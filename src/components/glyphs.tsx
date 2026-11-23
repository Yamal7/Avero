/* Glify stanu z projektu (rysunki stanu, nie ikony): kształt statusu zadania i zgłoszenia, priorytet, awatar osoby.
   Własne SVG, bo kształt koduje fazę (pierścień, wycinek koła, „!”, ptaszek). Działają w komponentach serwerowych i klienckich. */
import { personColor, personInitials, ticketStateLabel, type Priority, type TaskState, type TicketState } from '@/lib/tasks/labels';

/** Task status shape: Backlog dashed ring, Do zrobienia empty ring, W toku half pie, Do sprawdzenia full green pie, Gotowe check, Anulowane dashed grey. */
export function StatusIcon({ state }: { state: TaskState }) {
  if (state === 'backlog') return <ProgressGlyph color="var(--text-tertiary)" dashed />;
  if (state === 'in_progress') return <ProgressGlyph color="var(--st-progress)" fraction={0.5} />;
  if (state === 'review') return <ProgressGlyph color="var(--success)" fraction={1} />;
  if (state === 'done') return <ProgressGlyph color="var(--accent)" done />;
  if (state === 'cancelled') return <ProgressGlyph color="var(--text-tertiary)" dashed />;
  return <ProgressGlyph color="var(--text-secondary)" />;
}

export function PriorityIcon({ priority }: { priority: Priority }) {
  if (priority === 'none') return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0"><path d="M1.5 7h2M6 7h2M10.5 7h2" fill="none" strokeWidth="1.5" strokeLinecap="round" className="stroke-tertiary" /></svg>;
  if (priority === 'urgent') return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0"><rect x="1" y="1" width="12" height="12" rx="3" className="fill-danger" /><path d="M7 4v3.5M7 10v.01" fill="none" strokeWidth="1.6" strokeLinecap="round" className="stroke-surface" /></svg>;
  const on = priority === 'high' ? 3 : priority === 'normal' ? 2 : 1, c = (i: number) => (i <= on ? 'fill-secondary' : 'fill-border-strong');
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0"><rect x="1" y="8" width="3" height="5" rx="1" className={c(1)} /><rect x="5.5" y="5" width="3" height="8" rx="1" className={c(2)} /><rect x="10" y="2" width="3" height="11" rx="1" className={c(3)} /></svg>;
}

/** Generic progress glyph of the design: ring + pie of the given fraction; `done` fills with a check, `alert` shows "!". */
export function ProgressGlyph({ color, fraction = 0, done = false, alert = false, dashed = false }: { color: string; fraction?: number; done?: boolean; alert?: boolean; dashed?: boolean }) {
  const f = Math.max(0, Math.min(1, fraction)), a = f * 2 * Math.PI, x = (7 + 3 * Math.sin(a)).toFixed(2), y = (7 - 3 * Math.cos(a)).toFixed(2);
  const pie = f <= 0 ? 'M7 7Z' : f >= 1 ? 'M7 4a3 3 0 1 1 0 6a3 3 0 1 1 0-6Z' : `M7 7L7 4A3 3 0 ${f > 0.5 ? 1 : 0} 1 ${x} ${y}Z`;
  // kolor fazy przychodzi jako var(--…) z wywołującego, dlatego stroke/fill zostają w style
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0"><circle cx="7" cy="7" r="5.75" fill="none" strokeWidth="1.5" strokeDasharray={dashed ? '2.2 2.31' : 'none'} style={{ stroke: color }} /><path d={alert ? 'M7 7Z' : pie} style={{ fill: color }} /><circle cx="7" cy="7" r="6.5" opacity={done ? 1 : 0} style={{ fill: color }} /><path d="M4.4 7.2 6.2 9 9.6 5.4" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={done ? 1 : 0} className="stroke-surface" /><path d="M7 4.2v3.3M7 9.7v.01" fill="none" strokeWidth="1.5" strokeLinecap="round" opacity={alert ? 1 : 0} style={{ stroke: color }} /></svg>;
}

/** Ticket status shape from the design: Nowe = dashed ring, W realizacji = 2/3 pie, Czeka na części = orange ring with "!", Zamknięte = filled with a check. */
export function TicketStatusIcon({ status }: { status: string }) {
  const g = status === 'closed' ? <ProgressGlyph color="var(--accent)" done /> : status === 'in_progress' ? <ProgressGlyph color="var(--st-progress)" fraction={2 / 3} /> : status === 'waiting' ? <ProgressGlyph color="var(--st-blocked)" alert /> : <ProgressGlyph color="var(--text-secondary)" dashed />;
  const label = ticketStateLabel[status as TicketState] ?? status;
  return <span role="img" aria-label={label} title={label} className="inline-flex">{g}</span>;
}

/** Coloured person avatar from the design (20px, white initials). Kolor osoby jest wyliczany, więc tło zostaje w style. */
export function PersonAvatar({ id, label, size = 20 }: { id: string; label: string; size?: number }) {
  return <span title={label} style={{ width: size, height: size, flex: '0 0 auto', borderRadius: '50%', background: personColor(id), boxShadow: '0 0 0 2px var(--bg-surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size <= 16 ? 7 : 9, lineHeight: '10px', fontWeight: 600, color: 'rgb(255, 255, 255)' }}>{personInitials(label)}</span>;
}
