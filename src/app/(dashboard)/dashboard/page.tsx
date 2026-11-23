/* Mój dzień — ported 1:1 from the design artboard "Mój dzień · jasny" (inline styles copied from the rendered design).
   Groups and widgets show the data the program has; SLA, contracts and invoices are modules that do not exist yet. */
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { crmTaskCommentSchema, maintenanceListSchema } from '@hvac/api-client';
import { getTaskAlerts } from '@/lib/data/task-alerts';
import { myTaskCustomerHref } from '@/lib/crm/tasks';
import { displayTime, localDate, SERVICE_TIME_ZONE, visitOnDate } from '@/lib/service/dates';
import { visitLabels, type CalendarVisit } from '@/lib/service/types';
import { requireSession } from '@/lib/auth';
import { PersonAvatar, PriorityIcon, ProgressGlyph, StatusIcon } from '@/components/glyphs';
import { personName, taskNumber, ticketCode, type Priority } from '@/lib/tasks/labels';
import { Buildings, CalendarBlank, CalendarDot, CalendarX, CaretDown, CaretRight, Clock, Plus, SidebarSimple, Sun, Warning, WarningCircle, Wrench } from '@phosphor-icons/react/ssr';

const I = {
  sun: <Sun size={16} className="shrink-0" aria-hidden />,
  alert: <Warning size={14} className="shrink-0 text-danger" aria-hidden />,
  clock: <Clock size={14} className="shrink-0 text-tertiary" aria-hidden />,
  late: <WarningCircle size={14} className="shrink-0 text-danger" aria-hidden />,
  cal: <CalendarBlank size={14} className="shrink-0 text-tertiary" aria-hidden />,
  cal16: <CalendarBlank size={16} className="shrink-0" aria-hidden />,
  tool: <Wrench size={14} className="shrink-0 text-tertiary" aria-hidden />,
  inbox: <WarningCircle size={14} className="shrink-0 text-tertiary" aria-hidden />,
  people: <Buildings size={14} className="shrink-0 text-tertiary" aria-hidden />,
};
const ibStyle = (size: number): CSSProperties => ({ width: size, height: size, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--text-secondary)', padding: 0 });
const rowStyle = (cols: string): CSSProperties => ({ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 12, height: 36, padding: '0 8px', borderRadius: 10 });
const tabStyle = (on: boolean): CSSProperties => ({ height: 28, padding: '0 12px', borderRadius: 14, border: 0, background: on ? 'var(--bg-subtle)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: on ? 500 : 400, display: 'inline-flex', alignItems: 'center' });

function Group({ title, count, action, children }: { title: string; count: number; action?: ReactNode; children: ReactNode }) {
  return (
    <details open style={{ display: 'flex', flexDirection: 'column' }}>
      <summary className="grp" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36, padding: '0 6px 0 4px', borderRadius: 10, background: 'transparent', marginBottom: 4, listStyle: 'none', cursor: 'pointer' }}>
        <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 6px' }}>
          <span className="caret day-caret" style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}><CaretDown size={14} className="shrink-0" aria-hidden /></span>
          <h2 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>{title}</h2>
          <span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{count}</span>
        </span>
        {action}
      </summary>
      <div style={{ overflowX: 'auto', margin: '0 -8px', padding: 0 }}><div style={{ minWidth: 640, padding: 0 }}>{children}</div></div>
    </details>
  );
}
function Widget({ title, note, action, children }: { title: string; note?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <details open style={{ border: 0, borderRadius: 14, background: 'var(--bg-raised)', padding: 4 }}>
      <summary style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36, padding: '0 4px', listStyle: 'none', cursor: 'pointer' }}>
        <span className="tab" style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 6, height: 28, padding: '0 6px', borderRadius: 8, color: 'var(--text-secondary)' }}>
          <h2 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500, color: 'var(--text-primary)' }}>{title}</h2>
          <span className="caret day-caret" style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}><CaretDown size={14} className="shrink-0" aria-hidden /></span>
        </span>
        {note && <span style={{ fontSize: 12, color: 'var(--text-tertiary)', paddingRight: 6 }}>{note}</span>}
        {action}
      </summary>
      <div style={{ padding: '0 0 4px' }}>{children}</div>
    </details>
  );
}
function Stat({ href, icon, label, value, dot }: { href: string; icon: ReactNode; label: string; value: ReactNode; dot?: boolean }) {
  return <Link href={href} className="row" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 8px', borderRadius: 10 }}><span style={{ display: 'inline-flex' }}>{icon}</span><span className="ell" style={{ flex: '1 1 auto', color: 'var(--text-secondary)' }}>{label}</span>{dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', flex: '0 0 auto' }} />}<span className="num" style={{ fontWeight: 500 }}>{value}</span></Link>;
}
const Empty = ({ children }: { children: ReactNode }) => <p style={{ margin: 0, padding: '8px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{children}</p>;

const shortDate = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, day: 'numeric', month: 'short' }).format(new Date(day + 'T12:00:00Z')).replace('.', '');
const longStamp = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, dateStyle: 'long', timeStyle: 'short' }).format(new Date(v));
function elapsed(from: string, now: Date) {
  const min = Math.max(0, Math.round((now.getTime() - new Date(from).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ${min % 60} min`;
  const d = Math.floor(h / 24);
  return `${d} d ${h % 24} h`;
}
function ago(from: string, now: Date) {
  const min = Math.max(0, Math.round((now.getTime() - new Date(from).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  if (min < 24 * 60) return `${Math.floor(min / 60)} godz.`;
  return shortDate(localDate(from));
}
const days = (from: string, to: string) => Math.round((new Date(to + 'T12:00:00Z').getTime() - new Date(from + 'T12:00:00Z').getTime()) / 86400000);
const plural = (n: number, one: string, few: string, many: string) => n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;
const ticketPriority = (p: string): Priority => p === 'high' ? 'high' : p === 'low' ? 'low' : 'normal';
const ticketPriorityLabel: Record<string, string> = { high: 'Wysoki', normal: 'Normalny', low: 'Niski' };
const visitGlyph = (s: CalendarVisit['status']) => s === 'completed' ? <ProgressGlyph color="var(--success)" fraction={1} /> : s === 'in_progress' ? <ProgressGlyph color="var(--st-progress)" fraction={2 / 3} /> : s === 'en_route' ? <ProgressGlyph color="var(--st-progress)" fraction={1 / 3} /> : <ProgressGlyph color="var(--text-secondary)" />;

type TicketRow = { id: string; ticket_number: number; subject: string; priority: string; created_at: string; customer: { name: string } | null; installation: { location: { city: string | null } | null } | null };
const feedSchema = z.array(crmTaskCommentSchema.extend({ taskNumber: z.number(), taskTitle: z.string(), customerId: z.string().uuid() }));

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ widgets?: string }> }) {
  const { widgets } = await searchParams, showRail = widgets !== 'off';
  const { db, access } = await requireSession(), now = new Date(), today = localDate(now.toISOString()), manager = ['admin', 'office'].includes(access.role);
  const ticketCols = 'id,ticket_number,subject,priority,created_at,customer:customers(name),installation:installations(location:locations(city))';
  const [customers, serviceCount, urgent, unassigned, calendar, maintenance, tasks, feed, techs] = await Promise.all([
    db.from('customers').select('id', { count: 'exact', head: true }).is('archived_at', null),
    db.from('service_tickets').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
    db.from('service_tickets').select(ticketCols, { count: 'exact' }).neq('status', 'closed').eq('priority', 'high').order('created_at').limit(5),
    db.from('service_tickets').select(ticketCols, { count: 'exact' }).neq('status', 'closed').is('assigned_to', null).order('created_at').limit(5),
    db.rpc('calendar_service_visits', { p_from: today }), db.rpc('maintenance_schedule'), getTaskAlerts(), db.rpc('my_task_comment_feed'),
    manager ? db.rpc('service_technicians', { p_customer: null }) : Promise.resolve({ data: [], error: null }),
  ]);
  const failed = Object.entries({ customers, serviceCount, urgent, unassigned, calendar, maintenance, feed, techs }).find(([, result]) => result.error);
  if (failed) { console.error('Mój dzień:', failed[0], failed[1].error); throw new Error('Nie udało się pobrać podsumowania.'); }
  const plans = maintenanceListSchema.parse({ ...maintenance.data, apiVersion: '1', page: 1, pageSize: 20 });
  const week = (calendar.data as CalendarVisit[]).filter(v => v.status !== 'cancelled');
  const visits = week.filter(visit => visitOnDate(visit.scheduled_at, visit.duration_minutes, today));
  const people = new Map(((techs.data || []) as { id: string; email: string }[]).map(t => [t.id, t.email]));
  const overduePlans = plans.plans.filter(plan => plan.state === 'overdue').slice(0, 5);
  const upcomingPlans = plans.plans.filter(plan => plan.state !== 'overdue').slice(0, 4);
  const urgentRows = (urgent.data || []) as unknown as TicketRow[], freeRows = (unassigned.data || []) as unknown as TicketRow[];
  const unassignedCount = manager ? unassigned.count || 0 : 0;
  const mentions = feedSchema.parse(feed.data);
  const taskTotal = tasks.counts.today + tasks.counts.overdue;
  const total = visits.length + (urgent.count || 0) + unassignedCount + plans.summary.overdue + taskTotal;
  const dayLabel = new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const fullDate = new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, dateStyle: 'full' }).format(now);
  const weekEnd = new Date(today + 'T12:00:00Z'); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const weekNote = `${shortDate(today).split(' ')[0]}–${shortDate(weekEnd.toISOString().slice(0, 10))}`;
  const plansThisWeek = plans.plans.filter(p => p.next_due_on >= today && p.next_due_on <= weekEnd.toISOString().slice(0, 10)).length;
  const team = [...new Set(visits.map(v => v.assigned_to).filter((x): x is string => !!x))].map(id => {
    const own = visits.filter(v => v.assigned_to === id), done = own.filter(v => v.status === 'completed').length, active = own.some(v => v.status === 'in_progress' || v.status === 'en_route');
    return { id, label: people.get(id) || 'Technik', done, total: own.length, active };
  });
  const groupAction = (href: string, label: string) => <Link href={href} className="ib" aria-label={label} title={label} style={ibStyle(24)}><Plus size={16} className="shrink-0" aria-hidden /></Link>;

  return (
    <main className="dk" style={{ flex: '1 1 auto', minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px 0 20px' }}>
        <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{I.sun}</span>
        <h1 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Mój dzień</h1>
        <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}><CaretRight size={12} className="shrink-0" aria-hidden /></span>
        <time dateTime={today} title={fullDate} style={{ color: 'var(--text-secondary)' }}>{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</time>
        <span style={{ flex: '1 1 auto' }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginRight: 4 }}>{total} {plural(total, 'sprawa', 'sprawy', 'spraw')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: '8px 12px 8px 16px' }}>
        <div role="tablist" aria-label="Zakres" style={{ display: 'flex', gap: 4 }}>
          <Link role="tab" aria-selected="true" className="tab" href="/dashboard" style={tabStyle(true)}>Dziś</Link>
          <Link role="tab" aria-selected="false" className="tab" href={`/dashboard/calendar?week=${today}`} style={tabStyle(false)}>Ten tydzień</Link>
          <Link role="tab" aria-selected="false" className="tab" href="/dashboard/notifications" style={tabStyle(false)}>Aktywność</Link>
        </div>
        <span style={{ flex: '1 1 auto' }} />
        <Link href={showRail ? '/dashboard?widgets=off' : '/dashboard'} className={`ib${showRail ? ' on' : ''}`} aria-label="Pokaż lub ukryj widgety" aria-pressed={showRail} title="Pokaż lub ukryj widgety" style={ibStyle(28)}><SidebarSimple size={16} mirrored className="shrink-0" aria-hidden /></Link>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16, padding: '4px 12px 24px' }}>
        <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Group title="Wizyty" count={visits.length} action={manager ? groupAction(`/dashboard/calendar?week=${today}`, 'Zaplanuj wizytę') : undefined}>
            {visits.length ? visits.map(v => (
              <Link key={v.id} href={`/dashboard/service/${v.ticket_id}`} className="row" style={rowStyle('40px 64px 14px minmax(0px, 1fr) 44px')}>
                <span className="num" style={{ color: 'var(--text-secondary)' }}>{localDate(v.scheduled_at) < today ? 'Trwa' : displayTime(v.scheduled_at)}</span>
                <span className="num" style={{ color: 'var(--text-tertiary)' }}>{ticketCode(v.ticket_number)}</span>
                <span role="img" aria-label={visitLabels[v.status]} title={visitLabels[v.status]} style={{ display: 'inline-flex', alignItems: 'center' }}>{visitGlyph(v.status)}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}><span className="ell" style={{ flex: '0 1 auto', fontWeight: 500 }}>{v.subject}</span><span className="ell" style={{ flex: '0 10000 auto', color: 'var(--text-secondary)' }}>{v.customer_name}{v.city ? ` · ${v.city}` : ''}</span></span>
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>{v.assigned_to && <PersonAvatar id={v.assigned_to} label={people.get(v.assigned_to) || 'Technik'} />}</span>
              </Link>
            )) : <Empty>Na dziś nie ma zaplanowanych wizyt. Terminy pojawią się tutaj po zapisaniu ich w planowaniu.</Empty>}
          </Group>

          {(urgent.count || 0) > 0 && (
            <Group title="Pilne zgłoszenia" count={urgent.count || 0}>
              {urgentRows.map(t => (
                <Link key={t.id} href={`/dashboard/service/${t.id}`} className="row" style={rowStyle('80px minmax(0px, 1fr) 20px 132px')}>
                  <span className="num" style={{ color: 'var(--text-tertiary)' }}>{ticketCode(t.ticket_number)}</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}><span className="ell" style={{ flex: '0 1 auto', fontWeight: 500 }}>{t.subject}</span><span className="ell" style={{ flex: '0 10000 auto', color: 'var(--text-secondary)' }}>{t.customer?.name}</span></span>
                  <span title="Priorytet: Wysoki" style={{ display: 'flex', alignItems: 'center' }}><PriorityIcon priority={ticketPriority(t.priority)} /></span>
                  <span title={`Zgłoszono ${longStamp(t.created_at)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: 12 }}>{I.alert}<span className="num" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{elapsed(t.created_at, now)}</span></span>
                </Link>
              ))}
            </Group>
          )}

          {unassignedCount > 0 && (
            <Group title="Bez technika" count={unassignedCount} action={groupAction('/dashboard/service/new', 'Nowe zgłoszenie')}>
              {freeRows.map(t => (
                <Link key={t.id} href={`/dashboard/service/${t.id}`} className="row" style={rowStyle('80px minmax(0px, 1fr) 20px 132px')}>
                  <span className="num" style={{ color: 'var(--text-tertiary)' }}>{ticketCode(t.ticket_number)}</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}><span className="ell" style={{ flex: '0 1 auto', fontWeight: 500 }}>{t.subject}</span><span className="ell" style={{ flex: '0 10000 auto', color: 'var(--text-secondary)' }}>{[t.customer?.name, t.installation?.location?.city].filter(Boolean).join(' · ')}</span></span>
                  <span title={`Priorytet: ${ticketPriorityLabel[t.priority] ?? t.priority}`} style={{ display: 'flex', alignItems: 'center' }}><PriorityIcon priority={ticketPriority(t.priority)} /></span>
                  <span title={`Czeka od ${longStamp(t.created_at)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>{I.clock}<span className="num">{elapsed(t.created_at, now)}</span></span>
                </Link>
              ))}
            </Group>
          )}

          {plans.summary.overdue > 0 && (
            <Group title="Po terminie" count={plans.summary.overdue}>
              {overduePlans.map(p => {
                const late = days(p.next_due_on, today);
                return (
                  <Link key={p.id} href={`/dashboard/maintenance/${p.id}`} className="row" style={rowStyle('minmax(0px, 1fr) 160px')}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}><span className="ell" style={{ flex: '0 1 auto', fontWeight: 500 }}>{p.title}</span><span className="ell" style={{ flex: '0 10000 auto', color: 'var(--text-secondary)' }}>{p.customer_name}</span></span>
                    <span title={`Termin: ${p.next_due_on}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: 12 }}>{I.late}<span className="num" style={{ color: 'var(--danger)', fontWeight: 500 }}>{late} {plural(late, 'dzień', 'dni', 'dni')} po terminie</span></span>
                  </Link>
                );
              })}
            </Group>
          )}

          <Group title="Moje zadania" count={taskTotal} action={<Link href="/dashboard/tasks" className="ib" aria-label="Wszystkie zadania" title="Wszystkie zadania" style={ibStyle(24)}><CaretRight size={12} className="shrink-0" aria-hidden /></Link>}>
            {tasks.items.length ? tasks.items.map(t => {
              const late = t.dueOn < tasks.today;
              return (
                <Link key={t.id} href={myTaskCustomerHref(t)} className="row" style={rowStyle('56px 14px minmax(0px, 1fr) 76px')}>
                  <span className="num" style={{ color: 'var(--text-tertiary)' }}>{taskNumber(t.number)}</span>
                  <span style={{ display: 'inline-flex' }}><StatusIcon state={t.state} /></span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}><span className="ell" style={{ flex: '0 1 auto', fontWeight: 500 }}>{t.title}</span><span className="ell" style={{ flex: '0 10000 auto', color: 'var(--text-secondary)' }}>{t.customerName}</span></span>
                  <span className="num" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontSize: 12, color: late ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 500 }}>{late ? <CalendarX size={14} className="shrink-0 text-danger" aria-hidden /> : <CalendarDot size={14} className="shrink-0 text-warning" aria-hidden />}<span>{late ? shortDate(t.dueOn) : 'Dziś'}</span></span>
                </Link>
              );
            }) : <Empty>Nie masz zaległych ani dzisiejszych zadań.</Empty>}
          </Group>

          {mentions.length > 0 && (
            <Group title="Wzmianki" count={mentions.length}>
              {mentions.map(m => (
                <Link key={m.id} href={`/dashboard/tasks?filter=open`} className="row" style={{ display: 'grid', gridTemplateColumns: '20px minmax(0px, 1fr) auto', gap: '2px 12px', alignItems: 'center', padding: 8, borderRadius: 8 }}>
                  <span style={{ gridRow: '1 / span 2', alignSelf: 'start', marginTop: 2 }}><PersonAvatar id={m.authorId} label={m.authorLabel} /></span>
                  <span className="ell" style={{ fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{personName(m.authorLabel)}</span> w <span className="mono" style={{ fontSize: 11 }}>{taskNumber(m.taskNumber)}</span> · <span>{m.taskTitle}</span></span>
                  <span className="num" title={longStamp(m.createdAt)} style={{ fontSize: 12, lineHeight: '16px', color: 'var(--text-tertiary)' }}>{ago(m.createdAt, now)}</span>
                  <span className="ell" style={{ gridColumn: '2 / span 2' }}>{m.body}</span>
                </Link>
              ))}
            </Group>
          )}
        </div>

        {showRail && (
          <aside aria-label="Widgety" style={{ flex: '1 1 300px', maxWidth: 340, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {manager && (
              <Widget title="Zespół dziś" action={<Link href={`/dashboard/calendar?week=${today}`} className="ib" aria-label="Otwórz planowanie" title="Otwórz planowanie" style={ibStyle(24)}>{I.cal16}</Link>}>
                {team.length ? team.map(p => (
                  <Link key={p.id} href={`/dashboard/calendar?week=${today}`} className="row" title={`${p.label} · ${p.done}/${p.total} wizyt zakończonych`} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 8px', borderRadius: 10 }}>
                    <PersonAvatar id={p.id} label={p.label} />
                    <span className="ell" style={{ flex: '1 1 auto', fontWeight: 500 }}>{personName(p.label)}</span>
                    <span role="img" aria-label={p.done === p.total ? 'Zakończone' : p.active ? 'W realizacji' : 'Zaplanowane'} style={{ display: 'inline-flex' }}>{p.done === p.total ? <ProgressGlyph color="var(--success)" done /> : p.active ? <ProgressGlyph color="var(--st-progress)" fraction={Math.max(1 / 3, p.done / p.total)} /> : <ProgressGlyph color="var(--text-secondary)" />}</span>
                    <span className="num" style={{ width: 28, textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>{p.done}/{p.total}</span>
                  </Link>
                )) : <Empty>Nikt z zespołu nie ma dziś wizyt.</Empty>}
              </Widget>
            )}
            <Widget title="Najbliższe 7 dni" note={weekNote}>
              <Stat href={`/dashboard/calendar?week=${today}`} icon={I.tool} label="Wizyty" value={week.length} />
              <Stat href="/dashboard/maintenance?view=upcoming" icon={I.cal} label="Przeglądy" value={plansThisWeek} />
              <Stat href="/dashboard/service?status=open" icon={I.inbox} label="Otwarte zgłoszenia" value={serviceCount.count || 0} />
              <Stat href="/dashboard/maintenance?view=overdue" icon={<CalendarX size={14} className="shrink-0 text-danger" aria-hidden />} label="Przeglądy po terminie" value={plans.summary.overdue} dot={plans.summary.overdue > 0} />
              <Stat href="/dashboard/customers" icon={I.people} label="Aktywni klienci" value={(customers.count || 0).toLocaleString('pl-PL')} />
            </Widget>
            <Widget title="Najbliższe przeglądy">
              {upcomingPlans.length ? upcomingPlans.map(p => (
                <Link key={p.id} href={`/dashboard/maintenance/${p.id}`} className="row" title={`${p.title} · ${p.customer_name}`} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 8px', borderRadius: 10 }}>
                  <span className="ell" style={{ flex: '1 1 auto', color: 'var(--text-secondary)' }}>{p.customer_name}</span>
                  <span className="num" style={{ fontWeight: 500 }}>{shortDate(p.next_due_on)}</span>
                </Link>
              )) : <Empty>Brak zbliżających się przeglądów.</Empty>}
            </Widget>
          </aside>
        )}
      </div>
    </main>
  );
}
