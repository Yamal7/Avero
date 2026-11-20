import { describe, expect, it } from 'vitest';
import { mapCustomers, MAX_CSV_BYTES, parseCsv, reportCsv, suggestMapping } from '@/lib/import/csv';

describe('CSV reader', () => {
  it('detects separators, BOM, CRLF and skips blank lines', () => {
    const document = parseCsv('\uFEFFnazwa;email\r\nJan;jan@example.test\r\n\r\nAnna;anna@example.test');
    expect(document.separator).toBe(';');
    expect(document.rows.map(row => row.line)).toEqual([2, 4]);
    expect(document.headers).toEqual(['nazwa', 'email']);
  });
  it('supports quoted separators, escaped quotes and multiline cells', () => {
    const document = parseCsv('name,email\n"Firma, ""ABC""",a@example.test\n"Jan\nKowalski",j@example.test');
    expect(document.rows[0].cells[0]).toBe('Firma, "ABC"');
    expect(document.rows[1].cells[0]).toBe('Jan\nKowalski');
    expect(mapCustomers(document, suggestMapping(document.headers)).candidates[1].name).toBe('Jan Kowalski');
  });
  it('detects tabs and ignores separators inside quoted headers', () => {
    expect(parseCsv('"name,email"\tphone\nTest\t500100200').separator).toBe('\t');
  });
  it.each(['name\n"unfinished', 'name\nabc"def', 'name\n"Test"bad'])('rejects malformed quoting: %s', value => {
    expect(() => parseCsv(value)).toThrow();
  });
  it('rejects empty, badly decoded, oversized and too many rows', () => {
    for (const source of ['', 'name\nBad\uFFFD', 'name\nA\0', 'a'.repeat(MAX_CSV_BYTES + 1), 'name\n' + 'A\n'.repeat(2001)]) expect(() => parseCsv(source)).toThrow();
  });
});

describe('Column mapping and validation', () => {
  it('recognizes Polish headings, defaults customer type and normalizes email/name', () => {
    const document = parseCsv('Imię i nazwisko;Adres e-mail;Telefon\n  Jan   Kowalski ; JAN@example.test ;+48 500 100 200');
    const result = mapCustomers(document, suggestMapping(document.headers));
    expect(result.invalid).toEqual([]);
    expect(result.candidates[0]).toEqual({ row_number: 2, name: 'Jan Kowalski', email: 'jan@example.test', phone: '+48 500 100 200', type: 'individual' });
  });
  it('reports malformed widths, invalid contacts and unknown types per row', () => {
    const document = parseCsv('nazwa;email;telefon;typ\nA;bad;500100200;firma\nB;;abc;firma\nC;;;unknown\nD;d@example.test;123;firma\nE\n;valid@example.test;;firma');
    const result = mapCustomers(document, suggestMapping(document.headers));
    expect(result.candidates).toHaveLength(0); expect(result.invalid).toHaveLength(6);
    expect(result.invalid[4].reason).toContain('Liczba kolumn');
  });
  it('does not silently map the same column twice or accept a forged index', () => {
    const document = parseCsv('nazwa;email\nTest;test@example.test');
    expect(() => mapCustomers(document, { name: 0, email: 0, phone: null, type: null })).toThrow();
    expect(() => mapCustomers(document, { name: 999, email: null, phone: null, type: null })).toThrow();
  });
  it('escapes CSV report values and neutralizes spreadsheet formulas', () => {
    const csv = reportCsv([{ row_number: 2, name: '=HYPERLINK("test")', phone: '+48500100200', status: 'invalid', reason: 'Błąd; sprawdź' }]);
    expect(csv).toContain("\"'=HYPERLINK(\"\"test\"\")\"");
    expect(csv).toContain('"\'+48500100200"');
    expect(parseCsv(csv).rows[0].cells[5]).toBe('Błąd; sprawdź');
  });
});
