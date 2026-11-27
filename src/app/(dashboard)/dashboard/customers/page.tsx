/* Firmy i osoby na silniku widoku kolekcji (M0.4, KRA-31; tabela w jednej linii z M0.3).
   Zapytanie (widok, szukanie, kategorie any / all / none, sortowanie, grupowanie, strona) w adresie → RPC customer_directory /
   people_directory (filtry, sortowanie, grupy i strony w SQL). Kolumny, zwinięte grupy i zapisane widoki — preferencje konta.
   Makieta: ekrany `firmy` (+ `filtr: kategoria`) i `osoby` (design/canvas/Main.dc.html). */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { customerCategoryListSchema, customerDirectoryParamsSchema, customerDirectorySchema, peopleDirectoryParamsSchema, peopleDirectorySchema, type CustomerDirectory, type PeopleDirectory } from '@hvac/api-client';
import { CategoryManager } from '@/components/category-manager';
import { PersonCategories } from '@/components/person-categories';
import { CollectionNotice, CollectionProvider, CollectionSearch, CollectionTable, CollectionViews, FilterBar, SortMenu, ViewOptionsButton, type CollectionGroup, type CollectionRow } from '@/components/collection';
import { CollectionFooter } from '@/components/collection/footer';
import { CustomerLogo, type CustomerCard } from '@/components/table/customer-logo';
import { Logo } from '@/components/table/logo';
import { Cell, HeaderCell, TableMessage } from '@/components/table/table';
import { PageHead, Segmented, Spacer, TablePage, Toolbar } from '@/components/table/page-chrome';
import { buttonClasses } from '@/components/ui/button';
import { categoryColorKey, categoryDotClass, categoryTintClass, colorMap } from '@/lib/crm/category-colors';
import { clampPage, clearFilters, isFiltered, parseQuery, patchQuery, queryHref } from '@/lib/collection/query';
import { archivedIndividualsColumns, companiesSpec, peopleSpec } from '@/lib/collection/specs';
import { collectionLayout, collectionPrefs, SELECT_COLUMN, visibleColumns } from '@/lib/collection/views';
import { loadPreferences } from '@/lib/collection/server';
import type { Query } from '@/lib/collection/spec';
import { columnLayout, type TableLayout } from '@/lib/table/columns';
import { requireSession } from '@/lib/auth';
import { personInitials } from '@/lib/tasks/labels';
import { catalogMoney } from '@/lib/catalog/format';
import { Building, Buildings, Clock, Coins, Cube, DownloadSimple, MapPin, Phone, Plus, Scroll, Tag, User, UsersThree } from '@phosphor-icons/react/ssr';
import { cx } from '@/lib/cx';

const zone = 'Europe/Warsaw';
function lastContact(v: string | null, now: Date) {
  if (!v) return null;
  const d = new Date(v), days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const title = new Intl.DateTimeFormat('pl-PL', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  if (days < 1) return { text: 'dziś', title };
  if (days < 2) return { text: 'wczoraj', title };
  if (days < 30) return { text: `${days} dni temu`, title };
  return { text: new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short', year: 'numeric' }).format(d).replace('.', ''), title };
}

/* Ikony nagłówków w kolorach --ic-* (konwencja z design/tools: miasto = czerwona pinezka, urządzenia = morskie pudełko, …). */
const H = {
  firm: <Building size={14} className="shrink-0 text-ic-indigo" aria-hidden />,
  person: <User size={14} className="shrink-0 text-ic-pink" aria-hidden />,
  tag: <Tag size={14} className="shrink-0 text-ic-pink" aria-hidden />,
  pin: <MapPin size={14} className="shrink-0 text-ic-red" aria-hidden />,
  cube: <Cube size={14} className="shrink-0 text-ic-teal" aria-hidden />,
  contract: <Scroll size={14} className="shrink-0 text-ic-green" aria-hidden />,
  clock: <Clock size={14} className="shrink-0 text-ic-slate" aria-hidden />,
  owner: <User size={14} className="shrink-0 text-ic-indigo" aria-hidden />,
  coins: <Coins size={14} className="shrink-0 text-ic-yellow" aria-hidden />,
  role: <UsersThree size={14} className="shrink-0 text-ic-indigo" aria-hidden />,
  phone: <Phone size={14} className="shrink-0 text-ic-teal" aria-hidden />,
};

const archivedLayout = columnLayout([SELECT_COLUMN, ...archivedIndividualsColumns]);

const Dash = () => <span className="text-tertiary">—</span>;
function Owner({ label }: { label: string | null }) {
  if (!label) return null;
  return <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center rounded-pill bg-subtle text-micro leading-none font-semibold text-secondary">{personInitials(label)}</span>;
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Customers({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const people = raw.kind === 'individual', spec = people ? peopleSpec : companiesSpec;
  // Dawne adresy: ?archived=1 → widok „Zarchiwizowane”.
  const query = parseQuery(spec, raw.archived === '1' && !raw.view ? { ...raw, view: 'archived' } : raw);
  const archived = query.view === 'archived', usePeople = people && !archived;
  const { db } = await requireSession();
  const dirParams = customerDirectoryParamsSchema.parse({
    p_search: usePeople ? '' : query.q, p_archived: archived, p_kind: people ? 'individual' : 'company', p_page: usePeople ? 1 : query.page,
    p_categories: people ? [] : query.filters.cat ?? [], p_mode: people ? 'any' : query.modes.cat ?? 'any',
    p_view: query.view === 'no_contact_30' && !people ? 'no_contact_30' : 'all', p_sort: usePeople ? 'name' : query.sort, p_group: people ? 'none' : query.group,
  });
  const [dir, staff, catList, ppl, prefsAll] = await Promise.all([
    db.rpc('customer_directory', dirParams),
    db.rpc('can_manage_crm'),
    db.rpc('customer_category_list', { p_kind: people ? 'individual' : 'company' }),
    usePeople ? db.rpc('people_directory', peopleDirectoryParamsSchema.parse({ p_search: query.q, p_view: query.view, p_page: query.page, p_sort: query.sort })) : Promise.resolve(null),
    loadPreferences(db),
  ]);
  const parsed = dir.error ? null : customerDirectorySchema.safeParse(dir.data);
  const data = parsed?.success ? parsed.data : null, manage = staff.data === true, now = new Date();
  const categories = catList.error ? [] : customerCategoryListSchema.parse(catList.data), colors = colorMap(categories);
  const pplParsed = ppl && !ppl.error ? peopleDirectorySchema.safeParse(ppl.data) : null;
  const persons: PeopleDirectory | null = pplParsed?.success ? pplParsed.data : null;
  // Strona poza zakresem (np. po zawężeniu filtra albo z zapisanego adresu) → ostatnia strona wyniku.
  const page = usePeople ? (persons ? clampPage({ total: persons.total, count: persons.items.length, page: query.page }, spec.pageSize) : null) : data ? clampPage({ total: data.total, count: data.items.length, page: query.page }, spec.pageSize) : null;
  if (page) redirect(queryHref(spec, patchQuery(spec, query, { page })));
  const prefs = collectionPrefs(spec, prefsAll);
  const kindHref = (k: 'company' | 'individual') => `/dashboard/customers?${new URLSearchParams({ kind: k, ...(archived ? { view: 'archived' } : {}) })}`;

  return (
    <CollectionProvider spec={spec} query={query} prefs={prefs}>
      <TablePage>
        <PageHead icon={<Buildings size={16} className="shrink-0" aria-hidden />} category="Klienci" title="Firmy i osoby">
          <Segmented label="Rodzaj rekordów" className="ml-2" items={[
            { key: 'company', active: !people, href: kindHref('company'), children: <>Firmy<span className="font-normal text-tertiary tabular-nums">{data?.counts.company ?? ''}</span></> },
            { key: 'individual', active: people, href: kindHref('individual'), children: <>Osoby<span className="font-normal text-tertiary tabular-nums">{persons?.all ?? data?.counts.individual ?? ''}</span></> },
          ]} />
          <Spacer />
        </PageHead>
        <Toolbar>
          <CollectionViews label="Widoki" />
          <Spacer />
          <ViewOptionsButton />
          {manage && <Link href="/dashboard/customers/import" title="Import CSV" className={buttonClasses({ variant: 'sec', size: 'sm', className: 'ml-1' })}><DownloadSimple size={14} className="shrink-0" aria-hidden />Import</Link>}
          {manage && <Link href="/dashboard/customers/new" title={people ? 'Nowa osoba' : 'Nowa firma'} className={buttonClasses({ variant: 'pri', size: 'sm' })}><Plus size={14} className="shrink-0" aria-hidden />{people ? 'Nowa osoba' : 'Nowa firma'}</Link>}
        </Toolbar>
        <div className="flex min-w-0 flex-wrap items-center gap-2 pr-3 pb-2 pl-4 max-desktop:pl-3">
          <CollectionSearch />
          {!people && <FilterBar
            options={{ cat: categories.map(k => { const key = categoryColorKey(k.name, colors); return { value: k.name, label: k.name, count: k.count, dotClass: categoryDotClass[key], tintClass: categoryTintClass[key] }; }) }}
            manage={manage ? { cat: <CategoryManager categories={categories} /> } : {}}
          />}
          <SortMenu />
        </div>
        <CollectionNotice />
        {usePeople
          ? <PeopleTable data={persons} query={query} manage={manage} now={now} chosen={prefs.presentation.columns} />
          : <CustomerTable data={data} people={people} archived={archived} query={query} colors={colors} now={now} chosen={prefs.presentation.columns} />}
      </TablePage>
    </CollectionProvider>
  );
}

function groupLabel(group: string, g: { key: string; label: string }) {
  if (g.label) return g.label;
  return group === 'city' ? 'Bez miasta' : 'Bez kategorii';
}

function CustomerTable({ data, people, archived, query, colors, now, chosen }: { data: CustomerDirectory | null; people: boolean; archived: boolean; query: Query; colors: Record<string, string>; now: Date; chosen: string[] | null }) {
  const spec = people ? peopleSpec : companiesSpec;
  const layout: TableLayout = people ? archivedLayout : collectionLayout(companiesSpec, chosen);
  const cols = new Set(layout.keys), n = layout.keys.length, filtered = isFiltered(spec, query);
  const head: Record<string, ReactNode> = {
    name: <HeaderCell key="name" layout={layout} col="name" icon={people ? H.person : H.firm}>{people ? 'Osoba' : 'Firma'}</HeaderCell>,
    categories: <HeaderCell key="categories" layout={layout} col="categories" icon={H.tag}>Kategorie</HeaderCell>,
    city: <HeaderCell key="city" layout={layout} col="city" icon={H.pin}>Miasto</HeaderCell>,
    devices: <HeaderCell key="devices" layout={layout} col="devices" icon={H.cube} align="right">Urządzenia</HeaderCell>,
    contract: <HeaderCell key="contract" layout={layout} col="contract" icon={H.contract}>Umowa</HeaderCell>,
    contact: <HeaderCell key="contact" layout={layout} col="contact" icon={H.clock}>Kontakt</HeaderCell>,
    owner: <HeaderCell key="owner" layout={layout} col="owner" icon={H.owner} label="Opiekun" />,
    revenue: <HeaderCell key="revenue" layout={layout} col="revenue" icon={H.coins} align="right" title="Wartość zaakceptowanych ofert z ostatnich 12 miesięcy (netto)">Przychód</HeaderCell>,
  };
  const keys = layout.keys.filter(k => k !== 'select');
  const rows: CollectionRow[] = (data?.items ?? []).map(c => {
    const contact = lastContact(c.lastContact, now), shown = c.categories.slice(0, 2), more = c.categories.slice(2);
    const card: CustomerCard = { subtitle: people ? 'Klient indywidualny' : c.categories.slice(0, 2).join(' · ') || null, city: c.city, owner: c.ownerLabel, phone: c.phone, lastContact: contact };
    const cell: Record<string, ReactNode> = {
      name: <Cell key="name" layout={layout} col="name"><CustomerLogo name={c.name} kind={people ? 'person' : 'company'} href={`/dashboard/customers/${c.id}`} card={card} showName /></Cell>,
      categories: <Cell key="categories" layout={layout} col="categories" gap={1}>
        {shown.map(cat => <span key={cat} className={cx('inline-flex h-5 items-center rounded-xs px-2 text-small leading-4 whitespace-nowrap text-primary', categoryTintClass[categoryColorKey(cat, colors)])}>{cat}</span>)}
        {more.length > 0 && <span title={more.join(', ')} className="inline-flex h-5 items-center rounded-xs bg-subtle px-2 text-small leading-4 text-secondary tabular-nums">+{more.length}</span>}
        {!c.categories.length && <Dash />}
      </Cell>,
      city: <Cell key="city" layout={layout} col="city" className="text-secondary"><span className="truncate">{c.city || '—'}</span></Cell>,
      devices: <Cell key="devices" layout={layout} col="devices" align="right" className={cx('tabular-nums', c.devices ? 'text-primary' : 'text-tertiary')}>{c.devices}</Cell>,
      contract: <Cell key="contract" layout={layout} col="contract" title="Moduł umów jest w przygotowaniu"><Dash /></Cell>,
      contact: <Cell key="contact" layout={layout} col="contact" title={contact?.title ?? 'Brak kontaktu'} className="text-secondary">{contact ? <><Clock size={14} className="shrink-0 text-tertiary" aria-hidden /><span className="truncate">{contact.text}</span></> : <Dash />}</Cell>,
      owner: <Cell key="owner" layout={layout} col="owner" title={c.ownerLabel ? `Opiekun: ${c.ownerLabel}` : 'Bez opiekuna'}><Owner label={c.ownerLabel} /></Cell>,
      revenue: <Cell key="revenue" layout={layout} col="revenue" align="right" className={cx('tabular-nums', c.revenueCents ? 'text-primary' : 'text-tertiary')}>{c.revenueCents === null ? '' : c.revenueCents ? catalogMoney(c.revenueCents) : '—'}</Cell>,
    };
    return { id: c.id, label: c.name, group: c.group, cells: keys.map(k => cell[k]) };
  });
  const grouped = !people && query.group !== 'none' && data ? data.groups : null;
  const groups: CollectionGroup[] | undefined = grouped?.map(g => {
    const key = g.label ? categoryColorKey(g.label, colors) : null;
    return { key: g.key, label: groupLabel(query.group, g), count: g.count, icon: query.group === 'city' ? <MapPin size={14} className="shrink-0 text-ic-red" aria-hidden /> : <span aria-hidden="true" className={cx('size-2 shrink-0 rounded-pill', key ? categoryDotClass[key] : 'bg-border-strong')} /> };
  });
  const clear = queryHref(spec, clearFilters(spec, query));
  const message = !data
    ? <TableMessage columns={n} kind="error" action={<Link href={queryHref(spec, query)} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Spróbuj ponownie</Link>}>Nie udało się wczytać listy klientów. Sprawdź połączenie i spróbuj ponownie.</TableMessage>
    : <TableMessage columns={n} action={filtered ? <Link href={clear} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Wyczyść filtry</Link> : !archived && !people ? <Link href="/dashboard/customers/new" title="Nowa firma" className={buttonClasses({ variant: 'sec', size: 'sm' })}>Dodaj firmę</Link> : undefined}>
        {filtered ? 'Nic nie pasuje do wyszukiwania ani filtrów.' : archived ? 'Brak zarchiwizowanych rekordów.' : query.view === 'no_contact_30' ? 'Każda firma miała kontakt w ostatnich 30 dniach.' : 'Nie ma jeszcze firm. Dodaj pierwszą firmę, a potem jej lokalizację i urządzenia.'}
      </TableMessage>;
  return (
    <>
      <CollectionTable layout={layout} label={people ? 'Osoby' : 'Firmy'} lines header={keys.map(k => head[k])} rows={rows} groups={groups} message={message} className="flex-auto border-t border-edge" />
      {data && (
        <CollectionFooter spec={spec} query={query} total={data.total}>
          <span title={filtered ? 'Pasujące do filtrów z wszystkich' : undefined}>{filtered ? `${data.total} z ${data.summary.all}` : data.total} {people ? 'osób' : 'firm'}{archived ? ' w archiwum' : ''}</span>
          {cols.has('devices') && <span title="Urządzenia u klientów z listy">urządzeń: {data.summary.devices}</span>}
          {!people && data.summary.revenueCents !== null && <span title="Zaakceptowane oferty z 12 miesięcy, netto">przychód: {catalogMoney(data.summary.revenueCents)}</span>}
        </CollectionFooter>
      )}
    </>
  );
}

function PeopleTable({ data, query, manage, now, chosen }: { data: PeopleDirectory | null; query: Query; manage: boolean; now: Date; chosen: string[] | null }) {
  const spec = peopleSpec, layout = collectionLayout(spec, chosen), n = layout.keys.length;
  const keys = visibleColumns(spec, chosen).map(c => c.key), filtered = isFiltered(spec, query) || query.view !== 'all';
  const head: Record<string, ReactNode> = {
    name: <HeaderCell key="name" layout={layout} col="name" icon={H.person}>Osoba</HeaderCell>,
    company: <HeaderCell key="company" layout={layout} col="company" icon={H.firm}>Firma</HeaderCell>,
    role: <HeaderCell key="role" layout={layout} col="role" icon={H.role}>Rola</HeaderCell>,
    categories: <HeaderCell key="categories" layout={layout} col="categories" icon={H.tag}>Kategorie</HeaderCell>,
    phone: <HeaderCell key="phone" layout={layout} col="phone" icon={H.phone}>Telefon</HeaderCell>,
    contact: <HeaderCell key="contact" layout={layout} col="contact" icon={H.clock}>Kontakt</HeaderCell>,
    owner: <HeaderCell key="owner" layout={layout} col="owner" icon={H.owner} label="Opiekun" />,
  };
  const rows: CollectionRow[] = (data?.items ?? []).map(p => {
    const contact = lastContact(p.lastContact, now), own = `/dashboard/customers/${p.customerId}`;
    const cell: Record<string, ReactNode> = {
      name: <Cell key="name" layout={layout} col="name">
        {p.kind === 'individual'
          ? <CustomerLogo name={p.name} kind="person" href={own} showName card={{ owner: p.ownerLabel, phone: p.phone, lastContact: contact }} />
          : <Link href={`${own}?tab=contacts`} title={p.email ?? undefined} className="inline-flex min-w-0 items-center gap-2 rounded-xs text-primary no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"><Logo name={p.name} kind="person" /><span className="truncate font-medium">{p.name}</span></Link>}
      </Cell>,
      company: <Cell key="company" layout={layout} col="company">{p.company ? <CustomerLogo name={p.company} href={own} showName /> : <span className="text-tertiary">bez firmy</span>}</Cell>,
      role: <Cell key="role" layout={layout} col="role" className="text-secondary"><span className="truncate">{p.role || '—'}</span></Cell>,
      categories: <Cell key="categories" layout={layout} col="categories" clip={false}><PersonCategories contactId={p.kind === 'contact' ? p.id : null} initial={p.categories} editable={manage && p.kind === 'contact'} /></Cell>,
      phone: <Cell key="phone" layout={layout} col="phone" className="tabular-nums">{p.phone ? <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="truncate text-primary no-underline hover:underline">{p.phone}</a> : <Dash />}</Cell>,
      contact: <Cell key="contact" layout={layout} col="contact" title={contact?.title ?? 'Brak kontaktu'} className="text-secondary">{contact ? <><Clock size={14} className="shrink-0 text-tertiary" aria-hidden /><span className="truncate">{contact.text}</span></> : <Dash />}</Cell>,
      owner: <Cell key="owner" layout={layout} col="owner" title={p.ownerLabel ? `Opiekun: ${p.ownerLabel}` : 'Bez opiekuna'}><Owner label={p.ownerLabel} /></Cell>,
    };
    return { id: `${p.kind}-${p.id}`, label: p.name, cells: keys.map(k => cell[k]) };
  });
  const message = !data
    ? <TableMessage columns={n} kind="error" action={<Link href={queryHref(spec, query)} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Spróbuj ponownie</Link>}>Nie udało się wczytać listy osób. Sprawdź połączenie i spróbuj ponownie.</TableMessage>
    : <TableMessage columns={n} action={filtered ? <Link href={queryHref(spec, clearFilters(spec, { ...query, view: 'all' }))} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Wszystkie osoby</Link> : undefined}>
        {filtered ? 'Nic nie pasuje do wyszukiwania ani widoku.' : 'Nie ma jeszcze osób. Dodaj osobę kontaktową na karcie firmy albo klienta indywidualnego.'}
      </TableMessage>;
  return (
    <>
      <CollectionTable layout={layout} label="Osoby" lines header={keys.map(k => head[k])} rows={rows} message={message} className="flex-auto border-t border-edge" />
      {data && (
        <CollectionFooter spec={spec} query={query} total={data.total}>
          <span>{filtered ? `${data.total} z ${data.all}` : data.total} osób</span>
        </CollectionFooter>
      )}
    </>
  );
}
