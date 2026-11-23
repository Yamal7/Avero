'use client';
/* Magazyn — ported 1:1 from the design artboards "Magazyn · jasny", "wydanie na zlecenie (RW)" and "w samochodach". */
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { stockCategories, stockDocumentResultSchema, stockMovesSchema, stockRefillResultSchema, stockUnits, type StockDraft, type StockItem, type StockLocation, type StockMove, type StockOverview } from '@hvac/api-client';
import { PersonAvatar } from '@/components/glyphs';
import { personName, taskNumber, ticketCode } from '@/lib/tasks/labels';
import { Archive, ArrowLineDown, ArrowLineUp, ArrowsLeftRight, CaretDown, CaretRight, Cloud, Cube, Drop, FileText, Folder, Gauge, Hash, Lock, NotePencil, Plus, Rows, SidebarSimple, Truck, Warning, WarningCircle, X } from '@phosphor-icons/react/ssr';

export type StockTicket = { id: string; number: number; subject: string; customer: string; devices: { id: string; label: string }[] };
export type StockTask = { id: string; number: number; title: string; customerId: string; customer: string };
type DocKind = 'PZ' | 'RW' | 'MM' | 'WZ';
type View = 'all' | 'refrigerant' | 'below' | 'vehicles';
type Dialog = { kind: DocKind; itemId?: string; from?: string; to?: string; draft?: StockDraft } | { kind: 'item'; item?: StockItem } | { kind: 'vehicle' } | null;

const I = {
  box: <Archive size={16} className="shrink-0" aria-hidden />,
  lock: <Lock size={12} className="shrink-0 text-tertiary" aria-hidden />,
  warn: <Warning size={14} className="shrink-0 text-warning" aria-hidden />,
  err: <WarningCircle size={14} className="shrink-0 text-danger" aria-hidden />,
  out: <ArrowLineUp size={14} className="shrink-0 text-tertiary" aria-hidden />,
  in: <ArrowLineDown size={14} className="shrink-0 text-success" aria-hidden />,
  mm: <ArrowsLeftRight size={14} className="shrink-0" aria-hidden />,
  drop: <Drop size={14} className="shrink-0" aria-hidden />,
  cube: <Cube size={14} className="shrink-0" aria-hidden />,
  cloud: <Cloud size={14} className="shrink-0" aria-hidden />,
  gauge: <Gauge size={14} className="shrink-0" aria-hidden />,
  shelf: <Rows size={16} className="shrink-0 text-tertiary" aria-hidden />,
  folder: <Folder size={16} className="shrink-0 text-tertiary" aria-hidden />,
  hash: <Hash size={16} className="shrink-0 text-tertiary" aria-hidden />,
  min: <Gauge size={16} className="shrink-0 text-tertiary" aria-hidden />,
  draft: <FileText size={14} className="shrink-0 text-tertiary" aria-hidden />,
  truck: <Truck size={14} className="shrink-0 text-tertiary" aria-hidden />,
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

export function StockView({ data, view, tickets, tasks = [], technicians }: { data: StockOverview; view: View; tickets: StockTicket[]; tasks?: StockTask[]; technicians: { id: string; label: string }[] }) {
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
        <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{I.box}</span><span style={{ color: 'var(--text-secondary)' }}>Finanse i magazyn</span><span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}><CaretRight size={12} className="shrink-0" aria-hidden /></span>
        <h1 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Magazyn</h1><span style={{ flex: '1 1 auto' }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginRight: 4 }}>{items.length} pozycji · {belowCount} poniżej minimum</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: '8px 12px 8px 16px' }}>
        <div role="tablist" aria-label="Zapisane widoki" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {([['all', 'Wszystkie'], ['refrigerant', 'Czynniki chłodnicze'], ['below', 'Poniżej minimum'], ['vehicles', 'W samochodach']] as [View, string][]).map(([v, l]) => <Link key={v} role="tab" aria-selected={view === v} className="tab" href={href(v)} style={tab(view === v)}>{l}</Link>)}
        </div>
        <span style={{ flex: '1 1 auto' }} />
        {view !== 'vehicles' && <button type="button" className={`ib${panelOn ? ' on' : ''}`} aria-label="Panel szczegółów" aria-pressed={panelOn} title="Panel szczegółów" onClick={() => setPanelOn(v => !v)} style={ib(28)}><SidebarSimple size={16} mirrored className="shrink-0" aria-hidden /></button>}
        {manage && <button type="button" className="sec" title="Nowa pozycja magazynowa" onClick={() => setDialog({ kind: 'item' })} style={{ ...sec, marginLeft: 4 }}><Plus size={14} className="shrink-0" aria-hidden />Pozycja</button>}
        {data.drafts.map(d => <button key={d.id} type="button" className="sec" title={`Szkic ${d.kind} z ${full(d.updatedAt)}`} onClick={() => setDialog({ kind: d.kind, draft: d, itemId: typeof d.payload.itemId === 'string' ? d.payload.itemId : undefined })} style={{ ...sec, fontWeight: 400, color: 'var(--text-secondary)' }}>{I.draft}Szkic {d.kind}</button>)}
        {manage && <button type="button" className="sec" title="Przyjęcie (PZ)" onClick={() => setDialog({ kind: 'PZ', itemId: selected?.id })} style={sec}>{I.in}Przyjęcie</button>}
        {manage && <button type="button" className="sec" title="Wydanie zewnętrzne, np. sprzedaż (WZ)" onClick={() => setDialog({ kind: 'WZ', itemId: selected?.id })} style={sec}>{I.out}WZ</button>}
        <button type="button" className="pri" title="Wydanie na zlecenie (RW)" onClick={() => setDialog({ kind: 'RW', itemId: selected?.id })} disabled={!manage && !myVan} style={pri}><span style={{ display: 'inline-flex', transform: 'rotate(0deg)' }}>{I.out}</span>Wydanie</button>
      </div>
      {notice && <p role="status" style={{ margin: '0 20px 8px', fontSize: 12, color: 'var(--success)' }}>{notice}</p>}

      {view === 'vehicles'
        ? <Vehicles items={items} main={main} vans={vans} manage={manage} onMM={(itemId, to) => setDialog({ kind: 'MM', itemId, from: main?.id, to })} onAddVan={() => setDialog({ kind: 'vehicle' })} onDone={done} onError={setNotice} />
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
                          <span className="caret" style={{ display: 'inline-flex', color: 'var(--text-tertiary)', transform: collapsed[g.c] ? 'rotate(-90deg)' : 'rotate(0deg)' }}><CaretDown size={14} className="shrink-0" aria-hidden /></span>
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
            {selected && <ItemPanel item={selected} locations={data.locations} manage={manage} canIssue={manage || !!myVan} onClose={() => setPanelOn(false)} onDoc={kind => setDialog({ kind, itemId: selected.id })} onEdit={() => setDialog({ kind: 'item', item: selected })} tickets={tickets} tasks={tasks} onReserved={() => { setNotice('Zarezerwowano.'); router.refresh(); }} />}
          </div>
        )}
      {dialog && dialog.kind === 'item' && <ItemDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
      {dialog && dialog.kind === 'vehicle' && <VehicleDialog technicians={technicians.filter(t => !vans.some(v => v.technicianId === t.id))} onClose={() => setDialog(null)} onDone={done} />}
      {dialog && (dialog.kind === 'PZ' || dialog.kind === 'RW' || dialog.kind === 'MM' || dialog.kind === 'WZ') && <DocDialog key={dialog.draft?.id ?? dialog.kind} draft={dialog.draft} kind={dialog.kind} items={items} locations={data.locations} manage={manage} myVan={myVan} tickets={tickets} initialItem={dialog.itemId} initialFrom={dialog.from} initialTo={dialog.to} onClose={() => setDialog(null)} onDone={done} />}
    </main>
  );
}

function ItemPanel({ item, locations, manage, canIssue, onClose, onDoc, onEdit, tickets, tasks, onReserved }: { item: StockItem; locations: StockLocation[]; manage: boolean; canIssue: boolean; onClose: () => void; onDoc: (k: DocKind) => void; onEdit: () => void; tickets: StockTicket[]; tasks: StockTask[]; onReserved: () => void }) {
  const [moves, setMoves] = useState<StockMove[] | null>(null), [reserve, setReserve] = useState(false), [rTicket, setRTicket] = useState(''), [rQty, setRQty] = useState(''), [err, setErr] = useState('');
  useEffect(() => { setMoves(null); const c = new AbortController(); fetch(`/api/v1/stock/items/${item.id}/moves`, { cache: 'no-store', signal: c.signal }).then(r => (r.ok ? r.json() : [])).then(b => { const p = stockMovesSchema.safeParse(b); if (p.success) setMoves(p.data); }).catch(() => {}); return () => c.abort(); }, [item.id, item.lastMove?.at]);
  const t = total(item), a = avail(item), low = below(item);
  async function doReserve() {
    const q = parseNum(rQty); if (!rTicket || !(q > 0)) { setErr('Wybierz zgłoszenie albo zadanie i ilość.'); return; }
    const [kind, target] = rTicket.split(':');
    const r = await fetch('/api/v1/stock/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), itemId: item.id, ticketId: kind === 'ticket' ? target : null, taskId: kind === 'task' ? target : null, quantity: q }) });
    if (!r.ok) { setErr((await r.json()).error?.message || 'Nie udało się zarezerwować.'); return; }
    setReserve(false); setRQty(''); setErr(''); onReserved();
  }
  const prop = (icon: ReactNode, value: ReactNode, title: string) => <div title={title} style={{ minHeight: 32, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8 }}>{icon}<span className="ell">{value}</span></div>;
  return (
    <aside aria-label={`Pozycja magazynowa ${item.code}`} className="tl-panel" style={{ flex: '0 0 400px', minWidth: 0, borderLeft: '1px solid var(--edge)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 44, padding: '0 8px 0 20px' }}>
        <span className="mono" style={{ color: 'var(--text-tertiary)' }}>{item.code}</span><span style={{ flex: '1 1 auto' }} />
        {manage && <button type="button" className="ib" aria-label="Edytuj pozycję" title="Edytuj" onClick={onEdit} style={ib(24)}><NotePencil size={16} className="shrink-0" aria-hidden /></button>}
        <button type="button" className="ib" aria-label="Zamknij panel" title="Zamknij  Esc" onClick={onClose} style={ib(24)}>{<X size={16} className="shrink-0" aria-hidden />}</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 20px 16px' }}>
        <h2 style={{ margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 600, letterSpacing: '-0.01em' }}>{item.name}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {item.refrigerantClass && <span title={`Czynnik chłodniczy ${item.refrigerantClass}`} style={chip}>{I.drop}<span>{item.refrigerantClass}</span></span>}
          {item.container && <span title={item.container} style={chip}>{I.cube}<span>{item.container}</span></span>}
          {item.gwp !== null && <span title={`Współczynnik GWP ${item.gwp}`} style={chip}>{I.cloud}<span>GWP {item.gwp}</span></span>}
        </div>
      </div>
      <section aria-label="Stan" title="Stan zmienia tylko dokument: PZ, RW, WZ, MM" style={{ margin: '0 20px 16px', padding: 12, display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 12, background: 'var(--bg-raised)' }}>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0px, 1fr))', gap: 8 }}>
          {[['Stan', I.cube, fmt(t, item.unit), null], ['Rezerwacja', I.lock, fmt(item.reserved, item.unit), null], ['Dostępne', I.gauge, fmt(a, item.unit), a < 0 ? I.err : low ? I.warn : null]].map(([l, ic, v, w]) => (
            <div key={l as string}><dt style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}>{ic}{l}</dt><dd className="num" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, lineHeight: '22px', fontWeight: 600 }}>{w}{v}</dd></div>
          ))}
        </dl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {item.minQuantity > 0 && <span title={low ? `Brakuje ${fmt(item.minQuantity - a, item.unit)}` : 'Minimalny stan'} style={{ ...chip, background: 'var(--bg-surface)' }}>{I.gauge}min {fmt(item.minQuantity, item.unit)}</span>}
          {item.reservations.map(r => <Link key={r.id} href={r.ticketId ? `/dashboard/service/${r.ticketId}` : `/dashboard/customers/${r.taskCustomerId}?tab=tasks&filter=all#crm-${r.taskId}`} title={`Rezerwacja ${fmt(r.quantity, item.unit)}`} style={{ ...chip, background: 'var(--bg-surface)' }}>{I.lock}{r.ticketNumber !== null ? ticketCode(r.ticketNumber) : r.taskNumber !== null ? taskNumber(r.taskNumber) : 'Rezerwacja'}</Link>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {manage && <button type="button" onClick={() => onDoc('PZ')} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.in}PZ</button>}
          {canIssue && <button type="button" onClick={() => onDoc('RW')} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.out}RW</button>}
          {manage && <button type="button" onClick={() => onDoc('MM')} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.mm}MM</button>}
          {manage && <button type="button" title="Wydanie zewnętrzne" onClick={() => onDoc('WZ')} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.out}WZ</button>}
          {manage && <button type="button" onClick={() => setReserve(v => !v)} style={{ ...sec, background: 'var(--bg-surface)', height: 28 }}>{I.lock}Rezerwuj</button>}
        </div>
        {reserve && <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}><select aria-label="Zgłoszenie" value={rTicket} onChange={e => setRTicket(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0, height: 28, minHeight: 0, borderRadius: 8, border: 0, background: 'var(--bg-surface)', font: 'inherit', fontSize: 12 }}><option value="">Zgłoszenie lub zadanie…</option><optgroup label="Zgłoszenia">{tickets.map(t => <option key={t.id} value={`ticket:${t.id}`}>{ticketCode(t.number)} · {t.subject}</option>)}</optgroup>{tasks.length > 0 && <optgroup label="Zadania">{tasks.map(t => <option key={t.id} value={`task:${t.id}`}>{taskNumber(t.number)} · {t.title} · {t.customer}</option>)}</optgroup>}</select><input aria-label="Ilość" inputMode="decimal" placeholder={item.unit} value={rQty} onChange={e => setRQty(e.target.value)} style={{ width: 64, height: 28, minHeight: 0, borderRadius: 8, border: 0, background: 'var(--bg-surface)', textAlign: 'right', font: 'inherit', fontSize: 12, padding: '0 6px' }} /><button type="button" className="pri" onClick={() => void doReserve()} style={{ ...pri, height: 28 }}>OK</button></div>}
        {err && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      </section>
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column' }}>
        {item.minQuantity > 0 && prop(I.min, `Minimum ${fmt(item.minQuantity, item.unit)}`, 'Minimalny stan')}
        {item.bin && prop(I.shelf, <span className="mono">{item.bin}</span>, 'Lokalizacja na półce')}
        {prop(I.folder, stockCategories[item.category], 'Kategoria')}
        {prop(I.hash, <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{item.unit}{item.unitLocked && I.lock}</span>, item.unitLocked ? 'Jednostka zablokowana: pozycja ma już ruchy' : 'Jednostka')}
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
              <span className="ell" title={m.cylinder ? `Butla ${m.cylinder}` : undefined}>{m.ticketNumber ? <Link href={`/dashboard/service/${m.ticketId}`}>{ticketCode(m.ticketNumber)}</Link> : m.kind === 'PZ' ? (m.supplier || 'Dostawa') : m.kind === 'WZ' ? (m.supplier || 'Wydanie zewnętrzne') : locations.find(l => l.id === m.locationId)?.name}{m.cylinder && <span className="mono" style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>{m.cylinder}</span>}</span>
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

function Vehicles({ items, main, vans, manage, onMM, onAddVan, onDone, onError }: { items: StockItem[]; main?: StockLocation; vans: StockLocation[]; manage: boolean; onMM: (itemId: string, to: string) => void; onAddVan: () => void; onDone: (t: string) => void; onError: (t: string) => void }) {
  /* Each van has its own minimum per item; a van without a minimum for an item shows a grey dash when empty. */
  const carried = items.filter(i => vans.some(v => (i.levels[v.id] ?? 0) !== 0 || (i.vehicleMins[v.id] ?? 0) > 0) || (main && (i.levels[main.id] ?? 0) > 0));
  const short = (i: StockItem, v: StockLocation) => Math.max(0, (i.vehicleMins[v.id] ?? 0) - (i.levels[v.id] ?? 0));
  const shortages = vans.map(v => carried.filter(i => short(i, v) > 0).length), totalShort = shortages.reduce((a, b) => a + b, 0);
  const [editing, setEditing] = useState<string | null>(null), [draft, setDraft] = useState(''), [busy, setBusy] = useState(false), request = useRef<string | null>(null);
  const cols = `84px minmax(0px, 1fr) 96px ${vans.map(() => '112px').join(' ')} 92px`;
  const groups = (Object.keys(stockCategories) as (keyof typeof stockCategories)[]).map(c => ({ c, rows: carried.filter(i => i.category === c) })).filter(g => g.rows.length);
  async function saveMin(i: StockItem, v: StockLocation) {
    const n = draft.trim() === '' ? 0 : parseNum(draft); setEditing(null);
    if (!(n >= 0) || n === (i.vehicleMins[v.id] ?? 0)) return;
    const r = await fetch('/api/v1/stock/minimums', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locationId: v.id, itemId: i.id, minQuantity: Math.round(n * 1000) / 1000 }) });
    if (!r.ok) { onError((await r.json()).error?.message || 'Nie udało się zapisać minimum.'); return; }
    onDone(n ? `Minimum ${i.code} w ${v.name}: ${fmt(n, i.unit)}.` : `Usunięto minimum ${i.code} w ${v.name}.`);
  }
  async function refill() {
    setBusy(true); request.current ??= crypto.randomUUID();
    try {
      const r = await fetch('/api/v1/stock/refill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: request.current }) }), b = await r.json();
      if (!r.ok) throw new Error(b.error?.message || 'Nie udało się uzupełnić braków.');
      const docs = stockRefillResultSchema.parse(b); request.current = null;
      onDone(docs.length ? `Zaksięgowano ${docs.map(d => d.number).join(', ')}.` : 'W bazie nie ma towaru na uzupełnienie braków.');
    } catch (e) { onError(e instanceof Error ? e.message : 'Nie udało się uzupełnić braków.'); } finally { setBusy(false); }
  }
  return (
    <div style={{ flex: '1 1 auto', minWidth: 0, padding: '0 12px 24px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 8px' }}>
        {totalShort > 0 && <span title="Pozycje poniżej minimum ustalonego dla samochodu" style={{ ...chip, padding: '0 8px 0 6px' }}>{I.warn}{totalShort} {totalShort === 1 ? 'brak' : totalShort < 5 ? 'braki' : 'braków'}</span>}
        <span style={{ flex: '1 1 auto' }} />
        {manage && <button type="button" className="sec" onClick={onAddVan} style={sec}><Plus size={14} className="shrink-0" aria-hidden />Samochód</button>}
        {manage && totalShort > 0 && <button type="button" className="pri" disabled={busy} title="Jedno przesunięcie MM z bazy do każdego samochodu z brakami" onClick={() => void refill()} style={{ ...pri, opacity: busy ? 0.6 : 1 }}>{I.mm}{busy ? 'Księgowanie…' : `Uzupełnij braki (${totalShort})`}</button>}
      </div>
      {!vans.length ? <p style={{ margin: 0, padding: '16px 8px', color: 'var(--text-secondary)' }}>{manage ? 'Nie ma jeszcze samochodów. Dodaj samochód technika, a potem przesuń do niego towar dokumentem MM.' : 'Biuro nie dodało jeszcze samochodów.'}</p> : (
        <div style={{ minWidth: 480 + vans.length * 124, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 12, height: 32, padding: '0 8px', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Indeks</span><span>Nazwa</span><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>{I.cube}Baza</span>
            {vans.map(v => <span key={v.id} title={`${v.name}${v.plate ? ` · ${v.plate}` : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>{I.truck}<PersonAvatar id={v.technicianId!} label={v.technicianLabel ?? v.name} /></span>)}
            <span style={{ textAlign: 'right' }}>Razem</span>
          </div>
          {groups.map(g => (
            <section key={g.c} style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 10px' }}><span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}><CaretDown size={14} className="shrink-0" aria-hidden /></span><h2 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>{stockCategories[g.c]}</h2><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{g.rows.length}</span></div>
              {g.rows.map(i => (
                <div key={i.id} className="row" style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 12, height: 36, padding: '0 8px', borderRadius: 10 }}>
                  <span className="mono ell" style={{ color: 'var(--text-tertiary)' }}>{i.code}</span><span className="ell" style={{ fontWeight: 500 }}>{i.name}</span>
                  <span className="num" style={{ textAlign: 'right', color: main && i.levels[main.id] ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{main && i.levels[main.id] ? fmt(i.levels[main.id], i.unit) : '—'}</span>
                  {vans.map(v => {
                    const q = i.levels[v.id] ?? 0, min = i.vehicleMins[v.id] ?? 0, miss = short(i, v), key = `${i.id}:${v.id}`;
                    if (editing === key) return <span key={v.id} style={{ display: 'flex', justifyContent: 'flex-end' }}><input autoFocus aria-label={`Minimum ${i.code} w ${v.name}`} inputMode="decimal" value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => void saveMin(i, v)} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditing(null); }} placeholder="min" style={{ width: 72, height: 28, minHeight: 0, padding: '0 8px', border: 0, borderRadius: 8, background: 'var(--bg-raised)', textAlign: 'right', font: 'inherit', fontSize: 12 }} /></span>;
                    const title = `${v.name}: ${fmt(q, i.unit)}${min ? ` · minimum ${fmt(min, i.unit)}` : ' · bez minimum'}${miss ? ` · brakuje ${fmt(miss, i.unit)}` : ''}${manage ? ' · kliknij dwukrotnie, aby ustawić minimum' : ''}`;
                    return (
                      <span key={v.id} className="num" title={title} onDoubleClick={() => { if (manage) { setEditing(key); setDraft(min ? String(min).replace('.', ',') : ''); } }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, color: q || miss ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: miss ? 500 : 400, cursor: manage ? 'cell' : undefined }}>
                        {miss ? (manage ? <button type="button" title={`Uzupełnij ${v.name} z bazy (MM)`} onClick={() => onMM(i.id, v.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0, border: 0, background: 'transparent', font: 'inherit', fontWeight: 500, color: 'inherit', minHeight: 0 }}>{I.warn}{fmt(q, i.unit)}</button> : <>{I.warn}{fmt(q, i.unit)}</>) : q ? fmt(q, i.unit) : '—'}
                        {min > 0 && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary)' }}>/{min.toLocaleString('pl-PL', { maximumFractionDigits: 3 })}</span>}
                      </span>);
                  })}
                  <span className="num" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{fmt(total(i), i.unit)}</span>
                </div>
              ))}
            </section>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 12, height: 40, padding: '0 8px', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span /><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{I.mm}Do uzupełnienia</span><span />
            {shortages.map((n, k) => <span key={vans[k].id} className="num" style={{ textAlign: 'right', color: n ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: n ? 500 : 400 }}>{n ? `${n} ${n === 1 ? 'brak' : n < 5 ? 'braki' : 'braków'}` : '—'}</span>)}<span />
          </div>
          {manage && <p style={{ margin: '4px 8px 0', fontSize: 12, color: 'var(--text-tertiary)' }}>Minimum dla samochodu ustawisz, klikając dwukrotnie komórkę. Liczba po ukośniku to minimum.</p>}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h2 style={{ margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 600 }}>{title}</h2>{sub && <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub}</span>}<span style={{ flex: '1 1 auto' }} /><button type="button" className="ib" aria-label="Zamknij" onClick={onClose} style={ib(24)}>{<X size={16} className="shrink-0" aria-hidden />}</button></div>
        {children}
      </div>
    </div>
  );
}
const field: CSSProperties = { width: '100%', height: 32, minHeight: 0, padding: '0 10px', border: 0, borderRadius: 10, background: 'var(--bg-raised)', font: 'inherit', color: 'var(--text-primary)', boxShadow: 'none' };
const label: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-secondary)', margin: 0 };

function DocDialog({ kind, draft, items, locations, manage, myVan, tickets, initialItem, initialFrom, initialTo, onClose, onDone }: { kind: DocKind; draft?: StockDraft; items: StockItem[]; locations: StockLocation[]; manage: boolean; myVan?: StockLocation; tickets: StockTicket[]; initialItem?: string; initialFrom?: string; initialTo?: string; onClose: () => void; onDone: (t: string) => void }) {
  const main = locations.find(l => l.kind === 'warehouse');
  const d = (k: string) => (typeof draft?.payload[k] === 'string' ? draft.payload[k] as string : undefined);
  const docId = useRef(draft?.id ?? crypto.randomUUID());
  const [itemId, setItemId] = useState(d('itemId') ?? initialItem ?? items[0]?.id ?? ''), [ticketId, setTicketId] = useState(d('ticketId') ?? tickets[0]?.id ?? ''), [deviceId, setDeviceId] = useState(d('deviceId') ?? '');
  const [from, setFrom] = useState(d('from') ?? initialFrom ?? (kind === 'RW' ? (manage ? main?.id : myVan?.id) ?? '' : main?.id ?? '')), [to, setTo] = useState(d('to') ?? initialTo ?? (kind === 'PZ' ? main?.id ?? '' : locations.find(l => l.kind === 'vehicle')?.id ?? ''));
  const [qty, setQty] = useState(d('qty') ?? ''), [before, setBefore] = useState(d('before') ?? ''), [after, setAfter] = useState(d('after') ?? ''), [weigh, setWeigh] = useState(d('weigh') !== 'no'), [op, setOp] = useState<'fill' | 'topup' | 'other'>((d('op') as 'fill' | 'topup' | 'other') ?? 'topup'), [supplier, setSupplier] = useState(d('supplier') ?? ''), [note, setNote] = useState(d('note') ?? ''), [cylinder, setCylinder] = useState(d('cylinder') ?? ''), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const item = items.find(i => i.id === itemId), ticket = tickets.find(t => t.id === ticketId);
  const isGas = item?.category === 'refrigerant' && item.unit === 'kg', useWeigh = kind === 'RW' && isGas && weigh;
  const filled = (v: string) => v.trim() !== '';
  const amount = useWeigh ? (filled(before) && filled(after) ? parseNum(before) - parseNum(after) : NaN) : filled(qty) ? parseNum(qty) : NaN;
  const valid = !!item && amount > 0 && (kind !== 'RW' || !!ticketId) && (kind !== 'WZ' || supplier.trim().length > 0) && (kind === 'PZ' ? !!to : !!from) && (kind !== 'MM' || (!!to && to !== from));
  const fromLevel = item && from ? item.levels[from] ?? 0 : 0, toLevel = item && to ? item.levels[to] ?? 0 : 0;
  const fromOptions = kind === 'RW' && !manage ? locations.filter(l => l.id === myVan?.id) : locations;
  const firstTicket = useRef(true);
  useEffect(() => { if (firstTicket.current) { firstTicket.current = false; return; } setDeviceId(''); }, [ticketId]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void submit(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); });
  async function saveDraft() {
    setBusy(true); setErr('');
    try {
      const payload = { itemId, ticketId, deviceId, from, to, qty, before, after, weigh: weigh ? 'yes' : 'no', op, supplier, note, cylinder };
      const r = await fetch('/api/v1/stock/drafts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: docId.current, kind, payload }) });
      if (!r.ok) throw new Error((await r.json()).error?.message || 'Nie udało się zapisać szkicu.');
      onDone(`Zapisano szkic ${kind}. Znajdziesz go na pasku nad tabelą.`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Nie udało się zapisać szkicu.'); } finally { setBusy(false); }
  }
  async function dropDraft() {
    if (!draft) return; setBusy(true);
    const r = await fetch('/api/v1/stock/drafts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: draft.id }) });
    setBusy(false); if (r.ok) onDone('Usunięto szkic.'); else setErr('Nie udało się usunąć szkicu.');
  }
  async function submit() {
    if (!valid || !item || busy) return; setBusy(true); setErr('');
    const line: Record<string, unknown> = { itemId: item.id, ...(useWeigh ? { massBefore: parseNum(before), massAfter: parseNum(after) } : { quantity: Math.round(amount * 1000) / 1000 }), ...(kind === 'RW' && isGas ? { operation: op } : {}), ...(kind === 'RW' && deviceId ? { deviceId } : {}), ...(isGas && cylinder.trim() ? { cylinder: cylinder.trim() } : {}) };
    try {
      const r = await fetch('/api/v1/stock/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: docId.current, kind, from: kind === 'PZ' ? null : from, to: kind === 'RW' || kind === 'WZ' ? null : to, ticketId: kind === 'RW' ? ticketId : null, supplier: kind === 'PZ' || kind === 'WZ' ? supplier.trim() : '', note: note.trim(), lines: [line] }) }), body = await r.json();
      if (!r.ok) throw new Error(body.error?.message || 'Nie udało się zaksięgować dokumentu.');
      onDone(`Zaksięgowano ${stockDocumentResultSchema.parse(body).number}.`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Nie udało się zaksięgować.'); } finally { setBusy(false); }
  }
  const title = kind === 'PZ' ? 'Przyjęcie do magazynu' : kind === 'RW' ? 'Wydanie na zlecenie' : kind === 'WZ' ? 'Wydanie zewnętrzne' : 'Przesunięcie między magazynami';
  const locSelect = (value: string, set: (v: string) => void, opts: StockLocation[], aria: string) => <select aria-label={aria} value={value} onChange={e => set(e.target.value)} style={field}>{opts.map(l => <option key={l.id} value={l.id}>{l.name}{item ? ` · ${fmt(item.levels[l.id] ?? 0, item.unit)}` : ''}</option>)}</select>;
  return (
    <Modal title={title} sub={draft ? `${kind} · szkic` : kind} onClose={onClose}>
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
      {isGas && <label style={label}>Numer butli<input value={cylinder} maxLength={40} onChange={e => setCylinder(e.target.value)} placeholder="np. B-0417" style={{ ...field, fontFamily: 'var(--font-mono)' }} /></label>}
      {kind === 'WZ' && <label style={label}>Odbiorca<input value={supplier} maxLength={120} onChange={e => setSupplier(e.target.value)} placeholder="Firma lub osoba, nr dokumentu sprzedaży" style={field} /></label>}
      {kind === 'PZ' && <label style={label}>Dostawca<input value={supplier} maxLength={120} onChange={e => setSupplier(e.target.value)} placeholder="np. hurtownia, nr faktury" style={field} /></label>}
      {item && amount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Po zatwierdzeniu</span>
          {kind !== 'PZ' && from && <Row l={locations.find(l => l.id === from)?.name ?? ''} v={`${fmt(fromLevel, item.unit)} → ${fmt(Math.round((fromLevel - amount) * 1000) / 1000, item.unit)}`} warn={fromLevel - amount < 0} />}
          {kind !== 'RW' && kind !== 'WZ' && to && <Row l={locations.find(l => l.id === to)?.name ?? ''} v={`${fmt(toLevel, item.unit)} → ${fmt(Math.round((toLevel + amount) * 1000) / 1000, item.unit)}`} />}
          {kind === 'RW' && item.reservations.some(r => r.ticketId === ticketId) && <Row l={`Rezerwacja ${ticket ? ticketCode(ticket.number) : ''}`} v="zamknięta" />}
          {kind === 'RW' && <Row l="Materiały zlecenia" v="dopisane z numerem RW" />}
          {kind === 'RW' && item.gwp !== null && <Row l="CO₂e" v={`+${(Math.round(amount * item.gwp) / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 2 })} t`} />}
        </div>
      )}
      <textarea aria-label="Uwagi" rows={2} maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Uwagi" style={{ ...field, height: 'auto', padding: '8px 10px', resize: 'none' }} />
      {err && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{draft && <button type="button" className="ghost" disabled={busy} onClick={() => void dropDraft()} style={{ height: 32, padding: '0 10px', border: 0, borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', minHeight: 0 }}>Usuń szkic</button>}<span style={{ flex: '1 1 auto' }} /><button type="button" className="sec" title="Anuluj  Esc" onClick={onClose} style={{ ...sec, height: 32, padding: '0 12px' }}>Anuluj</button><button type="button" className="sec" disabled={busy} title="Zapisz bez księgowania" onClick={() => void saveDraft()} style={{ ...sec, height: 32, padding: '0 12px' }}>Zapisz szkic</button><button type="button" className="pri" title="Zatwierdź  ⌘↵" disabled={!valid || busy} onClick={() => void submit()} style={{ ...pri, height: 32, padding: '0 12px', opacity: !valid || busy ? 0.6 : 1 }}>{busy ? 'Księgowanie…' : kind === 'RW' || kind === 'WZ' ? `Wydaj${item && amount > 0 ? ` ${fmt(Math.round(amount * 1000) / 1000, item.unit)}` : ''}` : kind === 'PZ' ? 'Przyjmij' : 'Przesuń'}</button></div>
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
        <label style={label} title={item?.unitLocked ? 'Jednostka zablokowana: pozycja ma już ruchy' : undefined}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Jednostka{item?.unitLocked && I.lock}</span><select value={f.unit} disabled={item?.unitLocked} onChange={set('unit')} style={{ ...field, opacity: item?.unitLocked ? 0.7 : 1 }}>{stockUnits.map(u => <option key={u}>{u}</option>)}</select></label>
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
