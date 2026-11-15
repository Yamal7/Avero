import Link from 'next/link';
import { ListHeader,ListSearch,ListTabs,ListTable } from '@/components/list-layout';
import { RecordActions } from '@/components/record-actions';
import { Icon } from '@/components/icon';
import { requireSession } from '@/lib/auth';

type Row = { id: string; name: string; email: string | null; phone: string | null; type: string };
export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; archived?: string }> }) {
  const params = await searchParams;
  const q = (params.q || '').trim().slice(0, 200);
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page || '1', 10) || 1));
  const archived = params.archived === '1';
  const { db } = await requireSession();
  const [{ data, error, count }, { data: staff }] = await Promise.all([
    db.rpc('search_customers', { search_text: q, show_archived: archived }, { count: 'exact' }).range((page - 1) * 25, page * 25 - 1),
    db.rpc('can_manage_crm'),
  ]);
  if (error) throw new Error('Nie udało się pobrać listy. Sprawdź połączenie i migracje Supabase.');
  const href = (p: number) => `/dashboard/customers?${new URLSearchParams({ q, page: String(p), archived: archived ? '1' : '0' })}`;
  return <main className="list-page"><ListHeader category="Relacje" title="Klienci">{staff === true && <><Link className="button secondary" href="/dashboard/customers/import">Importuj CSV</Link><Link className="button" href="/dashboard/customers/new"><Icon name="plus" size={19}/>Dodaj klienta</Link></>}</ListHeader>
    <div className="list-toolbar"><ListSearch action="/dashboard/customers" value={q} placeholder="Szukaj klienta, adresu lub numeru seryjnego" hidden={{archived:archived?'1':'0'}}/><ListTabs label="Status klientów" items={[false,true].map(value=>({label:value?'Zarchiwizowani':'Aktywni',active:value===archived,href:`/dashboard/customers?${new URLSearchParams({q,archived:value?'1':'0'})}`}))}/></div>
    <ListTable label="Lista klientów"><thead><tr><th>Klient</th><th>Kontakt</th><th>Typ</th><th>Status</th><th><span className="sr-only">Działania</span></th></tr></thead><tbody>{(data as Row[]).map(c=><tr key={c.id}><td><Link className="list-record-title" href={`/dashboard/customers/${c.id}`}>{c.name}</Link><span className="list-record-subtitle">{c.type==='company'?'Klient firmowy':'Klient indywidualny'}</span></td><td>{c.email||'—'}<span className="list-record-subtitle">{c.phone||'Brak telefonu'}</span></td><td>{c.type==='company'?'Firma':'Osoba prywatna'}</td><td><span className={`badge ${archived?'neutral-badge':'list-status-success'}`}>{archived?'Zarchiwizowany':'Aktywny'}</span></td><td className="list-actions"><RecordActions label={c.name}><Link href={`/dashboard/customers/${c.id}`}>Otwórz kartę klienta<Icon name="arrow" size={18}/></Link></RecordActions></td></tr>)}</tbody></ListTable>
    {!data?.length&&<div className="list-empty"><Icon name="users" size={30}/><h2>Nie znaleziono klientów</h2><p>Dodaj klienta lub zmień kryteria wyszukiwania.</p></div>}
    <div className="list-footer"><span className="muted">Wyniki: {count??0}</span><div className="pagination">{page>1&&<Link href={href(page-1)}>← Poprzednia</Link>}<span>Strona {page}</span>{page*25<(count??0)&&<Link href={href(page+1)}>Następna →</Link>}</div></div></main>;
}
