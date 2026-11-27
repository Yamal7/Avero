'use client';
/* Zadania — lista w jednej linii + panel zadania (M0.3, KRA-63): wspólna tabela z src/components/table
   (wiersz 36 px, kolumny do tytułu przypięte, przewijanie ←/→, klient jako logo z kartą podglądu). Tailwind na tokenach.
   M0.4 (KRA-31): Opcje widoku, zapisane widoki, grupy i klawiatura z silnika widoku kolekcji (tryb local — filtrowanie,
   sortowanie i grupowanie 20 wczytanych zadań zostaje w przeglądarce; ustawienia w preferencjach `view.tasks`). */
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { crmTaskCommentSchema, crmTaskCommentsSchema, crmTaskLinkOptionsSchema, crmTaskMetaSchema, taskPlanChangeSchema, taskPlanContextSchema, type CrmTaskLink, crmTaskProgressSchema, crmTaskSchema, type CrmTaskComment, type MyTask, type MyTasks } from '@hvac/api-client';
import { myTaskCustomerHref } from '@/lib/crm/tasks';
import { CollectionProvider, CollectionTable, CollectionViews, ViewOptionsButton, useCollection, type CollectionGroup, type CollectionRow } from '@/components/collection';
import { tasksSpec } from '@/lib/collection/specs';
import { collectionLayout, visibleColumns, type CollectionPrefs } from '@/lib/collection/views';
import { PriorityIcon, StatusIcon } from '@/components/glyphs';
import { CustomerLogo } from '@/components/table/customer-logo';
import { Cell, TableMessage } from '@/components/table/table';
import { Spacer, TablePage, Toolbar } from '@/components/table/page-chrome';
import { Button, buttonClasses } from '@/components/ui/button';
import { isOpenTask, taskStateLabel, priorityLabel, taskLabels, taskNumber, type Priority, type TaskLabel } from '@/lib/tasks/labels';
import { cx } from '@/lib/cx';
import { BuildingOffice, CalendarBlank, CalendarDot, CalendarX, FunnelSimple, LinkIcon, Plus, SidebarSimple, X } from '@phosphor-icons/react/ssr';

type Task = MyTask;
type State = Task['state'];
const zone = 'Europe/Warsaw';
const stateLabel = taskStateLabel;
const linkKind: Record<CrmTaskLink['kind'], string> = { ticket: 'Zgłoszenie', order: 'Zlecenie', offer: 'Oferta' };
const priorityRank: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3, none: 4 };
type Group = { key: string; label: string; icon: ReactNode; rows: Task[] };
const groupOrder: State[] = ['in_progress', 'review', 'todo', 'backlog', 'done', 'cancelled'];
type Progress = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
const progressStates: Progress[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];

/* Kropki etykiet w kolorach ikon (--ic-*); wartości rgb z labels.ts przechodzą na tokeny zmieniające się z motywem. */
const labelDot: Record<TaskLabel, string> = { purchasing: 'bg-ic-orange', offers: 'bg-ic-indigo', fgas: 'bg-ic-teal', documents: 'bg-ic-slate', customers: 'bg-ic-blue', warranty: 'bg-ic-violet', contracts: 'bg-ic-blue', tools: 'bg-ic-slate', internal: 'bg-ic-slate' };
const Dot = ({ label, small = false }: { label: TaskLabel; small?: boolean }) => <span aria-hidden="true" className={cx('inline-block shrink-0 rounded-pill', small ? 'size-1.5' : 'size-2', labelDot[label])} />;
const avatarClasses = (size: 16 | 20, bg: 'bg-subtle' | 'bg-surface' = 'bg-subtle') => cx('inline-flex shrink-0 items-center justify-center rounded-pill font-semibold leading-none text-secondary', size === 16 ? 'size-4 text-micro' : 'size-5 text-micro', bg);
/* Kapsułka właściwości w panelu (28 px, pełne zaokrąglenie); wybór przez niewidoczny <select> na całej kapsułce. */
const capsuleBase = 'relative m-0 inline-flex h-7 flex-row max-w-full min-w-0 items-center gap-2 rounded-pill bg-subtle py-0 font-sans text-body leading-5 transition-colors focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent';
const capsulePad = { default: 'pr-3 pl-2', avatar: 'pr-3 pl-1', icon: 'w-7 justify-center px-0', wide: 'px-3' } as const;
/** Kapsułka: wcięcie, kolor i grubość tekstu są parametrami (nie doklejanymi klasami), bo cx nie rozstrzyga konfliktów klas. */
const capsule = ({ pad = 'default', color = 'text-primary', weight = 'font-normal', editable = true, pointer = true }: { pad?: keyof typeof capsulePad; color?: string; weight?: 'font-normal' | 'font-medium'; editable?: boolean; pointer?: boolean } = {}) =>
  cx(capsuleBase, capsulePad[pad], color, weight, editable && 'hover:bg-border', pointer ? 'cursor-pointer' : 'cursor-default');
const picker = 'absolute inset-0 m-0 size-full min-h-0 cursor-pointer appearance-none border-0 p-0 opacity-0 disabled:cursor-not-allowed';
const note = 'm-0 text-small leading-4';

const addDays = (day: string, n: number) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const short = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short' }).format(new Date(day + 'T12:00:00Z')).replace('.', '');
const longDay = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(day + 'T12:00:00Z'));
const stamp = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(v));
const stampShort = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short' }).format(new Date(v)).replace('.', '');
const initials = (label: string) => label.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?';
const open = (t: Task) => isOpenTask(t.state);
function dueLabel(t: Task, today: string) {
  if (open(t) && t.dueOn < today) return { text: short(t.dueOn), title: 'Po terminie', icon: <CalendarX size={14} className="shrink-0 text-danger" aria-hidden />, color: 'text-danger', weight: 'font-medium' as const };
  if (t.dueOn === today) return { text: 'Dziś', title: 'Termin dziś', icon: <CalendarDot size={14} className="shrink-0 text-warning" aria-hidden />, color: 'text-primary', weight: 'font-medium' as const };
  if (t.dueOn === addDays(today, 1)) return { text: 'Jutro', title: 'Termin', icon: <CalendarBlank size={14} className="shrink-0 text-tertiary" aria-hidden />, color: 'text-secondary', weight: 'font-normal' as const };
  return { text: short(t.dueOn), title: 'Termin', icon: <CalendarBlank size={14} className="shrink-0 text-tertiary" aria-hidden />, color: 'text-secondary', weight: 'font-normal' as const };
}
/* Kolumny (kolejność, szerokości, które da się ukryć) — tasksSpec w src/lib/collection/specs.ts. Do tytułu (główna) przypięte. */
const labelDots = Object.fromEntries((Object.keys(taskLabels) as TaskLabel[]).map(l => [l, <Dot key={l} label={l} small />]));

type Props = { canPlan?: boolean; data: MyTasks; prefs: CollectionPrefs; header: ReactNode; toolbarTabs: ReactNode; toolbarExtra?: ReactNode; layoutSwitch: ReactNode; search: ReactNode; board?: ReactNode; footer?: ReactNode };

export function TaskListView(props: Props) {
  return <CollectionProvider spec={tasksSpec} mode="local" prefs={props.prefs} defaultCollapsed={['done', 'cancelled']}><TaskList {...props} /></CollectionProvider>;
}

function TaskList({ data, header, toolbarTabs, toolbarExtra, layoutSwitch, search, board, footer, canPlan = false }: Props) {
  const router = useRouter();
  const items = data.items;
  const [panelOn, setPanelOn] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [showSearch, setShowSearch] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false), [notice, setNotice] = useState(''), [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const [comments, setComments] = useState<CrmTaskComment[]>([]), [draft, setDraft] = useState(''), [posting, setPosting] = useState(false);
  const selectedKey = panelOn && selectedId ? `${selectedId}:${items.find(t => t.id === selectedId)?.customerId}` : '';
  useEffect(() => {
    setComments([]); setDraft('');
    if (!selectedKey) return;
    const [taskId, customerId] = selectedKey.split(':'), controller = new AbortController();
    fetch(`/api/v1/customers/${customerId}/tasks/${taskId}/comments`, { cache: 'no-store', signal: controller.signal }).then(r => r.ok ? r.json() : []).then(body => { const parsed = crmTaskCommentsSchema.safeParse(body); if (parsed.success && !controller.signal.aborted) setComments(parsed.data); }).catch(() => {});
    return () => controller.abort();
  }, [selectedKey]);
  const [people, setPeople] = useState<{ id: string; label: string }[]>([]), [links, setLinks] = useState<CrmTaskLink[] | null>(null);
  useEffect(() => {
    setPeople([]); setLinks(null);
    if (!selectedKey || !canPlan) return;
    const [taskId, customerId] = selectedKey.split(':'), controller = new AbortController();
    fetch(`/api/v1/customers/${customerId}/tasks/${taskId}/plan`, { cache: 'no-store', signal: controller.signal }).then(r => r.ok ? r.json() : null).then(body => { const parsed = taskPlanContextSchema.safeParse(body); if (parsed.success && !controller.signal.aborted) setPeople(parsed.data.assignees); }).catch(() => {});
    return () => controller.abort();
  }, [selectedKey, canPlan]);
  const selected = panelOn ? items.find(t => t.id === selectedId) ?? null : null;
  async function loadLinks() {
    if (!selected || links) return;
    try { const r = await fetch(`/api/v1/customers/${selected.customerId}/tasks/${selected.id}/link`, { cache: 'no-store' }); const parsed = crmTaskLinkOptionsSchema.safeParse(r.ok ? await r.json() : null); setLinks(parsed.success ? parsed.data : []); } catch { setLinks([]); }
  }
  const c = useCollection(), q = c.query;
  const vs = { group: q.group, sort: q.sort, showDone: (q.filters.done?.[0] ?? '1') === '1', showEmpty: q.filters.empty?.[0] === '1', columns: visibleColumns(tasksSpec, c.columns).map(x => x.key), filters: { priority: q.filters.priority ?? [], label: q.filters.label ?? [] } };
  const col = (c: string) => vs.columns.includes(c);
  const fp = vs.filters.priority ?? [], fl = vs.filters.label ?? [];
  const shownItems = items.filter(t => (vs.showDone || open(t)) && (!fp.length || fp.includes(t.priority)) && (!fl.length || (!!t.label && fl.includes(t.label))))
    .sort((a, b) => vs.sort === 'due' ? a.dueOn.localeCompare(b.dueOn) || b.number - a.number : vs.sort === 'number' ? b.number - a.number : vs.sort === 'created' ? b.createdAt.localeCompare(a.createdAt) : priorityRank[a.priority] - priorityRank[b.priority] || a.dueOn.localeCompare(b.dueOn));
  const assignees = [...new Map(items.map(t => [t.assigneeId, t.assigneeLabel])).entries()];
  const groups: Group[] = (vs.group === 'none' ? [{ key: 'all', label: 'Wszystkie zadania', icon: null, test: () => true }]
    : vs.group === 'priority' ? (Object.keys(priorityRank) as Priority[]).map(p => ({ key: `p-${p}`, label: priorityLabel[p], icon: <PriorityIcon priority={p} />, test: (t: Task) => t.priority === p }))
    : vs.group === 'label' ? [...(Object.keys(taskLabels) as TaskLabel[]).map(l => ({ key: `l-${l}`, label: taskLabels[l].name, icon: <Dot label={l} />, test: (t: Task) => t.label === l })), { key: 'l-none', label: 'Bez etykiety', icon: null, test: (t: Task) => !t.label }]
    : vs.group === 'assignee' ? assignees.map(([id, label]) => ({ key: `a-${id}`, label, icon: <span aria-hidden="true" className={avatarClasses(16)}>{initials(label)}</span>, test: (t: Task) => t.assigneeId === id }))
    : groupOrder.map(st => ({ key: st, label: stateLabel[st], icon: <StatusIcon state={st} />, test: (t: Task) => t.state === st })))
    .map(g => ({ key: g.key, label: g.label, icon: g.icon, rows: shownItems.filter(g.test) }))
    .filter(g => g.rows.length || (vs.showEmpty && (vs.showDone || !['done', 'cancelled'].includes(g.key))));
  const layout = collectionLayout(tasksSpec, c.columns);

  useEffect(() => { if (window.matchMedia('(max-width: 1100px)').matches) setPanelOn(false); }, []);
  function select(t: Task | null) { setSelectedId(t?.id ?? null); setError(''); setConflict(false); setCopied(false); setNotice(''); if (t) { setPanelOn(true); requestAnimationFrame(() => document.querySelector(`[data-row-id="${t.id}"]`)?.scrollIntoView({ block: 'nearest' })); } }
  // Klawisze z silnika kolekcji: J / K przesuwa kursor (panel podąża), Esc zamyka panel, ] przełącza panel, F pokazuje szukanie.
  const { bindKeys } = c;
  useEffect(() => {
    bindKeys({
      onEscape: () => { if (selected) setPanelOn(false); },
      onPanel: board ? undefined : () => { setPanelOn(v => !v); if (!selectedId && items[0]) setSelectedId(items[0].id); },
      onCursor: id => { if (!busy) select(items.find(t => t.id === id) ?? null); },
      onFilterKey: () => setShowSearch(v => !v),
    });
  });

  async function saveState(state: Progress) {
    if (!selected) return;
    const input = crmTaskProgressSchema.safeParse({ version: selected.version, state, result: selected.result });
    if (!input.success) { setError('Nie udało się zmienić statusu.'); return; }
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/v1/customers/${selected.customerId}/tasks/${selected.id}/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input.data) }), body = await r.json();
      if (!r.ok) { if (r.status === 409) { setConflict(true); throw new Error('Zadanie zmienił ktoś inny. Odśwież listę przed kolejną zmianą.'); } throw new Error(body.error?.message || 'Nie udało się zmienić statusu.'); }
      const task = crmTaskSchema.parse(body);
      if (task.id !== selected.id || task.assigneeId !== data.viewerId) throw new Error('Nieprawidłowa odpowiedź zapisu. Odśwież listę.');
      setNotice(`${task.title}: ${stateLabel[task.state]}`); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }
  async function saveMeta(priority: Priority, label: TaskLabel | null) {
    if (!selected) return;
    const input = crmTaskMetaSchema.safeParse({ version: selected.version, priority, label });
    if (!input.success) return;
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/v1/customers/${selected.customerId}/tasks/${selected.id}/meta`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input.data) }), body = await r.json();
      if (!r.ok) { if (r.status === 409) setConflict(true); throw new Error(r.status === 409 ? 'Zadanie zmienił ktoś inny. Odśwież listę.' : body.error?.message || 'Nie udało się zapisać.'); }
      crmTaskSchema.parse(body); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }
  async function send(path: string, method: string, payload: unknown, what: string) {
    if (!selected) return;
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/v1/customers/${selected.customerId}/tasks/${selected.id}/${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }), body = await r.json();
      if (!r.ok) { if (r.status === 409) setConflict(true); throw new Error(r.status === 409 ? 'Zadanie zmienił ktoś inny. Odśwież listę.' : body.error?.message || `Nie udało się zmienić: ${what}.`); }
      crmTaskSchema.parse(body); setNotice(`${selected.title}: zmieniono ${what}`); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }
  function savePlan(assigneeId: string, dueOn: string) {
    if (!selected) return;
    const input = taskPlanChangeSchema.safeParse({ version: selected.version, assigneeId, dueOn });
    if (input.success) void send('plan', 'PATCH', input.data, assigneeId !== selected.assigneeId ? 'osobę' : 'termin');
  }
  function saveLink(value: string) {
    if (!selected) return;
    const target = links?.find(l => l.id === value) ?? null;
    void send('link', 'POST', { version: selected.version, kind: target?.kind ?? null, targetId: target?.id ?? null }, 'powiązanie');
  }
  async function addComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!selected) return;
    const body = draft.trim(); if (!body) return;
    setPosting(true); setError('');
    try {
      const r = await fetch(`/api/v1/customers/${selected.customerId}/tasks/${selected.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), body }) }), json = await r.json();
      if (!r.ok) throw new Error(json.error?.message || 'Nie udało się dodać komentarza.');
      const c = crmTaskCommentSchema.parse(json); setComments(list => [...list, c]); setDraft('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Nie udało się dodać komentarza.'); } finally { setPosting(false); }
  }
  async function copyLink() { if (!selected) return; try { await navigator.clipboard.writeText(new URL(myTaskCustomerHref(selected), location.origin).toString()); setCopied(true); } catch { setError('Nie udało się skopiować linku.'); } }

  const n = layout.keys.length;
  const tableGroups: CollectionGroup[] = groups.map(g => ({ key: g.key, label: g.label, count: g.rows.length, icon: g.icon }));
  const rows: CollectionRow[] = groups.flatMap(g => g.rows.map(t => {
    const due = dueLabel(t, data.today), sel = t.id === selected?.id;
    return {
      id: t.id, label: t.title, group: g.key,
      cells: <>
        {col('priority') && <Cell layout={layout} col="priority"><span role="img" aria-label={`Priorytet: ${priorityLabel[t.priority]}`} title={`Priorytet: ${priorityLabel[t.priority]}`} className="inline-flex"><PriorityIcon priority={t.priority} /></span></Cell>}
        {col('number') && <Cell layout={layout} col="number" className="font-mono text-small text-tertiary">{taskNumber(t.number)}</Cell>}
        <Cell layout={layout} col="status"><span role="img" aria-label={stateLabel[t.state]} title={stateLabel[t.state]} className="inline-flex"><StatusIcon state={t.state} /></span></Cell>
        <Cell layout={layout} col="title">
          <a href={myTaskCustomerHref(t)} aria-current={sel ? 'true' : undefined} onClick={e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); select(t); }} className="min-w-0 truncate rounded-xs font-medium text-primary no-underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent">{t.title}</a>
          {t.link && <span title={`${linkKind[t.link.kind]}: ${t.link.title}`} className="shrink-0 font-mono text-micro text-tertiary">{t.link.code}</span>}
        </Cell>
        {col('customer') && <Cell layout={layout} col="customer"><CustomerLogo name={t.customerName} href={`/dashboard/customers/${t.customerId}`} /></Cell>}
        {col('label') && <Cell layout={layout} col="label" align="right">{t.label && <span className="inline-flex h-5 items-center gap-1 rounded-xs bg-subtle px-2 text-small leading-4 whitespace-nowrap text-secondary"><Dot label={t.label} small />{taskLabels[t.label].name}</span>}</Cell>}
        {col('due') && <Cell gap={1} layout={layout} col="due" align="right" title={`${due.title}: ${longDay(t.dueOn)}`} className={cx('text-small tabular-nums', due.color, due.weight)}>{due.icon}<span>{due.text}</span></Cell>}
        {col('assignee') && <Cell layout={layout} col="assignee" align="right"><span title={t.assigneeLabel} className={avatarClasses(20)}>{initials(t.assigneeLabel)}</span></Cell>}
      </>,
    };
  }));
  return (
    <TablePage>
      {header}
      <Toolbar>
        {toolbarTabs}
        <CollectionViews label="Zapisane widoki" builtIn={false} />
        <Spacer />
        {showSearch && search}
        <Button variant="icon" size="sm" aria-label="Filtruj" title="Szukaj zadania lub klienta" shortcut="F" aria-pressed={showSearch} onClick={() => setShowSearch(v => !v)} icon={<FunnelSimple size={16} className="shrink-0" aria-hidden />} className="aria-pressed:bg-subtle aria-pressed:text-primary" />
        {layoutSwitch}
        {!board && <ViewOptionsButton inlineFilters dots={{ label: labelDots }} />}
        {!board && <Button variant="icon" size="sm" aria-label="Panel szczegółów" title="Panel szczegółów" shortcut="]" aria-pressed={panelOn} onClick={() => { setPanelOn(v => !v); if (!selectedId && items[0]) setSelectedId(items[0].id); }} icon={<SidebarSimple size={16} mirrored className="shrink-0" aria-hidden />} className="aria-pressed:bg-subtle aria-pressed:text-primary" />}
        {toolbarExtra}
      </Toolbar>
      {board ?? <div className="flex min-h-0 flex-auto items-stretch">
        <div className="flex min-w-0 flex-auto flex-col gap-4 px-3 pt-1 pb-6">
          {notice && <p role="status" className={cx(note, 'mx-2 text-success')}>{notice}</p>}
          <CollectionTable layout={layout} label="Zadania" rows={rows} groups={tableGroups} showEmptyGroups={vs.showEmpty} groupGap activeId={selected?.id ?? null} onActivate={id => select(items.find(t => t.id === id) ?? null)}
            message={items.length === 0
              ? <TableMessage columns={n}>Brak zadań w tym widoku. Wybierz inny widok lub zmień wyszukiwanie — nowe zadanie dodasz w karcie klienta.</TableMessage>
              : <TableMessage columns={n} action={<Button size="sm" onClick={c.reset} disabled={c.isDefault}>Przywróć domyślne</Button>}>Żadne zadanie nie pasuje do filtrów widoku.</TableMessage>} />
        </div>
        {selected && (
          <aside ref={panelRef} aria-label={`Szczegóły zadania: ${selected.title}`} className="flex w-100 min-w-0 flex-none flex-col border-l border-edge max-panel:fixed max-panel:inset-y-0 max-panel:right-0 max-panel:z-40 max-panel:w-full max-panel:max-w-110 max-panel:overflow-y-auto max-panel:bg-surface max-panel:shadow-modal">
            <div className="flex h-11 items-center gap-1 pr-2 pl-5">
              <span className="font-mono text-small text-tertiary">{taskNumber(selected.number)}</span>
              <Spacer />
              <Button variant="icon" size="sm" aria-label="Kopiuj link" title={copied ? 'Skopiowano' : 'Kopiuj link'} onClick={copyLink} icon={<LinkIcon size={16} className="shrink-0" aria-hidden />} />
              <Link href={myTaskCustomerHref(selected)} aria-label="Otwórz w karcie klienta" title="Otwórz w karcie klienta" className={buttonClasses({ variant: 'icon', size: 'sm' })}><BuildingOffice size={16} className="shrink-0" aria-hidden /></Link>
              <Button variant="icon" size="sm" aria-label="Zamknij panel" title="Zamknij" shortcut="Esc" onClick={() => setPanelOn(false)} icon={<X size={16} className="shrink-0" aria-hidden />} />
            </div>
            <div className="flex flex-col gap-2 px-5 pt-1 pb-4">
              <h2 className="m-0 font-sans text-heading leading-6 font-semibold tracking-tight text-primary">{selected.title}</h2>
              <p className="m-0 whitespace-pre-wrap text-secondary">{selected.description || 'Brak dodatkowego opisu.'}</p>
            </div>
            <div aria-label="Właściwości zadania" className="flex flex-wrap gap-2 px-5 pb-4">
              <label title="Status  S" className={capsule({ pointer: selected.state !== 'cancelled' })}><StatusIcon state={selected.state} />{stateLabel[selected.state]}{selected.state !== 'cancelled' && <select aria-label="Status" value={selected.state} disabled={busy || conflict} onChange={e => void saveState(e.target.value as Progress)} className={picker}>{progressStates.map(k => <option key={k} value={k}>{stateLabel[k]}</option>)}</select>}</label>
              <label title="Priorytet" className={capsule()}><PriorityIcon priority={selected.priority} />{priorityLabel[selected.priority]}<select aria-label="Priorytet" value={selected.priority} disabled={busy} onChange={e => void saveMeta(e.target.value as Priority, selected.label)} className={picker}>{(Object.keys(priorityLabel) as Priority[]).map(k => <option key={k} value={k}>{priorityLabel[k]}</option>)}</select></label>
              <label title="Osoba" className={capsule({ pad: 'avatar', pointer: canPlan && open(selected) })}><span aria-hidden="true" className={avatarClasses(20, 'bg-surface')}>{initials(selected.assigneeLabel)}</span>{selected.assigneeLabel}{canPlan && open(selected) && people.length > 0 && <select aria-label="Osoba" value={selected.assigneeId} disabled={busy || conflict} onChange={e => savePlan(e.target.value, selected.dueOn)} className={picker}>{!people.some(p => p.id === selected.assigneeId) && <option value={selected.assigneeId}>{selected.assigneeLabel}</option>}{people.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select>}</label>
              {(() => { const d = dueLabel(selected, data.today); return <label title={`Termin: ${longDay(selected.dueOn)}`} className={capsule({ color: d.color, weight: 'font-medium', pointer: canPlan && open(selected) })}>{d.icon}{d.text}{canPlan && open(selected) && <input type="date" aria-label="Termin" value={selected.dueOn} disabled={busy || conflict} onClick={e => { try { e.currentTarget.showPicker(); } catch {} }} onChange={e => { if (e.target.value) savePlan(selected.assigneeId, e.target.value); }} className={picker} />}</label>; })()}
              <label title="Etykieta" className={capsule(selected.label ? {} : { pad: 'icon', color: 'text-secondary' })}>{selected.label ? <><Dot label={selected.label} />{taskLabels[selected.label].name}</> : <Plus size={14} className="shrink-0" aria-hidden />}<select aria-label="Etykieta" value={selected.label ?? ''} disabled={busy} onChange={e => void saveMeta(selected.priority, (e.target.value || null) as TaskLabel | null)} className={picker}><option value="">Bez etykiety</option>{(Object.keys(taskLabels) as TaskLabel[]).map(k => <option key={k} value={k}>{taskLabels[k].name}</option>)}</select></label>
              <label title={selected.link ? `${linkKind[selected.link.kind]}: ${selected.link.title}` : 'Powiąż ze zgłoszeniem, zleceniem lub ofertą'} className={capsule(selected.link ? {} : { pad: 'icon', color: 'text-secondary' })} onPointerDown={() => void loadLinks()} onFocus={() => void loadLinks()}>
                {selected.link ? <><LinkIcon size={16} className="shrink-0 text-tertiary" aria-hidden /><span className="font-mono text-small">{selected.link.code}</span></> : <LinkIcon size={16} className="shrink-0" aria-hidden />}
                <select aria-label="Powiązane zlecenie" value={selected.link?.id ?? ''} disabled={busy || conflict} onChange={e => saveLink(e.target.value)} className={picker}>
                  <option value="">Bez powiązania</option>
                  {selected.link && !links?.some(l => l.id === selected.link!.id) && <option value={selected.link.id}>{selected.link.code} · {selected.link.title}</option>}
                  {links === null ? <option disabled value="__loading">Wczytywanie…</option> : links.map(l => <option key={l.id} value={l.id}>{l.code} · {l.title}</option>)}
                </select>
              </label>
              {selected.contactLabel && <span title="Osoba kontaktowa" className={capsule({ pad: 'wide', editable: false, pointer: false })}><span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-ic-blue" />{selected.contactLabel}</span>}
            </div>
            <Link href={myTaskCustomerHref(selected)} className="mx-3 mb-3 -mt-2 flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-primary no-underline transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
              <span className="text-small leading-4 text-secondary">Klient</span>
              <span className="truncate">{selected.customerName}</span>
            </Link>
            <section aria-label="Aktywność" className="flex flex-auto flex-col gap-3 px-5 pt-2 pb-5">
              <h3 className="m-0 font-sans text-small leading-4 font-medium text-secondary">Aktywność</h3>
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                <li className="flex items-center gap-2 text-small leading-4 text-secondary"><span className="min-w-0 flex-auto truncate">Zadanie utworzone</span><span title={stamp(selected.createdAt)} className="text-tertiary tabular-nums">{stampShort(selected.createdAt)}</span></li>
                {selected.updatedAt !== selected.createdAt && <li className="flex items-center gap-2 text-small leading-4 text-secondary"><span className="min-w-0 flex-auto truncate">Ostatnia zmiana</span><span title={stamp(selected.updatedAt)} className="text-tertiary tabular-nums">{stampShort(selected.updatedAt)}</span></li>}
                {selected.result && <li className="flex flex-col gap-1 rounded-lg bg-raised px-3 py-2"><span className="flex items-center gap-2 text-small leading-4"><span className={avatarClasses(16)}>{initials(selected.assigneeLabel)}</span><span className="flex-auto font-medium">{selected.assigneeLabel}</span><span className="text-tertiary">wynik</span></span><span className="whitespace-pre-wrap">{selected.result}</span></li>}
                {comments.map(c => <li key={c.id} className="flex flex-col gap-1 rounded-lg bg-raised px-3 py-2"><span className="flex items-center gap-2 text-small leading-4"><span className={avatarClasses(16)}>{initials(c.authorLabel)}</span><span className="flex-auto font-medium">{c.authorLabel}</span><span title={stamp(c.createdAt)} className="text-tertiary tabular-nums">{stampShort(c.createdAt)}</span></span><span className="whitespace-pre-wrap">{c.body}</span></li>)}
              </ol>
              <form onSubmit={addComment}>
                <label htmlFor="tl-comment" className="sr-only">Dodaj komentarz</label>
                <textarea id="tl-comment" rows={3} value={draft} maxLength={2000} disabled={posting} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder="Dodaj komentarz…  ⌘↵" className="m-0 block min-h-0 w-full resize-none rounded-md border-0 bg-raised px-3 py-2 font-sans text-body leading-5 text-primary shadow-none outline-0 placeholder:text-tertiary focus:field-ring focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50" />
              </form>
              {selected.state === 'cancelled' && <p className={cx(note, 'text-secondary')}>Zadanie jest anulowane. Wznowisz je w karcie klienta.</p>}
              {conflict && <Button variant="pri" size="sm" className="self-start" onClick={() => { setConflict(false); setError(''); router.refresh(); }}>Odśwież listę</Button>}
              {error && <p role="alert" className={cx(note, 'text-danger')}>{error}</p>}
            </section>
          </aside>
        )}
      </div>}
      {footer}
    </TablePage>
  );
}
