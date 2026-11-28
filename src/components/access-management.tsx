'use client';
import { useOrganizationId } from '@/components/organization-context';
import { useState, type FormEvent } from 'react';
import { RecordActions } from '@/components/record-actions';
import { useRouter } from 'next/navigation';
import { assignCustomer, changeBlocked, changeRole, findAccessCustomers, inviteAccount, retryInvitation, revokeInvitation } from '@/app/(dashboard)/dashboard/users/actions';
import { roleLabels, type AccessActionResult, type AccessLog, type AccessRole, type AccessUser, type CustomerOption, type Invitation } from '@/lib/access/types';

function Result({ result }: { result: AccessActionResult }) {
  return <>{result.error && <p role="alert" className="error">{result.error}</p>}{result.success && <p role="status" className="success">{result.success}</p>}</>;
}
function CustomerPicker({ options, selected, onChange, disabled, required = false }: { options: CustomerOption[]; selected: string; onChange: (id: string) => void; disabled: boolean; required?: boolean }) {
  const organizationId = useOrganizationId();
  const [choices, setChoices] = useState(options), [query, setQuery] = useState(''), [loading, setLoading] = useState(false);
  async function search() {
    setLoading(true);
    try { const results = await findAccessCustomers(query, organizationId); setChoices(results); if (!results.some(row => row.id === selected)) onChange(''); }
    finally { setLoading(false); }
  }
  return <div className="customer-picker"><div className="picker-search"><label>Szukaj klienta<input value={query} maxLength={200} disabled={disabled || loading} onChange={e => setQuery(e.target.value)} placeholder="Nazwa klienta" /></label><button type="button" className="secondary" onClick={search} disabled={disabled || loading}>{loading ? 'Szukanie…' : 'Wyszukaj'}</button></div><label>Przypisz klienta{required ? ' *' : ''}<select value={selected} onChange={e => onChange(e.target.value)} disabled={disabled || loading} required={required}><option value="">{required ? 'Wybierz klienta' : 'Bez przypisania'}</option>{choices.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label><p className="muted">Lista zawiera do 50 wyników. Wyszukaj nazwę, aby znaleźć pozostałych klientów.</p></div>;
}
export function InvitationForm({ customers }: { customers: CustomerOption[] }) {
  const organizationId = useOrganizationId();
  const [role, setRole] = useState<AccessRole>('client'), [customer, setCustomer] = useState('');
  const [busy, setBusy] = useState(false), [result, setResult] = useState<AccessActionResult>({});
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setBusy(true); setResult({});
    try {
      const outcome = await inviteAccount({ email: data.get('email'), role, customerId: ['client', 'technician'].includes(role) ? customer || null : null }, organizationId);
      setResult(outcome);
      if (outcome.success) { form.reset(); setCustomer(''); setRole('client'); }
      router.refresh();
    } catch { setResult({ error: 'Nie udało się wysłać zaproszenia. Sprawdź jego status przed ponowieniem.' }); }
    finally { setBusy(false); }
  }
  return <section className="card"><h2>Zaproś użytkownika</h2><p className="muted">Odbiorca potwierdzi adres e-mail i przyjmie wskazany dostęp. Zaproszenie jest ważne przez 7 dni; link logowania z wiadomości ma osobny termin ważności.</p><form onSubmit={submit}><div className="fields"><label>Adres e-mail<input name="email" type="email" maxLength={320} required disabled={busy} autoComplete="off" /></label><label>Rola<select value={role} onChange={e => { setRole(e.target.value as AccessRole); setCustomer(''); }} disabled={busy}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>{['client', 'technician'].includes(role) && <CustomerPicker options={customers} selected={customer} onChange={setCustomer} disabled={busy} required={role === 'client'} />}<label className="checkbox access-confirm"><input type="checkbox" required disabled={busy} />Potwierdzam adres odbiorcy, wybraną rolę i zakres dostępu.</label><Result result={result} /><button disabled={busy}>{busy ? 'Wysyłanie…' : 'Wyślij zaproszenie'}</button></form></section>;
}
function UserCard({ user, customers, currentUser }: { user: AccessUser; customers: CustomerOption[]; currentUser: string }) {
  const organizationId = useOrganizationId();
  const [role, setRole] = useState<AccessRole>(user.role), [customer, setCustomer] = useState('');
  const [busy, setBusy] = useState(false), [result, setResult] = useState<AccessActionResult>({});
  const router = useRouter();
  async function run(operation: () => Promise<AccessActionResult>) {
    setBusy(true); setResult({});
    try { const outcome = await operation(); setResult(outcome); if (outcome.success) router.refresh(); }
    catch { setResult({ error: 'Nie udało się potwierdzić zmiany. Odśwież listę przed ponowieniem.' }); }
    finally { setBusy(false); }
  }
  function saveRole(event: FormEvent<HTMLFormElement>) { event.preventDefault(); run(() => changeRole(user.id, role, organizationId)); }
  function saveBlocked(event: FormEvent<HTMLFormElement>) { event.preventDefault(); run(() => changeBlocked(user.id, !user.blocked, organizationId)); }
  return <article className="access-user"><div className="section-heading"><div><h3>{user.email}</h3><p className="muted">{roleLabels[user.role]}{currentUser === user.id ? ' · Twoje konto' : ''}{!user.email_confirmed_at ? ' · E-mail niepotwierdzony' : ''}</p></div><span className={`badge ${user.blocked ? 'import-status-invalid' : 'import-status-ready'}`}>{user.blocked ? 'Dostęp zablokowany' : 'Dostęp aktywny'}</span></div><Result result={result} /><details><summary>Zmień rolę lub dostęp</summary><div className="access-settings"><form onSubmit={saveRole}><label>Nowa rola<select value={role} disabled={busy} onChange={e => setRole(e.target.value as AccessRole)}>{Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="checkbox access-confirm"><input required type="checkbox" disabled={busy} />Potwierdzam zmianę roli tego konta.</label><button className="secondary" disabled={busy || role === user.role}>Zapisz rolę</button></form><form onSubmit={saveBlocked}><p>{user.blocked ? 'Przywrócenie dostępu zachowa przypisania i rolę konta.' : 'Blokada od razu odetnie dostęp do danych programu, także w istniejącej sesji.'}</p><label className="checkbox access-confirm"><input required type="checkbox" disabled={busy} />Potwierdzam {user.blocked ? 'przywrócenie' : 'zablokowanie'} dostępu.</label><button className="secondary" disabled={busy}>{user.blocked ? 'Przywróć dostęp' : 'Zablokuj dostęp'}</button></form></div><p className="muted">Nie można zablokować ani pozbawić roli ostatniego aktywnego administratora.</p></details><details><summary>Przypisani klienci ({user.customers.length})</summary>{user.customers.length ? <ul className="access-assignments">{user.customers.map(item => <li key={`${item.kind}-${item.id}`}><span>{item.name}<small>{item.kind === 'technician' ? 'Przypisanie technika' : 'Członkostwo klienta'}</small></span><button className="secondary" disabled={busy} onClick={() => run(() => assignCustomer(user.id, item.id, item.kind, true, organizationId))} aria-label={`Odbierz przypisanie: ${item.name}`}>Odbierz dostęp</button></li>)}</ul> : <p className="muted">Brak indywidualnych przypisań. Administrator i biuro mają dostęp do całego CRM.</p>}{['client', 'technician'].includes(user.role) && <form onSubmit={e => { e.preventDefault(); run(() => assignCustomer(user.id, customer, user.role === 'technician' ? 'technician' : 'member', false, organizationId)); }}><CustomerPicker options={customers} selected={customer} onChange={setCustomer} disabled={busy} required /><label className="checkbox access-confirm"><input required type="checkbox" disabled={busy} />Potwierdzam przypisanie tego klienta do konta {user.email}.</label><button disabled={busy || !customer}>Przypisz klienta</button></form>}</details></article>;
}
export function UserList({ users, customers, currentUser }: { users: AccessUser[]; customers: CustomerOption[]; currentUser: string }) {
  return <div className="list-table table-scroll"><table aria-label="Konta użytkowników"><thead><tr><th>Użytkownik</th><th>Rola</th><th>Status</th><th>Przypisani klienci</th><th><span className="sr-only">Działania</span></th></tr></thead><tbody>{users.map(user=><tr key={user.id}><td><strong className="list-record-title">{user.email}</strong><span className="list-record-subtitle">{currentUser===user.id?'Twoje konto':user.email_confirmed_at?'E-mail potwierdzony':'E-mail niepotwierdzony'}</span></td><td>{roleLabels[user.role]}</td><td><span className={`badge ${user.blocked?'import-status-invalid':'list-status-success'}`}>{user.blocked?'Zablokowany':'Aktywny'}</span></td><td>{['admin','office'].includes(user.role)?'Cały CRM':user.customers.length}</td><td className="list-actions"><RecordActions label={user.email}><UserCard key={`${user.id}-${user.role}-${user.blocked}-${user.customers.map(c=>c.id+c.kind).join()}`} user={user} customers={customers} currentUser={currentUser}/></RecordActions></td></tr>)}</tbody></table>{!users.length&&<p className="empty">Nie znaleziono kont.</p>}</div>;
}
export function InvitationList({ invitations }: { invitations: Invitation[] }) {
  const organizationId = useOrganizationId();
  const [busy, setBusy] = useState(false), [result, setResult] = useState<AccessActionResult>({});
  const router = useRouter();
  async function run(id: string, revoke: boolean) {
    setBusy(true); setResult({});
    try { setResult(await (revoke ? revokeInvitation(id, organizationId) : retryInvitation(id, organizationId))); router.refresh(); }
    catch { setResult({ error: 'Nie udało się potwierdzić operacji. Sprawdź status zaproszenia.' }); }
    finally { setBusy(false); }
  }
  const deliveryLabels = { prepared: 'Przygotowano', sending: 'Wysyłanie', sent: 'Przekazano do usługi pocztowej', failed: 'Błąd wysyłki' };
  return <section className="card"><h2>Ostatnie zaproszenia</h2><Result result={result} />{invitations.length ? invitations.map(invitation => {
    const expired = new Date(invitation.expires_at).getTime() < Date.now();
    return <article key={invitation.id} className="access-invitation"><strong>{invitation.email}</strong><p>{roleLabels[invitation.role]}{invitation.customer_name ? ` · ${invitation.customer_name}` : ''}</p><p className="muted">{invitation.status === 'accepted' ? 'Przyjęte' : invitation.status === 'revoked' ? 'Unieważnione' : expired ? 'Wygasłe' : `Oczekujące · ${deliveryLabels[invitation.delivery_status]}`}</p>{invitation.status === 'pending' && <div className="button-group">{!expired && <button className="secondary" onClick={() => run(invitation.id, false)} disabled={busy}>Ponów wysyłkę</button>}<button className="secondary" onClick={() => run(invitation.id, true)} disabled={busy}>Unieważnij zaproszenie</button></div>}</article>;
  }) : <p className="muted">Nie wysłano jeszcze zaproszeń.</p>}</section>;
}
const actionLabels: Record<string, string> = { staff_users: 'Rola pracownika', account_access: 'Blokada dostępu', customer_memberships: 'Członkostwo klienta', staff_customer_assignments: 'Przypisanie technika', access_invitations: 'Zaproszenie' };
export function AccessHistory({ logs }: { logs: AccessLog[] }) {
  return <section className="card"><h2>Historia zmian dostępu</h2><p className="muted">Ostatnie 50 zdarzeń. Zapisy obejmują nadania ról, przypisania, blokady i obsługę zaproszeń.</p>{logs.length ? <div className="table-scroll"><table><thead><tr><th>Kiedy / kto</th><th>Konto</th><th>Zmiana</th></tr></thead><tbody>{logs.map(log => <tr key={log.id}><td>{new Date(log.happened_at).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}<br /><span className="muted">{log.actor_email || 'Konfiguracja systemu'}</span></td><td>{log.target_email || '—'}</td><td>{actionLabels[log.action.split(':')[0]] || log.action}<details><summary>Szczegóły</summary><pre className="audit-details">{JSON.stringify({ przed: log.old_data, po: log.new_data }, null, 2)}</pre></details></td></tr>)}</tbody></table></div> : <p className="muted">Brak zmian dostępu.</p>}</section>;
}
