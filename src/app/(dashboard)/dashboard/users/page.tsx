import Link from 'next/link';
import { OpenDetails } from '@/components/open-details';
import { ListHeader,ListSearch } from '@/components/list-layout';
import { Icon } from '@/components/icon';
import { requireSession } from '@/lib/auth';
import { AccessHistory, InvitationForm, InvitationList, UserList } from '@/components/access-management';
import type { AccessLog, AccessUser, CustomerOption, Invitation } from '@/lib/access/types';
export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { db, user } = await requireSession();
  const { data: admin } = await db.rpc('is_admin');
  if (admin !== true) return <main className="card"><h1>Dostęp dla administratorów</h1><p>Zarządzanie kontami i uprawnieniami jest dostępne wyłącznie dla administratora firmy.</p><Link href="/dashboard">Wróć do pulpitu</Link></main>;
  const params = await searchParams;
  const query = (params.q || '').trim().slice(0, 200), page = Math.min(100000, Math.max(1, Number.parseInt(params.page || '1') || 1));
  const [accounts, activity, customers] = await Promise.all([
    db.rpc('list_access_users', { p_search: query, p_page: page }),
    db.rpc('list_access_activity'),
    db.rpc('search_customers', { search_text: '', show_archived: false }).select('id,name').limit(50),
  ]);
  if ([accounts, activity, customers].some(result => result.error)) throw new Error('Nie udało się pobrać ustawień dostępu.');
  const link = (value: number) => `/dashboard/users?${new URLSearchParams({ q: query, page: String(value) })}`;
  return <main className="list-page"><ListHeader category="Administracja" title="Użytkownicy"><OpenDetails id="invite-user"><Icon name="plus" size={19}/>Zaproś użytkownika</OpenDetails></ListHeader><div className="list-toolbar"><ListSearch action="/dashboard/users" value={query} placeholder="Szukaj użytkownika po e-mailu"/></div><p className="muted">Konta: {accounts.data.total}</p><UserList users={accounts.data.users as AccessUser[]} currentUser={user.id} customers={customers.data as CustomerOption[]} /><div className="pagination">{page > 1 && <Link href={link(page-1)}>← Poprzednia</Link>}<span>Strona {page}</span>{page*25<accounts.data.total && <Link href={link(page+1)}>Następna →</Link>}</div><section className="card access-role-guide"><h2>Zakres ról</h2><p><strong>Administrator:</strong> cały CRM i zarządzanie dostępem. <strong>Biuro:</strong> zarządzanie CRM i import. <strong>Technik:</strong> odczyt przypisanych klientów i instalacji oraz obsługa własnych wizyt. <strong>Klient:</strong> odczyt własnych danych i dokumentów udostępnionych przez firmę.</p></section><details className="card list-create-form" id="invite-user"><summary>Zaproś użytkownika</summary><InvitationForm customers={customers.data as CustomerOption[]} /></details><InvitationList invitations={activity.data.invitations as Invitation[]} /><AccessHistory logs={activity.data.logs as AccessLog[]} /></main>;
}
