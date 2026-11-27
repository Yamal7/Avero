/* Przeglądy na silniku widoku kolekcji (M0.4, KRA-31): obecna lista planów (kolumny i widoki jak dotąd) w tabeli
   w jednej linii z M0.3, Tailwind. Zapytanie w adresie → maintenance_schedule (szukanie, widok, sortowanie, strony w SQL).
   Pełny projekt z makiety `przeglądy` (statusy, grupy po miesiącach, pasek SMS, panel F-gaz) — M1.8. */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { maintenanceListSchema, maintenanceScheduleParamsSchema, type MaintenanceList, type MaintenancePlan } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { CollectionNotice, CollectionProvider, CollectionSearch, CollectionTable, CollectionViews, SortMenu, ViewOptionsButton, type CollectionRow } from '@/components/collection';
import { CollectionFooter } from '@/components/collection/footer';
import { RecordActions } from '@/components/record-actions';
import { MaintenancePlanForm, MaintenanceToggle } from '@/components/maintenance-forms';
import { NewMaintenancePlan } from '@/components/maintenance-new-plan';
import { CustomerLogo } from '@/components/table/customer-logo';
import { Cell, HeaderCell, TableMessage } from '@/components/table/table';
import { PageHead, Spacer, TablePage, Toolbar } from '@/components/table/page-chrome';
import { buttonClasses } from '@/components/ui/button';
import { clearFilters, isFiltered, parseQuery, queryHref } from '@/lib/collection/query';
import { maintenanceSpec } from '@/lib/collection/specs';
import { collectionLayout, collectionPrefs } from '@/lib/collection/views';
import { loadPreferences } from '@/lib/collection/server';
import type { InstallationOption } from '@/lib/service/types';
import { cx } from '@/lib/cx';
import { Archive, ArrowLeft, ArrowRight, CalendarBlank, CalendarCheck, CalendarDot, CalendarX, ClockCounterClockwise, Building, PauseCircle, Wrench, Calendar, Repeat, ListChecks, MapPin } from '@phosphor-icons/react/ssr';

type InstallationContext = { id: string; type: string; status: string; locations: { customer_id: string; address: string; city: string; customers: { name: string; archived_at: string | null } } };
type State = MaintenancePlan['state'];

const zone = 'Europe/Warsaw';
const fullDay = (d: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${d}T12:00:00Z`));
function shortDay(d: string, today: string) {
  const sameYear = d.slice(0, 4) === today.slice(0, 4);
  return new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }).format(new Date(`${d}T12:00:00Z`)).replace('.', '');
}
/* Status: kształt + kolor + tekst. */
const state: Record<State, { label: string; icon: ReactNode }> = {
  overdue: { label: 'Po terminie', icon: <CalendarX size={14} className="shrink-0 text-danger" aria-hidden /> },
  upcoming: { label: 'W ciągu 30 dni', icon: <CalendarDot size={14} className="shrink-0 text-warning" aria-hidden /> },
  later: { label: 'Późniejszy termin', icon: <CalendarBlank size={14} className="shrink-0 text-tertiary" aria-hidden /> },
  paused: { label: 'Wstrzymany', icon: <PauseCircle size={14} className="shrink-0 text-tertiary" aria-hidden /> },
  archived: { label: 'Archiwalny', icon: <Archive size={14} className="shrink-0 text-tertiary" aria-hidden /> },
};
const H = {
  title: <ListChecks size={14} className="shrink-0 text-ic-green" aria-hidden />,
  customer: <Building size={14} className="shrink-0 text-ic-indigo" aria-hidden />,
  installation: <MapPin size={14} className="shrink-0 text-ic-red" aria-hidden />,
  state: <CalendarCheck size={14} className="shrink-0 text-ic-slate" aria-hidden />,
  due: <Calendar size={14} className="shrink-0 text-ic-blue" aria-hidden />,
  interval: <Repeat size={14} className="shrink-0 text-ic-teal" aria-hidden />,
};
const actionLink = 'flex items-center justify-between gap-2';

export default async function MaintenancePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  if (typeof raw.installation === 'string' && !z.string().uuid().safeParse(raw.installation).success) notFound();
  const query = parseQuery(maintenanceSpec, raw), installation = query.context.installation;
  const { db, access } = await requireSession(), manager = ['admin', 'office'].includes(access.role);
  let context: InstallationContext | null = null;
  if (installation) {
    const result = await db.from('installations').select('id,type,status,locations!inner(customer_id,address,city,customers!inner(name,archived_at))').eq('id', installation).maybeSingle();
    if (result.error) throw new Error('Nie udało się pobrać instalacji.');
    if (!result.data) notFound();
    context = result.data as unknown as InstallationContext;
  }
  const params = maintenanceScheduleParamsSchema.parse({ p_search: query.q, p_view: query.view, p_page: query.page, p_installation: installation ?? null, p_sort: query.sort });
  const [result, prefsAll] = await Promise.all([db.rpc('maintenance_schedule', params), loadPreferences(db)]);
  const parsed = result.error ? null : maintenanceListSchema.safeParse({ ...result.data, apiVersion: '1', page: query.page, pageSize: 20 });
  const list: MaintenanceList | null = parsed?.success ? parsed.data : null;
  const canAdd = manager && (!context || (context.status !== 'archived' && !context.locations.customers.archived_at));
  let options: InstallationOption[] = [];
  if (canAdd) {
    const found = await db.rpc('find_service_installations', { p_search: '' });
    if (!found.error) options = found.data as InstallationOption[];
    if (context && !options.some(o => o.id === context!.id)) options.unshift({ id: context.id, label: `${context.locations.customers.name} · ${context.locations.address}, ${context.locations.city} · ${context.type}` });
  }
  const prefs = collectionPrefs(maintenanceSpec, prefsAll);
  const layout = collectionLayout(maintenanceSpec, prefs.presentation.columns), n = layout.keys.length;
  const keys = layout.keys.filter(k => k !== 'select'), filtered = isFiltered(maintenanceSpec, query);
  const today = list?.today ?? new Date().toISOString().slice(0, 10);
  const head: Record<string, ReactNode> = {
    title: <HeaderCell key="title" layout={layout} col="title" icon={H.title}>Plan</HeaderCell>,
    customer: <HeaderCell key="customer" layout={layout} col="customer" icon={H.customer}>Klient</HeaderCell>,
    installation: <HeaderCell key="installation" layout={layout} col="installation" icon={H.installation}>Instalacja</HeaderCell>,
    state: <HeaderCell key="state" layout={layout} col="state" icon={H.state}>Status</HeaderCell>,
    due: <HeaderCell key="due" layout={layout} col="due" icon={H.due} align="right" title="Następny termin">Termin</HeaderCell>,
    interval: <HeaderCell key="interval" layout={layout} col="interval" icon={H.interval} align="right">Cykl</HeaderCell>,
    actions: <HeaderCell key="actions" layout={layout} col="actions" label="Działania" />,
  };
  const rows: CollectionRow[] = (list?.plans ?? []).map(plan => {
    const st = state[plan.state], where = `${plan.installation_type} · ${plan.address}, ${plan.city}`;
    const cell: Record<string, ReactNode> = {
      title: <Cell key="title" layout={layout} col="title"><Link href={`/dashboard/maintenance/${plan.id}`} className="min-w-0 truncate rounded-xs font-medium text-primary no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent">{plan.title}</Link></Cell>,
      customer: <Cell key="customer" layout={layout} col="customer"><CustomerLogo name={plan.customer_name} href={`/dashboard/customers/${plan.customer_id}`} card={{ city: plan.city }} showName /></Cell>,
      installation: <Cell key="installation" layout={layout} col="installation" title={where} className="text-secondary"><span className="truncate">{where}</span></Cell>,
      state: <Cell key="state" layout={layout} col="state" gap={1} className="text-secondary">{st.icon}<span className="truncate">{st.label}</span></Cell>,
      due: <Cell key="due" layout={layout} col="due" align="right" title={`Następny termin: ${fullDay(plan.next_due_on)}`} className={cx('tabular-nums', plan.state === 'overdue' ? 'font-medium text-danger' : 'font-normal text-primary')}>{shortDay(plan.next_due_on, today)}</Cell>,
      interval: <Cell key="interval" layout={layout} col="interval" align="right" className="text-secondary tabular-nums">co {plan.interval_months} mies.</Cell>,
      actions: <Cell key="actions" layout={layout} col="actions" align="right" clip={false}>
        <RecordActions compact label={plan.title}>
          <Link className={actionLink} href={`/dashboard/maintenance/${plan.id}`}>Wykonanie i historia<ClockCounterClockwise size={18} aria-hidden /></Link>
          {plan.active && plan.parent_active && <Link className={actionLink} href={`/dashboard/service/new?installation=${plan.installation_id}`}>Utwórz zgłoszenie serwisowe<Wrench size={18} aria-hidden /></Link>}
          <Link className={actionLink} href={`/dashboard/maintenance?installation=${plan.installation_id}&view=all`}>Plany tej instalacji<ArrowRight size={18} aria-hidden /></Link>
          {manager && plan.parent_active && <><MaintenanceToggle plan={plan} /><details><summary>Edytuj plan / ustaw następny termin</summary><MaintenancePlanForm record={plan} /></details></>}
        </RecordActions>
      </Cell>,
    };
    return { id: `${plan.id}:${plan.version}`, label: plan.title, cells: keys.map(k => cell[k]) };
  });
  const message = !list
    ? <TableMessage columns={n} kind="error" action={<Link href={queryHref(maintenanceSpec, query)} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Spróbuj ponownie</Link>}>Nie udało się pobrać harmonogramu przeglądów. Sprawdź połączenie i spróbuj ponownie.</TableMessage>
    : filtered
      ? <TableMessage columns={n} action={<Link href={queryHref(maintenanceSpec, clearFilters(maintenanceSpec, query))} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Wyczyść szukanie</Link>}>Żaden plan nie pasuje do wyszukiwania.</TableMessage>
      : <TableMessage columns={n} action={query.view !== 'all' ? <Link href={queryHref(maintenanceSpec, { ...query, view: 'all', sort: query.sort, page: 1 })} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Pokaż wszystkie</Link> : undefined}>
          {query.view === 'all' ? (manager ? 'Nie ma jeszcze planów przeglądów. Dodaj plan dla instalacji.' : 'Nie ma jeszcze planów przeglądów.') : 'Brak planów w tym widoku.'}
        </TableMessage>;
  const counter = (icon: ReactNode, value: number, label: string) => <span title={label} className="inline-flex items-center gap-1 tabular-nums">{icon}{value}<span className="sr-only"> {label}</span></span>;

  return (
    <CollectionProvider spec={maintenanceSpec} query={query} prefs={prefs}>
      <TablePage>
        <PageHead icon={<CalendarCheck size={16} className="shrink-0" aria-hidden />} category="Serwis" title="Przeglądy">
          <Spacer />
          {list && (
            <span title={`Terminy według daty ${fullDay(list.today)} w Polsce. Plan przeglądu nie jest rezerwacją wizyty — po wykonaniu potwierdź go na podstawie zatwierdzonego protokołu. Liczniki uwzględniają wybraną instalację i wyszukiwanie.`} className="mr-1 inline-flex min-w-0 items-center gap-3 overflow-hidden text-small leading-4 text-secondary">
              {counter(state.overdue.icon, list.summary.overdue, 'po terminie')}
              {counter(state.upcoming.icon, list.summary.upcoming, 'w ciągu 30 dni')}
              {counter(<CalendarCheck size={14} className="shrink-0 text-success" aria-hidden />, list.summary.active, 'aktywnych planów')}
              {counter(state.paused.icon, list.summary.paused, 'wstrzymanych')}
            </span>
          )}
        </PageHead>
        {context && (
          <div className="flex min-w-0 flex-wrap items-center gap-2 pr-3 pb-1 pl-5 text-small leading-4 text-secondary max-desktop:pl-3">
            <Link href={`/dashboard/customers/${context.locations.customer_id}`} className="inline-flex items-center gap-1 rounded-xs text-secondary no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-accent"><ArrowLeft size={12} className="shrink-0" aria-hidden />Karta klienta</Link>
            <span className="min-w-0 truncate text-primary">{context.locations.customers.name} · {context.type} · {context.locations.address}, {context.locations.city}</span>
            <Link href="/dashboard/maintenance" className="rounded-xs text-secondary no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-accent">Wszystkie instalacje</Link>
          </div>
        )}
        <Toolbar>
          <CollectionViews label="Terminy przeglądów" />
          <Spacer />
          <ViewOptionsButton />
          {canAdd && <NewMaintenancePlan options={options} selected={installation} />}
        </Toolbar>
        <div className="flex min-w-0 flex-wrap items-center gap-2 pr-3 pb-2 pl-4 max-desktop:pl-3">
          <CollectionSearch />
          <SortMenu />
        </div>
        <CollectionNotice />
        <div className="flex min-w-0 flex-auto flex-col px-3 pb-6">
          <CollectionTable layout={layout} label="Plany przeglądów" header={keys.map(k => head[k])} rows={rows} message={message} />
        </div>
        {list && <CollectionFooter spec={maintenanceSpec} query={query} total={list.total}><span>{filtered ? 'Pasujące plany' : 'Plany'}: {list.total}</span></CollectionFooter>}
      </TablePage>
    </CollectionProvider>
  );
}
