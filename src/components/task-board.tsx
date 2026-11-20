import Link from 'next/link';
import type { MyTasks } from '@hvac/api-client';
import { myTaskCustomerHref } from '@/lib/crm/tasks';

type Task = MyTasks['items'][number];
const columns: { state: Task['state']; label: string }[] = [
  { state: 'todo', label: 'Do zrobienia' },
  { state: 'in_progress', label: 'W toku' },
  { state: 'done', label: 'Zrobione' },
  { state: 'cancelled', label: 'Anulowane' },
];
const shortDate = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short' }).format(new Date(day + 'T12:00:00Z'));

/** Board layout of the current task view (design: Zadania · tablica). Read-only; changes happen in the list or on the record. */
export function TaskBoard({ data }: { data: MyTasks }) {
  const visible = columns.filter(c => c.state === 'todo' || c.state === 'in_progress' || data.items.some(t => t.state === c.state));
  return (
    <div className="tb" role="list" aria-label="Tablica zadań">
      {visible.map(col => {
        const items = data.items.filter(t => t.state === col.state);
        return (
          <section className="tb-col" key={col.state} role="listitem" aria-label={`${col.label}: ${items.length}`}>
            <h2 className="tb-head"><span className={`tb-mark is-${col.state}`} aria-hidden="true" />{col.label}<span className="day-count num">{items.length}</span></h2>
            <div className="tb-cards">
              {items.map(task => {
                const late = task.dueOn < data.today && (task.state === 'todo' || task.state === 'in_progress');
                return (
                  <Link className="tb-card" href={myTaskCustomerHref(task)} key={task.id}>
                    <span className="tb-title">{task.title}</span>
                    <span className="tb-meta"><span className="ell">{task.customerName}</span><time className={`num${late ? ' is-late' : ''}`} dateTime={task.dueOn} title={task.dueOn}>{task.dueOn === data.today ? 'Dziś' : shortDate(task.dueOn)}</time></span>
                  </Link>
                );
              })}
              {!items.length && <p className="tb-empty">Brak zadań</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
