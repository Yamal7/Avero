'use client';
/* Zlecenie (design ZS-1047): measurements, materials and the activity thread, styled with the design's inline values. */
import { useEffect, useState, type CSSProperties } from 'react';
import { serviceJobSchema, type ServiceJob, type ServiceMaterial, type ServiceMeasurement } from '@hvac/api-client';
import { PersonAvatar, personName } from './design-icons';
import { catalogMoney } from '@/lib/catalog/format';

export type JobEvent = { at: string; who: string | null; whoId: string | null; text: string; ref?: string };
const zone = 'Europe/Warsaw';
const stamp = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(v)).replace('.', '');
const full = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, dateStyle: 'long', timeStyle: 'short' }).format(new Date(v));
const head: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, height: 28 };
const h3: CSSProperties = { margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 };
const ghost: CSSProperties = { height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 8px', border: 0, borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', fontSize: 12 };
const cellInput: CSSProperties = { width: '100%', height: 28, minHeight: 0, padding: '0 6px', border: 0, borderRadius: 6, background: 'var(--bg-surface)', boxShadow: 'inset 0 0 0 1px var(--border)', font: 'inherit', fontSize: 13, color: 'var(--text-primary)' };
const warn = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></svg>;
const plus = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5v14" /></svg>;
const send = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7M12 19V5" /></svg>;
const trash = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const truck = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>;
function parseQuantity(raw: string) { const n = Number(raw.replace(',', '.').trim()); return Number.isFinite(n) ? n : NaN; }
function parseMoney(raw: string) { const n = Number(raw.replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN; }

export function ServiceJobSections({ ticketId, initial, events, editable, closed, visitLabel }: { ticketId: string; initial: ServiceJob; events: JobEvent[]; editable: boolean; closed: boolean; visitLabel: string | null }) {
  const [job, setJob] = useState(initial), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [mDraft, setMDraft] = useState<ServiceMeasurement | null>(null), [matDraft, setMatDraft] = useState<(Omit<ServiceMaterial, 'quantity' | 'netCents'> & { quantity: string; net: string }) | null>(null), [comment, setComment] = useState('');
  useEffect(() => setJob(initial), [initial]);
  const canWrite = editable && !closed;
  async function call(path: string, method: 'POST' | 'DELETE', body: unknown, ok?: () => void) {
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/v1/service/tickets/${ticketId}/${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), json = await r.json();
      if (!r.ok) throw new Error(json.error?.message || 'Nie udało się zapisać.');
      setJob(serviceJobSchema.parse(json)); ok?.();
    } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }
  const total = job.materials.reduce((a, m) => a + m.netCents, 0);
  const thread = [...events.map(e => ({ kind: 'event' as const, ...e })), ...job.comments.map(c => ({ kind: 'comment' as const, at: c.createdAt, who: c.authorLabel, whoId: c.authorId, text: c.body }))].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      {error && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{error}</p>}
      <section id="pomiary" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={head}><h3 style={h3}>Pomiary</h3><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{job.measurements.length}</span><span style={{ flex: '1 1 auto' }} />{canWrite && <button type="button" className="ghost" disabled={busy} onClick={() => setMDraft({ id: crypto.randomUUID(), parameter: '', norm: '', before: '', after: '', outOfNorm: false, updatedAt: '' })} style={ghost}>{plus}Pomiar</button>}</div>
        <div role="table" aria-label="Pomiary" style={{ display: 'flex', flexDirection: 'column' }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0px, 1fr) 128px 128px 128px 28px', columnGap: 12, alignItems: 'center', height: 28, fontSize: 12, lineHeight: '16px', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--edge)' }}><span role="columnheader">Parametr</span><span role="columnheader">Norma</span><span role="columnheader" style={{ textAlign: 'right' }}>{visitLabel ? `Przed · ${visitLabel}` : 'Przed naprawą'}</span><span role="columnheader" style={{ textAlign: 'right' }}>Po naprawie</span><span /></div>
          {job.measurements.map(m => mDraft?.id === m.id ? null : (
            <div role="row" key={m.id} className={canWrite ? 'trow' : undefined} onDoubleClick={() => canWrite && setMDraft(m)} title={canWrite ? 'Kliknij dwukrotnie, aby edytować' : undefined} style={{ display: 'grid', gridTemplateColumns: 'minmax(0px, 1fr) 128px 128px 128px 28px', columnGap: 12, alignItems: 'center', height: 36, borderBottom: '1px solid var(--edge)' }}>
              <span role="cell" className="ell">{m.parameter}</span>
              <span role="cell" className="num" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.norm || '—'}</span>
              <span role="cell" className="num" title={m.outOfNorm ? 'Poza normą' : undefined} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, color: m.before ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: m.outOfNorm ? 500 : 400 }}>{m.outOfNorm && <span style={{ display: 'inline-flex', color: 'var(--warning)' }}>{warn}</span>}{m.before || '—'}</span>
              <span role="cell" className="num" style={{ textAlign: 'right', color: m.after ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{m.after || '—'}</span>
              <span role="cell">{canWrite && <button type="button" className="ib" aria-label={`Usuń pomiar ${m.parameter}`} title="Usuń" disabled={busy} onClick={() => void call('measurements', 'DELETE', { id: m.id })} style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--text-tertiary)', padding: 0 }}>{trash}</button>}</span>
            </div>
          ))}
          {mDraft && (
            <form onSubmit={e => { e.preventDefault(); void call('measurements', 'POST', { id: mDraft.id, parameter: mDraft.parameter.trim(), norm: mDraft.norm.trim(), before: mDraft.before.trim(), after: mDraft.after.trim(), outOfNorm: mDraft.outOfNorm }, () => setMDraft(null)); }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0px, 1fr) 128px 128px 128px', columnGap: 12, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
              <input aria-label="Parametr" autoFocus required maxLength={120} placeholder="np. Temperatura w komorze" value={mDraft.parameter} onChange={e => setMDraft({ ...mDraft, parameter: e.target.value })} style={cellInput} />
              <input aria-label="Norma" maxLength={80} placeholder="−22 … −18 °C" value={mDraft.norm} onChange={e => setMDraft({ ...mDraft, norm: e.target.value })} style={cellInput} />
              <input aria-label="Wartość przed naprawą" maxLength={80} placeholder="−8 °C" value={mDraft.before} onChange={e => setMDraft({ ...mDraft, before: e.target.value })} style={{ ...cellInput, textAlign: 'right' }} />
              <input aria-label="Wartość po naprawie" maxLength={80} placeholder="—" value={mDraft.after} onChange={e => setMDraft({ ...mDraft, after: e.target.value })} style={{ ...cellInput, textAlign: 'right' }} />
              <label style={{ gridColumn: '1 / span 2', display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}><input type="checkbox" checked={mDraft.outOfNorm} onChange={e => setMDraft({ ...mDraft, outOfNorm: e.target.checked })} style={{ width: 14, height: 14, margin: 0, accentColor: 'var(--accent)' }} />Wynik poza normą</label>
              <span style={{ gridColumn: '3 / span 2', display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}><button type="button" className="sec" onClick={() => setMDraft(null)} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontWeight: 500 }}>Anuluj</button><button type="submit" className="pri" disabled={busy} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500 }}>Zapisz</button></span>
            </form>
          )}
          {!job.measurements.length && !mDraft && <p style={{ margin: 0, padding: '8px 0', fontSize: 12, color: 'var(--text-secondary)' }}>Brak pomiarów. {canWrite ? 'Dodaj parametry z diagnozy, a po naprawie uzupełnij wartości.' : ''}</p>}
        </div>
      </section>

      <section id="materialy" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={head}><h3 style={h3}>Materiały i czynnik</h3><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{job.materials.length}</span><span style={{ flex: '1 1 auto' }} />{canWrite && <button type="button" className="ghost" disabled={busy} onClick={() => setMatDraft({ id: crypto.randomUUID(), name: '', quantity: '1', unit: 'szt.', document: '', source: '', net: '', createdAt: '' })} style={ghost}>{plus}Materiał</button>}</div>
        <div role="table" aria-label="Materiały" style={{ display: 'flex', flexDirection: 'column', margin: '0 -8px' }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0px, 1fr) 72px 136px 96px 96px 28px', columnGap: 12, alignItems: 'center', height: 28, padding: '0 8px', fontSize: 12, lineHeight: '16px', color: 'var(--text-tertiary)' }}><span role="columnheader">Pozycja</span><span role="columnheader" style={{ textAlign: 'right' }}>Ilość</span><span role="columnheader">Dokument</span><span role="columnheader">Skąd</span><span role="columnheader" style={{ textAlign: 'right' }}>Netto</span><span /></div>
          {job.materials.map(m => (
            <div role="row" key={m.id} className="trow" style={{ display: 'grid', gridTemplateColumns: 'minmax(0px, 1fr) 72px 136px 96px 96px 28px', columnGap: 12, alignItems: 'center', height: 40, padding: '0 8px', borderRadius: 10 }}>
              <span role="cell" className="ell">{m.name}</span>
              <span role="cell" className="num" style={{ textAlign: 'right' }}>{m.quantity.toLocaleString('pl-PL')} {m.unit}</span>
              <span role="cell" className="mono ell" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.document || '—'}</span>
              <span role="cell">{m.source ? <span title={m.source} style={{ height: 22, maxWidth: '100%', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 8px 0 6px', borderRadius: 11, background: 'var(--bg-subtle)', fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden' }}>{truck}<span className="ell">{m.source}</span></span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</span>
              <span role="cell" className="num" style={{ textAlign: 'right' }}>{catalogMoney(m.netCents)}</span>
              <span role="cell">{canWrite && <button type="button" className="ib" aria-label={`Usuń materiał ${m.name}`} title="Usuń" disabled={busy} onClick={() => void call('materials', 'DELETE', { id: m.id })} style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--text-tertiary)', padding: 0 }}>{trash}</button>}</span>
            </div>
          ))}
          {matDraft && (
            <form onSubmit={e => { e.preventDefault(); const quantity = parseQuantity(matDraft.quantity), netCents = parseMoney(matDraft.net || '0'); if (!(quantity > 0) || Number.isNaN(netCents)) { setError('Sprawdź ilość i cenę netto.'); return; } void call('materials', 'POST', { id: matDraft.id, name: matDraft.name.trim(), quantity, unit: matDraft.unit.trim(), document: matDraft.document.trim(), source: matDraft.source.trim(), netCents }, () => setMatDraft(null)); }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0px, 1fr) 40px 32px 136px 96px 96px', columnGap: 8, alignItems: 'center', padding: '6px 8px' }}>
              <input aria-label="Nazwa materiału" autoFocus required maxLength={160} placeholder="np. Silnik wentylatora" value={matDraft.name} onChange={e => setMatDraft({ ...matDraft, name: e.target.value })} style={cellInput} />
              <input aria-label="Ilość" required inputMode="decimal" value={matDraft.quantity} onChange={e => setMatDraft({ ...matDraft, quantity: e.target.value })} style={{ ...cellInput, textAlign: 'right' }} />
              <input aria-label="Jednostka" required maxLength={12} value={matDraft.unit} onChange={e => setMatDraft({ ...matDraft, unit: e.target.value })} style={cellInput} />
              <input aria-label="Dokument" maxLength={40} placeholder="RW/MM nr" value={matDraft.document} onChange={e => setMatDraft({ ...matDraft, document: e.target.value })} style={{ ...cellInput, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <input aria-label="Skąd" maxLength={80} placeholder="Bus, magazyn" value={matDraft.source} onChange={e => setMatDraft({ ...matDraft, source: e.target.value })} style={cellInput} />
              <input aria-label="Cena netto (zł)" inputMode="decimal" placeholder="0,00" value={matDraft.net} onChange={e => setMatDraft({ ...matDraft, net: e.target.value })} style={{ ...cellInput, textAlign: 'right' }} />
              <span style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}><button type="button" className="sec" onClick={() => setMatDraft(null)} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontWeight: 500 }}>Anuluj</button><button type="submit" className="pri" disabled={busy} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500 }}>Zapisz</button></span>
            </form>
          )}
          {job.materials.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 8px', borderTop: '1px solid var(--edge)', marginTop: 4 }}><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Razem materiały</span><span style={{ flex: '1 1 auto' }} /><span className="num" style={{ fontWeight: 500 }}>{catalogMoney(total)}</span></div>}
          {!job.materials.length && !matDraft && <p style={{ margin: 0, padding: '8px', fontSize: 12, color: 'var(--text-secondary)' }}>Brak materiałów na tym zleceniu.</p>}
        </div>
      </section>

      <section id="aktywnosc" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={head}><h3 style={h3}>Aktywność</h3></div>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {thread.map((e, i) => e.kind === 'comment'
            ? <li key={`c${i}`} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-raised)' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, lineHeight: '16px' }}>{e.whoId && <PersonAvatar id={e.whoId} label={e.who || ''} size={16} />}<span style={{ fontWeight: 500 }}>{personName(e.who || '')}</span><span className="num" title={full(e.at)} style={{ color: 'var(--text-tertiary)' }}>{stamp(e.at)}</span></span><span style={{ whiteSpace: 'pre-wrap' }}>{e.text}</span></li>
            : <li key={`e${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}><span aria-hidden="true" style={{ width: 16, height: 16, flex: '0 0 auto', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, lineHeight: '10px', fontWeight: 500, color: 'var(--text-secondary)' }}>{(e.who || '•').slice(0, 1).toUpperCase()}</span><span className="ell" style={{ flex: '1 1 auto' }}>{e.who && <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{personName(e.who)} </span>}{e.text}{e.ref && <> <span className="mono" style={{ fontSize: 11 }}>{e.ref}</span></>}</span><span className="num" title={full(e.at)} style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{stamp(e.at)}</span></li>)}
        </ol>
        {editable && (
          <form onSubmit={e => { e.preventDefault(); const body = comment.trim(); if (!body) return; void call('comments', 'POST', { id: crypto.randomUUID(), body }, () => setComment('')); }} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-raised)' }}>
            <label htmlFor="zs-komentarz" className="vh">Komentarz</label>
            <textarea id="zs-komentarz" rows={2} maxLength={2000} value={comment} disabled={busy} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder="Napisz komentarz dla zespołu…" style={{ width: '100%', resize: 'none', padding: 0, border: 0, background: 'transparent', font: 'inherit', color: 'var(--text-primary)', boxShadow: 'none', minHeight: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Widzi biuro i technik zlecenia</span><span style={{ flex: '1 1 auto' }} /><button type="submit" aria-label="Wyślij komentarz" title="Wyślij  ⌘Enter" disabled={busy || !comment.trim()} style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: comment.trim() ? 'var(--accent)' : 'var(--bg-subtle)', color: comment.trim() ? 'var(--on-accent)' : 'var(--text-tertiary)', padding: 0 }}>{send}</button></div>
          </form>
        )}
      </section>
    </>
  );
}
