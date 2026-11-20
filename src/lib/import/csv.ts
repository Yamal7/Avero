import { customerSchema, type CustomerInput } from '@/lib/validation/customer';

export const MAX_CSV_BYTES = 1024 * 1024;
export const MAX_CSV_ROWS = 2000;
export type Separator = ',' | ';' | '\t';
export type ImportField = 'name' | 'email' | 'phone' | 'type';
export type ColumnMapping = Record<ImportField, number | null>;
export type CsvDocument = { headers: string[]; rows: { line: number; cells: string[] }[]; separator: Separator };
export type ImportCandidate = CustomerInput & { row_number: number };
export type ImportReportRow = { row_number: number; name: string; email?: string | null; phone?: string | null; type?: string; status: 'ready' | 'invalid' | 'duplicate' | 'imported' | 'skipped'; reason?: string; customer_id?: string };

function parseRecords(text: string, separator: Separator) {
  const records: { line: number; cells: string[] }[] = [];
  let cells: string[] = [], value = '', quoted = false, closed = false;
  let line = 1, recordLine = 1;
  function pushRecord() {
    cells.push(value);
    if (cells.some(cell => cell.trim() !== '')) records.push({ line: recordLine, cells });
    cells = []; value = ''; closed = false;
    if (records.length > MAX_CSV_ROWS + 1) throw new Error(`Plik może zawierać maksymalnie ${MAX_CSV_ROWS} wierszy danych.`);
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { value += '"'; i++; }
        else { quoted = false; closed = true; }
      } else { value += char; if (char === '\n') line++; }
    } else if (char === separator) {
      cells.push(value); value = ''; closed = false;
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      pushRecord(); line++; recordLine = line;
    } else if (char === '"') {
      if (value || closed) throw new Error(`Nieprawidłowy cudzysłów w wierszu ${line}.`);
      quoted = true;
    } else if (closed) {
      if (!/[ \t]/.test(char)) throw new Error(`Nieprawidłowy znak po cudzysłowie w wierszu ${line}.`);
    } else value += char;
    if (value.length > 10000 || cells.length > 50) throw new Error('Zbyt długa komórka lub więcej niż 50 kolumn.');
  }
  if (quoted) throw new Error('Nie zamknięto cudzysłowu w pliku CSV.');
  pushRecord();
  return records;
}

export function parseCsv(input: string, chosen?: Separator): CsvDocument {
  if (new TextEncoder().encode(input).length > MAX_CSV_BYTES) throw new Error('Plik jest zbyt duży. Limit wynosi 1 MB.');
  const text = input.replace(/^\uFEFF/, '');
  if (!text.trim()) throw new Error('Plik jest pusty.');
  if (text.includes('\0') || text.includes('\uFFFD')) throw new Error('Nieprawidłowe kodowanie pliku. Wybierz UTF-8 lub Windows-1250.');
  let separator: Separator = chosen || ';';
  if (!chosen) {
    // Count separators outside quoted fields in the first logical record.
    const scores: Record<Separator, number> = { ',': 0, ';': 0, '\t': 0 };
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '"') { if (quoted && text[i + 1] === '"') i++; else quoted = !quoted; }
      else if (!quoted && /[\r\n]/.test(text[i])) break;
      else if (!quoted && text[i] in scores) scores[text[i] as Separator]++;
    }
    separator = (Object.keys(scores) as Separator[]).sort((a, b) => scores[b] - scores[a])[0];
  }
  const records = parseRecords(text, separator);
  if (records.length < 2) throw new Error('Plik musi zawierać nagłówek i co najmniej jeden wiersz danych.');
  const headers = records[0].cells.map((header, i) => header.trim() || `Kolumna ${i + 1}`);
  if (headers.length > 50) throw new Error('Plik może zawierać maksymalnie 50 kolumn.');
  return { headers, rows: records.slice(1), separator };
}

const aliases: Record<ImportField, string[]> = {
  name: ['name', 'nazwa', 'nazwa klienta', 'klient', 'imie i nazwisko', 'firma'],
  email: ['email', 'e-mail', 'adres email', 'adres e-mail'],
  phone: ['phone', 'telefon', 'numer telefonu', 'tel'],
  type: ['type', 'typ', 'typ klienta', 'rodzaj klienta'],
};
export function suggestMapping(headers: string[]): ColumnMapping {
  const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').trim();
  return Object.fromEntries(Object.entries(aliases).map(([field, values]) => {
    const index = headers.findIndex(header => values.includes(normalize(header)));
    return [field, index < 0 ? null : index];
  })) as ColumnMapping;
}

export function mapCustomers(document: CsvDocument, mapping: ColumnMapping) {
  const columns = Object.values(mapping).filter((column): column is number => column !== null);
  if (mapping.name === null || !columns.every(column => Number.isInteger(column) && column >= 0 && column < document.headers.length)) throw new Error('Wybierz prawidłową kolumnę z nazwą klienta.');
  if (new Set(columns).size !== columns.length) throw new Error('Jedna kolumna nie może być przypisana do kilku pól.');
  const candidates: ImportCandidate[] = [], invalid: ImportReportRow[] = [];
  for (const row of document.rows) {
    const value = (field: ImportField) => mapping[field] === null ? '' : (row.cells[mapping[field]!] || '').trim();
    const name = value('name').replace(/\s+/g, ' ');
    const email = value('email').toLowerCase() || null;
    const phone = value('phone') || null;
    const rawType = value('type').toLowerCase();
    const type = ['firma', 'company'].includes(rawType) ? 'company' : ['', 'individual', 'osoba prywatna', 'osoba', 'prywatny', 'indywidualny'].includes(rawType) ? 'individual' : rawType;
    const parsed = customerSchema.safeParse({ name, email, phone, type });
    let reason: string | undefined;
    if (row.cells.length !== document.headers.length) reason = `Liczba kolumn (${row.cells.length}) różni się od nagłówka (${document.headers.length}).`;
    else if (!parsed.success) {
      const labels: Record<string, string> = { name: 'nazwa (1–200 znaków)', email: 'e-mail', phone: 'telefon (do 40 znaków)', type: 'typ klienta' };
      reason = 'Sprawdź: ' + parsed.error.issues.map(issue => labels[String(issue.path[0])] || 'dane').join(', ') + '.';
    } else if (phone && !/^[+\d\s().\-/]+$/.test(phone)) reason = 'Telefon zawiera niedozwolone znaki.';
    else if (phone && (phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15)) reason = 'Telefon powinien zawierać od 7 do 15 cyfr.';
    if (reason || !parsed.success) invalid.push({ row_number: row.line, name, email, phone, type, status: 'invalid', reason });
    else candidates.push({ ...parsed.data, row_number: row.line });
  }
  return { candidates, invalid };
}

function escapeCell(value: string) {
  // Avoid executing spreadsheet formulas when staff open the exported report.
  const safe = /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}
export function reportCsv(rows: ImportReportRow[]) {
  const statuses = { ready: 'Gotowy', invalid: 'Błąd', duplicate: 'Duplikat', imported: 'Dodano', skipped: 'Pominięto' };
  return '\uFEFF' + [['Wiersz', 'Nazwa', 'E-mail', 'Telefon', 'Status', 'Powód'], ...rows.map(row => [String(row.row_number), row.name, row.email || '', row.phone || '', statuses[row.status], row.reason || ''])].map(row => row.map(escapeCell).join(';')).join('\r\n');
}
