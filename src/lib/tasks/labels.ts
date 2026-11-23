/* Etykiety i pomocnicze funkcje zadań, zgłoszeń i osób (wcześniej w components/design-icons.tsx). Bez JSX — do użycia wszędzie. */
import type { MyTask } from '@hvac/api-client';

export type TaskState = MyTask['state'];
export const taskStateLabel: Record<TaskState, string> = { backlog: 'Backlog', todo: 'Do zrobienia', in_progress: 'W toku', review: 'Do sprawdzenia', done: 'Gotowe', cancelled: 'Anulowane' };
export const isOpenTask = (state: TaskState) => state === 'backlog' || state === 'todo' || state === 'in_progress' || state === 'review';

export type Priority = 'none' | 'low' | 'normal' | 'high' | 'urgent';
export const priorityLabel: Record<Priority, string> = { none: 'Bez priorytetu', low: 'Niski', normal: 'Normalny', high: 'Wysoki', urgent: 'Pilny' };

export type TaskLabel = 'purchasing' | 'offers' | 'fgas' | 'documents' | 'customers' | 'warranty' | 'contracts' | 'tools' | 'internal';
export const taskLabels: Record<TaskLabel, { name: string; color: string }> = {
  purchasing: { name: 'Zakupy', color: 'rgb(224, 112, 42)' }, offers: { name: 'Oferty', color: 'rgb(124, 133, 224)' }, fgas: { name: 'F-gaz', color: 'rgb(43, 179, 177)' },
  documents: { name: 'Dokumenty', color: 'rgb(138, 143, 152)' }, customers: { name: 'Klienci', color: 'rgb(78, 167, 232)' }, warranty: { name: 'Gwarancje', color: 'rgb(168, 123, 234)' },
  contracts: { name: 'Umowy', color: 'rgb(78, 167, 232)' }, tools: { name: 'Narzędzia', color: 'rgb(138, 143, 152)' }, internal: { name: 'Wewnętrzne', color: 'rgb(138, 143, 152)' },
};
export const taskNumber = (n: number) => `ZD-${n}`;

export type TicketState = 'new' | 'in_progress' | 'waiting' | 'closed';
export const ticketStateLabel: Record<TicketState, string> = { new: 'Nowe', in_progress: 'W realizacji', waiting: 'Czeka na części', closed: 'Zamknięte' };
export const ticketCode = (n: number) => `ZG-${String(n).padStart(4, '0')}`;

const personPalette = ['rgb(59, 130, 214)', 'rgb(155, 107, 224)', 'rgb(31, 167, 165)', 'rgb(224, 112, 42)', 'rgb(214, 69, 61)', 'rgb(47, 158, 91)'];
export function personColor(id: string) { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return personPalette[h % personPalette.length]!; }
export function personInitials(label: string) { const base = label.includes('@') ? label.split('@')[0]! : label; return base.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?'; }
export function personName(label: string) { return label.includes('@') ? label.split('@')[0]! : label; }
