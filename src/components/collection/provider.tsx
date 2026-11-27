'use client';
/* Silnik widoku kolekcji (M0.4, KRA-31) — stan wspólny dla paska, tabeli i stopki jednej listy.
   - Zapytanie (szukanie, filtry, sortowanie, grupowanie, strona):
       mode="url"   — w adresie; zmiana = nawigacja (komponent serwerowy woła RPC z filtrami i sortowaniem w SQL);
       mode="local" — w stanie i w preferencjach `view.<id>.query` (Zadania: filtrowanie wczytanych wierszy w JS).
   - Prezentacja (widoczne kolumny, zwinięte grupy) i zapisane widoki — w preferencjach konta (`view.<id>`, `views.<id>`).
     W trybie url kolumny rysuje serwer, więc po zmianie kolumn strona się odświeża.
   - Klawiatura (poza polami edycji i oknami): J / K kursor, Shift+J / K rozszerza zaznaczenie, X / Shift+X zaznaczenie,
     ↵ otwiera wiersz, Esc czyści zaznaczenie, a bez zaznaczenia zamyka panel, ] panel, V Opcje widoku, / szukanie, F filtr. */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { defaultQuery, isDefaultQuery, parseQuery, patchQuery, queryHref, savedQueryKey, type QueryPatch } from '@/lib/collection/query';
import { activeSavedView, chosenColumns, removeSavedView, SAVED_VIEWS_FULL_MESSAGE, savedViewsFull, upsertSavedView, type CollectionPrefs, type SavedView } from '@/lib/collection/views';
import { initialSelection, keyCommand, selectionReducer, type Selection, type SelectionAction } from '@/lib/collection/selection';
import { savePreference } from '@/lib/collection/preferences';
import type { CollectionSpec, Query } from '@/lib/collection/spec';

type RowHandlers = { ids: string[]; open?: (id: string) => void };
/** Obsługa klawiszy zależna od ekranu (panel, kursor, F). */
export type KeyHandlers = { onEscape?: () => void; onPanel?: () => void; onCursor?: (id: string) => void; onFilterKey?: () => void; /** Trwa zapis — klawisze wierszy (J / K / X / ↵) nie działają. */ locked?: boolean };

export type CollectionState = {
  spec: CollectionSpec;
  mode: 'url' | 'local';
  query: Query;
  /** Widoczne kolumny ukrywalne. */
  columns: string[];
  collapsed: string[];
  saved: SavedView[];
  /** Nazwa zapisanego widoku zgodnego z bieżącym zapytaniem i kolumnami. */
  activeView: string | null;
  isDefault: boolean;
  pending: boolean;
  error: string;
  href: (patch: QueryPatch) => string;
  setQuery: (patch: QueryPatch) => void;
  replaceQuery: (q: Query) => void;
  setColumns: (columns: string[]) => void;
  toggleGroup: (key: string) => void;
  saveView: (name: string) => Promise<boolean>;
  removeView: (name: string) => void;
  applyView: (view: SavedView) => void;
  reset: () => void;
  selection: Selection;
  dispatch: (a: SelectionAction) => void;
  optionsOpen: boolean;
  setOptionsOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  /** Otwarty filtr (klucz) — F otwiera pierwszy. */
  filterOpen: string | null;
  setFilterOpen: (key: string | null) => void;
  /** Rejestracja wierszy przez tabelę (kolejność do J / K, otwieranie ↵). */
  registerRows: (h: RowHandlers) => void;
  searchId: string;
  hasPanel: boolean;
  /** Komponent wewnątrz listy podpina obsługę Esc / ] / kursora / F (gdy provider stoi wyżej niż stan ekranu). */
  bindKeys: (h: KeyHandlers) => void;
};

const Ctx = createContext<CollectionState | null>(null);

export function useCollection() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCollection poza <CollectionProvider>');
  return c;
}
/** Wersja bez wyjątku — dla komponentów, które mogą stać poza listą. */
export const useOptionalCollection = () => useContext(Ctx);

const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
const interactive = (el: EventTarget | null) => el instanceof HTMLElement && !!el.closest('a[href],button,summary,[role="button"],[role="checkbox"]');
const modalOpen = () => !!document.querySelector('dialog[open],[aria-modal="true"]');

type ProviderProps = KeyHandlers & {
  spec: CollectionSpec;
  prefs: CollectionPrefs;
  children: ReactNode;
  /** Tryb url: zapytanie z serwera (parseQuery na searchParams). */
  query?: Query;
  mode?: 'url' | 'local';
  /** Domyślnie zwinięte grupy, gdy konto ich jeszcze nie zapisało (Zadania: Gotowe, Anulowane). */
  defaultCollapsed?: string[];
};

/* Esc bez zaznaczenia (np. zamknij panel), ] (przełącz panel), ruch kursora J / K (panel podąża za kursorem), F (gdy ekran
   nie ma paska filtrów — np. Zadania pokazują szukanie) — z atrybutów albo z bindKeys(). */
export function CollectionProvider({ spec, prefs, children, query: serverQuery, mode = 'url', defaultCollapsed = [], onEscape, onPanel, onCursor, onFilterKey }: ProviderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialLocal = useMemo(() => (mode === 'local' ? parseQuery(spec, new URLSearchParams(prefs.presentation.query ?? '')) : null), [mode, spec, prefs.presentation.query]);
  const [localQuery, setLocalQuery] = useState<Query>(initialLocal ?? defaultQuery(spec));
  const query = mode === 'url' ? serverQuery ?? defaultQuery(spec) : localQuery;
  const [columns, setColumnsState] = useState<string[]>(() => chosenColumns(spec, prefs.presentation.columns));
  const [collapsed, setCollapsed] = useState<string[]>(prefs.presentation.collapsed ?? defaultCollapsed);
  const [saved, setSaved] = useState<SavedView[]>(prefs.saved);
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const [error, setError] = useState('');
  const rows = useRef<RowHandlers>({ ids: [] });
  const props = useRef<KeyHandlers>({});
  const bound = useRef<KeyHandlers>({});
  useEffect(() => { props.current = { onEscape, onPanel, onCursor, onFilterKey }; });
  const bindKeys = useCallback((h: KeyHandlers) => { bound.current = h; }, []);

  // Kolumny i grupy z serwera po odświeżeniu (np. zastosowanie zapisanego widoku).
  const serverColumns = prefs.presentation.columns?.join('\u0000');
  useEffect(() => { if (mode === 'url') setColumnsState(chosenColumns(spec, prefs.presentation.columns)); }, [mode, spec, serverColumns]); // eslint-disable-line react-hooks/exhaustive-deps

  const presentation = useCallback((next: { columns?: string[]; collapsed?: string[]; query?: Query }) => {
    const value = { columns: next.columns ?? columns, collapsed: next.collapsed ?? collapsed, ...(mode === 'local' ? { query: savedQueryKey(spec, next.query ?? localQuery) } : {}) };
    return savePreference(`view.${spec.id}`, value);
  }, [columns, collapsed, mode, spec, localQuery]);

  // Ten sam adres (np. „Przywróć domyślne” zmienia tylko kolumny) — odświeżenie zamiast nawigacji.
  const navigate = useCallback((href: string) => startTransition(() => {
    if (href === `${window.location.pathname}${window.location.search}`) router.refresh();
    else router.push(href, { scroll: false });
  }), [router]);

  const go = useCallback((q: Query) => {
    setError('');
    if (mode === 'local') { setLocalQuery(q); void presentation({ query: q }); return; }
    navigate(queryHref(spec, q));
  }, [mode, presentation, navigate, spec]);

  const setQuery = useCallback((patch: QueryPatch) => go(patchQuery(spec, query, patch)), [go, spec, query]);
  const href = useCallback((patch: QueryPatch) => queryHref(spec, patchQuery(spec, query, patch)), [spec, query]);

  const setColumns = useCallback((next: string[]) => {
    const previous = columns;
    setColumnsState(next);
    void presentation({ columns: next }).then(ok => {
      // Zapis się nie udał — kapsułki wracają do stanu sprzed kliknięcia.
      if (!ok) { setColumnsState(previous); setError('Nie udało się zapisać kolumn. Spróbuj ponownie.'); return; }
      if (mode === 'url') startTransition(() => router.refresh());
    });
  }, [mode, presentation, router, columns]);

  const toggleGroup = useCallback((key: string) => {
    const next = collapsed.includes(key) ? collapsed.filter(k => k !== key) : [...collapsed, key];
    setCollapsed(next);
    void presentation({ collapsed: next });
  }, [collapsed, presentation]);

  const queryKey = savedQueryKey(spec, query);
  const saveView = useCallback(async (name: string) => {
    if (savedViewsFull(saved, name)) { setError(SAVED_VIEWS_FULL_MESSAGE); return false; }
    const next = upsertSavedView(saved, { name, query: queryKey, columns });
    if (next === saved) return false;
    const ok = await savePreference(`views.${spec.id}`, next);
    if (!ok) { setError('Nie udało się zapisać widoku. Spróbuj krótszej nazwy albo usuń stary widok.'); return false; }
    setSaved(next); setError('');
    return true;
  }, [saved, queryKey, columns, spec.id]);

  const removeView = useCallback((name: string) => {
    const next = removeSavedView(saved, name);
    setSaved(next);
    void savePreference(`views.${spec.id}`, next).then(ok => { if (!ok) setError('Nie udało się usunąć widoku.'); });
  }, [saved, spec.id]);

  const applyView = useCallback((view: SavedView) => {
    const q = parseQuery(spec, new URLSearchParams(view.query));
    const cols = view.columns ? chosenColumns(spec, view.columns) : columns;
    setColumnsState(cols);
    if (mode === 'local') { setLocalQuery(q); void presentation({ query: q, columns: cols }); return; }
    void presentation({ columns: cols }).then(() => navigate(queryHref(spec, q)));
  }, [spec, columns, mode, presentation, navigate]);

  const reset = useCallback(() => {
    const cols = chosenColumns(spec, null);
    const q = defaultQuery(spec, query.view, query.context);
    setColumnsState(cols);
    if (mode === 'local') { const d = defaultQuery(spec); setLocalQuery(d); void presentation({ query: d, columns: cols }); return; }
    void presentation({ columns: cols }).then(() => navigate(queryHref(spec, q)));
  }, [spec, query, mode, presentation, navigate]);

  const replaceQuery = useCallback((q: Query) => go(q), [go]);
  const registerRows = useCallback((h: RowHandlers) => { rows.current = h; }, []);

  // Zaznaczenie znika razem z wierszami (zmiana strony, filtra).
  const selectionRef = useRef(selection);
  useEffect(() => { selectionRef.current = selection; });

  useEffect(() => {
    function focusRow(id: string) {
      const el = document.querySelector<HTMLElement>(`[data-collection="${spec.id}"] [data-row-id="${CSS.escape(id)}"]`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'nearest' });
    }
    const h = (): KeyHandlers => ({ ...props.current, ...bound.current });
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.defaultPrevented || modalOpen()) return;
      const cmd = keyCommand({ key: e.key, shiftKey: e.shiftKey, metaKey: e.metaKey, ctrlKey: e.ctrlKey, altKey: e.altKey, typing: typing(e.target) });
      if (!cmd) return;
      // W warstwie pływającej (menu, filtr, Opcje widoku) klawisze należą do niej; V zamyka Opcje widoku.
      if (cmd !== 'options' && (e.target as HTMLElement | null)?.closest?.('[data-popover]')) return;
      if (h().locked && ['next', 'prev', 'extendNext', 'extendPrev', 'toggle', 'range', 'open'].includes(cmd)) return;
      const s = selectionRef.current, ids = rows.current.ids;
      const move = (delta: number, extend = false) => {
        if (!ids.length) return;
        e.preventDefault();
        const i = s.cursor ? ids.indexOf(s.cursor) : -1;
        const id = ids[i < 0 ? 0 : Math.min(ids.length - 1, Math.max(0, i + delta))]!;
        dispatch({ type: 'move', ids, delta, extend });
        // kolejne naciśnięcie przed przerysowaniem liczy od nowego kursora
        selectionRef.current = selectionReducer(s, { type: 'move', ids, delta, extend });
        focusRow(id);
        h().onCursor?.(id);
      };
      switch (cmd) {
        case 'next': return move(1);
        case 'prev': return move(-1);
        case 'extendNext': return spec.selectable ? move(1, true) : undefined;
        case 'extendPrev': return spec.selectable ? move(-1, true) : undefined;
        case 'toggle': if (spec.selectable && s.cursor) { e.preventDefault(); dispatch({ type: 'toggle' }); } return;
        case 'range': if (spec.selectable && s.cursor) { e.preventDefault(); dispatch({ type: 'range', ids }); } return;
        case 'open': {
          // ↵ na linku lub przycisku działa sam; na wierszu (kursor J / K) otwiera pierwszy link wiersza.
          if (interactive(e.target) || !s.cursor) return;
          const row = (e.target as HTMLElement).closest?.('[data-row-id]');
          if (!row) return;
          e.preventDefault();
          if (rows.current.open) rows.current.open(s.cursor);
          else row.querySelector<HTMLElement>('a[href]')?.click();
          return;
        }
        case 'escape':
          if (s.selected.length) { e.preventDefault(); dispatch({ type: 'clear' }); return; }
          { const f = h().onEscape; if (f) { e.preventDefault(); f(); } }
          return;
        case 'panel': { const f = h().onPanel; if (f) { e.preventDefault(); f(); } return; }
        case 'options': e.preventDefault(); setOptionsOpen(v => !v); return;
        case 'search': { const el = document.getElementById(`${spec.id}-search`); if (el) { e.preventDefault(); el.focus(); } return; }
        case 'filter':
          { const f = h().onFilterKey; if (f) { e.preventDefault(); f(); return; } }
          if (spec.filters.some(f => f.kind !== 'toggle')) { e.preventDefault(); setFilterOpen(spec.filters.find(f => f.kind !== 'toggle')!.key); }
          return;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spec]);

  const value: CollectionState = {
    spec, mode, query, columns, collapsed, saved, pending, error,
    activeView: activeSavedView(saved, queryKey, columns),
    isDefault: isDefaultQuery(spec, query) && columns.join() === chosenColumns(spec, null).join(),
    href, setQuery, replaceQuery, setColumns, toggleGroup, saveView, removeView, applyView, reset,
    selection, dispatch, optionsOpen, setOptionsOpen, filterOpen, setFilterOpen, registerRows,
    searchId: `${spec.id}-search`, hasPanel: !!onPanel, bindKeys,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
