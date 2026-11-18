/* Firmy i osoby — ported 1:1 from the design artboard "Firmy · tabela" (inline styles copied from the rendered design). */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { customerDirectorySchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { DI, personInitials } from '@/components/design-icons';
import { catalogMoney } from '@/lib/catalog/format';

const sv = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, style: { flex: '0 0 auto' } };
const I = {
  building16: <svg {...sv} width={16} height={16}><path key="1" d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path key="2" d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" /></svg>,
  download: <svg {...sv}><path key="1" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>,
  search: <svg {...sv}><circle key="1" cx="11" cy="11" r="8" /><path key="2" d="m21 21-4.3-4.3" /></svg>,
  firm: <svg {...sv}><path key="1" d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path key="2" d="M10 6h4M10 10h4M10 14h4M10 18h4" /></svg>,
  person: <svg {...sv}><circle key="1" cx="12" cy="8" r="4" /><path key="2" d="M4 21a8 8 0 0 1 16 0" /></svg>,
  tag: <svg {...sv}><path key="1" d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle key="2" cx="7.5" cy="7.5" r=".5" fill="currentColor" /></svg>,
  pin: <svg {...sv}><path key="1" d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle key="2" cx="12" cy="10" r="3" /></svg>,
  cube: <svg {...sv}><path key="1" d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path key="2" d="m3.3 7 8.7 5 8.7-5M12 22V12" /></svg>,
  contract: <svg {...sv}><path key="1" d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path key="2" d="M14 2v4a2 2 0 0 0 2 2h4M9 15l2 2 4-4" /></svg>,
  clock: <svg {...sv}><circle key="1" cx="12" cy="12" r="10" /><path key="2" d="M12 6v6l4 2" /></svg>,
  coins: <svg {...sv}><circle key="1" cx="8" cy="8" r="6" /><path key="2" d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82" /></svg>,
  clockMuted: <svg {...sv} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><circle key="1" cx="12" cy="12" r="10" /><path key="2" d="M12 6v6l4 2" /></svg>,
};
const palette = ['rgb(59, 130, 214)', 'rgb(31, 167, 165)', 'rgb(155, 107, 224)', 'rgb(224, 112, 42)', 'rgb(47, 158, 91)', 'rgb(201, 138, 18)'];
const categoryColor = (name: string) => { let h = 0; for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return palette[h % palette.length]; };
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

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; archived?: string; kind?: string }> }) {
  const params = await searchParams;
  const q = (params.q || '').trim().slice(0, 200), archived = params.archived === '1', kind = params.kind === 'individual' ? 'individual' : 'company', people = kind === 'individual';
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page || '1', 10) || 1));
  const { db } = await requireSession();
  const [dir, staff] = await Promise.all([db.rpc('customer_directory', { p_search: q, p_archived: archived, p_kind: kind, p_page: page }), db.rpc('can_manage_crm')]);
  if (dir.error) throw new Error('Nie udało się pobrać listy. Sprawdź połączenie i migracje Supabase.');
  const data = customerDirectorySchema.parse(dir.data), manage = staff.data === true, now = new Date();
  const href = (patch: Record<string, string>) => `/dashboard/customers?${new URLSearchParams({ ...(q ? { q } : {}), kind, ...(archived ? { archived: '1' } : {}), ...patch })}`;
  const grid = cols(people);

  return (
    <main className="dk" style={{ flex: '1 1 auto', minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px 0 20px' }}>
        <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{I.building16}</span>
        <span style={{ color: 'var(--text-secondary)' }}>Klienci</span>
        <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}>{DI.chev}</span>
        <h1 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Firmy i osoby</h1>
        <div role="tablist" aria-label="Rodzaj rekordów" style={{ display: 'inline-flex', gap: 2, padding: 2, marginLeft: 8, borderRadius: 10, background: 'var(--bg-subtle)' }}>
          <Link role="tab" aria-selected={!people} href={`/dashboard/customers?${new URLSearchParams({ kind: 'company', ...(archived ? { archived: '1' } : {}) })}`} style={kindTab(!people)}>Firmy<span className="num" style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{data.counts.company}</span></Link>
          <Link role="tab" aria-selected={people} href={`/dashboard/customers?${new URLSearchParams({ kind: 'individual', ...(archived ? { archived: '1' } : {}) })}`} style={kindTab(people)}>Osoby<span className="num" style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{data.counts.individual}</span></Link>
        </div>
        <span style={{ flex: '1 1 auto' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: '8px 12px 8px 16px' }}>
        <div role="tablist" aria-label="Zapisane widoki" style={{ display: 'flex', gap: 4 }}>
          <Link role="tab" aria-selected={!archived} className="tab" href={`/dashboard/customers?${new URLSearchParams({ kind })}`} style={tab(!archived)}>{people ? 'Wszystkie osoby' : 'Wszystkie firmy'}</Link>
          <Link role="tab" aria-selected={archived} className="tab" href={`/dashboard/customers?${new URLSearchParams({ kind, archived: '1' })}`} style={tab(archived)}>Zarchiwizowane</Link>
        </div>
        <span style={{ flex: '1 1 auto' }} />
        {manage && <Link href="/dashboard/customers/import" className="sec" title="Import CSV" style={{ height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px 0 8px', marginLeft: 4, border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontWeight: 500 }}>{I.download}Import</Link>}
        {manage && <Link href="/dashboard/customers/new" className="pri" title={people ? 'Nowa osoba' : 'Nowa firma'} style={{ height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px 0 8px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500 }}>{DI.plus14}<span>{people ? 'Nowa osoba' : 'Nowa firma'}</span></Link>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '0 12px 8px 16px' }}>
        <form action="/dashboard/customers" role="search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 8px', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 12 }}>
          <input type="hidden" name="kind" value={kind} />{archived && <input type="hidden" name="archived" value="1" />}
          <span style={{ display: 'inline-flex', color: 'var(--text-secondary)' }}>{I.search}</span>
          <label htmlFor="customer-search" className="vh">Szukaj klienta, adresu lub kategorii</label>
          <input id="customer-search" type="search" name="q" defaultValue={q} maxLength={200} placeholder="Szukaj klienta, adresu lub kategorii" style={{ width: 260, height: 24, minHeight: 0, padding: 0, border: 0, background: 'transparent', boxShadow: 'none', font: 'inherit', fontSize: 12, color: 'var(--text-primary)' }} />
        </form>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 8px', fontSize: 12, color: 'var(--text-secondary)' }}>Sortowanie: <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Nazwa</span></span>
      </div>
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
                  {shown.map(cat => <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 6px', borderRadius: 6, background: `color-mix(in srgb, ${categoryColor(cat)} 16%, transparent 84%)`, color: 'var(--text-primary)', fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' }}>{cat}</span>)}
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
          {!data.items.length && <p style={{ margin: 0, padding: '16px 20px', color: 'var(--text-secondary)' }}>{q ? 'Nic nie pasuje do wyszukiwania. Zmień frazę albo wyczyść wyszukiwanie.' : archived ? 'Brak zarchiwizowanych rekordów.' : people ? 'Nie ma jeszcze osób prywatnych.' : 'Nie ma jeszcze firm. Dodaj pierwszą firmę, a potem jej lokalizację i urządzenia.'}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 36, padding: '0 20px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--edge)' }}>
        <span className="num">{data.total} {people ? 'osób' : 'firm'}{archived ? ' w archiwum' : ''}</span>
        <span style={{ display: 'inline-flex', gap: 12 }}>{page > 1 && <Link href={href({ page: String(page - 1) })}>Poprzednia</Link>}<span className="num">Strona {page}</span>{page * 25 < data.total && <Link href={href({ page: String(page + 1) })}>Następna</Link>}</span>
      </div>
    </main>
  );
}
