/* Firmy i osoby (M0.3, KRA-63): tabele w jednej linii z przypiętą kolumną główną, logo z kartą podglądu, przewijanie ←/→.
   Makieta: ekrany `firmy` i `osoby` (design/canvas/Main.dc.html), wzór tabel: design/tools/ui1.py, tabele_przewijane.py. */
import Link from 'next/link';
import { customerCategoryListSchema, customerDirectorySchema, peopleDirectorySchema, type CustomerDirectory, type PeopleDirectory } from '@hvac/api-client';
import { PersonCategories } from '@/components/person-categories';
import { CustomerFilters } from '@/components/customer-filters';
import { CustomerLogo, type CustomerCard } from '@/components/table/customer-logo';
import { Logo } from '@/components/table/logo';
import { Cell, HeaderCell, HeaderRow, Row, TableMessage } from '@/components/table/table';
import { TableScroll } from '@/components/table/table-scroll';
import { PageHead, PageLink, Segmented, Spacer, TableFooter, TablePage, Toolbar, ViewTabs, searchFrameClasses, searchInputClasses } from '@/components/table/page-chrome';
import { buttonClasses } from '@/components/ui/button';
import { categoryColorKey, categoryTintClass, colorMap } from '@/lib/crm/category-colors';
import { columnLayout, type TableLayout } from '@/lib/table/columns';
import { requireSession } from '@/lib/auth';
import { personInitials } from '@/lib/tasks/labels';
import { catalogMoney } from '@/lib/catalog/format';
import { Building, Buildings, Clock, Coins, Cube, DownloadSimple, MagnifyingGlass, MapPin, Phone, Plus, Scroll, Tag, User, UsersThree } from '@phosphor-icons/react/ssr';
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

const companyLayout = columnLayout([
  { key: 'name', fr: 2, main: true },
  { key: 'categories', fr: 1.5 },
  { key: 'city', fr: 1 },
  { key: 'devices', width: 80 },
  { key: 'contract', width: 104 },
  { key: 'contact', width: 104 },
  { key: 'owner', width: 20 },
  { key: 'revenue', width: 112 },
]);
const individualLayout = columnLayout([
  { key: 'name', fr: 2, main: true },
  { key: 'categories', fr: 1.5 },
  { key: 'city', fr: 1 },
  { key: 'devices', width: 80 },
  { key: 'contact', width: 104 },
  { key: 'owner', width: 20 },
]);
const peopleLayout = columnLayout([
  { key: 'name', fr: 1.5, main: true },
  { key: 'company', fr: 1.5 },
  { key: 'role', fr: 1 },
  { key: 'categories', fr: 1.25 },
  { key: 'phone', width: 128 },
  { key: 'contact', width: 104 },
  { key: 'owner', width: 20 },
]);

const Dash = () => <span className="text-tertiary">—</span>;
function Owner({ label }: { label: string | null }) {
  if (!label) return null;
  return <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center rounded-pill bg-subtle text-micro leading-none font-semibold text-secondary">{personInitials(label)}</span>;
}

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; archived?: string; kind?: string; cat?: string | string[]; mode?: string; view?: string; sort?: string }> }) {
  const params = await searchParams;
  const q = (params.q || '').trim().slice(0, 200), archived = params.archived === '1', kind = params.kind === 'individual' ? 'individual' : 'company', people = kind === 'individual';
  const cats = (Array.isArray(params.cat) ? params.cat : params.cat ? [params.cat] : []).map(c => c.trim().slice(0, 40)).filter(Boolean).slice(0, 20);
  const mode = params.mode === 'all' || params.mode === 'none' ? params.mode : 'any', stale = params.view === 'no_contact_30' && !archived, pview = people && !archived && (params.view === 'decision' || params.view === 'individual' || params.view === 'no_contact_30') ? params.view : 'all', sort = params.sort === 'last_contact' ? 'last_contact' : 'name';
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page || '1', 10) || 1));
  const { db } = await requireSession();
  const [dir, staff, catList, ppl] = await Promise.all([db.rpc('customer_directory', { p_search: q, p_archived: archived, p_kind: kind, p_page: page, p_categories: cats, p_mode: mode, p_view: stale ? 'no_contact_30' : 'all', p_sort: sort }), db.rpc('can_manage_crm'), db.rpc('customer_category_list', { p_kind: kind }), db.rpc('people_directory', { p_search: people ? q : '', p_view: pview, p_page: people ? page : 1 })]);
  const parsed = dir.error ? null : customerDirectorySchema.safeParse(dir.data);
  const data = parsed?.success ? parsed.data : null, manage = staff.data === true, now = new Date();
  const categories = catList.error ? [] : customerCategoryListSchema.parse(catList.data), colors = colorMap(categories);
  const persons: PeopleDirectory | null = ppl.error ? null : peopleDirectorySchema.parse(ppl.data), usePeople = people && !archived && persons !== null;
  const base: Record<string, string> = { ...(q ? { q } : {}), kind, ...(archived ? { archived: '1' } : {}), ...(stale ? { view: 'no_contact_30' } : {}) };
  const href = (patch: Record<string, string>) => { const p = new URLSearchParams({ ...base, ...(sort !== 'name' ? { sort } : {}), ...(cats.length && mode !== 'any' ? { mode } : {}), ...patch }); cats.forEach(c => p.append('cat', c)); return `/dashboard/customers?${p}`; };
  const filtered = cats.length > 0 || stale || !!q;
  const list = (patch: Record<string, string>) => `/dashboard/customers?${new URLSearchParams({ kind, ...patch })}`;

  return (
    <TablePage>
      <PageHead icon={<Buildings size={16} className="shrink-0" aria-hidden />} category="Klienci" title="Firmy i osoby">
        <Segmented label="Rodzaj rekordów" className="ml-2" items={[
          { key: 'company', active: !people, href: `/dashboard/customers?${new URLSearchParams({ kind: 'company', ...(archived ? { archived: '1' } : {}) })}`, children: <>Firmy<span className="font-normal text-tertiary tabular-nums">{data?.counts.company ?? ''}</span></> },
          { key: 'individual', active: people, href: `/dashboard/customers?${new URLSearchParams({ kind: 'individual', ...(archived ? { archived: '1' } : {}) })}`, children: <>Osoby<span className="font-normal text-tertiary tabular-nums">{persons?.all ?? data?.counts.individual ?? ''}</span></> },
        ]} />
        <Spacer />
      </PageHead>
      <Toolbar>
        <ViewTabs label="Zapisane widoki" items={[
          { label: people ? 'Wszystkie osoby' : 'Wszystkie firmy', href: list({}), active: !archived && !stale && pview === 'all' },
          ...(people ? [{ label: 'Decyzyjne', title: 'Osoby z kategorią Decyzyjny', href: list({ view: 'decision' }), active: pview === 'decision' }, { label: 'Klienci indywidualni', href: list({ view: 'individual' }), active: pview === 'individual' }] : []),
          { label: 'Bez kontaktu 30 dni', title: 'Bez notatki, zgłoszenia ani zadania od 30 dni', href: list({ view: 'no_contact_30', ...(people ? {} : { sort: 'last_contact' }) }), active: stale },
          { label: 'Zarchiwizowane', href: list({ archived: '1' }), active: archived },
        ]} />
        <Spacer />
        {manage && <Link href="/dashboard/customers/import" title="Import CSV" className={buttonClasses({ variant: 'sec', size: 'sm', className: 'ml-1' })}><DownloadSimple size={14} className="shrink-0" aria-hidden />Import</Link>}
        {manage && <Link href="/dashboard/customers/new" title={people ? 'Nowa osoba' : 'Nowa firma'} className={buttonClasses({ variant: 'pri', size: 'sm' })}><Plus size={14} className="shrink-0" aria-hidden />{people ? 'Nowa osoba' : 'Nowa firma'}</Link>}
      </Toolbar>
      <div className="flex flex-wrap items-center gap-2 pr-3 pb-2 pl-4 max-desktop:pl-3">
        <form id="customer-search-form" action="/dashboard/customers" role="search" className="max-desktop:w-full">
          <input type="hidden" name="kind" value={kind} />{archived && <input type="hidden" name="archived" value="1" />}{(stale || pview !== 'all') && <input type="hidden" name="view" value={stale ? 'no_contact_30' : pview} />}{sort !== 'name' && <input type="hidden" name="sort" value={sort} />}{cats.length > 0 && mode !== 'any' && <input type="hidden" name="mode" value={mode} />}
          <label className={searchFrameClasses}>
            <MagnifyingGlass size={14} className="shrink-0" aria-hidden />
            <span className="sr-only">Szukaj klienta, adresu lub kategorii</span>
            <input id="customer-search" type="search" name="q" defaultValue={q} maxLength={200} placeholder="Szukaj klienta, adresu lub kategorii" className={cx(searchInputClasses, 'w-64')} />
          </label>
        </form>
        {cats.map(c => <input key={c} type="hidden" name="cat" value={c} form="customer-search-form" />)}
        {!usePeople && <CustomerFilters base={base} categories={categories} selected={cats} mode={mode} sort={sort} manage={manage} />}
      </div>
      {usePeople && persons
        ? <PeopleTable data={persons} q={q} view={pview} page={page} manage={manage} now={now} />
        : <CustomerTable data={data} people={people} archived={archived} filtered={filtered} colors={colors} now={now} page={page} href={href} retry={href({ page: String(page) })} />}
    </TablePage>
  );
}

function CustomerTable({ data, people, archived, filtered, colors, now, page, href, retry }: { data: CustomerDirectory | null; people: boolean; archived: boolean; filtered: boolean; colors: Record<string, string>; now: Date; page: number; href: (p: Record<string, string>) => string; retry: string }) {
  const layout: TableLayout = people ? individualLayout : companyLayout, n = layout.keys.length;
  return (
    <>
      <TableScroll layout={layout} label={people ? 'Osoby' : 'Firmy'} className="flex-auto border-t border-edge">
        <HeaderRow layout={layout}>
          <HeaderCell layout={layout} col="name" icon={people ? H.person : H.firm}>{people ? 'Osoba' : 'Firma'}</HeaderCell>
          <HeaderCell layout={layout} col="categories" icon={H.tag}>Kategorie</HeaderCell>
          <HeaderCell layout={layout} col="city" icon={H.pin}>Miasto</HeaderCell>
          <HeaderCell layout={layout} col="devices" icon={H.cube} align="right">Urządzenia</HeaderCell>
          {!people && <HeaderCell layout={layout} col="contract" icon={H.contract}>Umowa</HeaderCell>}
          <HeaderCell layout={layout} col="contact" icon={H.clock}>Kontakt</HeaderCell>
          <HeaderCell layout={layout} col="owner" icon={H.owner} label="Opiekun" />
          {!people && <HeaderCell layout={layout} col="revenue" icon={H.coins} align="right" title="Wartość zaakceptowanych ofert z ostatnich 12 miesięcy (netto)">Przychód</HeaderCell>}
        </HeaderRow>
        {!data && <TableMessage columns={n} kind="error" action={<Link href={retry} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Spróbuj ponownie</Link>}>Nie udało się wczytać listy klientów. Sprawdź połączenie i spróbuj ponownie.</TableMessage>}
        {data?.items.map(c => {
          const contact = lastContact(c.lastContact, now), shown = c.categories.slice(0, 2), more = c.categories.slice(2);
          const card: CustomerCard = { subtitle: people ? 'Klient indywidualny' : c.categories.slice(0, 2).join(' · ') || null, city: c.city, owner: c.ownerLabel, phone: c.phone, lastContact: contact };
          return (
            <Row key={c.id} layout={layout} lines>
              <Cell layout={layout} col="name"><CustomerLogo name={c.name} kind={people ? 'person' : 'company'} href={`/dashboard/customers/${c.id}`} card={card} showName /></Cell>
              <Cell layout={layout} col="categories" gap={1}>
                {shown.map(cat => <span key={cat} className={cx('inline-flex h-5 items-center rounded-xs px-2 text-small leading-4 whitespace-nowrap text-primary', categoryTintClass[categoryColorKey(cat, colors)])}>{cat}</span>)}
                {more.length > 0 && <span title={more.join(', ')} className="inline-flex h-5 items-center rounded-xs bg-subtle px-2 text-small leading-4 text-secondary tabular-nums">+{more.length}</span>}
                {!c.categories.length && <Dash />}
              </Cell>
              <Cell layout={layout} col="city" className="text-secondary"><span className="truncate">{c.city || '—'}</span></Cell>
              <Cell layout={layout} col="devices" align="right" className={cx('tabular-nums', c.devices ? 'text-primary' : 'text-tertiary')}>{c.devices}</Cell>
              {!people && <Cell layout={layout} col="contract" title="Moduł umów jest w przygotowaniu"><Dash /></Cell>}
              <Cell layout={layout} col="contact" title={contact?.title ?? 'Brak kontaktu'} className="text-secondary">{contact ? <><Clock size={14} className="shrink-0 text-tertiary" aria-hidden /><span className="truncate">{contact.text}</span></> : <Dash />}</Cell>
              <Cell layout={layout} col="owner" title={c.ownerLabel ? `Opiekun: ${c.ownerLabel}` : 'Bez opiekuna'}><Owner label={c.ownerLabel} /></Cell>
              {!people && <Cell layout={layout} col="revenue" align="right" className={cx('tabular-nums', c.revenueCents ? 'text-primary' : 'text-tertiary')}>{c.revenueCents === null ? '' : c.revenueCents ? catalogMoney(c.revenueCents) : '—'}</Cell>}
            </Row>
          );
        })}
        {data && !data.items.length && <TableMessage columns={n} action={filtered ? <Link href={`/dashboard/customers?${new URLSearchParams({ kind: people ? 'individual' : 'company', ...(archived ? { archived: '1' } : {}) })}`} className={buttonClasses({ variant: 'sec', size: 'sm' })}>Wyczyść filtry</Link> : !archived && !people ? <Link href="/dashboard/customers/new" title="Nowa firma" className={buttonClasses({ variant: 'sec', size: 'sm' })}>Dodaj firmę</Link> : undefined}>
          {filtered ? 'Nic nie pasuje do wyszukiwania ani filtrów.' : archived ? 'Brak zarchiwizowanych rekordów.' : people ? 'Nie ma jeszcze osób prywatnych.' : 'Nie ma jeszcze firm. Dodaj pierwszą firmę, a potem jej lokalizację i urządzenia.'}
        </TableMessage>}
      </TableScroll>
      {data && <TableFooter>
        <span className="inline-flex gap-4">
          <span title={filtered ? 'Pasujące do filtrów z wszystkich' : undefined}>{filtered ? `${data.total} z ${data.summary.all}` : data.total} {people ? 'osób' : 'firm'}{archived ? ' w archiwum' : ''}</span>
          <span title="Urządzenia u klientów z listy">urządzeń: {data.summary.devices}</span>
          {!people && data.summary.revenueCents !== null && <span title="Zaakceptowane oferty z 12 miesięcy, netto">przychód: {catalogMoney(data.summary.revenueCents)}</span>}
        </span>
        <span className="inline-flex gap-3">{page > 1 && <PageLink href={href({ page: String(page - 1) })}>Poprzednia</PageLink>}<span>Strona {page}</span>{page * 25 < data.total && <PageLink href={href({ page: String(page + 1) })}>Następna</PageLink>}</span>
      </TableFooter>}
    </>
  );
}

function PeopleTable({ data, q, view, page, manage, now }: { data: PeopleDirectory; q: string; view: string; page: number; manage: boolean; now: Date }) {
  const href = (n: number) => `/dashboard/customers?${new URLSearchParams({ kind: 'individual', ...(q ? { q } : {}), ...(view !== 'all' ? { view } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`;
  const filtered = !!q || view !== 'all', layout = peopleLayout, n = layout.keys.length;
  return (
    <>
      <TableScroll layout={layout} label="Osoby" className="flex-auto border-t border-edge">
        <HeaderRow layout={layout}>
          <HeaderCell layout={layout} col="name" icon={H.person}>Osoba</HeaderCell>
          <HeaderCell layout={layout} col="company" icon={H.firm}>Firma</HeaderCell>
          <HeaderCell layout={layout} col="role" icon={H.role}>Rola</HeaderCell>
          <HeaderCell layout={layout} col="categories" icon={H.tag}>Kategorie</HeaderCell>
          <HeaderCell layout={layout} col="phone" icon={H.phone}>Telefon</HeaderCell>
          <HeaderCell layout={layout} col="contact" icon={H.clock}>Kontakt</HeaderCell>
          <HeaderCell layout={layout} col="owner" icon={H.owner} label="Opiekun" />
        </HeaderRow>
        {data.items.map(p => {
          const contact = lastContact(p.lastContact, now), own = `/dashboard/customers/${p.customerId}`;
          return (
            <Row key={`${p.kind}-${p.id}`} layout={layout} lines>
              <Cell layout={layout} col="name">
                {p.kind === 'individual'
                  ? <CustomerLogo name={p.name} kind="person" href={own} showName card={{ owner: p.ownerLabel, phone: p.phone, lastContact: contact }} />
                  : <Link href={`${own}?tab=contacts`} title={p.email ?? undefined} className="inline-flex min-w-0 items-center gap-2 rounded-xs text-primary no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"><Logo name={p.name} kind="person" /><span className="truncate font-medium">{p.name}</span></Link>}
              </Cell>
              <Cell layout={layout} col="company">{p.company ? <CustomerLogo name={p.company} href={own} showName /> : <span className="text-tertiary">bez firmy</span>}</Cell>
              <Cell layout={layout} col="role" className="text-secondary"><span className="truncate">{p.role || '—'}</span></Cell>
              <Cell layout={layout} col="categories" clip={false}><PersonCategories contactId={p.kind === 'contact' ? p.id : null} initial={p.categories} editable={manage && p.kind === 'contact'} /></Cell>
              <Cell layout={layout} col="phone" className="tabular-nums">{p.phone ? <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="truncate text-primary no-underline hover:underline">{p.phone}</a> : <Dash />}</Cell>
              <Cell layout={layout} col="contact" title={contact?.title ?? 'Brak kontaktu'} className="text-secondary">{contact ? <><Clock size={14} className="shrink-0 text-tertiary" aria-hidden /><span className="truncate">{contact.text}</span></> : <Dash />}</Cell>
              <Cell layout={layout} col="owner" title={p.ownerLabel ? `Opiekun: ${p.ownerLabel}` : 'Bez opiekuna'}><Owner label={p.ownerLabel} /></Cell>
            </Row>
          );
        })}
        {!data.items.length && <TableMessage columns={n} action={filtered ? <Link href="/dashboard/customers?kind=individual" className={buttonClasses({ variant: 'sec', size: 'sm' })}>Wszystkie osoby</Link> : undefined}>
          {filtered ? 'Nic nie pasuje do wyszukiwania ani widoku.' : 'Nie ma jeszcze osób. Dodaj osobę kontaktową na karcie firmy albo klienta indywidualnego.'}
        </TableMessage>}
      </TableScroll>
      <TableFooter>
        <span>{filtered ? `${data.total} z ${data.all}` : data.total} osób</span>
        <span className="inline-flex gap-3">{page > 1 && <PageLink href={href(page - 1)}>Poprzednia</PageLink>}<span>Strona {page}</span>{page * 25 < data.total && <PageLink href={href(page + 1)}>Następna</PageLink>}</span>
      </TableFooter>
    </>
  );
}
