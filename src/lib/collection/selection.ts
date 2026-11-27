/* Kursor i zaznaczenie wierszy kolekcji (M0.4, KRA-31) — czysta logika bez DOM.
   J / K przesuwa kursor w granicach listy (bez zawijania), Shift+J / Shift+K rozszerza zaznaczenie,
   X zaznacza / odznacza wiersz pod kursorem, Shift+X zaznacza zakres od kotwicy (ostatnio przełączonego wiersza),
   Esc czyści zaznaczenie (a gdy nic nie jest zaznaczone — zamyka panel; to decyduje ekran). */

export type Selection = { cursor: string | null; anchor: string | null; selected: string[] };
export const initialSelection: Selection = { cursor: null, anchor: null, selected: [] };

export type SelectionAction =
  | { type: 'move'; ids: string[]; delta: number; extend?: boolean }
  | { type: 'focus'; id: string }
  | { type: 'toggle'; id?: string }
  | { type: 'range'; ids: string[]; id?: string }
  | { type: 'clear' }
  | { type: 'sync'; ids: string[] };

const union = (a: string[], b: string[]) => [...a, ...b.filter(x => !a.includes(x))];

export function selectionReducer(s: Selection, a: SelectionAction): Selection {
  switch (a.type) {
    case 'move': {
      if (!a.ids.length) return s;
      const i = s.cursor ? a.ids.indexOf(s.cursor) : -1;
      const next = a.ids[i < 0 ? 0 : Math.min(a.ids.length - 1, Math.max(0, i + a.delta))]!;
      if (!a.extend) return next === s.cursor ? s : { ...s, cursor: next };
      return { cursor: next, anchor: s.anchor ?? s.cursor ?? next, selected: union(s.selected, [...(s.cursor ? [s.cursor] : []), next]) };
    }
    case 'focus':
      return s.cursor === a.id ? s : { ...s, cursor: a.id };
    case 'toggle': {
      const id = a.id ?? s.cursor;
      if (!id) return s;
      const on = s.selected.includes(id);
      return { cursor: a.id ? s.cursor ?? id : id, anchor: id, selected: on ? s.selected.filter(x => x !== id) : [...s.selected, id] };
    }
    case 'range': {
      const id = a.id ?? s.cursor;
      if (!id) return s;
      const from = s.anchor ?? s.cursor ?? id;
      const j = a.ids.indexOf(id);
      let i = a.ids.indexOf(from);
      if (j < 0) return s;
      if (i < 0) i = j;
      const range = a.ids.slice(Math.min(i, j), Math.max(i, j) + 1);
      return { cursor: id, anchor: from, selected: union(s.selected, range) };
    }
    case 'clear':
      return s.selected.length || s.anchor ? { ...s, anchor: null, selected: [] } : s;
    case 'sync': {
      const selected = s.selected.filter(x => a.ids.includes(x));
      const cursor = s.cursor && a.ids.includes(s.cursor) ? s.cursor : null;
      const anchor = s.anchor && a.ids.includes(s.anchor) ? s.anchor : null;
      return selected.length === s.selected.length && cursor === s.cursor && anchor === s.anchor ? s : { cursor, anchor, selected };
    }
  }
}

export type KeyCommand = 'next' | 'prev' | 'extendNext' | 'extendPrev' | 'toggle' | 'range' | 'open' | 'escape' | 'panel' | 'options' | 'search' | 'filter';

/** Skrót listy z naciśnięcia klawisza. Poza polami edycji i bez ⌘ / Ctrl / Alt (te należą do przeglądarki i ⌘K). */
export function keyCommand(e: { key: string; shiftKey: boolean; metaKey: boolean; ctrlKey: boolean; altKey: boolean; typing: boolean }): KeyCommand | null {
  if (e.typing || e.metaKey || e.ctrlKey || e.altKey) return null;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === 'j') return e.shiftKey ? 'extendNext' : 'next';
  if (k === 'k') return e.shiftKey ? 'extendPrev' : 'prev';
  if (k === 'x') return e.shiftKey ? 'range' : 'toggle';
  if (e.shiftKey) return null;
  if (k === 'Enter') return 'open';
  if (k === 'Escape') return 'escape';
  if (k === ']') return 'panel';
  if (k === 'v') return 'options';
  if (k === '/') return 'search';
  if (k === 'f') return 'filter';
  return null;
}
