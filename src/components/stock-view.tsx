'use client';
/* Magazyn — ported 1:1 from the design artboards "Magazyn · jasny", "wydanie na zlecenie (RW)" and "w samochodach". */
import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { stockCategories, stockDocumentResultSchema, stockMovesSchema, stockUnits, type StockItem, type StockLocation, type StockMove, type StockOverview } from '@hvac/api-client';
import { DI, PersonAvatar, personName, ticketCode } from './design-icons';

export type StockTicket = { id: string; number: number; subject: string; customer: string; devices: { id: string; label: string }[] };
type View = 'all' | 'refrigerant' | 'below' | 'vehicles';
type Dialog = { kind: 'PZ' | 'RW' | 'MM'; itemId?: string; from?: string; to?: string } | { kind: 'item'; item?: StockItem } | { kind: 'vehicle' } | null;

const sv = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
const I = {
  box: <svg {...sv} width={16} height={16}><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" /></svg>,
  lock: <svg {...sv} width={12} height={12} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  warn: <svg {...sv} style={{ flex: '0 0 auto', color: 'var(--warning)' }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></svg>,
  err: <svg {...sv} style={{ flex: '0 0 auto', color: 'var(--danger)' }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>,
  out: <svg {...sv} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><path d="M12 21V9M7 14l5-5 5 5" /><path d="M5 3h14" /></svg>,
  in: <svg {...sv} style={{ flex: '0 0 auto', color: 'var(--success)' }}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>,
  mm: <svg {...sv} style={{ flex: '0 0 auto' }}><path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" /></svg>,
  drop: <svg {...sv} style={{ flex: '0 0 auto' }}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>,
  cube: <svg {...sv} style={{ flex: '0 0 auto' }}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></svg>,
  cloud: <svg {...sv} style={{ flex: '0 0 auto' }}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>,
  gauge: <svg {...sv} style={{ flex: '0 0 auto' }}><path d="m12 14 4-4M3.34 19a10 10 0 1 1 17.32 0" /></svg>,
  shelf: <svg {...sv} width={16} height={16} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18" /></svg>,
  folder: <svg {...sv} width={16} height={16} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>,
  hash: <svg {...sv} width={16} height={16} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></svg>,
  min: <svg {...sv} width={16} height={16} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><path d="m12 14 4-4M3.34 19a10 10 0 1 1 17.32 0" /></svg>,
  truck: <svg {...sv} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>,
};
const ib = (s: number): CSSProperties => ({ width: s, height: s, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--text-secondary)', padding: 0, minHeight: 0 });
const chip: CSSProperties = { height: 22, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 8px 0 6px', borderRadius: 11, background: 'var(--bg-subtle)', fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' };
const tab = (on: boolean): CSSProperties => ({ height: 28, padding: '0 12px', borderRadius: 14, border: 0, background: on ? 'var(--bg-subtle)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: on ? 500 : 400, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' });
const sec: CSSProperties = { height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px 0 8px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontWeight: 500, minHeight: 0, color: 'var(--text-primary)' };
const pri: CSSProperties = { ...sec, background: 'var(--accent)', color: 'var(--on-accent)' };
const fmt = (v: number, unit: string) => `${unit === 'kg' || unit === 'l' ? v.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) : v.toLocaleString('pl-PL', { maximumFractionDigits: 3 })} ${unit}`;
const day = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short' }).format(new Date(v)).replace('.', '');
const full = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'long', timeStyle: 'short' }).format(new Date(v));
const total = (i: StockItem) => Object.values(i.levels).reduce((a, b) => a + b, 0);
const avail = (i: StockItem) => total(i) - i.reserved;
const below = (i: StockItem) => i.minQuantity > 0 && avail(i) < i.minQuantity;
const parseNum = (s: string) => { const n = Number(s.replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };

export function StockView({ data, view, tickets, technicians }: { data: StockOverview; view: View; tickets: StockTicket[]; technicians: { id: string; label: string }[] }) {
  const router = useRouter();
  const items = data.items, manage = data.canManage;
  const main = data.locations.find(l => l.kind === 'warehouse'), vans = data.locations.filter(l => l.kind === 'vehicle'), myVan = vans.find(v => v.technicianId === data.viewerId);
  const visible = view === 'refrigerant' ? items.filter(i => i.category === 'refrigerant') : view === 'below' ? items.filter(below) : items;
  const [selectedId, setSelectedId] = useState<string | null>(visible[0]?.id ?? null), [panelOn, setPanelOn] = useState(view !== 'vehicles'), [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dialog, setDialog] = useState<Dialog>(null), [notice, setNotice] = useState('');
  const selected = panelOn ? items.find(i => i.id === selectedId) ?? null : null;
  useEffect(() => { if (window.matchMedia('(max-width: 1100px)').matches) setPanelOn(false); }, []);
  const groups = (Object.keys(stockCategories) as (keyof typeof stockCategories)[]).map(c => ({ c, rows: visible.filter(i => i.category === c) })).filter(g => g.rows.length);
  const belowCount = items.filter(below).length;
  const href = (v: View) => (v === 'all' ? '/dashboard/stock' : `/dashboard/stock?view=${v}`);
  function done(text: string) { setDialog(null); setNotice(text); router.refresh(); }

  return (
    <main className="dk" style={{ flex: '1 1 auto', minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px 0 20px' }}>
        <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{I.box}</span><span style={{ color: 'var(--text-secondary)' }}>Finanse i magazyn</span><span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}>{DI.chev}</span>
        <h1 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Magazyn</h1><span style={{ flex: '1 1 auto' }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginRight: 4 }}>{items.length} pozycji · {belowCount} poniżej minimum</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: '8px 12px 8px 16px' }}>
        <div role="tablist" aria-label="Zapisane widoki" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {([['all', 'Wszystkie'], ['refrigerant', 'Czynniki chłodnicze'], ['below', 'Poniżej minimum'], ['vehicles', 'W samochodach']] as [View, string][]).map(([v, l]) => <Link key={v} role="tab" aria-selected={view === v} className="tab" href={href(v)} style={tab(view === v)}>{l}</Link>)}
        </div>
        <span style={{ flex: '1 1 auto' }} />
        {view !== 'vehicles' && <button type="button" className={`ib${panelOn ? ' on' : ''}`} aria-label="Panel szczegółów" aria-pressed={panelOn} title="Panel szczegółów" onClick={() => setPanelOn(v => !v)} style={ib(28)}>{DI.panel}</button>}
        {manage && <button type="button" className="sec" title="Nowa pozycja magazynowa" onClick={() => setDialog({ kind: 'item' })} style={{ ...sec, marginLeft: 4 }}>{DI.plus14}Pozycja</button>}
        {manage && <button type="button" className="sec" title="Przyjęcie (PZ)" onClick={() => setDialog({ kind: 'PZ', itemId: selected?.id })} style={sec}>{I.in}Przyjęcie</button>}
        <button type="button" className="pri" title="Wydanie na zlecenie (RW)" onClick={() => setDialog({ kind: 'RW', itemId: selected?.id })} disabled={!manage && !myVan} style={pri}><span style={{ display: 'inline-flex', transform: 'rotate(0deg)' }}>{I.out}</span>Wydanie</button>
      </div>
      {notice && <p role="status" style={{ margin: '0 20px 8px', fontSize: 12, color: 'var(--success)' }}>{notice}</p>}

      {view === 'vehicles'
        ? <Vehicles items={items} main={main} vans={vans} manage={manage} onMM={(itemId, to) => setDialog({ kind: 'MM', itemId, from: main?.id, to })} onAddVan={() => setDialog({ kind: 'vehicle' })} />
        : (
          <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'stretch', minHeight: 0 }} className="plan-split">
            <div style={{ flex: '1 1 auto', minWidth: 0, padding: '0 12px 24px', overflowX: 'auto' }}>
              <div style={{ minWidth: 600, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0px, 1fr) 72px 64px 96px 72px', alignItems: 'center', columnGap: 12, height: 32, padding: '0 8px', fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}>
                  <span>Indeks</span><span>Nazwa</span><span title="Stan zmienia się tylko dokumentem: PZ, RW, MM" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>{I.lock}<span>Stan</span></span><span style={{ textAlign: 'right' }}>Rezerw.</span><span style={{ textAlign: 'right' }}>Dostępne</span><span style={{ textAlign: 'right' }}>Ruch</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {groups.map(g => (
                    <section key={g.c} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="grp" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36, padding: '0 6px 0 4px', borderRadius: 10, marginBottom: 4 }}>
                        <button type="button" aria-expanded={!collapsed[g.c]} onClick={() => setCollapsed(s => ({ ...s, [g.c]: !s[g.c] }))} style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 6px', border: 0, borderRadius: 8, background: 'transparent', textAlign: 'left' }}>
                          <span className="caret" style={{ display: 'inline-flex', color: 'var(--text-tertiary)', transform: collapsed[g.c] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>{DI.caret}</span>
                          <h2 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>{stockCategories[g.c]}</h2><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{g.rows.length}</span>
                        </button>
                      </div>
                      {!collapsed[g.c] && g.rows.map(i => {
                        const t = total(i), a = avail(i), low = below(i), neg = a < 0, sel = i.id === selected?.id;
                        return (
                          <a key={i.id} href={`#${i.code.toLowerCase()}`} className={`row${sel ? ' sel' : ''}`} onClick={e => { e.preventDefault(); setSelectedId(i.id); setPanelOn(true); }} style={{ display: 'grid', gridTemplateColumns: '84px minmax(0px, 1fr) 72px 64px 96px 72px', alignItems: 'center', columnGap: 12, height: 36, padding: '0 8px', borderRadius: 10 }}>
                            <span className="mono ell" style={{ color: 'var(--text-tertiary)' }}>{i.code}</span>
                            <span title={[i.container, i.gwp !== null ? `GWP ${i.gwp}` : ''].filter(Boolean).join(' · ') || undefined} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}><span className="ell" style={{ fontWeight: 500 }}>{i.name}</span></span>
                            <span className="num" style={{ textAlign: 'right' }}>{fmt(t, i.unit)}</span>
                            <span className="num" title="Zarezerwowane na zlecenia" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, color: i.reserved ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{i.reserved ? <>{I.lock}<span>{fmt(i.reserved, i.unit)}</span></> : '—'}</span>
                            <span className="num" title={i.minQuantity ? `Minimum ${fmt(i.minQuantity, i.unit)}${low ? ' · poniżej minimum' : ''}` : undefined} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, color: neg ? 'var(--danger)' : 'var(--text-primary)', fontWeight: low || neg ? 500 : 400 }}>{neg ? I.err : low ? I.warn : null}<span>{fmt(a, i.unit)}</span></span>
                            <span className="num" title={i.lastMove ? `Ostatni ruch ${full(i.lastMove.at)}` : 'Brak ruchów'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>{i.lastMove ? <>{i.lastMove.delta > 0 ? I.in : I.out}<span>{day(i.lastMove.at)}</span></> : '—'}</span>
                          </a>
                        );
                      })}
                    </section>
                  ))}
                  {!groups.length && <p style={{ margin: 0, padding: '16px 8px', color: 'var(--text-secondary)' }}>{view === 'below' ? 'Wszystkie pozycje są powyżej minimum.' : manage ? 'Magazyn jest pusty. Dodaj pierwszą pozycję, a potem przyjmij ją dokumentem PZ.' : 'Magazyn jest pusty.'}</p>}
                </div>
              </div>
            </div>
            {selected && <ItemPanel item={selected} locations={data.locations} manage={manage} canIssue={manage || !!myVan} onClose={() => setPanelOn(false)} onDoc={kind => setDialog({ kind, itemId: selected.id })} onEdit={() => setDialog({ kind: 'item', item: selected })} tickets={tickets} onReserved={() => { setNotice('Zarezerwowano.'); router.refresh(); }} />}
          </div>
        )}
      {dialog && dialog.kind === 'item' && <ItemDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
      {dialog && dialog.kind === 'vehicle' && <VehicleDialog technicians={technicians.filter(t => !vans.some(v => v.technicianId === t.id))} onClose={() => setDialog(null)} onDone={done} />}
      {dialog && (dialog.kind === 'PZ' || dialog.kind === 'RW' || dialog.kind === 'MM') && <DocDialog kind={dialog.kind} items={items} locations={data.locations} manage={manage} myVan={myVan} tickets={tickets} initialItem={dialog.itemId} initialFrom={dialog.from} initialTo={dialog.to} onClose={() => setDialog(null)} onDone={done} />}
    </main>
  );
}

function ItemPanel({ item, locations, manage, canIssue, onClose, onDoc, onEdit, tickets, onReserved }: { item: StockItem; locations: StockLocation[]; manage: boolean; canIssue: boolean; onClose: () => void; onDoc: (k: 'PZ' | 'RW' | 'MM') => void; onEdit: () => void; tickets: StockTicket[]; onReserved: () => void }) {
  const [moves, setMoves] = useState<StockMove[] | null>(null), [reserve, setReserve] = useState(false), [rTicket, setRTicket] = useState(''), [rQty, setRQty] = useState(''), [err, setErr] = useState('');
  useEffect(() => { setMoves(null); const c = new AbortController(); fetch(`/api/v1/stock/items/${item.id}/moves`, { cache: 'no-store', signal: c.signal }).then(r => (r.ok ? r.json() : [])).then(b => { const p = stockMovesSchema.safeParse(b); if (p.success) setMoves(p.data); }).catch(() => {}); return () => c.abort(); }, [item.id, item.lastMove?.at]);
  const t = total(item), a = avail(item), low = below(item);
  async function doReserve() {
    const q = parseNum(rQty); if (!rTicket || !(q > 0)) { setErr('Wybierz zgłoszenie i ilość.'); return; }
    const r = await fetch('/api/v1/stock/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), itemId: item.id, ticketId: rTicket, quantity: q }) });
    if (!r.ok) { setErr((await r.json()).error?.message || 'Nie udało się zarezerwować.'); return; }
    setReserve(false); setRQty(''); setErr(''); onReserved();
  }
  const prop = (icon: ReactNode, value: ReactNode, title: string) => <div title={title} style={{ minHeight: 32, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8 }}>{icon}<span className="ell">{value}</span></div>;
  return (
    <aside aria-label={`Pozycja magazynowa ${item.code}`} className="tl-panel" style={{ flex: '0 0 400px', minWidth: 0, borderLeft: '1px solid var(--edge)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 44, padding: '0 8px 0 20px' }}>
        <span className="mono" style={{ color: 'var(--text-tertiary)' }}>{item.code}</span><span style={{ flex: '1 1 auto' }} />
        {manage && <button type="button" className="ib" aria-label="Edytuj pozycję" title="Edytuj" onClick={onEdit} style={ib(24)}><svg {...sv} width={16} height={16}><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></svg></button>}
        <button type="button" className="ib" aria-label="Zamknij panel" title="Zamknij  Esc" onClick={onClose} style={ib(24)}>{DI.x}</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 20px 16px' }}>
        <h2 style={{ margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 600, letterSpacing: '-0.01em' }}>{item.name}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {item.refrigerantClass && <span title={`Czynnik chłodniczy ${item.refrigerantClass}`} style={chip}>{I.drop}<span>{item.refrigerantClass}</span></span>}
          {item.container && <span title={item.container} style={chip}>{I.cube}<span>{item.container}</span></span>}
          {item.gwp !== null && <span title={`Współczynnik GWP ${item.gwp}`} style={chip}>{I.cloud}<span>GWP {item.gwp}</span></span>}
        </div>
      </div>
      <section aria-label="Stan" title="Stan zmienia tylko dokument: PZ, RW, MM" style={{ margin: '0 20px 16px', padding: 12, display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 12, background: 'var(--bg-raised)' }}>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0px, 1fr))', gap: 8 }}>
          {[['Stan', I.cube, fmt(t, item.unit), null], ['Rezerwacja', I.lock, fmt(item.reserved, item.unit), null], ['Dostępne', I.gauge, fmt(a, item.unit), a < 0 ? I.err : low ? I.warn : null]].map(([l, ic, v, w]) => (
            <div key={l as string}><dt style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}>{ic}{l}</dt><dd className="num" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, lineHeight: '22px', fontWeight: 600 }}>{w}{v}</dd></div>
          ))}
        </dl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {item.minQuantity > 0 && <span title={low ? `Brakuje ${fmt(item.minQuantity - a, item.unit)}` : 'Minimalny stan'} style={{ ...chip, background: 'var(--bg-surface)' }}>{I.gauge}min {fmt(item.minQuantity, item.unit)}</span>}
          {item.reservations.map(r => <Link key={r.id} href={`/dashboard/service/${r.ticketId}`} title={`Rezerwacja ${fmt(r.quantity, item.unit)}`} style={{ ...chip, background: 'var(--bg-surface)' }}>{I.lock}{ticketCode(r.ticketNumber)}</Link>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {manage && <button type="button" onClick={() => onDoc('PZ')} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.in}PZ</button>}
          {canIssue && <button type="button" onClick={() => onDoc('RW')} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.out}RW</button>}
          {manage && <button type="button" onClick={() => onDoc('MM')} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.mm}MM</button>}
          {manage && <button type="button" onClick={() => setReserve(v => !v)} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.lock}Rezerwuj</button>}
        </div>
        {reserve && <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}><select aria-label="Zgłoszenie" value={rTicket} onChange={e => setRTicket(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0, height: 28, minHeight: 0, borderRadius: 8, border: 0, background: 'var(--bg-surface)', font: 'inherit', fontSize: 12 }}><option value="">Zgłoszenie…</option>{tickets.map(t => <option key={t.id} value={t.id}>{ticketCode(t.number)} · {t.subject}</option>)}</select><input aria-label="Ilość" inputMode="decimal" placeholder={item.unit} value={rQty} onChange={e => setRQty(e.target.value)} style={{ width: 64, height: 28, minHeight: 0, borderRadius: 8, border: 0, background: 'var(--bg-surface)', textAlign: 'right', font: 'inherit', fontSize: 12, padding: '0 6px' }} /><button type="button" className="pri" onClick={() => void doReserve()} style={{ ...pri, height: 28 }}>OK</button></div>}
        {err && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      </section>
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column' }}>
        {item.minQuantity > 0 && prop(I.min, `Minimum ${fmt(item.minQuantity, item.unit)}`, 'Minimalny stan')}
        {item.bin && prop(I.shelf, <span className="mono">{item.bin}</span>, 'Lokalizacja na półce')}
        {prop(I.folder, stockCategories[item.category], 'Kategoria')}
        {prop(I.hash, item.unit, 'Jednostka')}
        {Object.entries(item.levels).length > 0 && prop(I.truck, Object.entries(item.levels).map(([loc, q]) => `${locations.find(l => l.id === loc)?.name ?? 'Inne'}: ${fmt(q, item.unit)}`).join(' · '), 'Stan wg miejsc')}
      </div>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28 }}><h3 style={{ flex: '1 1 auto', margin: 0, fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Ruchy</h3></div>
        <ol style={{ margin: '0 -8px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
          {moves === null && <li style={{ padding: '0 8px', fontSize: 12, color: 'var(--text-tertiary)' }}>Wczytywanie…</li>}
          {moves?.map(m => (
            <li key={m.id}><div className="row" title={`${m.authorLabel ?? ''} · ${locations.find(l => l.id === m.locationId)?.name ?? ''}`} style={{ display: 'grid', gridTemplateColumns: '16px 112px minmax(0px, 1fr) auto 16px 44px', columnGap: 8, alignItems: 'center', height: 36, padding: '0 8px', borderRadius: 10 }}>
              <span style={{ display: 'inline-flex' }}>{m.kind === 'MM' ? I.mm : m.delta > 0 ? I.in : I.out}</span>
              <span className="mono ell" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.number}</span>
              <span className="ell">{m.ticketNumber ? <Link href={`/dashboard/service/${m.ticketId}`}>{ticketCode(m.ticketNumber)}</Link> : m.kind === 'PZ' ? (m.supplier || 'Dostawa') : locations.find(l => l.id === m.locationId)?.name}</span>
              <span className="num" style={{ fontWeight: 500 }}>{m.delta > 0 ? '+' : '−'}{fmt(Math.abs(m.delta), item.unit)}</span>
              <PersonAvatar id={m.authorId} label={m.authorLabel ?? '?'} size={16} />
              <span className="num" title={full(m.at)} style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-tertiary)' }}>{day(m.at)}</span>
            </div></li>
          ))}
          {moves?.length === 0 && <li style={{ padding: '0 8px', fontSize: 12, color: 'var(--text-secondary)' }}>Brak ruchów. Pierwszy ruch to przyjęcie PZ.</li>}
        </ol>
      </section>
    </aside>
  );
}

function Vehicles({ items, main, vans, manage, onMM, onAddVan }: { items: StockItem[]; main?: StockLocation; vans: StockLocation[]; manage: boolean; onMM: (itemId: string, to: string) => void; onAddVan: () => void }) {
  const carried = items.filter(i => vans.some(v => (i.levels[v.id] ?? 0) !== 0) || (main && (i.levels[main.id] ?? 0) > 0));
  const gap = (i: StockItem, v: StockLocation) => (i.levels[v.id] ?? 0) <= 0 && vans.some(o => o.id !== v.id && (i.levels[o.id] ?? 0) > 0) && (main ? (i.levels[main.id] ?? 0) > 0 : false);
  const shortages = vans.map(v => carried.filter(i => gap(i, v)).length), totalShort = shortages.reduce((a, b) => a + b, 0);
  const cols = `84px minmax(0px, 1fr) 96px ${vans.map(() => '100px').join(' ')} 92px`;
  const groups = (Object.keys(stockCategories) as (keyof typeof stockCategories)[]).map(c => ({ c, rows: carried.filter(i => i.category === c) })).filter(g => g.rows.length);
  return (
    <div style={{ flex: '1 1 auto', minWidth: 0, padding: '0 12px 24px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 8px' }}>
        {totalShort > 0 && <span title="Pozycje, których brakuje w samochodzie, a są w bazie i w innych samochodach" style={{ ...chip, padding: '0 8px 0 6px' }}>{I.warn}{totalShort} {totalShort === 1 ? 'brak' : totalShort < 5 ? 'braki' : 'braków'}</span>}
        <span style={{ flex: '1 1 auto' }} />
        {manage && <button type="button" className="sec" onClick={onAddVan} style={sec}>{DI.plus14}Samochód</button>}
      </div>
      {!vans.length ? <p style={{ margin: 0, padding: '16px 8px', color: 'var(--text-secondary)' }}>{manage ? 'Nie ma jeszcze samochodów. Dodaj samochód technika, a potem przesuń do niego towar dokumentem MM.' : 'Biuro nie dodało jeszcze samochodów.'}</p> : (
        <div style={{ minWidth: 480 + vans.length * 112, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 12, height: 32, padding: '0 8px', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Indeks</span><span>Nazwa</span><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>{I.cube}Baza</span>
            {vans.map(v => <span key={v.id} title={`${v.name}${v.plate ? ` · ${v.plate}` : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>{I.truck}<PersonAvatar id={v.technicianId!} label={v.technicianLabel ?? v.name} /></span>)}
            <span style={{ textAlign: 'right' }}>Razem</span>
          </div>
          {groups.map(g => (
            <section key={g.c} style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 10px' }}><span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}>{DI.caret}</span><h2 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>{stockCategories[g.c]}</h2><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{g.rows.length}</span></div>
              {g.rows.map(i => (
                <div key={i.id} className="row" style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 12, height: 36, padding: '0 8px', borderRadius: 10 }}>
                  <span className="mono ell" style={{ color: 'var(--text-tertiary)' }}>{i.code}</span><span className="ell" style={{ fontWeight: 500 }}>{i.name}</span>
                  <span className="num" style={{ textAlign: 'right', color: main && i.levels[main.id] ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{main && i.levels[main.id] ? fmt(i.levels[main.id], i.unit) : '—'}</span>
                  {vans.map(v => { const q = i.levels[v.id] ?? 0, short = gap(i, v); return (
                    <span key={v.id} className="num" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, color: q ? 'var(--text-primary)' : short ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: short ? 500 : 400 }}>
                      {short ? (manage ? <button type="button" title={`Uzupełnij ${v.name} z bazy (MM)`} onClick={() => onMM(i.id, v.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0, border: 0, background: 'transparent', font: 'inherit', fontWeight: 500, color: 'inherit', minHeight: 0 }}>{I.warn}{fmt(0, i.unit)}</button> : <>{I.warn}{fmt(0, i.unit)}</>) : q ? fmt(q, i.unit) : '—'}
                    </span>); })}
                  <span className="num" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{fmt(total(i), i.unit)}</span>
                </div>
              ))}
            </section>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 12, height: 40, padding: '0 8px', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span /><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{I.mm}Do uzupełnienia</span><span />
            {shortages.map((n, k) => <span key={vans[k].id} className="num" style={{ textAlign: 'right', color: n ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: n ? 500 : 400 }}>{n ? `${n} ${n === 1 ? 'brak' : n < 5 ? 'braki' : 'braków'}` : '—'}</span>)}<span />
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ title, sub, children, onClose }: { title: string; sub?: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '96px 16px 16px', background: 'var(--scrim)' }}>
      <div role="dialog" aria-modal="true" aria-label={title} style={{ width: 'min(580px, 100%)', maxHeight: 'calc(100dvh - 120px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRadius: 16, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h2 style={{ margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 600 }}>{title}</h2>{sub && <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub}</span>}<span style={{ flex: '1 1 auto' }} /><button type="button" className="ib" aria-label="Zamknij" onClick={onClose} style={ib(24)}>{DI.x}</button></div>
        {children}
      </div>
    </div>
  );
}
const field: CSSProperties = { width: '100%', height: 32, minHeight: 0, padding: '0 10px', border: 0, borderRadius: 10, background: 'var(--bg-raised)', font: 'inherit', color: 'var(--text-primary)', boxShadow: 'none' };
const label: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-secondary)', margin: 0 };

function DocDialog({ kind, items, locations, manage, myVan, tickets, initialItem, initialFrom, initialTo, onClose, onDone }: { kind: 'PZ' | 'RW' | 'MM'; items: StockItem[]; locations: StockLocation[]; manage: boolean; myVan?: StockLocation; tickets: StockTicket[]; initialItem?: string; initialFrom?: string; initialTo?: string; onClose: () => void; onDone: (t: string) => void }) {
  const main = locations.find(l => l.kind === 'warehouse');
  const [itemId, setItemId] = useState(initialItem ?? items[0]?.id ?? ''), [ticketId, setTicketId] = useState(tickets[0]?.id ?? ''), [deviceId, setDeviceId] = useState('');
  const [from, setFrom] = useState(initialFrom ?? (kind === 'RW' ? (manage ? main?.id : myVan?.id) ?? '' : main?.id ?? '')), [to, setTo] = useState(initialTo ?? (kind === 'PZ' ? main?.id ?? '' : locations.find(l => l.kind === 'vehicle')?.id ?? ''));
  const [qty, setQty] = useState(''), [before, setBefore] = useState(''), [after, setAfter] = useState(''), [weigh, setWeigh] = useState(true), [op, setOp] = useState<'fill' | 'topup' | 'other'>('topup'), [supplier, setSupplier] = useState(''), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const item = items.find(i => i.id === itemId), ticket = tickets.find(t => t.id === ticketId);
  const isGas = item?.category === 'refrigerant' && item.unit === 'kg', useWeigh = kind === 'RW' && isGas && weigh;
  const amount = useWeigh ? parseNum(before) - parseNum(after) : parseNum(qty);
  const valid = !!item && amount > 0 && (kind !== 'RW' || !!ticketId) && (kind === 'PZ' ? !!to : !!from) && (kind !== 'MM' || (!!to && to !== from));
  const fromLevel = item && from ? item.levels[from] ?? 0 : 0, toLevel = item && to ? item.levels[to] ?? 0 : 0;
  const fromOptions = kind === 'RW' && !manage ? locations.filter(l => l.id === myVan?.id) : locations;
  useEffect(() => { setDeviceId(''); }, [ticketId]);
  async function submit() {
    if (!valid || !item) return; setBusy(true); setErr('');
    const line: Record<string, unknown> = { itemId: item.id, ...(useWeigh ? { massBefore: parseNum(before), massAfter: parseNum(after) } : { quantity: Math.round(amount * 1000) / 1000 }), ...(kind === 'RW' && isGas ? { operation: op } : {}), ...(kind === 'RW' && deviceId ? { deviceId } : {}) };
    try {
      const r = await fetch('/api/v1/stock/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), kind, from: kind === 'PZ' ? null : from, to: kind === 'RW' ? null : to, ticketId: kind === 'RW' ? ticketId : null, supplier: kind === 'PZ' ? supplier.trim() : '', note: note.trim(), lines: [line] }) }), body = await r.json();
      if (!r.ok) throw new Error(body.error?.message || 'Nie udało się zaksięgować dokumentu.');
      onDone(`Zaksięgowano ${stockDocumentResultSchema.parse(body).number}.`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Nie udało się zaksięgować.'); } finally { setBusy(false); }
  }
  const title = kind === 'PZ' ? 'Przyjęcie do magazynu' : kind === 'RW' ? 'Wydanie na zlecenie' : 'Przesunięcie między magazynami';
  const locSelect = (value: string, set: (v: string) => void, opts: StockLocation[], aria: string) => <select aria-label={aria} value={value} onChange={e => set(e.target.value)} style={field}>{opts.map(l => <option key={l.id} value={l.id}>{l.name}{item ? ` · ${fmt(item.levels[l.id] ?? 0, item.unit)}` : ''}</option>)}</select>;
  return (
    <Modal title={title} sub={kind === 'PZ' ? 'PZ' : kind === 'RW' ? 'RW' : 'MM'} onClose={onClose}>
      {kind === 'RW' && <select aria-label="Zlecenie" value={ticketId} onChange={e => setTicketId(e.target.value)} style={field}>{!tickets.length && <option value="">Brak otwartych zgłoszeń</option>}{tickets.map(t => <option key={t.id} value={t.id}>{ticketCode(t.number)} · {t.subject} · {t.customer}</option>)}</select>}
      {kind === 'RW' && ticket && ticket.devices.length > 0 && <select aria-label="Urządzenie" value={deviceId} onChange={e => setDeviceId(e.target.value)} style={field}><option value="">Urządzenie (opcjonalnie)</option>{ticket.devices.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <select aria-label="Pozycja" value={itemId} onChange={e => setItemId(e.target.value)} style={field}>{items.map(i => <option key={i.id} value={i.id}>{i.code} · {i.name}</option>)}</select>
        {kind === 'PZ' ? locSelect(to, setTo, locations, 'Do magazynu') : locSelect(from, setFrom, fromOptions, 'Z magazynu')}
      </div>
      {kind === 'MM' && <label style={label}>Do{locSelect(to, setTo, locations.filter(l => l.id !== from), 'Do magazynu')}</label>}
      {useWeigh ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12, borderRadius: 12, background: 'var(--bg-raised)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ flex: '1 1 auto', fontSize: 12, color: 'var(--text-secondary)' }}>Ważenie butli</span><button type="button" onClick={() => setWeigh(false)} style={{ padding: 0, border: 0, background: 'transparent', fontSize: 12, color: 'var(--text-secondary)', minHeight: 0 }}>Wpisz ilość ręcznie</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
            <label style={label}>Masa przed<input inputMode="decimal" value={before} onChange={e => setBefore(e.target.value)} placeholder="0,00" style={{ ...field, background: 'var(--bg-surface)', textAlign: 'right' }} /></label>
            <label style={label}>Masa po<input inputMode="decimal" value={after} onChange={e => setAfter(e.target.value)} placeholder="0,00" style={{ ...field, background: 'var(--bg-surface)', textAlign: 'right' }} /></label>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>Ilość wydana<span className="num" style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 15, fontWeight: 600, color: amount > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{amount > 0 ? fmt(Math.round(amount * 1000) / 1000, 'kg') : '—'}</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ flex: '1 1 auto', fontSize: 12, color: 'var(--text-secondary)' }}>Rodzaj operacji</span>
            <div role="group" aria-label="Rodzaj operacji" style={{ display: 'inline-flex', gap: 2, padding: 2, borderRadius: 8, background: 'var(--bg-subtle)' }}>{([['fill', 'Napełnienie'], ['topup', 'Uzupełnienie'], ['other', 'Inne']] as const).map(([v, l]) => <button key={v} type="button" aria-pressed={op === v} onClick={() => setOp(v)} style={{ height: 24, padding: '0 10px', border: 0, borderRadius: 6, background: op === v ? 'var(--bg-surface)' : 'transparent', color: op === v ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: op === v ? 500 : 400, minHeight: 0 }}>{l}</button>)}</div>
          </div>
        </div>
      ) : (
        <label style={label}>Ilość ({item?.unit ?? ''}){kind === 'RW' && isGas && <button type="button" onClick={() => setWeigh(true)} style={{ alignSelf: 'flex-start', padding: 0, border: 0, background: 'transparent', fontSize: 12, color: 'var(--text-secondary)', minHeight: 0 }}>Ważenie butli</button>}<input inputMode="decimal" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" style={{ ...field, textAlign: 'right' }} /></label>
      )}
      {kind === 'PZ' && <label style={label}>Dostawca<input value={supplier} maxLength={120} onChange={e => setSupplier(e.target.value)} placeholder="np. hurtownia, nr faktury" style={field} /></label>}
      {item && amount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Po zatwierdzeniu</span>
          {kind !== 'PZ' && from && <Row l={locations.find(l => l.id === from)?.name ?? ''} v={`${fmt(fromLevel, item.unit)} → ${fmt(Math.round((fromLevel - amount) * 1000) / 1000, item.unit)}`} warn={fromLevel - amount < 0} />}
          {kind !== 'RW' && to && <Row l={locations.find(l => l.id === to)?.name ?? ''} v={`${fmt(toLevel, item.unit)} → ${fmt(Math.round((toLevel + amount) * 1000) / 1000, item.unit)}`} />}
          {kind === 'RW' && item.reservations.some(r => r.ticketId === ticketId) && <Row l={`Rezerwacja ${ticket ? ticketCode(ticket.number) : ''}`} v="zamknięta" />}
          {kind === 'RW' && <Row l="Materiały zlecenia" v="dopisane z numerem RW" />}
          {kind === 'RW' && item.gwp !== null && <Row l="CO₂e" v={`+${(Math.round(amount * item.gwp) / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 2 })} t`} />}
        </div>
      )}
      <textarea aria-label="Uwagi" rows={2} maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Uwagi" style={{ ...field, height: 'auto', padding: '8px 10px', resize: 'none' }} />
      {err && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button type="button" className="sec" onClick={onClose} style={{ ...sec, height: 32, padding: '0 12px' }}>Anuluj</button><button type="button" className="pri" disabled={!valid || busy} onClick={() => void submit()} style={{ ...pri, height: 32, padding: '0 12px', opacity: !valid || busy ? 0.6 : 1 }}>{busy ? 'Księgowanie…' : kind === 'RW' ? `Wydaj${item && amount > 0 ? ` ${fmt(Math.round(amount * 1000) / 1000, item.unit)}` : ''}` : kind === 'PZ' ? 'Przyjmij' : 'Przesuń'}</button></div>
    </Modal>
  );
}
function Row({ l, v, warn }: { l: string; v: string; warn?: boolean }) { return <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}><span style={{ flex: '1 1 auto', color: 'var(--text-secondary)' }}>{l}</span><span className="num" style={{ color: warn ? 'var(--danger)' : 'var(--text-primary)' }}>{v}</span></div>; }

function ItemDialog({ item, onClose, onDone }: { item?: StockItem; onClose: () => void; onDone: (t: string) => void }) {
  const [f, setF] = useState({ code: item?.code ?? '', name: item?.name ?? '', category: item?.category ?? 'parts', unit: item?.unit ?? 'szt.', min: item ? String(item.minQuantity).replace('.', ',') : '0', bin: item?.bin ?? '', cls: item?.refrigerantClass ?? '', gwp: item?.gwp?.toString() ?? '', container: item?.container ?? '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF(s => ({ ...s, [k]: e.target.value }));
  const gas = f.category === 'refrigerant';
  async function save() {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/v1/stock/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item?.id ?? crypto.randomUUID(), code: f.code, name: f.name, category: f.category, unit: f.unit, minQuantity: parseNum(f.min) || 0, bin: f.bin.trim(), refrigerantClass: gas ? f.cls.trim() : '', gwp: gas && f.gwp ? Number(f.gwp) : null, container: f.container.trim() }) }), b = await r.json();
      if (!r.ok) throw new Error(b.error?.message || 'Nie udało się zapisać pozycji.');
      onDone(item ? 'Pozycja zapisana.' : 'Dodano pozycję. Przyjmij ją dokumentem PZ.');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }
  return (
    <Modal title={item ? 'Edycja pozycji' : 'Nowa pozycja'} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
        <label style={label}>Indeks<input value={f.code} maxLength={32} onChange={set('code')} placeholder="CZ-R32" style={{ ...field, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }} /></label>
        <label style={label}>Nazwa<input value={f.name} maxLength={160} onChange={set('name')} placeholder="R32" style={field} /></label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 100px', gap: 8 }}>
        <label style={label}>Kategoria<select value={f.category} onChange={set('category')} style={field}>{Object.entries(stockCategories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label style={label}>Jednostka<select value={f.unit} onChange={set('unit')} style={field}>{stockUnits.map(u => <option key={u}>{u}</option>)}</select></label>
        <label style={label}>Minimum<input inputMode="decimal" value={f.min} onChange={set('min')} style={{ ...field, textAlign: 'right' }} /></label>
        <label style={label}>Półka<input value={f.bin} maxLength={20} onChange={set('bin')} placeholder="C-01" style={field} /></label>
      </div>
      {gas && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <label style={label}>Rodzaj<input value={f.cls} maxLength={20} onChange={set('cls')} placeholder="HFC" style={field} /></label>
        <label style={label}>GWP<input inputMode="numeric" value={f.gwp} onChange={set('gwp')} placeholder="675" style={{ ...field, textAlign: 'right' }} /></label>
        <label style={label}>Opakowanie<input value={f.container} maxLength={40} onChange={set('container')} placeholder="butla 9 kg" style={field} /></label>
      </div>}
      {err && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button type="button" className="sec" onClick={onClose} style={{ ...sec, height: 32, padding: '0 12px' }}>Anuluj</button><button type="button" className="pri" disabled={busy || !f.code || !f.name} onClick={() => void save()} style={{ ...pri, height: 32, padding: '0 12px' }}>{busy ? 'Zapisywanie…' : 'Zapisz'}</button></div>
    </Modal>
  );
}

function VehicleDialog({ technicians, onClose, onDone }: { technicians: { id: string; label: string }[]; onClose: () => void; onDone: (t: string) => void }) {
  const [tech, setTech] = useState(technicians[0]?.id ?? ''), [name, setName] = useState(''), [plate, setPlate] = useState(''), [err, setErr] = useState('');
  const def = useMemo(() => `Bus ${personName(technicians.find(t => t.id === tech)?.label ?? '')}`, [tech, technicians]);
  async function save() {
    const r = await fetch('/api/v1/stock/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), technicianId: tech, name: (name || def).trim(), plate: plate.trim().toUpperCase() }) });
    if (!r.ok) { setErr((await r.json()).error?.message || 'Nie udało się dodać samochodu.'); return; }
    onDone('Dodano samochód.');
  }
  return (
    <Modal title="Samochód technika" onClose={onClose}>
      {!technicians.length ? <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Każdy aktywny technik ma już samochód.</p> : <>
        <label style={label}>Technik<select value={tech} onChange={e => setTech(e.target.value)} style={field}>{technicians.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 8 }}><label style={label}>Nazwa<input value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder={def} style={field} /></label><label style={label}>Rejestracja<input value={plate} maxLength={20} onChange={e => setPlate(e.target.value)} placeholder="GD 2N551" style={field} /></label></div>
      </>}
      {err && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button type="button" className="sec" onClick={onClose} style={{ ...sec, height: 32, padding: '0 12px' }}>Anuluj</button>{technicians.length > 0 && <button type="button" className="pri" disabled={!tech} onClick={() => void save()} style={{ ...pri, height: 32, padding: '0 12px' }}>Dodaj</button>}</div>
    </Modal>
  );
}
