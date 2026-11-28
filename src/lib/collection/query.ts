/* Stan zapytania kolekcji ↔ URL (M0.4, KRA-31). Zapytanie (szukanie, filtry, sortowanie, grupowanie, strona) żyje
   w adresie strony: komponent serwerowy parsuje je i przekazuje do RPC. Nieznane wartości są zastępowane domyślnymi
   (walidacja Zod na wartościach dozwolonych przez konfigurację), a adres pomija wartości domyślne widoku. */
import { z } from 'zod';
import { PAGE_MAX, SEARCH_MAX, type CollectionSpec, type FilterDef, type FilterMode, type Query } from './spec';

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

const control = /[\u0000-\u001f\u007f]/;
const freeValue = z.string().trim().min(1).max(40).refine(v => !control.test(v));
const uuid = z.string().uuid();
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(`${v}T12:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v; });
const modeSchema = z.enum(['any', 'all', 'none']);

function all(params: Params, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const v = params[key];
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
}
const first = (params: Params, key: string) => all(params, key)[0];

const searchKey = (spec: CollectionSpec) => spec.searchKey ?? 'q';
const viewDef = (spec: CollectionSpec, key: string) => spec.views.find(v => v.key === key) ?? spec.views[0]!;
const defaultSort = (spec: CollectionSpec, view: string) => viewDef(spec, view).sort ?? spec.sorts[0]!.value;
const defaultGroup = (spec: CollectionSpec, view: string) => viewDef(spec, view).group ?? spec.groups[0]?.value ?? 'none';

function emptyFilter(f: FilterDef): string[] {
  return f.kind === 'toggle' ? [f.default ? '1' : '0'] : [];
}

/** Zapytanie domyślne widoku (bez szukania i filtrów). */
export function defaultQuery(spec: CollectionSpec, view = spec.views[0]!.key, context: Record<string, string> = {}): Query {
  const v = viewDef(spec, view).key;
  return {
    view: v,
    q: '',
    sort: defaultSort(spec, v),
    group: defaultGroup(spec, v),
    page: 1,
    filters: Object.fromEntries(spec.filters.map(f => [f.key, emptyFilter(f)])),
    modes: Object.fromEntries(spec.filters.filter(f => f.kind === 'multi' && f.modeKey).map(f => [f.key, 'any' as FilterMode])),
    context: { ...context },
  };
}

function parseFilter(f: FilterDef, params: Params): string[] {
  const raw = all(params, f.key);
  if (f.kind === 'toggle') {
    const v = raw[0];
    return v === '1' || v === '0' ? [v] : emptyFilter(f);
  }
  if (f.kind === 'dates') {
    const [from = '', to = '', extra] = (raw[0] ?? '').split('~');
    if (extra !== undefined || (!from && !to)) return [];
    if ((from && !isoDay.safeParse(from).success) || (to && !isoDay.safeParse(to).success)) return [];
    if (from && to && from > to) return [];
    return [from, to];
  }
  const allowed = f.options?.map(o => o.value);
  const out: string[] = [];
  for (const v of raw) {
    const ok = allowed ? (allowed.includes(v) ? v : null) : (freeValue.safeParse(v).success ? v.trim() : null);
    if (ok !== null && !out.some(x => x.toLowerCase() === ok.toLowerCase())) out.push(ok);
    if (out.length >= (f.max ?? 20)) break;
  }
  return out;
}

export function parseQuery(spec: CollectionSpec, params: Params): Query {
  const viewKeys = spec.views.map(v => v.key);
  const view = z.enum(viewKeys as [string, ...string[]]).safeParse(first(params, 'view'));
  const base = defaultQuery(spec, view.success ? view.data : undefined);
  const sort = z.enum(spec.sorts.map(s => s.value) as [string, ...string[]]).safeParse(first(params, 'sort'));
  const groupValues = spec.groups.map(g => g.value);
  const group = groupValues.length ? z.enum(groupValues as [string, ...string[]]).safeParse(first(params, 'group')) : { success: false as const };
  const rawPage = Number.parseInt(first(params, 'page') ?? '', 10);
  const filters: Record<string, string[]> = {}, modes: Record<string, FilterMode> = {};
  for (const f of spec.filters) {
    filters[f.key] = parseFilter(f, params);
    if (f.kind === 'multi' && f.modeKey) {
      const m = modeSchema.safeParse(first(params, f.modeKey));
      modes[f.key] = m.success ? m.data : 'any';
    }
  }
  const context: Record<string, string> = {};
  for (const key of spec.context ?? []) { const v = first(params, key); if (v && uuid.safeParse(v).success) context[key] = v; }
  return {
    view: base.view,
    q: (first(params, searchKey(spec)) ?? '').trim().slice(0, SEARCH_MAX),
    sort: sort.success ? sort.data : base.sort,
    group: group.success ? group.data : base.group,
    page: Number.isFinite(rawPage) ? Math.min(PAGE_MAX, Math.max(1, rawPage)) : 1,
    filters,
    modes,
    context,
  };
}

/** Adres bez wartości domyślnych. Kolejność: stałe, kontekst, widok, szukanie, sortowanie, grupowanie, filtry, strona. */
export function serializeQuery(spec: CollectionSpec, query: Query, { page = true }: { page?: boolean } = {}) {
  const p = new URLSearchParams(spec.fixed ?? {});
  for (const key of spec.context ?? []) if (query.context[key]) p.set(key, query.context[key]!);
  if (query.view !== spec.views[0]!.key) p.set('view', query.view);
  if (query.q) p.set(searchKey(spec), query.q);
  if (query.sort !== defaultSort(spec, query.view)) p.set('sort', query.sort);
  if (spec.groups.length && query.group !== defaultGroup(spec, query.view)) p.set('group', query.group);
  for (const f of spec.filters) {
    const v = query.filters[f.key] ?? emptyFilter(f);
    if (f.kind === 'toggle') { if (v[0] && v[0] !== emptyFilter(f)[0]) p.set(f.key, v[0]); continue; }
    if (f.kind === 'dates') { if (v.length === 2 && (v[0] || v[1])) p.set(f.key, `${v[0]}~${v[1]}`); continue; }
    for (const x of v) p.append(f.key, x);
    if (f.modeKey && v.length && query.modes[f.key] && query.modes[f.key] !== 'any') p.set(f.modeKey, query.modes[f.key]!);
  }
  if (page && query.page > 1) p.set('page', String(query.page));
  return p;
}

export function queryHref(spec: CollectionSpec, query: Query) {
  const s = serializeQuery(spec, query).toString();
  return s ? `${spec.path}?${s}` : spec.path;
}

/** Klucz zapisanego widoku: zapytanie bez strony. */
export const savedQueryKey = (spec: CollectionSpec, query: Query) => serializeQuery(spec, query, { page: false }).toString();

export type QueryPatch = Partial<Omit<Query, 'filters' | 'modes'>> & { filters?: Record<string, string[]>; modes?: Record<string, FilterMode> };

/** Zmiana zapytania. Wszystko poza samą stroną wraca na stronę 1; zmiana widoku bierze jego sortowanie i grupowanie. */
export function patchQuery(spec: CollectionSpec, query: Query, patch: QueryPatch): Query {
  const viewChanged = patch.view !== undefined && patch.view !== query.view;
  const base = viewChanged ? { ...query, view: viewDef(spec, patch.view!).key, sort: defaultSort(spec, patch.view!), group: defaultGroup(spec, patch.view!) } : query;
  const onlyPage = Object.keys(patch).every(k => k === 'page');
  return {
    ...base,
    ...patch,
    view: base.view,
    filters: { ...base.filters, ...patch.filters },
    modes: { ...base.modes, ...patch.modes },
    context: { ...base.context, ...patch.context },
    page: onlyPage ? Math.min(PAGE_MAX, Math.max(1, patch.page ?? base.page)) : 1,
  };
}

/** Zapytanie wbudowanego widoku (z zachowaniem kontekstu). */
export const viewQuery = (spec: CollectionSpec, view: string, context: Record<string, string> = {}) => defaultQuery(spec, view, context);

/** Czy wiersze są zawężone szukaniem lub filtrem (pusty wynik = „brak wyników filtra”, a nie „brak danych”). */
export function isFiltered(spec: CollectionSpec, query: Query) {
  if (query.q) return true;
  return spec.filters.some(f => {
    if (f.kind === 'toggle') return !f.presentation && (query.filters[f.key]?.[0] ?? emptyFilter(f)[0]) !== emptyFilter(f)[0];
    return (query.filters[f.key]?.length ?? 0) > 0;
  });
}

/** Wyczyść szukanie i filtry; widok, sortowanie, grupowanie i kontekst zostają. */
export function clearFilters(spec: CollectionSpec, query: Query): Query {
  const d = defaultQuery(spec, query.view, query.context);
  const filters = { ...d.filters };
  for (const f of spec.filters) if (f.kind === 'toggle' && f.presentation) filters[f.key] = query.filters[f.key] ?? d.filters[f.key]!;
  return { ...query, q: '', filters, modes: d.modes, page: 1 };
}

/** Czy zapytanie (poza stroną) jest domyślne dla swojego widoku — „Przywróć domyślne” wyłączone. */
export function isDefaultQuery(spec: CollectionSpec, query: Query) {
  return savedQueryKey(spec, query) === savedQueryKey(spec, defaultQuery(spec, query.view, query.context));
}

/** Ostatnia strona wyniku (co najmniej 1). */
export const lastPage = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize));
/** Strona poza zakresem (wynik niepusty, a na tej stronie nic): numer ostatniej strony do przekierowania, inaczej null. */
export function clampPage({ total, count, page }: { total: number; count: number; page: number }, pageSize: number) {
  return total > 0 && count === 0 && page > 1 ? lastPage(total, pageSize) : null;
}
