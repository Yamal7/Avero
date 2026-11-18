import Link from 'next/link';
import { redirect } from 'next/navigation';
import { myTasksQuerySchema, myTasksSchema, type MyTasksQuery } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { TaskBoard } from '@/components/task-board';
import { TaskListView } from '@/components/task-list';
import { DI } from '@/components/design-icons';

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px 0 20px' }}>
      <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{DI.check}</span>
      <span style={{ color: 'var(--text-secondary)' }}>Projekty</span>
      <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}>{DI.chev}</span>
      <h1 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Zadania</h1>
      <span style={{ flex: '1 1 auto' }} />
      <span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginRight: 4 }}>{data.counts.open} otwartych</span>
    </div>
  );
  const tabs = (
    <div role="tablist" aria-label="Widoki zadań" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {views.map(([filter, label]) => {
        const on = query.filter === filter;
        return <Link key={filter} role="tab" aria-selected={on} className="tab" href={href(filter)} title={`${label}: ${data.counts[filter]}`} style={{ height: 28, padding: '0 12px', borderRadius: 14, border: 0, background: on ? 'var(--bg-subtle)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: on ? 500 : 400, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{label}</Link>;
      })}
    </div>
  );
  const layout = (
    <div role="group" aria-label="Układ" style={{ display: 'inline-flex', gap: 2, padding: 2, margin: '0 4px', borderRadius: 10, background: 'var(--bg-subtle)' }}>
      <Link href={href(query.filter, query.page, 'list')} aria-current={view === 'list' ? 'page' : undefined} aria-label="Lista" title="Lista" style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: view === 'list' ? 'var(--bg-surface)' : 'transparent', color: view === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{DI.list}</Link>
      <Link href={href(query.filter, query.page, 'board')} aria-current={view === 'board' ? 'page' : undefined} aria-label="Tablica" title="Tablica" style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: view === 'board' ? 'var(--bg-surface)' : 'transparent', color: view === 'board' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{DI.board}</Link>
    </div>
  );
  const search = (
    <form action="/dashboard/tasks" role="search" style={{ display: 'inline-flex' }}>
      <input type="hidden" name="filter" value={query.filter} />
      {view === 'board' && <input type="hidden" name="view" value="board" />}
      <label htmlFor="task-search" className="vh">Szukaj zadania lub klienta</label>
      <input id="task-search" type="search" name="search" autoFocus maxLength={160} defaultValue={query.search} placeholder="Szukaj zadania lub klienta" style={{ width: 220, height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', font: 'inherit', color: 'var(--text-primary)', minHeight: 0, boxShadow: 'none' }} />
    </form>
  );
  const extra = staff
    ? <Link href="/dashboard/team-tasks" className="pri" title="Zadania całego zespołu" style={{ height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px', marginLeft: 4, border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500 }}>Zadania zespołu</Link>
    : null;
  const footer = (data.total > 20 || !parsed.success) && (
    <nav aria-label="Strony zadań" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 36, padding: '0 20px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
      {query.page > 1 ? <Link href={href(query.filter, query.page - 1)}>Poprzednia</Link> : <span />}
      <span className="num">Strona {query.page} · zadań: {data.total}</span>
      {query.page * 20 < data.total ? <Link href={href(query.filter, query.page + 1)}>Następna</Link> : <span />}
    </nav>
  );

  return <TaskListView key={`${query.filter}-${query.search}-${query.page}-${view}`} data={data} header={header} toolbarTabs={tabs} layoutSwitch={layout} search={search} toolbarExtra={extra} footer={footer} board={view === 'board' ? <TaskBoard data={data} /> : undefined} />;
}
