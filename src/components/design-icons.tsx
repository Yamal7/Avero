/* Icons copied 1:1 from the design (Lucide paths, 1.5 stroke) and its custom status/priority glyphs. Usable from server and client components. */
import type { MyTask } from '@hvac/api-client';
type State = MyTask['state'];
/* ── design icons (exact paths from the design) ── */
const sv = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, style: { flex: '0 0 auto' } };
export const DI = {
  check: <svg {...sv}><rect key="1" x="3" y="3" width="18" height="18" rx="2" /><path key="2" d="m9 12 2 2 4-4" /></svg>,
  chev: <svg {...sv} width={12} height={12} strokeWidth={2}><path key="1" d="m9 18 6-6-6-6" /></svg>,
  caret: <svg {...sv} width={14} height={14}><path key="1" d="m6 9 6 6 6-6" /></svg>,
  plus16: <svg {...sv}><path key="1" d="M5 12h14M12 5v14" /></svg>,
  plus14: <svg {...sv} width={14} height={14}><path key="1" d="M5 12h14M12 5v14" /></svg>,
  filter: <svg {...sv}><path key="1" d="M3 6h18M7 12h10M10 18h4" /></svg>,
  list: <svg {...sv} width={14} height={14}><path key="1" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
  board: <svg {...sv} width={14} height={14}><path key="1" d="M6 5v11M12 5v6M18 5v14" /></svg>,
  panel: <svg {...sv}><rect key="1" x="3" y="3" width="18" height="18" rx="2" /><path key="2" d="M15 3v18" /></svg>,
  link: <svg {...sv}><path key="1" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path key="2" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  x: <svg {...sv}><path key="1" d="M18 6 6 18M6 6l12 12" /></svg>,
  building: <svg {...sv}><rect key="1" x="4" y="2" width="16" height="20" rx="2" /><path key="2" d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" /></svg>,
  cal: <svg {...sv} width={14} height={14} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><rect key="1" x="3" y="4" width="18" height="18" rx="2" /><path key="2" d="M16 2v4M8 2v4M3 10h18" /></svg>,
  calToday: <svg {...sv} width={14} height={14} style={{ flex: '0 0 auto', color: 'var(--warning)' }}><path key="1" d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /><path key="2" d="M16 2v4M8 2v4M3 10h5" /><circle key="3" cx="16" cy="16" r="6" /><path key="4" d="M16 14v2l1 1" /></svg>,
  calLate: <svg {...sv} width={14} height={14} style={{ flex: '0 0 auto', color: 'var(--danger)' }}><rect key="1" x="3" y="4" width="18" height="18" rx="2" /><path key="2" d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4" /></svg>,
  noPrio: <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: '0 0 auto' }}><path key="1" d="M1.5 7h2M6 7h2M10.5 7h2" fill="none" strokeWidth="1.5" strokeLinecap="round" style={{ stroke: 'var(--text-tertiary)' }} /></svg>,
};
export function StatusIcon({ state }: { state: State }) {
  const color = state === 'in_progress' ? 'var(--st-progress)' : state === 'done' ? 'var(--accent)' : state === 'cancelled' ? 'var(--text-tertiary)' : 'var(--text-secondary)';
  const fill = state === 'in_progress' ? 'M7 7L7 4A3 3 0 0 1 7.00 10.00Z' : 'M7 7Z', done = state === 'done' ? '1' : '0';
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: '0 0 auto' }}><circle cx="7" cy="7" r="5.75" fill="none" strokeWidth="1.5" strokeDasharray={state === 'cancelled' ? '2.2 2.31' : 'none'} style={{ stroke: color }} /><path d={fill} style={{ fill: color }} /><circle cx="7" cy="7" r="6.5" opacity={done} style={{ fill: color }} /><path d="M4.4 7.2 6.2 9 9.6 5.4" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={done} style={{ stroke: 'var(--bg-surface)' }} /></svg>;
}


export type Priority = 'none' | 'low' | 'normal' | 'high' | 'urgent';
export const priorityLabel: Record<Priority, string> = { none: 'Bez priorytetu', low: 'Niski', normal: 'Normalny', high: 'Wysoki', urgent: 'Pilny' };
export function PriorityIcon({ priority }: { priority: Priority }) {
  if (priority === 'none') return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: '0 0 auto' }}><path d="M1.5 7h2M6 7h2M10.5 7h2" fill="none" strokeWidth="1.5" strokeLinecap="round" style={{ stroke: 'var(--text-tertiary)' }} /></svg>;
  if (priority === 'urgent') return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: '0 0 auto' }}><rect x="1" y="1" width="12" height="12" rx="3" style={{ fill: 'var(--danger)' }} /><path d="M7 4v3.5M7 10v.01" fill="none" strokeWidth="1.6" strokeLinecap="round" style={{ stroke: 'var(--bg-surface)' }} /></svg>;
  const on = priority === 'high' ? 3 : priority === 'normal' ? 2 : 1, c = (i: number) => (i <= on ? 'var(--text-secondary)' : 'var(--border-strong)');
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: '0 0 auto' }}><rect x="1" y="8" width="3" height="5" rx="1" style={{ fill: c(1) }} /><rect x="5.5" y="5" width="3" height="8" rx="1" style={{ fill: c(2) }} /><rect x="10" y="2" width="3" height="11" rx="1" style={{ fill: c(3) }} /></svg>;
}

export type TaskLabel = 'purchasing' | 'offers' | 'fgas' | 'documents' | 'customers' | 'warranty' | 'contracts' | 'tools' | 'internal';
export const taskLabels: Record<TaskLabel, { name: string; color: string }> = {
  purchasing: { name: 'Zakupy', color: 'rgb(224, 112, 42)' }, offers: { name: 'Oferty', color: 'rgb(124, 133, 224)' }, fgas: { name: 'F-gaz', color: 'rgb(43, 179, 177)' },
  documents: { name: 'Dokumenty', color: 'rgb(138, 143, 152)' }, customers: { name: 'Klienci', color: 'rgb(78, 167, 232)' }, warranty: { name: 'Gwarancje', color: 'rgb(168, 123, 234)' },
  contracts: { name: 'Umowy', color: 'rgb(78, 167, 232)' }, tools: { name: 'Narzędzia', color: 'rgb(138, 143, 152)' }, internal: { name: 'Wewnętrzne', color: 'rgb(138, 143, 152)' },
};
export const taskNumber = (n: number) => `ZD-${n}`;

/** Generic progress glyph of the design: ring + pie of the given fraction; `done` fills with a check, `alert` shows "!". */
export function ProgressGlyph({ color, fraction = 0, done = false, alert = false, dashed = false }: { color: string; fraction?: number; done?: boolean; alert?: boolean; dashed?: boolean }) {
  const f = Math.max(0, Math.min(1, fraction)), a = f * 2 * Math.PI, x = (7 + 3 * Math.sin(a)).toFixed(2), y = (7 - 3 * Math.cos(a)).toFixed(2);
  const pie = f <= 0 ? 'M7 7Z' : f >= 1 ? 'M7 4a3 3 0 1 1 0 6a3 3 0 1 1 0-6Z' : `M7 7L7 4A3 3 0 ${f > 0.5 ? 1 : 0} 1 ${x} ${y}Z`;
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: '0 0 auto' }}><circle cx="7" cy="7" r="5.75" fill="none" strokeWidth="1.5" strokeDasharray={dashed ? '2.2 2.31' : 'none'} style={{ stroke: color }} /><path d={alert ? 'M7 7Z' : pie} style={{ fill: color }} /><circle cx="7" cy="7" r="6.5" opacity={done ? 1 : 0} style={{ fill: color }} /><path d="M4.4 7.2 6.2 9 9.6 5.4" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={done ? 1 : 0} style={{ stroke: 'var(--bg-surface)' }} /><path d="M7 4.2v3.3M7 9.7v.01" fill="none" strokeWidth="1.5" strokeLinecap="round" opacity={alert ? 1 : 0} style={{ stroke: color }} /></svg>;
}

const personPalette = ['rgb(59, 130, 214)', 'rgb(155, 107, 224)', 'rgb(31, 167, 165)', 'rgb(224, 112, 42)', 'rgb(214, 69, 61)', 'rgb(47, 158, 91)'];
export function personColor(id: string) { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return personPalette[h % personPalette.length]; }
export function personInitials(label: string) { const base = label.includes('@') ? label.split('@')[0]! : label; return base.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?'; }
export function personName(label: string) { return label.includes('@') ? label.split('@')[0]! : label; }
/** Coloured person avatar from the design (20px, white initials). */
export function PersonAvatar({ id, label, size = 20 }: { id: string; label: string; size?: number }) {
  return <span title={label} style={{ width: size, height: size, flex: '0 0 auto', borderRadius: '50%', background: personColor(id), boxShadow: '0 0 0 2px var(--bg-surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size <= 16 ? 7 : 9, lineHeight: '10px', fontWeight: 600, color: 'rgb(255, 255, 255)' }}>{personInitials(label)}</span>;
}
export const ticketCode = (n: number) => `ZG-${String(n).padStart(4, '0')}`;
