import Link from 'next/link';
import { redirect } from 'next/navigation';
import { myTasksQuerySchema, myTasksSchema, type MyTasksQuery } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { TaskBoard } from '@/components/task-board';
import { TaskListView } from '@/components/task-list';
import { PageHead, PageLink, Segmented, Spacer, ViewTabs, searchFrameClasses, searchInputClasses } from '@/components/table/page-chrome';
import { buttonClasses } from '@/components/ui/button';
import { cx } from '@/lib/cx';
import { CheckSquare, Kanban, ListBullets, MagnifyingGlass } from '@phosphor-icons/react/ssr';

/* Saved views of the design ("Wszystkie / Moje / Ten tydzień / F-gaz") map onto the filters the task query supports. */
const views: [MyTasksQuery['filter'], string][] = [['open', 'Otwarte'], ['today', 'Dziś'], ['overdue', 'Po terminie'], ['upcoming', 'Nadchodzące'], ['closed', 'Zamknięte']];

export default async function MyTasksPage({ searchParams }: { searchParams: Promise<{ filter?: string; search?: string; page?: string; view?: string }> }) {
  const { db, user, access } = await requireSession();
  if (!['admin', 'office', 'technician'].includes(access.role)) redirect('/portal');
  const { view: viewParam, ...raw } = await searchParams;
  const view = viewParam === 'board' ? 'board' : 'list';
  const parsed = myTasksQuerySchema.safeParse({ filter: 'open', ...raw });
  const query = parsed.success ? parsed.data : myTasksQuerySchema.parse({ filter: 'open' });
  const r = await db.rpc('my_crm_tasks', { p_filter: query.filter, p_search: query.search, p_page: query.page });
  if (r.error) throw new Error('Nie udało się pobrać Twoich zadań.');
  const data = myTasksSchema.refine(v => v.viewerId === user.id).parse(r.data);
  const href = (filter: MyTasksQuery['filter'], page = 1, v: string = view) => `/dashboard/tasks?${new URLSearchParams({ filter, ...(query.search ? { search: query.search } : {}), ...(page > 1 ? { page: String(page) } : {}), ...(v === 'board' ? { view: 'board' } : {}) })}`;
  const staff = ['admin', 'office'].includes(access.role);

  const header = (
    <PageHead icon={<CheckSquare size={16} className="shrink-0" aria-hidden />} category="Projekty" title="Zadania">
      <Spacer />
      <span className="mr-1 text-small leading-4 text-tertiary tabular-nums">{data.counts.open} otwartych</span>
    </PageHead>
  );
  const tabs = <ViewTabs label="Widoki zadań" items={views.map(([filter, label]) => ({ label, href: href(filter), active: query.filter === filter, title: `${label}: ${data.counts[filter]}` }))} />;
  const layout = (
    <Segmented label="Układ" className="mx-1" items={[
      { key: 'list', href: href(query.filter, query.page, 'list'), active: view === 'list', ariaLabel: 'Lista', title: 'Lista', children: <ListBullets size={14} className="shrink-0" aria-hidden /> },
      { key: 'board', href: href(query.filter, query.page, 'board'), active: view === 'board', ariaLabel: 'Tablica', title: 'Tablica', children: <Kanban size={14} className="shrink-0" aria-hidden /> },
    ]} />
  );
  const search = (
    <form action="/dashboard/tasks" role="search" className="inline-flex">
      <input type="hidden" name="filter" value={query.filter} />
      {view === 'board' && <input type="hidden" name="view" value="board" />}
      <label className={searchFrameClasses}>
        <MagnifyingGlass size={14} className="shrink-0" aria-hidden />
        <span className="sr-only">Szukaj zadania lub klienta</span>
        <input id="task-search" type="search" name="search" autoFocus maxLength={160} defaultValue={query.search} placeholder="Szukaj zadania lub klienta" className={cx(searchInputClasses, 'w-56')} />
      </label>
    </form>
  );
  const extra = staff
    ? <Link href="/dashboard/team-tasks" title="Zadania całego zespołu" className={buttonClasses({ variant: 'pri', size: 'sm', className: 'ml-1' })}>Zadania zespołu</Link>
    : null;
  const footer = (data.total > 20 || !parsed.success) && (
    <nav aria-label="Strony zadań" className="flex min-h-row items-center justify-between gap-4 px-5 pb-4 text-small leading-4 text-secondary tabular-nums">
      {query.page > 1 ? <PageLink href={href(query.filter, query.page - 1)}>Poprzednia</PageLink> : <span />}
      <span>Strona {query.page} · zadań: {data.total}</span>
      {query.page * 20 < data.total ? <PageLink href={href(query.filter, query.page + 1)}>Następna</PageLink> : <span />}
    </nav>
  );

  return <TaskListView key={`${query.filter}-${query.search}-${query.page}-${view}`} data={data} header={header} toolbarTabs={tabs} layoutSwitch={layout} search={search} toolbarExtra={extra} footer={footer} canPlan={staff} board={view === 'board' ? <TaskBoard data={data} /> : undefined} />;
}
