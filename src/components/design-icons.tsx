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

