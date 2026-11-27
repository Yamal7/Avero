/* M0.4 Silnik widoku kolekcji (KRA-31): stan zapytania ↔ URL, zapisane widoki i migracja starego formatu,
   zaznaczanie i klawiatura, spójność konfiguracji kolekcji z parametrami RPC. */
import { describe, expect, it } from 'vitest';
import { customerDirectoryGroups, customerDirectorySorts, maintenanceQuerySchema, peopleDirectorySorts, stockListGroups, stockListSorts, stockListViews } from '@hvac/api-client';
import { clampPage, clearFilters, defaultQuery, isDefaultQuery, lastPage, isFiltered, parseQuery, patchQuery, queryHref, savedQueryKey, serializeQuery, viewQuery } from '@/lib/collection/query';
import { activeSavedView, collectionLayout, readPresentation, readSavedViews, removeSavedView, savedViewsFull, upsertSavedView, visibleColumns } from '@/lib/collection/views';
import { initialSelection, keyCommand, selectionReducer, visibleRowIds, type Selection } from '@/lib/collection/selection';
import { companiesSpec, maintenanceSpec, peopleSpec, stockSpec, tasksSpec } from '@/lib/collection/specs';
import type { CollectionSpec } from '@/lib/collection/spec';

const sp = (s: string) => new URLSearchParams(s);

describe('stan zapytania ↔ URL', () => {
  it('domyślne wartości z pierwszego widoku i bez parametrów w adresie', () => {
    const q = parseQuery(companiesSpec, sp(''));
    expect(q).toMatchObject({ view: 'all', q: '', sort: 'name', group: 'none', page: 1, filters: { cat: [] }, modes: { cat: 'any' } });
    expect(queryHref(companiesSpec, q)).toBe('/dashboard/customers?kind=company');
  });

  it('round-trip: parse(serialize(q)) === q', () => {
    const q = parseQuery(companiesSpec, sp('kind=company&view=no_contact_30&q=Rumia&sort=devices&group=city&cat=VIP&cat=Chłodnictwo&mode=none&page=3'));
    expect(q).toMatchObject({ view: 'no_contact_30', q: 'Rumia', sort: 'devices', group: 'city', page: 3, filters: { cat: ['VIP', 'Chłodnictwo'] }, modes: { cat: 'none' } });
    expect(parseQuery(companiesSpec, serializeQuery(companiesSpec, q))).toEqual(q);
    const s = parseQuery(stockSpec, sp('view=below&cat=parts&cat=refrigerant&sort=available&group=none'));
    expect(parseQuery(stockSpec, serializeQuery(stockSpec, s))).toEqual(s);
    const t = parseQuery(tasksSpec, sp('group=label&sort=due&priority=urgent&label=fgas&done=0&empty=1'));
    expect(t).toMatchObject({ group: 'label', sort: 'due', filters: { priority: ['urgent'], label: ['fgas'], done: ['0'], empty: ['1'] } });
    expect(parseQuery(tasksSpec, serializeQuery(tasksSpec, t))).toEqual(t);
  });

  it('pomija wartości domyślne widoku (sortowanie widoku „Bez kontaktu 30 dni”)', () => {
    const q = viewQuery(companiesSpec, 'no_contact_30');
    expect(q.sort).toBe('last_contact');
    expect(serializeQuery(companiesSpec, q).toString()).toBe('kind=company&view=no_contact_30');
    expect(parseQuery(companiesSpec, sp('kind=company&view=no_contact_30')).sort).toBe('last_contact');
    expect(serializeQuery(companiesSpec, { ...q, sort: 'name' }).get('sort')).toBe('name');
  });

  it('odrzuca nieznane wartości (zastępuje domyślnymi) i ogranicza długości', () => {
    const q = parseQuery(companiesSpec, sp(`view=hack&sort=drop&group=owner&mode=some&page=-4&q=${'a'.repeat(300)}&cat=${encodeURIComponent('\u0000x')}&cat=${'b'.repeat(41)}&cat=OK`));
    expect(q).toMatchObject({ view: 'all', sort: 'name', group: 'none', page: 1, filters: { cat: ['OK'] }, modes: { cat: 'any' } });
    expect(q.q.length).toBe(200);
    expect(parseQuery(companiesSpec, sp('page=abc')).page).toBe(1);
    expect(parseQuery(companiesSpec, sp('page=999999999')).page).toBe(100000);
    expect(parseQuery(stockSpec, sp('cat=gas&cat=parts')).filters.cat).toEqual(['parts']);
    expect(parseQuery(stockSpec, sp('sort=price')).sort).toBe('code');
    expect(parseQuery(maintenanceSpec, sp('installation=nie-uuid')).context).toEqual({});
    expect(parseQuery(maintenanceSpec, sp('installation=e4500000-0000-4000-8000-000000000001')).context).toEqual({ installation: 'e4500000-0000-4000-8000-000000000001' });
    // wartości z wielu filtrów: bez powtórzeń, z limitem
    expect(parseQuery(companiesSpec, sp(Array.from({ length: 30 }, (_, i) => `cat=k${i}`).join('&') + '&cat=k1')).filters.cat).toHaveLength(20);
  });

  it('parsuje obiekt searchParams z Next.js (napis albo lista)', () => {
    const q = parseQuery(companiesSpec, { cat: ['A', 'B'], q: '  Gdynia  ', sort: ['devices', 'name'] });
    expect(q).toMatchObject({ q: 'Gdynia', sort: 'devices', filters: { cat: ['A', 'B'] } });
  });

  it('zmiana zapytania wraca na pierwszą stronę; zmiana widoku bierze jego ustawienia', () => {
    const q = parseQuery(companiesSpec, sp('page=4&sort=devices'));
    expect(patchQuery(companiesSpec, q, { group: 'city' })).toMatchObject({ page: 1, group: 'city', sort: 'devices' });
    expect(patchQuery(companiesSpec, q, { page: 5 }).page).toBe(5);
    expect(patchQuery(companiesSpec, q, { view: 'no_contact_30' })).toMatchObject({ view: 'no_contact_30', sort: 'last_contact', page: 1 });
    expect(patchQuery(companiesSpec, q, { filters: { cat: ['VIP'] } }).filters.cat).toEqual(['VIP']);
  });

  it('kontekst (np. instalacja) zostaje przy zmianach i przy czyszczeniu filtrów', () => {
    const q = parseQuery(maintenanceSpec, sp('installation=e4500000-0000-4000-8000-000000000001&view=all&search=Rumia&sort=title'));
    expect(q.q).toBe('Rumia');
    const href = queryHref(maintenanceSpec, patchQuery(maintenanceSpec, q, { sort: 'customer' }));
    expect(href).toBe('/dashboard/maintenance?installation=e4500000-0000-4000-8000-000000000001&view=all&search=Rumia&sort=customer');
    expect(clearFilters(maintenanceSpec, q)).toMatchObject({ q: '', view: 'all', sort: 'title', context: { installation: 'e4500000-0000-4000-8000-000000000001' } });
  });

  it('rozróżnia „brak danych” od „brak wyników filtra”', () => {
    expect(isFiltered(companiesSpec, parseQuery(companiesSpec, sp('view=archived')))).toBe(false);
    expect(isFiltered(companiesSpec, parseQuery(companiesSpec, sp('q=x')))).toBe(true);
    expect(isFiltered(companiesSpec, parseQuery(companiesSpec, sp('cat=VIP')))).toBe(true);
    expect(isFiltered(stockSpec, parseQuery(stockSpec, sp('sort=name')))).toBe(false);
    expect(isFiltered(tasksSpec, parseQuery(tasksSpec, sp('done=0')))).toBe(true);
    expect(isFiltered(tasksSpec, parseQuery(tasksSpec, sp('empty=1')))).toBe(false);
    const cleared = clearFilters(companiesSpec, parseQuery(companiesSpec, sp('view=no_contact_30&q=x&cat=VIP&mode=all&sort=devices&page=2')));
    expect(cleared).toMatchObject({ view: 'no_contact_30', q: '', filters: { cat: [] }, modes: { cat: 'any' }, sort: 'devices', page: 1 });
  });

  it('strona poza zakresem wraca na ostatnią', () => {
    expect(lastPage(0, 25)).toBe(1);
    expect(lastPage(51, 25)).toBe(3);
    expect(clampPage({ total: 51, count: 0, page: 9 }, 25)).toBe(3);
    expect(clampPage({ total: 51, count: 1, page: 3 }, 25)).toBeNull();
    expect(clampPage({ total: 0, count: 0, page: 4 }, 25)).toBeNull();
    expect(clampPage({ total: 10, count: 0, page: 1 }, 25)).toBeNull();
  });

  it('domyślne ustawienia widoku', () => {
    expect(isDefaultQuery(companiesSpec, parseQuery(companiesSpec, sp('view=no_contact_30')))).toBe(true);
    expect(isDefaultQuery(companiesSpec, parseQuery(companiesSpec, sp('group=city')))).toBe(false);
    expect(isDefaultQuery(companiesSpec, parseQuery(companiesSpec, sp('page=3')))).toBe(true);
  });

  it('filtr zakresu dat (dla kolejnych modułów)', () => {
    const spec: CollectionSpec = { ...stockSpec, id: 'x', filters: [{ key: 'due', label: 'Termin', kind: 'dates' }] };
    const q = parseQuery(spec, sp('due=2026-12-01~2027-01-31'));
    expect(q.filters.due).toEqual(['2026-12-01', '2027-01-31']);
    expect(serializeQuery(spec, q).get('due')).toBe('2026-12-01~2027-01-31');
    expect(parseQuery(spec, sp('due=~2027-01-31')).filters.due).toEqual(['', '2027-01-31']);
    expect(parseQuery(spec, sp('due=jutro~2027-02-30')).filters.due).toEqual([]);
    expect(parseQuery(spec, sp('due=2027-02-01~2027-01-01')).filters.due).toEqual([]);
  });
});

describe('zapisane widoki i prezentacja', () => {
  it('zapis: nazwa przycięta, ten sam tytuł nadpisuje, najwyżej 12 (13. nowy widok odrzucony, nie ucina najstarszego)', () => {
    let list = upsertSavedView([], { name: '  Rumia VIP  ', query: 'kind=company&cat=VIP', columns: ['categories'] });
    expect(list).toEqual([{ name: 'Rumia VIP', query: 'kind=company&cat=VIP', columns: ['categories'] }]);
    list = upsertSavedView(list, { name: 'Rumia VIP', query: 'kind=company&cat=VIP&group=city' });
    expect(list).toHaveLength(1);
    expect(list[0]!.query).toContain('group=city');
    for (let i = 0; i < 11; i++) list = upsertSavedView(list, { name: `Widok ${i}`, query: `q=${i}` });
    expect(list).toHaveLength(12);
    expect(savedViewsFull(list, 'Nowy')).toBe(true);
    expect(savedViewsFull(list, 'Rumia VIP')).toBe(false);
    expect(upsertSavedView(list, { name: 'Nowy', query: 'q=x' })).toBe(list);
    expect(list[0]!.name).toBe('Rumia VIP');
    expect(upsertSavedView(list, { name: 'Widok 3', query: 'q=nowe' }).find(v => v.name === 'Widok 3')!.query).toBe('q=nowe');
    expect(list.at(-1)!.name).toBe('Widok 10');
    expect(upsertSavedView(list, { name: '   ', query: '' })).toBe(list);
    expect(upsertSavedView([], { name: 'x'.repeat(60), query: '' })[0]!.name).toHaveLength(40);
    expect(removeSavedView(list, 'Widok 10').some(v => v.name === 'Widok 10')).toBe(false);
    expect(savedViewsFull(removeSavedView(list, 'Widok 10'), 'Nowy')).toBe(false);
  });

  it('zastosowanie: aktywny widok to ten sam klucz zapytania i te same kolumny', () => {
    const q = parseQuery(companiesSpec, sp('kind=company&cat=VIP&group=city&page=3'));
    const key = savedQueryKey(companiesSpec, q);
    expect(key).toBe('kind=company&group=city&cat=VIP');
    const list = [{ name: 'VIP wg miast', query: key, columns: ['categories', 'city'] }];
    expect(activeSavedView(list, key, ['categories', 'city'])).toBe('VIP wg miast');
    expect(activeSavedView(list, key, ['categories'])).toBeNull();
    expect(activeSavedView([{ name: 'Bez kolumn', query: key }], key, ['x'])).toBe('Bez kolumn');
    expect(parseQuery(companiesSpec, sp(list[0]!.query))).toMatchObject({ group: 'city', filters: { cat: ['VIP'] }, page: 1 });
  });

  it('odczyt odrzuca uszkodzone wpisy', () => {
    expect(readSavedViews(tasksSpec, 'zły')).toEqual([]);
    expect(readSavedViews(tasksSpec, [{ name: 'A', query: 'sort=due' }, { name: 3 }, null, { name: 'B', query: 'x'.repeat(2000) }])).toEqual([{ name: 'A', query: 'sort=due' }]);
  });

  it('migracja starego formatu Zadań (view.tasks / views.tasks sprzed M0.4)', () => {
    const legacy = { group: 'label', sort: 'due', showDone: false, showEmpty: true, columns: ['priority', 'due'], filters: { priority: ['urgent', 'high'], label: [] } };
    const p = readPresentation(tasksSpec, legacy);
    expect(p.columns).toEqual(['priority', 'due']);
    expect(parseQuery(tasksSpec, sp(p.query ?? ''))).toMatchObject({ group: 'label', sort: 'due', filters: { priority: ['urgent', 'high'], label: [], done: ['0'], empty: ['1'] } });
    const views = readSavedViews(tasksSpec, [{ name: 'Pilne', state: legacy }, { name: 'Zły', state: { group: 1 } }]);
    expect(views).toHaveLength(1);
    expect(views[0]).toMatchObject({ name: 'Pilne', columns: ['priority', 'due'] });
    expect(parseQuery(tasksSpec, sp(views[0]!.query)).filters.priority).toEqual(['urgent', 'high']);
    expect(readPresentation(tasksSpec, { columns: ['due'], collapsed: ['done'], query: 'sort=number' })).toEqual({ columns: ['due'], collapsed: ['done'], query: 'sort=number' });
    expect(readPresentation(tasksSpec, null)).toEqual({ columns: null, collapsed: null, query: null });
  });

  it('kolumny: nieukrywalne zawsze, kolejność z konfiguracji, nieznane pominięte', () => {
    expect(visibleColumns(companiesSpec, ['revenue', 'city', 'nieznana']).map(c => c.key)).toEqual(['name', 'city', 'revenue']);
    expect(visibleColumns(companiesSpec, null).map(c => c.key)).toEqual(companiesSpec.columns.filter(c => !c.hidden).map(c => c.key));
    const layout = collectionLayout(companiesSpec, ['city']);
    expect(layout.keys).toEqual(['select', 'name', 'city']);
    expect(layout.mainIndex).toBe(1);
    expect(collectionLayout(tasksSpec, null).keys[0]).not.toBe('select');
  });
});

describe('zaznaczanie i klawiatura', () => {
  const ids = ['a', 'b', 'c', 'd'];
  const run = (actions: Parameters<typeof selectionReducer>[1][], s: Selection = initialSelection) => actions.reduce(selectionReducer, s);

  it('J/K: od pierwszego wiersza, w granicach listy', () => {
    expect(run([{ type: 'move', ids, delta: 1 }]).cursor).toBe('a');
    expect(run([{ type: 'move', ids, delta: -1 }]).cursor).toBe('a');
    expect(run([{ type: 'move', ids, delta: 1 }, { type: 'move', ids, delta: 1 }, { type: 'move', ids, delta: 1 }, { type: 'move', ids, delta: 1 }, { type: 'move', ids, delta: 1 }]).cursor).toBe('d');
    expect(run([{ type: 'move', ids, delta: 1 }, { type: 'move', ids, delta: -1 }]).cursor).toBe('a');
    expect(run([{ type: 'move', ids: [], delta: 1 }])).toBe(initialSelection);
  });

  it('X zaznacza i odznacza wiersz pod kursorem; Shift+X zaznacza zakres od kotwicy', () => {
    let s = run([{ type: 'focus', id: 'b' }, { type: 'toggle' }]);
    expect(s.selected).toEqual(['b']);
    s = run([{ type: 'toggle' }], s);
    expect(s.selected).toEqual([]);
    s = run([{ type: 'focus', id: 'a' }, { type: 'toggle' }, { type: 'focus', id: 'c' }, { type: 'range', ids }]);
    expect(s.selected).toEqual(['a', 'b', 'c']);
    s = run([{ type: 'focus', id: 'd' }, { type: 'range', ids }], run([{ type: 'focus', id: 'c' }, { type: 'toggle' }]));
    expect(s.selected).toEqual(['c', 'd']);
    expect(run([{ type: 'toggle', id: 'd' }]).selected).toEqual(['d']);
  });

  it('Shift+J/K rozszerza zaznaczenie', () => {
    const s = run([{ type: 'focus', id: 'b' }, { type: 'move', ids, delta: 1, extend: true }, { type: 'move', ids, delta: 1, extend: true }]);
    expect(s.cursor).toBe('d');
    expect([...s.selected].sort()).toEqual(['b', 'c', 'd']);
  });

  it('zwinięcie grupy odznacza jej wiersze (zostają tylko widoczne id)', () => {
    const rows = [{ id: 'a', group: 'g1' }, { id: 'b', group: 'g1' }, { id: 'c', group: 'g2' }, { id: 'd' }];
    const groups = [{ key: 'g1' }, { key: 'g2' }, { key: '' }];
    expect(visibleRowIds(rows, groups, [])).toEqual(['a', 'b', 'c', 'd']);
    expect(visibleRowIds(rows, groups, ['g1'])).toEqual(['c', 'd']);
    expect(visibleRowIds(rows, undefined, ['g1'])).toEqual(['a', 'b', 'c', 'd']);
    const s = run([{ type: 'toggle', id: 'a' }, { type: 'toggle', id: 'c' }]);
    expect(run([{ type: 'sync', ids: visibleRowIds(rows, groups, ['g1']) }], s).selected).toEqual(['c']);
  });

  it('Esc czyści zaznaczenie; synchronizacja usuwa znikające wiersze', () => {
    const s = run([{ type: 'toggle', id: 'a' }, { type: 'toggle', id: 'c' }]);
    expect(run([{ type: 'clear' }], s).selected).toEqual([]);
    expect(run([{ type: 'clear' }])).toBe(initialSelection);
    expect(run([{ type: 'sync', ids: ['c', 'd'] }], { ...s, cursor: 'a' })).toMatchObject({ selected: ['c'], cursor: null });
  });

  it('skróty działają poza polami edycji i bez modyfikatorów', () => {
    const k = (key: string, o: Partial<{ shiftKey: boolean; metaKey: boolean; ctrlKey: boolean; altKey: boolean; typing: boolean }> = {}) => keyCommand({ key, shiftKey: false, metaKey: false, ctrlKey: false, altKey: false, typing: false, ...o });
    expect(k('j')).toBe('next');
    expect(k('k')).toBe('prev');
    expect(k('ArrowDown')).toBe(null);
    expect(k('J', { shiftKey: true })).toBe('extendNext');
    expect(k('K', { shiftKey: true })).toBe('extendPrev');
    expect(k('x')).toBe('toggle');
    expect(k('X', { shiftKey: true })).toBe('range');
    expect(k('Escape')).toBe('escape');
    expect(k('Escape', { typing: true })).toBe(null);
    expect(k(']')).toBe('panel');
    expect(k('v')).toBe('options');
    expect(k('/')).toBe('search');
    expect(k('/', { shiftKey: true })).toBe('search');
    expect(k('f')).toBe('filter');
    expect(k('j', { typing: true })).toBe(null);
    expect(k('j', { metaKey: true })).toBe(null);
    expect(k('x', { ctrlKey: true })).toBe(null);
    expect(k('Enter')).toBe('open');
  });
});

describe('konfiguracje kolekcji zgodne z RPC', () => {
  const specs = [companiesSpec, peopleSpec, stockSpec, maintenanceSpec, tasksSpec];
  it('sortowania i grupowania należą do wartości przyjmowanych przez funkcje', () => {
    expect(companiesSpec.sorts.map(s => s.value).every(v => (customerDirectorySorts as readonly string[]).includes(v))).toBe(true);
    expect(companiesSpec.groups.map(s => s.value).every(v => (customerDirectoryGroups as readonly string[]).includes(v))).toBe(true);
    expect(peopleSpec.sorts.map(s => s.value).every(v => (peopleDirectorySorts as readonly string[]).includes(v))).toBe(true);
    expect(stockSpec.sorts.map(s => s.value).every(v => (stockListSorts as readonly string[]).includes(v))).toBe(true);
    expect(stockSpec.groups.map(s => s.value).every(v => (stockListGroups as readonly string[]).includes(v))).toBe(true);
    expect(stockSpec.views.filter(v => !v.custom).map(v => v.key).every(v => (stockListViews as readonly string[]).includes(v))).toBe(true);
    for (const s of maintenanceSpec.sorts) expect(maintenanceQuerySchema.safeParse({ sort: s.value }).success).toBe(true);
    for (const v of maintenanceSpec.views) expect(maintenanceQuerySchema.safeParse({ view: v.key }).success).toBe(true);
  });

  it('każda konfiguracja jest spójna', () => {
    for (const s of specs) {
      const keys = s.columns.map(c => c.key);
      expect(new Set(keys).size, s.id).toBe(keys.length);
      expect(keys, s.id).not.toContain('select');
      expect(s.columns.filter(c => c.fr !== undefined && c.main).length, s.id).toBe(1);
      expect(s.columns.every(c => c.label.length > 0), s.id).toBe(true);
      expect(s.views.length, s.id).toBeGreaterThan(0);
      expect(s.sorts.length, s.id).toBeGreaterThan(0);
      for (const v of s.views) {
        if (v.sort) expect(s.sorts.map(x => x.value), `${s.id}:${v.key}`).toContain(v.sort);
        if (v.group) expect(s.groups.map(x => x.value), `${s.id}:${v.key}`).toContain(v.group);
      }
      // układ kolumn da się zbudować dla domyślnego i pełnego zestawu
      expect(() => collectionLayout(s, null), s.id).not.toThrow();
      expect(() => collectionLayout(s, keys), s.id).not.toThrow();
      expect(defaultQuery(s).page).toBe(1);
    }
  });
});
