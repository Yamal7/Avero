export const SERVICE_TIME_ZONE = 'Europe/Warsaw';
export function localDate(iso = new Date().toISOString()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: SERVICE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(iso));
  const part = (name: string) => parts.find(item => item.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function localDateTime(iso: string) {
  const date = new Date(iso);
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: SERVICE_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  return `${localDate(iso)}T${time}`;
}
export function addDays(date: string, days: number) { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate()+days); return value.toISOString().slice(0,10); }
export function weekStart(date: string) { const day = new Date(`${date}T12:00:00Z`).getUTCDay(); return addDays(date, -(day === 0 ? 6 : day-1)); }
export function displayDateTime(iso: string | null) { return iso ? new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) : 'Nie ustalono'; }
export function displayTime(iso: string) { return new Intl.DateTimeFormat('pl-PL', { timeZone: SERVICE_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso)); }

export function visitOnDate(start: string, minutes: number, day: string) {
  const lastInstant = new Date(new Date(start).getTime()+minutes*60000-1).toISOString();
  return localDate(start) <= day && localDate(lastInstant) >= day;
}
