'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MAX_CSV_BYTES, mapCustomers, parseCsv, reportCsv, suggestMapping, type ColumnMapping, type CsvDocument, type ImportField, type Separator } from '@/lib/import/csv';
import { commitImport, discardImport, previewImport, type ImportPreview, type ImportResult } from '@/app/(dashboard)/dashboard/customers/import/actions';
import { Icon } from './icon';

const labels: Record<ImportField, string> = { name: 'Nazwa / imię i nazwisko *', email: 'E-mail', phone: 'Telefon', type: 'Typ klienta' };
const statuses = { ready: 'Gotowy', invalid: 'Błąd', duplicate: 'Duplikat', imported: 'Dodano', skipped: 'Pominięto' };
const emptyMapping: ColumnMapping = { name: null, email: null, phone: null, type: null };
export function CustomerImport() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [encoding, setEncoding] = useState('utf-8');
  const [separator, setSeparator] = useState<Separator | ''>('');
  const [document, setDocument] = useState<CsvDocument | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>(emptyMapping);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [fileKey, setFileKey] = useState(0);

  async function loadFile(selected: File | null, nextEncoding = encoding) {
    setError(''); setText(''); setDocument(null); setMapping(emptyMapping); setFile(selected);
    if (!selected) return;
    setBusy(true);
    try {
      if (selected.size > MAX_CSV_BYTES) throw new Error('Plik jest zbyt duży. Limit wynosi 1 MB.');
      const decoded = new TextDecoder(nextEncoding, { fatal: true }).decode(await selected.arrayBuffer());
      setText(decoded);
      const parsed = parseCsv(decoded, separator || undefined);
      setDocument(parsed); setMapping(suggestMapping(parsed.headers));
    } catch (e) { setError(e instanceof TypeError ? 'Nie można odczytać pliku. Sprawdź wybrane kodowanie.' : e instanceof Error ? e.message : 'Nie udało się odczytać pliku.'); }
    finally { setBusy(false); }
  }
  function changeSeparator(value: Separator | '') {
    setSeparator(value); setError(''); setDocument(null);
    if (!text) return;
    try { const parsed = parseCsv(text, value || undefined); setDocument(parsed); setMapping(suggestMapping(parsed.headers)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się odczytać pliku.'); }
  }
  async function buildPreview() {
    if (!document) return;
    setBusy(true); setError(''); setConfirmed(false);
    try {
      // Catch mapping errors before making a request; server repeats validation.
      mapCustomers(document, mapping);
      const data = await previewImport(text, mapping, document.separator);
      if (data.error) setError(data.error);
      else { setPreview(data); setFilter('all'); setPage(1); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się przygotować podglądu.'); }
    finally { setBusy(false); }
  }
  async function editMapping(resetFile = false) {
    setBusy(true); setError('');
    try {
      if (preview?.batchId && !result) {
        const discarded = await discardImport(preview.batchId);
        if (!discarded) { setError('Nie udało się anulować podglądu. Spróbuj ponownie po sprawdzeniu połączenia.'); return; }
      }
      setPreview(null); setResult(null); setConfirmed(false); setPage(1); setFilter('all');
    if (resetFile) { setFile(null); setDocument(null); setText(''); setFileKey(key => key + 1); }
    } catch { setError('Nie udało się zmienić podglądu. Sprawdź połączenie i spróbuj ponownie.'); }
    finally { setBusy(false); }
  }
  async function commit() {
    if (!preview?.batchId || !confirmed) return;
    setBusy(true); setError('');
    try {
      const data = await commitImport(preview.batchId);
      if (data.error) setError(data.error);
      else { setResult(data); setFilter('all'); setPage(1); }
    } catch { setError('Utracono połączenie. Ponów zatwierdzenie tego samego podglądu — nie doda klientów drugi raz.'); }
    finally { setBusy(false); }
  }
  const outcome = new Map(result?.rows.map(row => [row.row_number, row]));
  const rows = preview?.rows.map(row => ({ ...row, ...outcome.get(row.row_number) })) || [];
  const ready = rows.filter(row => row.status === 'ready').length;
  const invalid = rows.filter(row => row.status === 'invalid').length;
  const duplicates = rows.filter(row => row.status === 'duplicate' || row.status === 'skipped').length;
  const visibleRows = rows.filter(row => filter === 'all' || row.status === filter);
  function downloadReport() {
    const url = URL.createObjectURL(new Blob([reportCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const a = window.document.createElement('a'); a.href = url; a.download = 'raport-importu-klientow.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div aria-busy={busy}>
    <ol className="import-steps" aria-label="Etapy importu"><li className={!preview ? 'current' : ''} aria-current={!preview ? 'step' : undefined}>1. Plik i kolumny</li><li className={preview && !result ? 'current' : ''} aria-current={preview && !result ? 'step' : undefined}>2. Sprawdzenie danych</li><li className={result ? 'current' : ''} aria-current={result ? 'step' : undefined}>3. Wynik importu</li></ol>
    <section className="card"><div className="section-heading"><h2>Plik i mapowanie kolumn</h2>{preview && <button className="secondary" disabled={busy} onClick={() => editMapping(true)}>Wybierz inny plik</button>}</div><p className="muted">Import obejmuje dane klientów. Lokalizacje, instalacje i urządzenia dodasz na ich kartach. Maksymalnie 2000 wierszy, 1 MB. Pierwszy wiersz powinien zawierać nazwy kolumn.</p>
      {!preview && <fieldset disabled={busy} className="import-fieldset"><div className="import-file-fields"><label>Plik CSV<input key={fileKey} type="file" accept=".csv,text/csv" onChange={e => loadFile(e.target.files?.[0] || null)} /></label><label>Kodowanie<select value={encoding} onChange={e => { setEncoding(e.target.value); loadFile(file, e.target.value); }}><option value="utf-8">UTF-8</option><option value="windows-1250">Windows-1250 (starsze pliki Excel)</option></select></label><label>Separator<select value={separator} onChange={e => changeSeparator(e.target.value as Separator | '')}><option value="">Rozpoznaj automatycznie</option><option value=";">Średnik ;</option><option value=",">Przecinek ,</option><option value={'\t'}>Tabulator</option></select></label></div>
      {document && <><p className="muted">Odczytano {document.rows.length} wierszy. Wybierz, gdzie mają trafić poszczególne kolumny. Nieprzypisane kolumny zostaną pominięte.</p><div className="fields">{(Object.keys(labels) as ImportField[]).map(field => <label key={field}>{labels[field]}<select value={mapping[field] === null ? '' : String(mapping[field])} onChange={e => setMapping(previous => ({ ...previous, [field]: e.target.value === '' ? null : Number(e.target.value) }))}><option value="">{field === 'name' ? 'Wybierz kolumnę' : field === 'type' ? 'Domyślnie: osoba prywatna' : 'Nie importuj tego pola'}</option>{document.headers.map((header, index) => <option key={index} value={index}>{index + 1}. {header}</option>)}</select></label>)}</div><p className="muted">Typ klienta: „firma” / „company” lub „osoba prywatna” / „individual”. Pusta wartość oznacza osobę prywatną.</p><details><summary>Pokaż pierwsze 3 wiersze pliku</summary><div className="table-scroll"><table><thead><tr>{document.headers.map((header, index) => <th key={index}>{header}</th>)}</tr></thead><tbody>{document.rows.slice(0, 3).map(row => <tr key={row.line}>{row.cells.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div></details></>}
      </fieldset>}{preview && <p><strong>{file?.name}</strong> · {preview.rows.length} wierszy w raporcie</p>}{document && !preview && <button disabled={busy || mapping.name === null} onClick={buildPreview}><Icon name="search" size={18} />{busy ? 'Sprawdzanie…' : 'Sprawdź dane przed importem'}</button>}
    </section>
    {error && <p role="alert" className="import-alert error">{error}</p>}
    {preview && <section className="card"><div className="section-heading"><h2>{result ? 'Wynik importu' : 'Podgląd przed zapisem'}</h2><div className="button-group"><button className="secondary" onClick={downloadReport} disabled={busy}>Pobierz raport CSV</button>{!result && <button className="secondary" onClick={() => editMapping()} disabled={busy}>Zmień mapowanie</button>}</div></div>
      {result ? <p className="import-alert success" role="status">Dodano {result.imported} klientów. Pominięto {result.skipped} duplikatów i {invalid} wierszy z błędami.</p> : <><div className="import-counts"><span><strong>{ready}</strong> gotowych do dodania</span><span><strong>{duplicates}</strong> możliwych duplikatów</span><span><strong>{invalid}</strong> błędnych wierszy</span></div><p className="muted">Duplikat oznacza zgodną nazwę, e-mail lub telefon w pliku albo w bazie, również w archiwum. Wielkość liter, nadmiarowe spacje i format telefonu nie wpływają na porównanie. Dla polskich numerów porównujemy również zapis z +48 i bez niego. Osoby o tej samej nazwie wymagają ręcznej weryfikacji.</p><p>Dodamy wyłącznie wiersze oznaczone „Gotowy”. Istniejące dane nie zostaną nadpisane. Podgląd jest ważny przez godzinę.</p></>}
      <div className="import-report-tools"><label>Filtr raportu<select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="all">Wszystkie wiersze</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p className="muted">{visibleRows.length} wierszy</p></div>
      <div className="table-scroll"><table><thead><tr><th>Wiersz</th><th>Klient</th><th>Kontakt</th><th>Wynik</th></tr></thead><tbody>{visibleRows.slice((page - 1) * 50, page * 50).map(row => <tr key={row.row_number}><td>{row.row_number}</td><td>{row.customer_id ? <Link href={`/dashboard/customers/${row.customer_id}`}>{row.name}</Link> : row.name || '—'}</td><td>{row.email || '—'}<br /><span className="muted">{row.phone || '—'}</span></td><td><span className={`badge import-status-${row.status}`}>{statuses[row.status]}</span>{row.reason && <p className="report-reason">{row.reason}</p>}</td></tr>)}</tbody></table></div>{!visibleRows.length && <p className="empty">Brak wierszy dla wybranego filtra.</p>}<div className="pagination">{page > 1 && <button className="secondary" onClick={() => setPage(p => p - 1)}>← Poprzednia</button>}<span>Strona {page}</span>{page * 50 < visibleRows.length && <button className="secondary" onClick={() => setPage(p => p + 1)}>Następna →</button>}</div>
      {!result && ready > 0 && <div className="import-confirm"><label className="checkbox"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Sprawdziłem podgląd. Potwierdzam dodanie {ready} nowych klientów i pominięcie pozostałych wierszy.</label><button disabled={busy || !confirmed} onClick={commit}>{busy ? 'Zapisywanie…' : `Zatwierdź import (${ready})`}</button></div>}{!result && !ready && <p role="status">Nie ma wierszy gotowych do dodania. Popraw plik lub mapowanie i sprawdź dane ponownie.</p>}{result && <Link className="button" href="/dashboard/customers">Przejdź do klientów <Icon name="arrow" size={18} /></Link>}
    </section>}
  </div>;
}
