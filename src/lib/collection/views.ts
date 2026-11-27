/* Zapisane widoki i prezentacja kolekcji (M0.4, KRA-31) — w preferencjach konta (RPC my_preferences / set_my_preference):
   - `views.<id>`: zapisane widoki { name, query, columns? } — query to adres zapytania bez strony (savedQueryKey);
     zastosowanie widoku = nawigacja na `path?query` + zapis jego kolumn;
   - `view.<id>`: prezentacja { columns, collapsed, query? } — widoczne kolumny, zwinięte grupy; `query` tylko dla
     kolekcji z zapytaniem po stronie klienta (Zadania).
   Stary format Zadań sprzed M0.4 (`view.tasks` = { group, sort, showDone, showEmpty, columns, filters },
   `views.tasks` = [{ name, state }]) jest przepisywany przy odczycie. */
import { z } from 'zod';
import { columnLayout, type ColumnSpec } from '@/lib/table/columns';
import { defaultQuery, savedQueryKey } from './query';
import type { CollectionSpec, ColumnDef, Query } from './spec';

export const SAVED_VIEWS_MAX = 12;
export const VIEW_NAME_MAX = 40;

const key = z.string().min(1).max(40);
export const savedViewSchema = z.object({ name: z.string().trim().min(1).max(VIEW_NAME_MAX), query: z.string().max(1000), columns: z.array(key).max(30).optional() }).strict();
export type SavedView = z.infer<typeof savedViewSchema>;
export const presentationSchema = z.object({ columns: z.array(key).max(30).nullable().optional(), collapsed: z.array(z.string().max(80)).max(50).nullable().optional(), query: z.string().max(1000).nullable().optional() }).strict();
export type Presentation = { columns: string[] | null; collapsed: string[] | null; query: string | null };

const legacyStateSchema = z.object({ group: z.string(), sort: z.string(), showDone: z.boolean(), showEmpty: z.boolean(), columns: z.array(z.string()), filters: z.record(z.string(), z.array(z.string())) });
type LegacyState = z.infer<typeof legacyStateSchema>;

/** Stary stan Zadań → klucz zapytania (showDone → filtr `done`, showEmpty → przełącznik `empty`). */
function legacyQuery(spec: CollectionSpec, s: LegacyState) {
  const d = defaultQuery(spec);
  const has = (k: string) => spec.filters.some(f => f.key === k);
  const filters: Query['filters'] = { ...d.filters };
  for (const f of spec.filters) if (f.kind === 'multi' && Array.isArray(s.filters[f.key])) filters[f.key] = s.filters[f.key]!.filter(v => !f.options || f.options.some(o => o.value === v));
  if (has('done')) filters.done = [s.showDone ? '1' : '0'];
  if (has('empty')) filters.empty = [s.showEmpty ? '1' : '0'];
  const sort = spec.sorts.some(x => x.value === s.sort) ? s.sort : d.sort;
  const group = spec.groups.some(x => x.value === s.group) ? s.group : d.group;
  return savedQueryKey(spec, { ...d, sort, group, filters });
}

export function readSavedViews(spec: CollectionSpec, raw: unknown): SavedView[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedView[] = [];
  for (const item of raw) {
    const v = savedViewSchema.safeParse(item);
    if (v.success) { out.push(v.data); continue; }
    const legacy = z.object({ name: z.string().trim().min(1).max(VIEW_NAME_MAX), state: legacyStateSchema }).safeParse(item);
    if (legacy.success) out.push({ name: legacy.data.name, query: legacyQuery(spec, legacy.data.state), columns: legacy.data.state.columns });
  }
  return out.slice(0, SAVED_VIEWS_MAX);
}

export function readPresentation(spec: CollectionSpec, raw: unknown): Presentation {
  const p = presentationSchema.safeParse(raw);
  if (p.success) return { columns: p.data.columns ?? null, collapsed: p.data.collapsed ?? null, query: p.data.query ?? null };
  const legacy = legacyStateSchema.safeParse(raw);
  if (legacy.success) return { columns: legacy.data.columns, collapsed: null, query: legacyQuery(spec, legacy.data) };
  return { columns: null, collapsed: null, query: null };
}

export function upsertSavedView(list: SavedView[], view: SavedView): SavedView[] {
  const name = view.name.trim().slice(0, VIEW_NAME_MAX);
  if (!name) return list;
  const next: SavedView = { name, query: view.query, ...(view.columns ? { columns: view.columns } : {}) };
  return [...list.filter(v => v.name !== name), next].slice(-SAVED_VIEWS_MAX);
}

export const removeSavedView = (list: SavedView[], name: string) => list.filter(v => v.name !== name);

const sameColumns = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x));

/** Nazwa zapisanego widoku zgodnego z bieżącym zapytaniem i kolumnami (widok bez kolumn pasuje do każdych). */
export function activeSavedView(list: SavedView[], queryKey: string, columns: string[]) {
  return list.find(v => v.query === queryKey && (!v.columns || sameColumns(v.columns, columns)))?.name ?? null;
}

/** Widoczne kolumny w kolejności konfiguracji: nieukrywalne zawsze, ukrywalne — z wyboru (null = domyślne). */
export function visibleColumns(spec: CollectionSpec, chosen: string[] | null): ColumnDef[] {
  return spec.columns.filter(c => !c.hideable || (chosen ? chosen.includes(c.key) : !c.hidden));
}

/** Klucze widocznych kolumn ukrywalnych (do zapisu w preferencjach). */
export const chosenColumns = (spec: CollectionSpec, chosen: string[] | null) => visibleColumns(spec, chosen).filter(c => c.hideable).map(c => c.key);

export const SELECT_COLUMN: ColumnSpec = { key: 'select', width: 16 };

/** Układ tabeli kolekcji: kolumna zaznaczenia (jeśli kolekcja ją ma) + widoczne kolumny. */
export function collectionLayout(spec: CollectionSpec, chosen: string[] | null) {
  const cols = visibleColumns(spec, chosen).map(c => (c.fr === undefined ? { key: c.key, width: c.width } : { key: c.key, fr: c.fr, main: c.main, min: c.min }) as ColumnSpec);
  return columnLayout(spec.selectable ? [SELECT_COLUMN, ...cols] : cols);
}
