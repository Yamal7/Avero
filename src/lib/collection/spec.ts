/* Konfiguracja kolekcji (M0.4, KRA-31) — deklaratywna i serializowalna (przechodzi z komponentu serwerowego do klienta):
   widoki wbudowane, sortowania, grupowania, filtry, kolumny i rozmiar strony. Bez Reacta i bez funkcji —
   ikony, treść komórek i etykiety grup podaje ekran. */
import type { ColumnSpec } from '@/lib/table/columns';

export type Choice = { value: string; label: string; title?: string };

export type FilterDef =
  /** Wybór wielokrotny: `?key=a&key=b`. Bez `options` — wartości dowolne (np. kategorie firm), 1–40 znaków.
      `modeKey` — parametr warunku any | all | none (np. `mode`). */
  | { key: string; label: string; kind: 'multi'; options?: Choice[]; modeKey?: string; max?: number }
  /** Tak / nie: `?key=1|0`. `presentation` — przełącznik wyglądu (np. puste grupy), nie liczy się jako filtr. */
  | { key: string; label: string; kind: 'toggle'; default: boolean; presentation?: boolean }
  /** Zakres dat: `?key=RRRR-MM-DD~RRRR-MM-DD` (jedna strona może być pusta). */
  | { key: string; label: string; kind: 'dates' };

export type ViewDef = {
  key: string;
  label: string;
  title?: string;
  /** Domyślne sortowanie i grupowanie tego widoku (np. „Bez kontaktu 30 dni” sortuje wg ostatniego kontaktu). */
  sort?: string;
  group?: string;
  /** Widok z własnym ekranem (np. macierz „W samochodach”) — tylko kapsułka, bez listy z silnika. */
  custom?: boolean;
};

export type ColumnDef = ColumnSpec & {
  label: string;
  /** Kolumnę można ukryć w Opcjach widoku. */
  hideable?: boolean;
  /** Ukryta domyślnie (do włączenia w Opcjach widoku). */
  hidden?: boolean;
};

export type CollectionSpec = {
  /** Klucz kolekcji — preferencje `view.<id>` i `views.<id>`. */
  id: string;
  /** Nazwa dla czytników i komunikatów („Firmy”). */
  label: string;
  path: string;
  /** Parametry stałe kolekcji (np. kind=company), zawsze w adresie. */
  fixed?: Record<string, string>;
  /** Parametry kontekstu przechodzące przez wszystkie zmiany (np. installation); wartości to UUID. */
  context?: string[];
  /** Nazwa parametru szukania (domyślnie `q`). */
  searchKey?: string;
  searchLabel: string;
  views: ViewDef[];
  sorts: Choice[];
  groups: Choice[];
  filters: FilterDef[];
  columns: ColumnDef[];
  pageSize: number;
  /** Kolumna zaznaczenia (X, Shift+X, pasek zaznaczonych). */
  selectable?: boolean;
};

export type FilterMode = 'any' | 'all' | 'none';

/** Zapytanie kolekcji: wszystko, co decyduje o wierszach (filtrowanie, sortowanie, grupowanie, strona). */
export type Query = {
  view: string;
  q: string;
  sort: string;
  group: string;
  page: number;
  filters: Record<string, string[]>;
  modes: Record<string, FilterMode>;
  context: Record<string, string>;
};

export const SEARCH_MAX = 200;
export const PAGE_MAX = 100000;
