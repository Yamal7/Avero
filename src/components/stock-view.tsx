'use client';
/* Magazyn (M0.3, KRA-63; M0.4, KRA-31): lista pozycji na silniku widoku kolekcji — widoki, szukanie, filtr kategorii,
   sortowanie i grupowanie w SQL (RPC stock_item_list, 50 na stronę), kolumny i zapisane widoki na koncie, J / K / X, ] panel,
   Esc zamyka panel. Macierz „W samochodach”, panel pozycji i okna dokumentów PZ / RW / MM / WZ korzystają ze stock_overview —
   logika (dokumenty, szkice, rezerwacje, minimum na bus) bez zmian. */
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { stockCategories, stockDocumentResultSchema, stockMovesSchema, stockRefillResultSchema, stockUnits, type StockDraft, type StockItem, type StockLocation, type StockItemList, type StockMove, type StockOverview } from '@hvac/api-client';
import { PersonAvatar } from '@/components/glyphs';
import { Cell, GroupBar, HeaderCell, HeaderRow, Row, RowGroup, TableMessage } from '@/components/table/table';
import { TableScroll } from '@/components/table/table-scroll';
import { PageHead, Spacer, TablePage, Toolbar } from '@/components/table/page-chrome';
import { Button, buttonClasses } from '@/components/ui/button';
import { CollectionNotice, CollectionProvider, CollectionSearch, CollectionTable, CollectionViews, FilterBar, SortMenu, ViewOptionsButton, type CollectionGroup, type CollectionRow } from '@/components/collection';
import { CollectionFooter } from '@/components/collection/footer';
import { clearFilters, isFiltered, queryHref } from '@/lib/collection/query';
import { stockSpec } from '@/lib/collection/specs';
import { collectionLayout, type CollectionPrefs } from '@/lib/collection/views';
import type { Query } from '@/lib/collection/spec';
import { columnLayout } from '@/lib/table/columns';
import { personName, taskNumber, ticketCode } from '@/lib/tasks/labels';
import { cx } from '@/lib/cx';
import { Archive, ArrowLineDown, ArrowLineUp, ArrowsLeftRight, BookmarkSimple, Cloud, Cube, Drop, FileText, Folder, Gauge, Hash, Lock, NotePencil, Package, Plus, Rows, SidebarSimple, Sigma, Truck, Warning, WarningCircle, X } from '@phosphor-icons/react/ssr';

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
  drop: <Drop size={14} className="shrink-0 text-ic-blue" aria-hidden />,
  cube: <Cube size={14} className="shrink-0 text-ic-teal" aria-hidden />,
  cloud: <Cloud size={14} className="shrink-0 text-ic-green" aria-hidden />,
  gauge: <Gauge size={14} className="shrink-0 text-ic-green" aria-hidden />,
  shelf: <Rows size={16} className="shrink-0 text-tertiary" aria-hidden />,
  folder: <Folder size={16} className="shrink-0 text-tertiary" aria-hidden />,
  hash: <Hash size={16} className="shrink-0 text-tertiary" aria-hidden />,
  min: <Gauge size={16} className="shrink-0 text-tertiary" aria-hidden />,
  draft: <FileText size={14} className="shrink-0 text-tertiary" aria-hidden />,
  truck: <Truck size={14} className="shrink-0 text-tertiary" aria-hidden />,
};
/* Ikony nagłówków w kolorach --ic-* (konwencja z design/tools: indeks = #, pozycja = pomarańczowe pudełko). */
const H = {
  code: <Hash size={14} className="shrink-0 text-ic-slate" aria-hidden />,
  name: <Package size={14} className="shrink-0 text-ic-orange" aria-hidden />,
  state: <Lock size={14} className="shrink-0 text-ic-slate" aria-hidden />,
  reserved: <BookmarkSimple size={14} className="shrink-0 text-ic-violet" aria-hidden />,
  available: <Gauge size={14} className="shrink-0 text-ic-green" aria-hidden />,
  move: <ArrowsLeftRight size={14} className="shrink-0 text-ic-blue" aria-hidden />,
  base: <Cube size={14} className="shrink-0 text-ic-teal" aria-hidden />,
  van: <Truck size={14} className="shrink-0 text-ic-indigo" aria-hidden />,
  total: <Sigma size={14} className="shrink-0 text-ic-slate" aria-hidden />,
};
/* Zestawy klas bez właściwości nadpisywanych przy użyciu: tło, rozmiar, szerokość i krój są parametrami
   (cx tylko skleja klasy — dwie klasy tej samej właściwości dawałyby wynik zależny od arkusza; tests/class-conflicts.test.ts). */
const chip = (bg: 'bg-subtle' | 'bg-surface' = 'bg-subtle') => cx('inline-flex h-6 items-center gap-1 rounded-pill px-2 text-small leading-4 whitespace-nowrap text-secondary no-underline', bg);
const fieldBase = 'm-0 block min-h-0 border-0 leading-5 font-normal text-primary shadow-none outline-0 placeholder:text-tertiary focus:field-ring focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50';
/** Pole formularza: md = 32 px (okna), sm = 28 px (w wierszu); `width` — klasa szerokości (domyślnie w-full); multiline — textarea. */
const field = ({ size = 'md', width = 'w-full', surface = false, mono = false, multiline = false }: { size?: 'md' | 'sm'; width?: string; surface?: boolean; mono?: boolean; multiline?: boolean } = {}) => cx(
  fieldBase,
  multiline ? 'h-auto py-2' : size === 'md' ? 'h-control py-0' : 'h-7 py-0',
  size === 'md' ? 'rounded-md px-3 text-body' : 'rounded-sm px-2 text-small',
  width,
  surface ? 'bg-surface' : 'bg-raised',
  mono ? 'font-mono' : 'font-sans',
);
const label = 'm-0 flex flex-col gap-1 text-small leading-4 font-normal text-secondary';
const note = 'm-0 text-small leading-4';
const linkButton = 'm-0 inline-flex min-h-0 items-center self-start border-0 bg-transparent p-0 font-sans text-small leading-4 font-normal text-secondary hover:bg-transparent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent';
const fmt = (v: number, unit: string) => `${unit === 'kg' || unit === 'l' ? v.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) : v.toLocaleString('pl-PL', { maximumFractionDigits: 3 })} ${unit}`;
const day = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short' }).format(new Date(v)).replace('.', '');
const full = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(v));
const total = (i: StockItem) => Object.values(i.levels).reduce((a, b) => a + b, 0);
const avail = (i: StockItem) => total(i) - i.reserved;
const below = (i: StockItem) => i.minQuantity > 0 && avail(i) < i.minQuantity;
const parseNum = (s: string) => { const n = Number(s.replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };

export function StockView({ data, list, query, prefs, tickets, tasks = [], technicians }: { data: StockOverview; list: StockItemList | null; query: Query; prefs: CollectionPrefs; tickets: StockTicket[]; tasks?: StockTask[]; technicians: { id: string; label: string }[] }) {
  const router = useRouter();
  const view = query.view as View;
  const items = data.items, manage = data.canManage;
  const main = data.locations.find(l => l.kind === 'warehouse'), vans = data.locations.filter(l => l.kind === 'vehicle'), myVan = vans.find(v => v.technicianId === data.viewerId);
  const visible = useMemo(() => list?.items ?? [], [list]);
  const [selectedId, setSelectedId] = useState<string | null>(visible[0]?.id ?? null), [panelOn, setPanelOn] = useState(view !== 'vehicles');
  const [dialog, setDialog] = useState<Dialog>(null), [notice, setNotice] = useState('');
  const selected = panelOn ? visible.find(i => i.id === selectedId) ?? items.find(i => i.id === selectedId) ?? null : null;
  useEffect(() => { if (window.matchMedia('(max-width: 1100px)').matches) setPanelOn(false); }, []);
  const belowCount = list?.summary.below ?? items.filter(below).length;
  function done(text: string) { setDialog(null); setNotice(text); router.refresh(); }
  const layout = collectionLayout(stockSpec, prefs.presentation.columns), n = layout.keys.length;
  const keys = layout.keys.filter(k => k !== 'select');
  const pick = useCallback((id: string) => { setSelectedId(id); setPanelOn(true); }, []);
  const head: Record<string, ReactNode> = {
    code: <HeaderCell key="code" layout={layout} col="code" icon={H.code}>Indeks</HeaderCell>,
    name: <HeaderCell key="name" layout={layout} col="name" icon={H.name}>Nazwa</HeaderCell>,
    state: <HeaderCell key="state" layout={layout} col="state" icon={H.state} align="right" title="Stan zmienia się tylko dokumentem: PZ, RW, MM">Stan</HeaderCell>,
    reserved: <HeaderCell key="reserved" layout={layout} col="reserved" icon={H.reserved} align="right" title="Zarezerwowane na zlecenia">Rezerw.</HeaderCell>,
    available: <HeaderCell key="available" layout={layout} col="available" icon={H.available} align="right">Dostępne</HeaderCell>,
    move: <HeaderCell key="move" layout={layout} col="move" icon={H.move} align="right" title="Ostatni ruch">Ruch</HeaderCell>,
  };
  const rows: CollectionRow[] = visible.map(i => {
    const t = total(i), a = avail(i), low = below(i), neg = a < 0, sel = i.id === selected?.id;
    const cell: Record<string, ReactNode> = {
      code: <Cell key="code" layout={layout} col="code" className="font-mono text-small text-tertiary"><span className="truncate">{i.code}</span></Cell>,
      name: <Cell key="name" layout={layout} col="name" title={[i.container, i.gwp !== null ? `GWP ${i.gwp}` : ''].filter(Boolean).join(' · ') || undefined}>
        <a href={`#${i.code.toLowerCase()}`} aria-current={sel ? 'true' : undefined} onClick={e => { e.preventDefault(); pick(i.id); }} className="min-w-0 truncate rounded-xs font-medium text-primary no-underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent">{i.name}</a>
      </Cell>,
      state: <Cell key="state" layout={layout} col="state" align="right" className="tabular-nums">{fmt(t, i.unit)}</Cell>,
      reserved: <Cell key="reserved" gap={1} layout={layout} col="reserved" align="right" title="Zarezerwowane na zlecenia" className={cx('tabular-nums', i.reserved ? 'text-primary' : 'text-tertiary')}>{i.reserved ? <>{I.lock}<span>{fmt(i.reserved, i.unit)}</span></> : '—'}</Cell>,
      available: <Cell key="available" layout={layout} col="available" align="right" title={i.minQuantity ? `Minimum ${fmt(i.minQuantity, i.unit)}${low ? ' · poniżej minimum' : ''}` : undefined} className={cx('tabular-nums', neg ? 'text-danger' : 'text-primary', low || neg ? 'font-medium' : 'font-normal')}>{neg ? I.err : low ? I.warn : null}<span>{fmt(a, i.unit)}</span></Cell>,
      move: <Cell key="move" gap={1} layout={layout} col="move" align="right" title={i.lastMove ? `Ostatni ruch: ${full(i.lastMove.at)}` : 'Brak ruchów'} className="text-small text-secondary tabular-nums">{i.lastMove ? <>{i.lastMove.delta > 0 ? I.in : I.out}<span>{day(i.lastMove.at)}</span></> : '—'}</Cell>,
    };
    return { id: i.id, label: `${i.code} ${i.name}`, group: query.group === 'category' ? i.category : undefined, cells: keys.map(k => cell[k]) };
  });
  const groups: CollectionGroup[] | undefined = list && query.group === 'category' ? list.groups.map(g => ({ key: g.key, label: stockCategories[g.key], count: g.count })) : undefined;
  const filtered = isFiltered(stockSpec, query);
  const message = !list
    ? <TableMessage columns={n} kind="error" action={<Button size="sm" onClick={() => router.refresh()}>Spróbuj ponownie</Button>}>Nie udało się wczytać pozycji magazynu. Sprawdź połączenie i spróbuj ponownie.</TableMessage>
    : filtered
      ? <TableMessage columns={n} action={<Link href={queryHref(stockSpec, clearFilters(stockSpec, query))} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Wyczyść filtry</Link>}>Nic nie pasuje do wyszukiwania ani filtrów.</TableMessage>
      : <TableMessage columns={n} action={manage && view !== 'below' ? <Button size="sm" onClick={() => setDialog({ kind: 'item' })} icon={<Plus size={14} className="shrink-0" aria-hidden />}>Pozycja</Button> : undefined}>{view === 'below' ? 'Wszystkie pozycje są powyżej minimum.' : view === 'refrigerant' ? 'Brak czynników chłodniczych w magazynie.' : manage ? 'Magazyn jest pusty. Dodaj pierwszą pozycję, a potem przyjmij ją dokumentem PZ.' : 'Magazyn jest pusty.'}</TableMessage>;

  return (
    <CollectionProvider spec={stockSpec} query={query} prefs={prefs}
      onEscape={() => setPanelOn(false)}
      onPanel={view !== 'vehicles' ? () => { setPanelOn(v => !v); if (!selectedId && visible[0]) setSelectedId(visible[0].id); } : undefined}
      onCursor={id => { if (panelOn) setSelectedId(id); }}>
      <TablePage>
        <PageHead icon={I.box} category="Finanse i magazyn" title="Magazyn">
          <Spacer />
          <span className="mr-1 min-w-0 truncate text-small leading-4 text-tertiary tabular-nums">{list?.summary.all ?? items.length} pozycji · {belowCount} poniżej minimum</span>
        </PageHead>
        <Toolbar>
          <CollectionViews label="Widoki magazynu" />
          <Spacer />
          {view !== 'vehicles' && <ViewOptionsButton />}
          {view !== 'vehicles' && <Button variant="icon" size="sm" aria-label="Panel szczegółów" aria-pressed={panelOn} title="Panel szczegółów" shortcut="]" onClick={() => { setPanelOn(v => !v); if (!selectedId && visible[0]) setSelectedId(visible[0].id); }} icon={<SidebarSimple size={16} mirrored className="shrink-0" aria-hidden />} className="aria-pressed:bg-subtle aria-pressed:text-primary" />}
          {manage && <Button size="sm" title="Nowa pozycja magazynowa" onClick={() => setDialog({ kind: 'item' })} className="ml-1" icon={<Plus size={14} className="shrink-0" aria-hidden />}>Pozycja</Button>}
          {data.drafts.map(d => <Button key={d.id} size="sm" title={`Szkic ${d.kind} z ${full(d.updatedAt)}`} onClick={() => setDialog({ kind: d.kind, draft: d, itemId: typeof d.payload.itemId === 'string' ? d.payload.itemId : undefined })} variant="ghost" icon={I.draft}>Szkic {d.kind}</Button>)}
          {manage && <Button size="sm" title="Przyjęcie (PZ)" onClick={() => setDialog({ kind: 'PZ', itemId: selected?.id })} icon={I.in}>Przyjęcie</Button>}
          {manage && <Button size="sm" title="Wydanie zewnętrzne, np. sprzedaż (WZ)" onClick={() => setDialog({ kind: 'WZ', itemId: selected?.id })} icon={I.out}>WZ</Button>}
          <Button variant="pri" size="sm" title="Wydanie na zlecenie (RW)" onClick={() => setDialog({ kind: 'RW', itemId: selected?.id })} disabled={!manage && !myVan} icon={<ArrowLineUp size={14} className="shrink-0" aria-hidden />}>Wydanie</Button>
        </Toolbar>
        {view !== 'vehicles' && (
          <div className="flex min-w-0 flex-wrap items-center gap-2 pr-3 pb-2 pl-4 max-desktop:pl-3">
            <CollectionSearch />
            <FilterBar />
            <SortMenu />
          </div>
        )}
        <CollectionNotice />
        {notice && <p role="status" className={cx(note, 'mx-5 mb-2 text-success')}>{notice}</p>}

        {view === 'vehicles'
          ? <Vehicles items={items} main={main} vans={vans} manage={manage} onMM={(itemId, to) => setDialog({ kind: 'MM', itemId, from: main?.id, to })} onAddVan={() => setDialog({ kind: 'vehicle' })} onDone={done} onError={setNotice} />
          : (
            <div className="flex min-h-0 flex-auto items-stretch">
              <div className="flex min-w-0 flex-auto flex-col px-3 pb-6">
                <CollectionTable layout={layout} label="Pozycje magazynowe" header={keys.map(k => head[k])} rows={rows} groups={groups} groupGap activeId={selected?.id ?? null} onActivate={pick} message={message} />
                {list && list.total > stockSpec.pageSize && <CollectionFooter spec={stockSpec} query={query} total={list.total}><span>{list.total} pozycji</span></CollectionFooter>}
              </div>
              {selected && <ItemPanel item={selected} locations={data.locations} manage={manage} canIssue={manage || !!myVan} onClose={() => setPanelOn(false)} onDoc={kind => setDialog({ kind, itemId: selected.id })} onEdit={() => setDialog({ kind: 'item', item: selected })} tickets={tickets} tasks={tasks} onReserved={() => { setNotice('Zarezerwowano.'); router.refresh(); }} />}
            </div>
          )}
        {dialog && dialog.kind === 'item' && <ItemDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
        {dialog && dialog.kind === 'vehicle' && <VehicleDialog technicians={technicians.filter(t => !vans.some(v => v.technicianId === t.id))} onClose={() => setDialog(null)} onDone={done} />}
        {dialog && (dialog.kind === 'PZ' || dialog.kind === 'RW' || dialog.kind === 'MM' || dialog.kind === 'WZ') && <DocDialog key={dialog.draft?.id ?? dialog.kind} draft={dialog.draft} kind={dialog.kind} items={items} locations={data.locations} manage={manage} myVan={myVan} tickets={tickets} initialItem={dialog.itemId} initialFrom={dialog.from} initialTo={dialog.to} onClose={() => setDialog(null)} onDone={done} />}
      </TablePage>
    </CollectionProvider>
  );
}

function ItemPanel({ item, locations, manage, canIssue, onClose, onDoc, onEdit, tickets, tasks, onReserved }: { item: StockItem; locations: StockLocation[]; manage: boolean; canIssue: boolean; onClose: () => void; onDoc: (k: DocKind) => void; onEdit: () => void; tickets: StockTicket[]; tasks: StockTask[]; onReserved: () => void }) {
  const [moves, setMoves] = useState<StockMove[] | null>(null), [movesError, setMovesError] = useState(false), [reserve, setReserve] = useState(false), [rTicket, setRTicket] = useState(''), [rQty, setRQty] = useState(''), [err, setErr] = useState('');
  useEffect(() => { setMoves(null); setMovesError(false); const c = new AbortController(); fetch(`/api/v1/stock/items/${item.id}/moves`, { cache: 'no-store', signal: c.signal }).then(r => (r.ok ? r.json() : Promise.reject(new Error('moves')))).then(b => { const p = stockMovesSchema.safeParse(b); if (p.success) setMoves(p.data); else setMovesError(true); }).catch(() => { if (!c.signal.aborted) setMovesError(true); }); return () => c.abort(); }, [item.id, item.lastMove?.at]);
  const t = total(item), a = avail(item), low = below(item);
  async function doReserve() {
    const q = parseNum(rQty); if (!rTicket || !(q > 0)) { setErr('Wybierz zgłoszenie albo zadanie i ilość.'); return; }
    const [kind, target] = rTicket.split(':');
    const r = await fetch('/api/v1/stock/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), itemId: item.id, ticketId: kind === 'ticket' ? target : null, taskId: kind === 'task' ? target : null, quantity: q }) });
    if (!r.ok) { setErr((await r.json()).error?.message || 'Nie udało się zarezerwować.'); return; }
    setReserve(false); setRQty(''); setErr(''); onReserved();
  }
  const prop = (icon: ReactNode, value: ReactNode, title: string) => <div title={title} className="flex min-h-8 items-center gap-3 rounded-sm px-2 py-1">{icon}<span className="min-w-0 truncate">{value}</span></div>;
  return (
    <aside aria-label={`Pozycja magazynowa ${item.code}`} className="flex w-100 min-w-0 flex-none flex-col border-l border-edge max-panel:fixed max-panel:inset-y-0 max-panel:right-0 max-panel:z-40 max-panel:w-full max-panel:max-w-110 max-panel:overflow-y-auto max-panel:bg-surface max-panel:shadow-modal">
      <div className="flex h-11 items-center gap-1 pr-2 pl-5">
        <span className="font-mono text-small text-tertiary">{item.code}</span><Spacer />
        {manage && <Button variant="icon" size="sm" aria-label="Edytuj pozycję" title="Edytuj" onClick={onEdit} icon={<NotePencil size={16} className="shrink-0" aria-hidden />} />}
        <Button variant="icon" size="sm" aria-label="Zamknij panel" title="Zamknij" onClick={onClose} icon={<X size={16} className="shrink-0" aria-hidden />} />
      </div>
      <div className="flex flex-col gap-2 px-5 pt-1 pb-4">
        <h2 className="m-0 font-sans text-heading leading-6 font-semibold tracking-tight text-primary">{item.name}</h2>
        <div className="flex flex-wrap gap-1">
          {item.refrigerantClass && <span title={`Czynnik chłodniczy ${item.refrigerantClass}`} className={chip()}>{I.drop}<span>{item.refrigerantClass}</span></span>}
          {item.container && <span title={item.container} className={chip()}>{I.cube}<span>{item.container}</span></span>}
          {item.gwp !== null && <span title={`Współczynnik GWP ${item.gwp}`} className={chip()}>{I.cloud}<span>GWP {item.gwp}</span></span>}
        </div>
      </div>
      <section aria-label="Stan" title="Stan zmienia tylko dokument: PZ, RW, WZ, MM" className="mx-5 mb-4 flex flex-col gap-3 rounded-lg bg-raised p-3">
        <dl className="m-0 grid grid-cols-3 gap-2">
          {([['Stan', I.cube, fmt(t, item.unit), null], ['Rezerwacja', I.lock, fmt(item.reserved, item.unit), null], ['Dostępne', I.gauge, fmt(a, item.unit), a < 0 ? I.err : low ? I.warn : null]] as [string, ReactNode, string, ReactNode][]).map(([l, ic, v, w]) => (
            <div key={l}><dt className="flex items-center gap-1 text-small leading-4 text-secondary">{ic}{l}</dt><dd className="m-0 flex items-center gap-1 text-heading leading-6 font-semibold tabular-nums">{w}{v}</dd></div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-1">
          {item.minQuantity > 0 && <span title={low ? `Brakuje ${fmt(item.minQuantity - a, item.unit)}` : 'Minimalny stan'} className={chip('bg-surface')}>{I.gauge}min {fmt(item.minQuantity, item.unit)}</span>}
          {item.reservations.map(r => <Link key={r.id} href={r.ticketId ? `/dashboard/service/${r.ticketId}` : `/dashboard/customers/${r.taskCustomerId}?tab=tasks&filter=all#crm-${r.taskId}`} title={`Rezerwacja ${fmt(r.quantity, item.unit)}`} className={cx(chip('bg-surface'), 'hover:text-primary focus-visible:outline-2 focus-visible:outline-accent')}>{I.lock}{r.ticketNumber !== null ? ticketCode(r.ticketNumber) : r.taskNumber !== null ? taskNumber(r.taskNumber) : 'Rezerwacja'}</Link>)}
        </div>
        <div className="flex flex-wrap gap-1">
          {manage && <Button variant="raised" size="sm" onClick={() => onDoc('PZ')} icon={I.in}>PZ</Button>}
          {canIssue && <Button variant="raised" size="sm" onClick={() => onDoc('RW')} icon={I.out}>RW</Button>}
          {manage && <Button variant="raised" size="sm" onClick={() => onDoc('MM')} icon={I.mm}>MM</Button>}
          {manage && <Button variant="raised" size="sm" title="Wydanie zewnętrzne" onClick={() => onDoc('WZ')} icon={I.out}>WZ</Button>}
          {manage && <Button variant="raised" size="sm" aria-expanded={reserve} onClick={() => setReserve(v => !v)} icon={I.lock}>Rezerwuj</Button>}
        </div>
        {reserve && <div className="flex items-center gap-1">
          <select aria-label="Zgłoszenie" value={rTicket} onChange={e => setRTicket(e.target.value)} className={field({ size: 'sm', width: 'min-w-0 flex-auto', surface: true })}><option value="">Zgłoszenie lub zadanie…</option><optgroup label="Zgłoszenia">{tickets.map(t => <option key={t.id} value={`ticket:${t.id}`}>{ticketCode(t.number)} · {t.subject}</option>)}</optgroup>{tasks.length > 0 && <optgroup label="Zadania">{tasks.map(t => <option key={t.id} value={`task:${t.id}`}>{taskNumber(t.number)} · {t.title} · {t.customer}</option>)}</optgroup>}</select>
          <input aria-label="Ilość" inputMode="decimal" placeholder={item.unit} value={rQty} onChange={e => setRQty(e.target.value)} className={cx(field({ size: 'sm', width: 'w-16 flex-none', surface: true }), 'text-right')} />
          <Button variant="pri" size="sm" onClick={() => void doReserve()}>OK</Button>
        </div>}
        {err && <p role="alert" className={cx(note, 'text-danger')}>{err}</p>}
      </section>
      <div className="flex flex-col px-3">
        {item.minQuantity > 0 && prop(I.min, `Minimum ${fmt(item.minQuantity, item.unit)}`, 'Minimalny stan')}
        {item.bin && prop(I.shelf, <span className="font-mono">{item.bin}</span>, 'Lokalizacja na półce')}
        {prop(I.folder, stockCategories[item.category], 'Kategoria')}
        {prop(I.hash, <span className="inline-flex items-center gap-1">{item.unit}{item.unitLocked && I.lock}</span>, item.unitLocked ? 'Jednostka zablokowana: pozycja ma już ruchy' : 'Jednostka')}
        {Object.entries(item.levels).length > 0 && prop(I.truck, Object.entries(item.levels).map(([loc, q]) => `${locations.find(l => l.id === loc)?.name ?? 'Inne'}: ${fmt(q, item.unit)}`).join(' · '), 'Stan wg miejsc')}
      </div>
      <section className="flex flex-col gap-1 px-5 pt-5 pb-6">
        <div className="flex h-7 items-center gap-2"><h3 className="m-0 flex-auto font-sans text-small leading-4 font-medium text-secondary">Ruchy</h3></div>
        <ol className="-mx-2 m-0 flex list-none flex-col p-0">
          {moves === null && !movesError && [0, 1, 2].map(k => <li key={k} aria-hidden="true" className="flex h-row items-center gap-2 px-2"><span className="block h-3 w-28 rounded-xs bg-subtle motion-safe:animate-pulse" /><span className="block h-3 flex-auto rounded-xs bg-subtle motion-safe:animate-pulse" /></li>)}
          {movesError && <li role="alert" className={cx(note, 'px-2 text-danger')}>Nie udało się wczytać ruchów. Zamknij i otwórz panel ponownie.</li>}
          {moves?.map(m => (
            <li key={m.id} title={`${m.authorLabel ?? ''} · ${locations.find(l => l.id === m.locationId)?.name ?? ''}`} className="flex h-row items-center gap-2 rounded-md px-2 transition-colors hover:bg-subtle">
              <span className="inline-flex w-4 shrink-0">{m.kind === 'MM' ? I.mm : m.delta > 0 ? I.in : I.out}</span>
              <span className="w-28 shrink-0 truncate font-mono text-micro text-tertiary">{m.number}</span>
              <span className="min-w-0 flex-auto truncate" title={m.cylinder ? `Butla ${m.cylinder}` : undefined}>{m.ticketNumber ? <Link href={`/dashboard/service/${m.ticketId}`} className="text-primary no-underline hover:underline">{ticketCode(m.ticketNumber)}</Link> : m.kind === 'PZ' ? (m.supplier || 'Dostawa') : m.kind === 'WZ' ? (m.supplier || 'Wydanie zewnętrzne') : locations.find(l => l.id === m.locationId)?.name}{m.cylinder && <span className="ml-2 font-mono text-micro text-tertiary">{m.cylinder}</span>}</span>
              <span className="shrink-0 font-medium tabular-nums">{m.delta > 0 ? '+' : '−'}{fmt(Math.abs(m.delta), item.unit)}</span>
              <PersonAvatar id={m.authorId} label={m.authorLabel ?? '?'} size={16} />
              <span title={full(m.at)} className="w-11 shrink-0 text-right text-small leading-4 text-tertiary tabular-nums">{day(m.at)}</span>
            </li>
          ))}
          {moves?.length === 0 && <li className={cx(note, 'px-2 text-secondary')}>Brak ruchów. Pierwszy ruch to przyjęcie PZ.</li>}
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
  const layout = useMemo(() => columnLayout([{ key: 'code', width: 84 }, { key: 'name', fr: 1, main: true }, { key: 'base', width: 96 }, ...vans.map(v => ({ key: `van-${v.id}`, width: 112 })), { key: 'total', width: 92 }]), [vans]);
  const n = layout.keys.length;
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
  const braki = (k: number) => `${k} ${k === 1 ? 'brak' : k < 5 ? 'braki' : 'braków'}`;
  return (
    <div className="min-w-0 flex-auto px-3 pb-6">
      <div className="flex items-center gap-2 px-2 pb-2">
        {totalShort > 0 && <span title="Pozycje poniżej minimum ustalonego dla samochodu" className={chip()}>{I.warn}{braki(totalShort)}</span>}
        <Spacer />
        {manage && <Button size="sm" onClick={onAddVan} icon={<Plus size={14} className="shrink-0" aria-hidden />}>Samochód</Button>}
        {manage && totalShort > 0 && <Button variant="pri" size="sm" loading={busy} title="Jedno przesunięcie MM z bazy do każdego samochodu z brakami" onClick={() => void refill()} icon={I.mm}>{busy ? 'Księgowanie…' : `Uzupełnij braki (${totalShort})`}</Button>}
      </div>
      {!vans.length ? <p className="m-0 px-2 py-4 text-secondary">{manage ? 'Nie ma jeszcze samochodów. Dodaj samochód technika, a potem przesuń do niego towar dokumentem MM.' : 'Biuro nie dodało jeszcze samochodów.'}</p> : (
        <TableScroll layout={layout} label="Stany w samochodach">
          <HeaderRow layout={layout} className="border-b-0">
            <HeaderCell layout={layout} col="code" icon={H.code}>Indeks</HeaderCell>
            <HeaderCell layout={layout} col="name" icon={H.name}>Nazwa</HeaderCell>
            <HeaderCell layout={layout} col="base" icon={H.base} align="right" title="Magazyn główny">Baza</HeaderCell>
            {vans.map(v => <Cell key={v.id} layout={layout} col={`van-${v.id}`} header align="right" title={`${v.name}${v.plate ? ` · ${v.plate}` : ''}`} aria-label={v.name} gap={1}>{H.van}<PersonAvatar id={v.technicianId!} label={v.technicianLabel ?? v.name} /></Cell>)}
            <HeaderCell layout={layout} col="total" icon={H.total} align="right">Razem</HeaderCell>
          </HeaderRow>
          {groups.map(g => (
            <RowGroup key={g.c} label={stockCategories[g.c]}>
              <GroupBar columns={n} label={stockCategories[g.c]} count={g.rows.length} />
              {g.rows.map(i => (
                <Row key={i.id} layout={layout}>
                  <Cell layout={layout} col="code" className="font-mono text-small text-tertiary"><span className="truncate">{i.code}</span></Cell>
                  <Cell layout={layout} col="name"><span className="truncate font-medium">{i.name}</span></Cell>
                  <Cell layout={layout} col="base" align="right" className={cx('tabular-nums', main && i.levels[main.id] ? 'text-primary' : 'text-tertiary')}>{main && i.levels[main.id] ? fmt(i.levels[main.id], i.unit) : '—'}</Cell>
                  {vans.map(v => {
                    const q = i.levels[v.id] ?? 0, min = i.vehicleMins[v.id] ?? 0, miss = short(i, v), key = `${i.id}:${v.id}`, col = `van-${v.id}`;
                    if (editing === key) return <Cell key={v.id} layout={layout} col={col} align="right"><input autoFocus aria-label={`Minimum ${i.code} w ${v.name}`} inputMode="decimal" value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => void saveMin(i, v)} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditing(null); }} placeholder="min" className={cx(field({ size: 'sm', width: 'w-18' }), 'text-right')} /></Cell>;
                    const title = `${v.name}: ${fmt(q, i.unit)}${min ? ` · minimum ${fmt(min, i.unit)}` : ' · bez minimum'}${miss ? ` · brakuje ${fmt(miss, i.unit)}` : ''}${manage ? ' · kliknij dwukrotnie, aby ustawić minimum' : ''}`;
                    return (
                      <Cell key={v.id} layout={layout} col={col} align="right" title={title} onDoubleClick={() => { if (manage) { setEditing(key); setDraft(min ? String(min).replace('.', ',') : ''); } }} className={cx('tabular-nums', q || miss ? 'text-primary' : 'text-tertiary', miss ? 'font-medium' : 'font-normal', manage && 'cursor-cell')}>
                        {miss ? (manage ? <button type="button" title={`Uzupełnij ${v.name} z bazy (MM)`} onClick={() => onMM(i.id, v.id)} className="m-0 inline-flex min-h-0 items-center gap-1 rounded-xs border-0 bg-transparent p-0 font-sans text-body leading-5 font-medium text-primary hover:bg-transparent hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent">{I.warn}{fmt(q, i.unit)}</button> : <>{I.warn}{fmt(q, i.unit)}</>) : q ? fmt(q, i.unit) : '—'}
                        {min > 0 && <span className="text-micro font-normal text-tertiary">/{min.toLocaleString('pl-PL', { maximumFractionDigits: 3 })}</span>}
                      </Cell>);
                  })}
                  <Cell layout={layout} col="total" align="right" className="text-secondary tabular-nums">{fmt(total(i), i.unit)}</Cell>
                </Row>
              ))}
            </RowGroup>
          ))}
          <Row layout={layout} className="mt-2 text-small text-secondary">
            <Cell layout={layout} col="code" />
            <Cell layout={layout} col="name" gap={1}>{I.mm}Do uzupełnienia</Cell>
            <Cell layout={layout} col="base" />
            {shortages.map((k, idx) => <Cell key={vans[idx]!.id} layout={layout} col={`van-${vans[idx]!.id}`} align="right" className={cx('tabular-nums', k ? 'font-medium text-primary' : 'text-tertiary')}>{k ? braki(k) : '—'}</Cell>)}
            <Cell layout={layout} col="total" />
          </Row>
        </TableScroll>
      )}
      {manage && vans.length > 0 && <p className={cx(note, 'mx-2 mt-1 text-tertiary')}>Minimum dla samochodu ustawisz, klikając dwukrotnie komórkę. Liczba po ukośniku to minimum.</p>}
    </div>
  );
}

function Modal({ title, sub, children, onClose }: { title: string; sub?: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-80 flex items-start justify-center bg-scrim px-4 pt-24 pb-4">
      <div role="dialog" aria-modal="true" aria-label={title} className="flex max-h-full w-full max-w-145 flex-col gap-3 overflow-y-auto rounded-xl bg-surface p-5 font-sans text-body leading-5 text-primary shadow-modal">
        <div className="flex items-center gap-2"><h2 className="m-0 font-sans text-heading leading-6 font-semibold text-primary">{title}</h2>{sub && <span className="font-mono text-micro text-tertiary">{sub}</span>}<Spacer /><Button variant="icon" size="sm" aria-label="Zamknij" title="Zamknij" shortcut="Esc" onClick={onClose} icon={<X size={16} className="shrink-0" aria-hidden />} /></div>
        {children}
      </div>
    </div>
  );
}

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
  const locSelect = (value: string, set: (v: string) => void, opts: StockLocation[], aria: string) => <select aria-label={aria} value={value} onChange={e => set(e.target.value)} className={field()}>{opts.map(l => <option key={l.id} value={l.id}>{l.name}{item ? ` · ${fmt(item.levels[l.id] ?? 0, item.unit)}` : ''}</option>)}</select>;
  return (
    <Modal title={title} sub={draft ? `${kind} · szkic` : kind} onClose={onClose}>
      {kind === 'RW' && <select aria-label="Zlecenie" value={ticketId} onChange={e => setTicketId(e.target.value)} className={field()}>{!tickets.length && <option value="">Brak otwartych zgłoszeń</option>}{tickets.map(t => <option key={t.id} value={t.id}>{ticketCode(t.number)} · {t.subject} · {t.customer}</option>)}</select>}
      {kind === 'RW' && ticket && ticket.devices.length > 0 && <select aria-label="Urządzenie" value={deviceId} onChange={e => setDeviceId(e.target.value)} className={field()}><option value="">Urządzenie (opcjonalnie)</option>{ticket.devices.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select>}
      <div className="grid grid-cols-2 gap-2">
        <select aria-label="Pozycja" value={itemId} onChange={e => setItemId(e.target.value)} className={field()}>{items.map(i => <option key={i.id} value={i.id}>{i.code} · {i.name}</option>)}</select>
        {kind === 'PZ' ? locSelect(to, setTo, locations, 'Do magazynu') : locSelect(from, setFrom, fromOptions, 'Z magazynu')}
      </div>
      {kind === 'MM' && <label className={label}>Do{locSelect(to, setTo, locations.filter(l => l.id !== from), 'Do magazynu')}</label>}
      {useWeigh ? (
        <div className="flex flex-col gap-3 rounded-lg bg-raised p-3">
          <div className="flex items-center"><span className="flex-auto text-small leading-4 text-secondary">Ważenie butli</span><button type="button" onClick={() => setWeigh(false)} className={linkButton}>Wpisz ilość ręcznie</button></div>
          <div className="grid grid-cols-3 items-end gap-3">
            <label className={label}>Masa przed<input inputMode="decimal" value={before} onChange={e => setBefore(e.target.value)} placeholder="0,00" className={cx(field({ surface: true }), 'text-right')} /></label>
            <label className={label}>Masa po<input inputMode="decimal" value={after} onChange={e => setAfter(e.target.value)} placeholder="0,00" className={cx(field({ surface: true }), 'text-right')} /></label>
            <span className="flex flex-col gap-1 text-small leading-4 text-secondary">Ilość wydana<span className={cx('flex h-control items-center justify-end text-heading leading-6 font-semibold tabular-nums', amount > 0 ? 'text-primary' : 'text-tertiary')}>{amount > 0 ? fmt(Math.round(amount * 1000) / 1000, 'kg') : '—'}</span></span>
          </div>
          <div className="flex items-center"><span className="flex-auto text-small leading-4 text-secondary">Rodzaj operacji</span>
            <div role="group" aria-label="Rodzaj operacji" className="inline-flex gap-1 rounded-sm bg-subtle p-1">{([['fill', 'Napełnienie'], ['topup', 'Uzupełnienie'], ['other', 'Inne']] as const).map(([v, l]) => <button key={v} type="button" aria-pressed={op === v} onClick={() => setOp(v)} className={cx('m-0 h-6 min-h-0 rounded-xs border-0 px-2 py-0 font-sans text-small leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent', op === v ? 'bg-surface font-medium text-primary hover:bg-surface' : 'bg-transparent font-normal text-secondary hover:bg-transparent hover:text-primary')}>{l}</button>)}</div>
          </div>
        </div>
      ) : (
        <label className={label}>Ilość ({item?.unit ?? ''}){kind === 'RW' && isGas && <button type="button" onClick={() => setWeigh(true)} className={linkButton}>Ważenie butli</button>}<input inputMode="decimal" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" className={cx(field(), 'text-right')} /></label>
      )}
      {isGas && <label className={label}>Numer butli<input value={cylinder} maxLength={40} onChange={e => setCylinder(e.target.value)} placeholder="np. B-0417" className={field({ mono: true })} /></label>}
      {kind === 'WZ' && <label className={label}>Odbiorca<input value={supplier} maxLength={120} onChange={e => setSupplier(e.target.value)} placeholder="Firma lub osoba, nr dokumentu sprzedaży" className={field()} /></label>}
      {kind === 'PZ' && <label className={label}>Dostawca<input value={supplier} maxLength={120} onChange={e => setSupplier(e.target.value)} placeholder="np. hurtownia, nr faktury" className={field()} /></label>}
      {item && amount > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-small leading-4 text-secondary">Po zatwierdzeniu</span>
          {kind !== 'PZ' && from && <Line l={locations.find(l => l.id === from)?.name ?? ''} v={`${fmt(fromLevel, item.unit)} → ${fmt(Math.round((fromLevel - amount) * 1000) / 1000, item.unit)}`} warn={fromLevel - amount < 0} />}
          {kind !== 'RW' && kind !== 'WZ' && to && <Line l={locations.find(l => l.id === to)?.name ?? ''} v={`${fmt(toLevel, item.unit)} → ${fmt(Math.round((toLevel + amount) * 1000) / 1000, item.unit)}`} />}
          {kind === 'RW' && item.reservations.some(r => r.ticketId === ticketId) && <Line l={`Rezerwacja ${ticket ? ticketCode(ticket.number) : ''}`} v="zamknięta" />}
          {kind === 'RW' && <Line l="Materiały zlecenia" v="dopisane z numerem RW" />}
          {kind === 'RW' && item.gwp !== null && <Line l="CO₂e" v={`+${(Math.round(amount * item.gwp) / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 2 })} t`} />}
        </div>
      )}
      <textarea aria-label="Uwagi" rows={2} maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Uwagi" className={cx(field({ multiline: true }), 'resize-none')} />
      {err && <p role="alert" className="m-0 text-small leading-4 text-danger">{err}</p>}
      <div className="flex items-center gap-2">{draft && <Button variant="ghost" disabled={busy} onClick={() => void dropDraft()}>Usuń szkic</Button>}<Spacer /><Button title="Anuluj" shortcut="Esc" onClick={onClose}>Anuluj</Button><Button disabled={busy} title="Zapisz bez księgowania" onClick={() => void saveDraft()}>Zapisz szkic</Button><Button variant="pri" title="Zatwierdź" shortcut="⌘↵" disabled={!valid} loading={busy} onClick={() => void submit()}>{busy ? 'Księgowanie…' : kind === 'RW' || kind === 'WZ' ? `Wydaj${item && amount > 0 ? ` ${fmt(Math.round(amount * 1000) / 1000, item.unit)}` : ''}` : kind === 'PZ' ? 'Przyjmij' : 'Przesuń'}</Button></div>
    </Modal>
  );
}
function Line({ l, v, warn }: { l: string; v: string; warn?: boolean }) { return <div className="flex items-center gap-2 text-small leading-4"><span className="flex-auto text-secondary">{l}</span><span className={cx('tabular-nums', warn ? 'text-danger' : 'text-primary')}>{v}</span></div>; }

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
      <div className="flex gap-2">
        <label className={cx(label, 'w-35 shrink-0')}>Indeks<input value={f.code} maxLength={32} onChange={set('code')} placeholder="CZ-R32" className={cx(field({ mono: true }), 'uppercase')} /></label>
        <label className={cx(label, 'min-w-0 flex-auto')}>Nazwa<input value={f.name} maxLength={160} onChange={set('name')} placeholder="R32" className={field()} /></label>
      </div>
      <div className="flex gap-2">
        <label className={cx(label, 'min-w-0 flex-auto')}>Kategoria<select value={f.category} onChange={set('category')} className={field()}>{Object.entries(stockCategories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className={cx(label, 'w-25 shrink-0')} title={item?.unitLocked ? 'Jednostka zablokowana: pozycja ma już ruchy' : undefined}><span className="inline-flex items-center gap-1">Jednostka{item?.unitLocked && I.lock}</span><select value={f.unit} disabled={item?.unitLocked} onChange={set('unit')} className={field()}>{stockUnits.map(u => <option key={u}>{u}</option>)}</select></label>
        <label className={cx(label, 'w-30 shrink-0')}>Minimum<input inputMode="decimal" value={f.min} onChange={set('min')} className={cx(field(), 'text-right')} /></label>
        <label className={cx(label, 'w-25 shrink-0')}>Półka<input value={f.bin} maxLength={20} onChange={set('bin')} placeholder="C-01" className={field()} /></label>
      </div>
      {gas && <div className="grid grid-cols-3 gap-2">
        <label className={label}>Rodzaj<input value={f.cls} maxLength={20} onChange={set('cls')} placeholder="HFC" className={field()} /></label>
        <label className={label}>GWP<input inputMode="numeric" value={f.gwp} onChange={set('gwp')} placeholder="675" className={cx(field(), 'text-right')} /></label>
        <label className={label}>Opakowanie<input value={f.container} maxLength={40} onChange={set('container')} placeholder="butla 9 kg" className={field()} /></label>
      </div>}
      {err && <p role="alert" className="m-0 text-small leading-4 text-danger">{err}</p>}
      <div className="flex justify-end gap-2"><Button onClick={onClose}>Anuluj</Button><Button variant="pri" disabled={!f.code || !f.name} loading={busy} onClick={() => void save()}>{busy ? 'Zapisywanie…' : 'Zapisz'}</Button></div>
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
      {!technicians.length ? <p className="m-0 text-secondary">Każdy aktywny technik ma już samochód.</p> : <>
        <label className={label}>Technik<select value={tech} onChange={e => setTech(e.target.value)} className={field()}>{technicians.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
        <div className="flex gap-2"><label className={cx(label, 'min-w-0 flex-auto')}>Nazwa<input value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder={def} className={field()} /></label><label className={cx(label, 'w-40 shrink-0')}>Rejestracja<input value={plate} maxLength={20} onChange={e => setPlate(e.target.value)} placeholder="GD 2N551" className={field()} /></label></div>
      </>}
      {err && <p role="alert" className="m-0 text-small leading-4 text-danger">{err}</p>}
      <div className="flex justify-end gap-2"><Button onClick={onClose}>Anuluj</Button>{technicians.length > 0 && <Button variant="pri" disabled={!tech} onClick={() => void save()}>Dodaj</Button>}</div>
    </Modal>
  );
}
