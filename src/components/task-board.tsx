import Link from 'next/link';
import type { MyTasks } from '@hvac/api-client';
import { myTaskCustomerHref } from '@/lib/crm/tasks';
import { DI, PersonAvatar, PriorityIcon, StatusIcon, isOpenTask, priorityLabel, taskLabels, taskNumber, taskStateLabel } from './design-icons';

type Task = MyTasks['items'][number];
type State = Task['state'];
/* Zadania · tablica, 1:1 from the design: five columns from Backlog to Gotowe, cards on --bg-raised without borders. */
const columns: State[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
const shortDate = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short' }).format(new Date(day + 'T12:00:00Z')).replace('.', '');
const longDate = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(day + 'T12:00:00Z'));

export function TaskBoard({ data }: { data: MyTasks }) {
  return (
    <div style={{ flex: '1 1 auto', overflowX: 'auto', padding: '4px 12px 24px' }}>
      <div role="list" aria-label="Tablica zadań" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 'max-content' }}>
        {columns.map(state => {
          const items = data.items.filter(t => t.state === state), name = taskStateLabel[state];
          return (
            <section key={state} role="listitem" aria-label={`${name}: ${items.length}`} style={{ flex: '0 0 224px', width: 224, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 0 0 8px' }}>
                <StatusIcon state={state} />
                <h2 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>{name}</h2>
                <span className="num" style={{ flex: '1 1 auto', fontSize: 12, color: 'var(--text-tertiary)' }}>{items.length}</span>
                <Link href="/dashboard/customers" className="ib" aria-label={`Nowe zadanie: ${name}`} title="Nowe zadanie: wybierz firmę" style={{ width: 24, height: 24, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--text-tertiary)', padding: 0 }}>{DI.plus14}</Link>
              </div>
              {items.map(t => {
                const late = isOpenTask(t.state) && t.dueOn < data.today, today = t.dueOn === data.today;
                return (
                  <Link key={t.id} href={myTaskCustomerHref(t)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--bg-raised)', border: 0, borderRadius: 12, color: 'inherit', textDecoration: 'none' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="num" style={{ flex: '1 1 auto', fontSize: 12, lineHeight: '16px', color: 'var(--text-tertiary)' }}>{taskNumber(t.number)}</span><PersonAvatar id={t.assigneeId} label={t.assigneeLabel} /></span>
                    <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><span role="img" aria-label={taskStateLabel[t.state]} title={taskStateLabel[t.state]} style={{ display: 'inline-flex', marginTop: 3 }}><StatusIcon state={t.state} /></span><span style={{ fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.title}</span></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span role="img" aria-label={`Priorytet: ${priorityLabel[t.priority]}`} title={`Priorytet: ${priorityLabel[t.priority]}`} style={{ display: 'inline-flex' }}><PriorityIcon priority={t.priority} /></span>
                      {t.label && <span className="ell" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 20, padding: '0 6px', border: 0, borderRadius: 6, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: taskLabels[t.label].color, flex: '0 0 auto' }} />{taskLabels[t.label].name}</span>}
                      <span style={{ flex: '1 1 auto' }} />
                      <time className="num" dateTime={t.dueOn} title={`${late ? 'Po terminie: ' : 'Termin: '}${longDate(t.dueOn)}`} style={{ fontSize: 12, color: late ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: late || today ? 500 : 400 }}>{today ? 'Dziś' : shortDate(t.dueOn)}</time>
                    </span>
                  </Link>
                );
              })}
              {!items.length && <p style={{ margin: 0, padding: '8px', fontSize: 12, color: 'var(--text-tertiary)' }}>Brak zadań</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
