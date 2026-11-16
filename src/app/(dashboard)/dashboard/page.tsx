import type { ReactNode } from 'react';
import Link from 'next/link';
import { maintenanceListSchema } from '@hvac/api-client';
import { getTaskAlerts } from '@/lib/data/task-alerts';
import { myTaskCustomerHref } from '@/lib/crm/tasks';
import { displayTime, localDate, SERVICE_TIME_ZONE, visitOnDate } from '@/lib/service/dates';
import { visitLabels, type CalendarVisit } from '@/lib/service/types';
import { requireSession } from '@/lib/auth';
import { Icon } from '@/components/icon';

type Phase = 'todo' | 'progress' | 'done' | 'alert';
const phaseColor: Record<Phase, string> = { todo: 'var(--text-secondary)', progress: 'var(--st-progress)', done: 'var(--success)', alert: 'var(--st-blocked)' };

/** Status mark from the design: shape + colour of the phase, never colour alone. */
function StatusMark({ phase, label }: { phase: Phase; label: string }) {
  const c = phaseColor[phase];
  return (
    <span className="day-status" role="img" aria-label={label} title={label}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        {phase === 'done' ? (
          <><circle cx="7" cy="7" r="6.5" fill={c} /><path d="M4.4 7.2 6.2 9 9.6 5.4" fill="none" stroke="var(--bg-surface)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>
        ) : (
          <>
            <circle cx="7" cy="7" r="5.75" fill="none" stroke={c} strokeWidth="1.5" />
            {phase === 'progress' && <path d="M7 7L7 4A3 3 0 0 1 7 10Z" fill={c} />}
            {phase === 'alert' && <path d="M7 4.2v3.3M7 9.7v.01" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />}
          </>
        )}
      </svg>
    </span>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <details className="day-group" open>
      <summary><Icon name="down" size={12} /><h2>{title}</h2><span className="day-count num">{count}</span></summary>
      {children}
    </details>
  );
}

function Widget({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <details className="day-widget" open>
      <summary><h2>{title}</h2><Icon name="down" size={12} />{note && <span className="day-count">{note}</span>}</summary>
      <div className="day-widget-body">{children}</div>
    </details>
  );
}

const shortDate = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, day: 'numeric', month: 'short' }).format(new Date(day + 'T12:00:00Z'));

export default async function Dashboard() {
  const { db, access } = await requireSession(), now = new Date(), today = localDate(now.toISOString()), manager = ['admin', 'office'].includes(access.role);
  const [customers, serviceCount, urgent, unassigned, calendar, maintenance, tasks] = await Promise.all([
    db.from('customers').select('id', { count: 'exact', head: true }).is('archived_at', null),
    db.from('service_tickets').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
    db.from('service_tickets').select('id,subject', { count: 'exact' }).neq('status', 'closed').eq('priority', 'high').order('created_at').limit(5),
    db.from('service_tickets').select('id,subject', { count: 'exact' }).neq('status', 'closed').is('assigned_to', null).order('created_at').limit(5),
    db.rpc('calendar_service_visits', { p_from: today }), db.rpc('maintenance_schedule'), getTaskAlerts(),
  ]);
  if ([customers, serviceCount, urgent, unassigned, calendar, maintenance].some(result => result.error)) throw new Error('Nie udało się pobrać podsumowania.');
  const plans = maintenanceListSchema.parse({ ...maintenance.data, apiVersion: '1', page: 1, pageSize: 20 });
  const visits = (calendar.data as CalendarVisit[]).filter(visit => visit.status !== 'cancelled' && visitOnDate(visit.scheduled_at, visit.duration_minutes, today));
  const overduePlans = plans.plans.filter(plan => plan.state === 'overdue').slice(0, 5);
  const upcomingPlans = plans.plans.filter(plan => plan.state !== 'overdue').slice(0, 4);
  const unassignedCount = manager ? unassigned.count || 0 : 0;
  const taskTotal = tasks.counts.today + tasks.counts.overdue;
  const total = visits.length + (urgent.count || 0) + unassignedCount + plans.summary.overdue + taskTotal;
  const dayLabel = new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const fullDate = new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, dateStyle: 'full' }).format(now);
  const visitPhase = (status: CalendarVisit['status']): Phase => status === 'completed' ? 'done' : status === 'planned' ? 'todo' : 'progress';

  return (
    <main className="pui-page">
      <div className="pui-page-head">
        <Icon name="day" size={16} />
        <h1>Mój dzień</h1>
        <span className="pui-crumb-sep" aria-hidden="true"><Icon name="right" size={12} /></span>
        <time className="pui-page-sub" dateTime={today} title={fullDate}>{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</time>
        <span className="pui-spacer" />
        <span className="pui-page-meta num">{total} {total === 1 ? 'sprawa' : total % 10 >= 2 && total % 10 <= 4 && (total % 100 < 12 || total % 100 > 14) ? 'sprawy' : 'spraw'}</span>
        <Link className="pui-ib" href="/dashboard/service/new" aria-label="Nowe zgłoszenie" title="Nowe zgłoszenie"><Icon name="plus" size={14} /></Link>
      </div>
      <div className="pui-toolbar">
        <nav className="pui-pills" aria-label="Zakres">
          <Link className="pui-pill is-active" href="/dashboard" aria-current="page">Dziś</Link>
          <Link className="pui-pill" href={`/dashboard/calendar?week=${today}`}>Ten tydzień</Link>
          <Link className="pui-pill" href="/dashboard/notifications">Aktywność</Link>
        </nav>
      </div>
      <div className="day-layout">
        <div className="day-main">
          <Group title="Wizyty" count={visits.length}>
            {visits.length ? (
              <div className="day-scroll"><div className="day-rows">
                {visits.map(visit => (
                  <Link className="day-row is-visit" href={`/dashboard/service/${visit.ticket_id}`} key={visit.id}>
                    <time className="day-time num" dateTime={visit.scheduled_at}>{localDate(visit.scheduled_at) < today ? 'Trwa' : displayTime(visit.scheduled_at)}</time>
                    <StatusMark phase={visitPhase(visit.status)} label={visitLabels[visit.status]} />
                    <span className="day-title"><span className="ell">{visit.subject}</span><span className="ell">{visit.customer_name} · {visit.city}</span></span>
                    <span className="day-meta ell">{visitLabels[visit.status]}</span>
                  </Link>
                ))}
              </div></div>
            ) : (
              <div className="day-empty">
                <p>Na dziś nie ma zaplanowanych wizyt. Terminy pojawią się tutaj po zapisaniu ich w planowaniu.</p>
                <p className="day-hint"><Link href={`/dashboard/calendar?week=${today}`}>Otwórz planowanie</Link></p>
              </div>
            )}
          </Group>

          {(urgent.count || 0) > 0 && (
            <Group title="Pilne zgłoszenia" count={urgent.count || 0}>
              <div className="day-scroll"><div className="day-rows">
                {(urgent.data || []).map(ticket => (
                  <Link className="day-row is-item" href={`/dashboard/service/${ticket.id}`} key={ticket.id}>
                    <StatusMark phase="alert" label="Pilne" />
                    <span className="day-title"><span className="ell">{ticket.subject}</span><span /></span>
                    <span className="day-meta">Pilny</span>
                  </Link>
                ))}
              </div></div>
            </Group>
          )}

          {unassignedCount > 0 && (
            <Group title="Bez technika" count={unassignedCount}>
              <div className="day-scroll"><div className="day-rows">
                {(unassigned.data || []).map(ticket => (
                  <Link className="day-row is-item" href={`/dashboard/service/${ticket.id}`} key={ticket.id}>
                    <StatusMark phase="todo" label="Nieprzypisane" />
                    <span className="day-title"><span className="ell">{ticket.subject}</span><span /></span>
                    <span className="day-meta">Przypisz technika</span>
                  </Link>
                ))}
              </div></div>
            </Group>
          )}

          {plans.summary.overdue > 0 && (
            <Group title="Przeglądy po terminie" count={plans.summary.overdue}>
              <div className="day-scroll"><div className="day-rows">
                {overduePlans.map(plan => (
                  <Link className="day-row is-item" href={`/dashboard/maintenance/${plan.id}`} key={plan.id}>
                    <StatusMark phase="alert" label="Po terminie" />
                    <span className="day-title"><span className="ell">{plan.title}</span><span className="ell">{plan.customer_name}</span></span>
                    <time className="day-meta is-late num" dateTime={plan.next_due_on} title={plan.next_due_on}>{shortDate(plan.next_due_on)}</time>
                  </Link>
                ))}
              </div></div>
            </Group>
          )}

          <Group title="Moje zadania" count={taskTotal}>
            {tasks.items.length ? (
              <div className="day-scroll"><div className="day-rows">
                {tasks.items.map(task => {
                  const late = task.dueOn < tasks.today;
                  return (
                    <Link className="day-row is-item" href={myTaskCustomerHref(task)} key={task.id}>
                      <StatusMark phase={task.state === 'in_progress' ? 'progress' : 'todo'} label={task.state === 'in_progress' ? 'W toku' : 'Do zrobienia'} />
                      <span className="day-title"><span className="ell">{task.title}</span><span className="ell">{task.customerName}</span></span>
                      <time className={`day-meta num${late ? ' is-late' : ''}`} dateTime={task.dueOn} title={task.dueOn}>{late ? shortDate(task.dueOn) : 'Dziś'}</time>
                    </Link>
                  );
                })}
              </div></div>
            ) : (
              <div className="day-empty">
                <p>Nie masz zaległych ani dzisiejszych zadań.</p>
                <p className="day-hint"><Link href="/dashboard/tasks?filter=open">Wszystkie otwarte zadania</Link></p>
              </div>
            )}
          </Group>
        </div>

        <aside className="day-rail" aria-label="Widgety">
          <Widget title="Stan firmy">
            <Link className="day-stat" href="/dashboard/customers"><span className="ell">Aktywni klienci</span><span className="num">{(customers.count || 0).toLocaleString('pl-PL')}</span></Link>
            <Link className="day-stat" href="/dashboard/service?status=open"><span className="ell">Otwarte zgłoszenia</span><span className="num">{serviceCount.count || 0}</span></Link>
            <Link className="day-stat" href="/dashboard/maintenance?view=overdue"><span className="ell">Przeglądy po terminie</span>{plans.summary.overdue > 0 && <span className="day-dot" aria-hidden="true" />}<span className="num">{plans.summary.overdue}</span></Link>
            <Link className="day-stat" href="/dashboard/maintenance?view=upcoming"><span className="ell">Przeglądy w ciągu 30 dni</span><span className="num">{plans.summary.upcoming}</span></Link>
            <Link className="day-stat" href="/dashboard/tasks?filter=overdue"><span className="ell">Moje zadania po terminie</span>{tasks.counts.overdue > 0 && <span className="day-dot" aria-hidden="true" />}<span className="num">{tasks.counts.overdue}</span></Link>
          </Widget>
          <Widget title="Najbliższe przeglądy">
            {upcomingPlans.length ? upcomingPlans.map(plan => (
              <Link className="day-stat" href={`/dashboard/maintenance/${plan.id}`} key={plan.id} title={`${plan.title} · ${plan.customer_name}`}>
                <span className="ell">{plan.customer_name}</span><time className="num" dateTime={plan.next_due_on}>{shortDate(plan.next_due_on)}</time>
              </Link>
            )) : <div className="day-empty"><p>Brak zbliżających się przeglądów.</p></div>}
          </Widget>
        </aside>
      </div>
    </main>
  );
}
