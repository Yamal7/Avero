/* Firmy i osoby — ported 1:1 from the design artboard "Firmy · tabela" (inline styles copied from the rendered design). */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { customerCategoryListSchema, customerDirectorySchema, peopleDirectorySchema, type PeopleDirectory } from '@hvac/api-client';
import { PersonCategories } from '@/components/person-categories';
import { CustomerFilters } from '@/components/customer-filters';
import { categoryTint, colorMap } from '@/lib/crm/category-colors';
import { requireSession } from '@/lib/auth';
import { personInitials } from '@/lib/tasks/labels';
import { catalogMoney } from '@/lib/catalog/format';
import { Building, Buildings, CaretRight, Clock, Coins, Cube, DownloadSimple, MagnifyingGlass, MapPin, Plus, Scroll, Tag, User } from '@phosphor-icons/react/ssr';

const I = {
  building16: <Buildings size={16} className="shrink-0" aria-hidden />,
  download: <DownloadSimple size={14} className="shrink-0" aria-hidden />,
  search: <MagnifyingGlass size={14} className="shrink-0" aria-hidden />,
  firm: <Building size={14} className="shrink-0" aria-hidden />,
  person: <User size={14} className="shrink-0" aria-hidden />,
  tag: <Tag size={14} className="shrink-0" aria-hidden />,
  pin: <MapPin size={14} className="shrink-0" aria-hidden />,
  cube: <Cube size={14} className="shrink-0" aria-hidden />,
  contract: <Scroll size={14} className="shrink-0" aria-hidden />,
  clock: <Clock size={14} className="shrink-0" aria-hidden />,
  coins: <Coins size={14} className="shrink-0" aria-hidden />,
  clockMuted: <Clock size={14} className="shrink-0 text-tertiary" aria-hidden />,
};
const cols = (people: boolean) => people ? '32px 260px 220px 120px 92px 120px 48px' : '32px 220px 240px 104px 92px 116px 120px 48px 128px';
const head: CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' };
const tab = (on: boolean): CSSProperties => ({ height: 28, padding: '0 12px', borderRadius: 14, border: 0, background: on ? 'var(--bg-subtle)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: on ? 500 : 400, display: 'inline-flex', alignItems: 'center' });
const kindTab = (on: boolean): CSSProperties => ({ height: 24, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px', border: 0, borderRadius: 8, background: on ? 'var(--bg-surface)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: on ? 500 : 400 });
function lastContact(v: string | null, now: Date) {
  if (!v) return { text: '—', title: 'Brak kontaktu' };
  const d = new Date(v), days = Math.floor((now.getTime() - d.getTime()) / 86400000), title = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'long', timeStyle: 'short' }).format(d);
  if (days < 1) return { text: 'dziś', title };
  if (days < 2) return { text: 'wczoraj', title };
  if (days < 30) return { text: `${days} dni temu`, title };
  return { text: new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short', year: 'numeric' }).format(d).replace('.', ''), title };
}

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; archived?: string; kind?: string; cat?: string | string[]; mode?: string; view?: string; sort?: string }> }) {
  const params = await searchParams;
  const q = (params.q || '').trim().slice(0, 200), archived = params.archived === '1', kind = params.kind === 'individual' ? 'individual' : 'company', people = kind === 'individual';
  const cats = (Array.isArray(params.cat) ? params.cat : params.cat ? [params.cat] : []).map(c => c.trim().slice(0, 40)).filter(Boolean).slice(0, 20);
  const mode = params.mode === 'all' || params.mode === 'none' ? params.mode : 'any', stale = params.view === 'no_contact_30' && !archived, pview = people && !archived && (params.view === 'decision' || params.view === 'individual' || params.view === 'no_contact_30') ? params.view : 'all', sort = params.sort === 'last_contact' ? 'last_contact' : 'name';
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page || '1', 10) || 1));
  const { db } = await requireSession();
  const [dir, staff, catList, ppl] = await Promise.all([db.rpc('customer_directory', { p_search: q, p_archived: archived, p_kind: kind, p_page: page, p_categories: cats, p_mode: mode, p_view: stale ? 'no_contact_30' : 'all', p_sort: sort }), db.rpc('can_manage_crm'), db.rpc('customer_category_list', { p_kind: kind }), db.rpc('people_directory', { p_search: people ? q : '', p_view: pview, p_page: people ? page : 1 })]);
  if (dir.error) throw new Error('Nie udało się pobrać listy. Sprawdź połączenie i migracje Supabase.');
  const data = customerDirectorySchema.parse(dir.data), manage = staff.data === true, now = new Date();
  const categories = catList.error ? [] : customerCategoryListSchema.parse(catList.data), colors = colorMap(categories);
  const persons: PeopleDirectory | null = ppl.error ? null : peopleDirectorySchema.parse(ppl.data), usePeople = people && !archived && persons !== null;
  const base: Record<string, string> = { ...(q ? { q } : {}), kind, ...(archived ? { archived: '1' } : {}), ...(stale ? { view: 'no_contact_30' } : {}) };
  const href = (patch: Record<string, string>) => { const p = new URLSearchParams({ ...base, ...(sort !== 'name' ? { sort } : {}), ...(cats.length && mode !== 'any' ? { mode } : {}), ...patch }); cats.forEach(c => p.append('cat', c)); return `/dashboard/customers?${p}`; };
  const filtered = cats.length > 0 || stale || !!q;
  const grid = cols(people);

  return (
    <main className="dk" style={{ flex: '1 1 auto', minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px 0 20px' }}>
        <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{I.building16}</span>
        <span style={{ color: 'var(--text-secondary)' }}>Klienci</span>
        <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}><CaretRight size={12} className="shrink-0" aria-hidden /></span>
        <h1 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Firmy i osoby</h1>
        <div role="tablist" aria-label="Rodzaj rekordów" style={{ display: 'inline-flex', gap: 2, padding: 2, marginLeft: 8, borderRadius: 10, background: 'var(--bg-subtle)' }}>
          <Link role="tab" aria-selected={!people} href={`/dashboard/customers?${new URLSearchParams({ kind: 'company', ...(archived ? { archived: '1' } : {}) })}`} style={kindTab(!people)}>Firmy<span className="num" style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{data.counts.company}</span></Link>
          <Link role="tab" aria-selected={people} href={`/dashboard/customers?${new URLSearchParams({ kind: 'individual', ...(archived ? { archived: '1' } : {}) })}`} style={kindTab(people)}>Osoby<span className="num" style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{persons?.all ?? data.counts.individual}</span></Link>
        </div>
        <span style={{ flex: '1 1 auto' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: '8px 12px 8px 16px' }}>
        <div role="tablist" aria-label="Zapisane widoki" style={{ display: 'flex', gap: 4 }}>
          <Link role="tab" aria-selected={!archived && !stale && pview === 'all'} className="tab" href={`/dashboard/customers?${new URLSearchParams({ kind })}`} style={tab(!archived && !stale && pview === 'all')}>{people ? 'Wszystkie osoby' : 'Wszystkie firmy'}</Link>
          {people && <Link role="tab" aria-selected={pview === 'decision'} className="tab" title="Osoby z kategorią Decyzyjny" href={`/dashboard/customers?${new URLSearchParams({ kind, view: 'decision' })}`} style={tab(pview === 'decision')}>Decyzyjne</Link>}
          {people && <Link role="tab" aria-selected={pview === 'individual'} className="tab" href={`/dashboard/customers?${new URLSearchParams({ kind, view: 'individual' })}`} style={tab(pview === 'individual')}>Klienci indywidualni</Link>}
          <Link role="tab" aria-selected={stale} className="tab" title="Bez notatki, zgłoszenia ani zadania od 30 dni" href={`/dashboard/customers?${new URLSearchParams({ kind, view: 'no_contact_30', ...(people ? {} : { sort: 'last_contact' }) })}`} style={tab(stale)}>Bez kontaktu 30 dni</Link>
          <Link role="tab" aria-selected={archived} className="tab" href={`/dashboard/customers?${new URLSearchParams({ kind, archived: '1' })}`} style={tab(archived)}>Zarchiwizowane</Link>
        </div>
        <span style={{ flex: '1 1 auto' }} />
        {manage && <Link href="/dashboard/customers/import" className="sec" title="Import CSV" style={{ height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px 0 8px', marginLeft: 4, border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontWeight: 500 }}>{I.download}Import</Link>}
        {manage && <Link href="/dashboard/customers/new" className="pri" title={people ? 'Nowa osoba' : 'Nowa firma'} style={{ height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px 0 8px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500 }}><Plus size={14} className="shrink-0" aria-hidden /><span>{people ? 'Nowa osoba' : 'Nowa firma'}</span></Link>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '0 12px 8px 16px' }}>
        <form id="customer-search-form" action="/dashboard/customers" role="search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 8px', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 12 }}>
          <input type="hidden" name="kind" value={kind} />{archived && <input type="hidden" name="archived" value="1" />}{(stale || pview !== 'all') && <input type="hidden" name="view" value={stale ? 'no_contact_30' : pview} />}{sort !== 'name' && <input type="hidden" name="sort" value={sort} />}{cats.length > 0 && mode !== 'any' && <input type="hidden" name="mode" value={mode} />}
          <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{I.search}</span>
          <label htmlFor="customer-search" className="vh">Szukaj klienta, adresu lub kategorii</label>
          <input id="customer-search" type="search" name="q" defaultValue={q} maxLength={200} placeholder="Szukaj klienta, adresu lub kategorii" style={{ width: 260, height: 24, minHeight: 0, padding: 0, border: 0, background: 'transparent', boxShadow: 'none', font: 'inherit', fontSize: 12, color: 'var(--text-primary)' }} />
        </form>
        {cats.map(c => <input key={c} type="hidden" name="cat" value={c} form="customer-search-form" />)}
        {!usePeople && <CustomerFilters base={base} categories={categories} selected={cats} mode={mode} sort={sort} manage={manage} />}
      </div>
      {usePeople && persons ? <PeopleTable data={persons} q={q} view={pview} page={page} manage={manage} now={now} /> : <>
      <div style={{ flex: '1 1 auto', minWidth: 0, overflowX: 'auto', borderTop: '1px solid var(--edge)' }}>
        <div role="table" aria-label={people ? 'Osoby' : 'Firmy'} style={{ minWidth: people ? 900 : 1156, display: 'flex', flexDirection: 'column' }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: grid, alignItems: 'center', height: 36, borderBottom: '1px solid var(--edge)', fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>
            <span role="columnheader" aria-label="Znacznik" style={{ height: '100%', position: 'sticky', left: 0, background: 'inherit' }} />
            <span role="columnheader" style={{ ...head, height: '100%', position: 'sticky', left: 32, background: 'inherit' }}>{people ? I.person : I.firm}{people ? 'Osoba' : 'Firma'}</span>
            <span role="columnheader" style={head}>{I.tag}Kategorie</span>
            <span role="columnheader" style={head}>{I.pin}Miasto</span>
            <span role="columnheader" style={{ ...head, justifyContent: 'flex-end' }}>{I.cube}Urządzenia</span>
            {!people && <span role="columnheader" style={head}>{I.contract}Umowa</span>}
            <span role="columnheader" style={head}>{I.clock}Kontakt</span>
            <span role="columnheader" aria-label="Opiekun" title="Opiekun" style={head}>{I.person}</span>
            {!people && <span role="columnheader" style={{ ...head, justifyContent: 'flex-end', padding: '0 12px 0 8px' }}>{I.coins}<span title="Wartość zaakceptowanych ofert z ostatnich 12 miesięcy (netto)">Przychód</span></span>}
          </div>
          {data.items.map(c => {
            const contact = lastContact(c.lastContact, now), shown = c.categories.slice(0, 2), more = c.categories.slice(2);
            return (
              <div role="row" className="trow" key={c.id} style={{ display: 'grid', gridTemplateColumns: grid, alignItems: 'center', height: 40, borderBottom: '1px solid var(--edge)' }}>
                <span role="cell" style={{ height: '100%', position: 'sticky', left: 0, background: 'inherit' }} />
                <span role="cell" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, padding: '0 8px', position: 'sticky', left: 32, background: 'inherit' }}>
                  <span aria-hidden="true" style={{ width: 20, height: 20, flex: '0 0 auto', borderRadius: people ? '50%' : 6, background: 'var(--bg-subtle)', border: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--text-secondary)' }}>{personInitials(c.name)}</span>
                  <Link href={`/dashboard/customers/${c.id}`} className="ell flink" style={{ fontWeight: 500 }}>{c.name}</Link>
                </span>
                <span role="cell" style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, padding: '0 8px', overflow: 'hidden' }}>
                  {shown.map(cat => <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 6px', borderRadius: 6, background: categoryTint(cat, colors), color: 'var(--text-primary)', fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' }}>{cat}</span>)}
                  {more.length > 0 && <span title={more.join(', ')} className="num" style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 6px', borderRadius: 6, border: 0, color: 'var(--text-secondary)', fontSize: 12, lineHeight: '16px', background: 'var(--bg-subtle)' }}>+{more.length}</span>}
                  {!c.categories.length && <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                </span>
                <span role="cell" className="ell" style={{ padding: '0 8px', color: 'var(--text-secondary)' }}>{c.city || '—'}</span>
                <span role="cell" className="num" style={{ padding: '0 8px', textAlign: 'right', color: c.devices ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{c.devices}</span>
                {!people && <span role="cell" title="Moduł umów jest w przygotowaniu" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, padding: '0 8px', color: 'var(--text-tertiary)' }}>—</span>}
                <span role="cell" className="ell" title={contact.title} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', color: 'var(--text-secondary)' }}>{c.lastContact && I.clockMuted}<span>{contact.text}</span></span>
                <span role="cell" title={c.ownerLabel ? `Opiekun: ${c.ownerLabel}` : 'Bez opiekuna'} style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>{c.ownerLabel && <span style={{ width: 20, height: 20, flex: '0 0 auto', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--text-secondary)' }}>{personInitials(c.ownerLabel)}</span>}</span>
                {!people && <span role="cell" className="num" style={{ padding: '0 12px 0 8px', textAlign: 'right', color: c.revenueCents ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{c.revenueCents === null ? '' : c.revenueCents ? catalogMoney(c.revenueCents) : '—'}</span>}
              </div>
            );
          })}
          {!data.items.length && <p style={{ margin: 0, padding: '16px 20px', color: 'var(--text-secondary)' }}>{filtered ? 'Nic nie pasuje do wyszukiwania ani filtrów. Zmień je albo wyczyść.' : archived ? 'Brak zarchiwizowanych rekordów.' : people ? 'Nie ma jeszcze osób prywatnych.' : 'Nie ma jeszcze firm. Dodaj pierwszą firmę, a potem jej lokalizację i urządzenia.'}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 36, padding: '0 20px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--edge)' }}>
        <span className="num" style={{ display: 'inline-flex', gap: 16 }}>
          <span title={filtered ? 'Pasujące do filtrów z wszystkich' : undefined}>{filtered ? `${data.total} z ${data.summary.all}` : data.total} {people ? 'osób' : 'firm'}{archived ? ' w archiwum' : ''}</span>
          <span title="Urządzenia u klientów z listy">urządzeń: {data.summary.devices}</span>
          {!people && data.summary.revenueCents !== null && <span title="Zaakceptowane oferty z 12 miesięcy, netto">przychód: {catalogMoney(data.summary.revenueCents)}</span>}
        </span>
        <span style={{ display: 'inline-flex', gap: 12 }}>{page > 1 && <Link href={href({ page: String(page - 1) })}>Poprzednia</Link>}<span className="num">Strona {page}</span>{page * 25 < data.total && <Link href={href({ page: String(page + 1) })}>Następna</Link>}</span>
      </div>
      </>}
    </main>
  );
}

const pcols = '32px 220px 200px 140px 200px 132px 120px 48px';
function PeopleTable({ data, q, view, page, manage, now }: { data: PeopleDirectory; q: string; view: string; page: number; manage: boolean; now: Date }) {
  const href = (n: number) => `/dashboard/customers?${new URLSearchParams({ kind: 'individual', ...(q ? { q } : {}), ...(view !== 'all' ? { view } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`;
  const filtered = !!q || view !== 'all';
  return (
    <>
      <div style={{ flex: '1 1 auto', minWidth: 0, overflowX: 'auto', borderTop: '1px solid var(--edge)' }}>
        <div role="table" aria-label="Osoby" style={{ minWidth: 1124, display: 'flex', flexDirection: 'column' }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: pcols, alignItems: 'center', height: 36, borderBottom: '1px solid var(--edge)', fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>
            <span role="columnheader" aria-label="Znacznik" style={{ height: '100%', position: 'sticky', left: 0, background: 'inherit' }} />
            <span role="columnheader" style={{ ...head, height: '100%', position: 'sticky', left: 32, background: 'inherit' }}>{I.person}Osoba</span>
            <span role="columnheader" style={head}>{I.firm}Firma</span>
            <span role="columnheader" style={head}>Rola</span>
            <span role="columnheader" style={head}>{I.tag}Kategorie</span>
            <span role="columnheader" style={head}>Telefon</span>
            <span role="columnheader" style={head}>{I.clock}Kontakt</span>
            <span role="columnheader" aria-label="Opiekun" title="Opiekun" style={head}>{I.person}</span>
          </div>
          {data.items.map(p => {
            const contact = lastContact(p.lastContact, now);
            return (
              <div role="row" className="trow" key={`${p.kind}-${p.id}`} style={{ display: 'grid', gridTemplateColumns: pcols, alignItems: 'center', height: 40, borderBottom: '1px solid var(--edge)' }}>
                <span role="cell" style={{ height: '100%', position: 'sticky', left: 0, background: 'inherit' }} />
                <span role="cell" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, padding: '0 8px', position: 'sticky', left: 32, background: 'inherit' }}>
                  <span aria-hidden="true" style={{ width: 20, height: 20, flex: '0 0 auto', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--text-secondary)' }}>{personInitials(p.name)}</span>
                  <Link href={p.kind === 'individual' ? `/dashboard/customers/${p.customerId}` : `/dashboard/customers/${p.customerId}?tab=contacts`} className="ell flink" style={{ fontWeight: 500 }} title={p.email ?? undefined}>{p.name}</Link>
                </span>
                <span role="cell" className="ell" style={{ padding: '0 8px', color: p.company ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{p.company ? <Link href={`/dashboard/customers/${p.customerId}`} className="flink">{p.company}</Link> : 'bez firmy'}</span>
                <span role="cell" className="ell" style={{ padding: '0 8px', color: 'var(--text-secondary)' }}>{p.role || '—'}</span>
                <span role="cell" style={{ padding: '0 4px', minWidth: 0 }}><PersonCategories contactId={p.kind === 'contact' ? p.id : null} initial={p.categories} editable={manage && p.kind === 'contact'} /></span>
                <span role="cell" className="num ell" style={{ padding: '0 8px', color: p.phone ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{p.phone ? <a href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a> : '—'}</span>
                <span role="cell" className="ell" title={contact.title} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', color: 'var(--text-secondary)' }}>{p.lastContact && I.clockMuted}<span>{contact.text}</span></span>
                <span role="cell" title={p.ownerLabel ? `Opiekun: ${p.ownerLabel}` : 'Bez opiekuna'} style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>{p.ownerLabel && <span style={{ width: 20, height: 20, flex: '0 0 auto', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--text-secondary)' }}>{personInitials(p.ownerLabel)}</span>}</span>
              </div>
            );
          })}
          {!data.items.length && <p style={{ margin: 0, padding: '16px 20px', color: 'var(--text-secondary)' }}>{filtered ? 'Nic nie pasuje do wyszukiwania ani widoku. Zmień je albo wróć do wszystkich osób.' : 'Nie ma jeszcze osób. Dodaj osobę kontaktową na karcie firmy albo klienta indywidualnego.'}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 36, padding: '0 20px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--edge)' }}>
        <span className="num">{filtered ? `${data.total} z ${data.all}` : data.total} osób</span>
        <span style={{ display: 'inline-flex', gap: 12 }}>{page > 1 && <Link href={href(page - 1)}>Poprzednia</Link>}<span className="num">Strona {page}</span>{page * 25 < data.total && <Link href={href(page + 1)}>Następna</Link>}</span>
      </div>
    </>
  );
}
