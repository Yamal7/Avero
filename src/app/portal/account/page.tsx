import { requirePortalContext } from '@/lib/portal/context';
import type { PortalAccount } from '@/lib/portal/types';
import { PortalContextPicker,PortalHeading,PortalNoScope } from '@/components/portal-ui';
import { logout } from '@/app/(dashboard)/dashboard/actions';
export default async function PortalAccountPage({searchParams}:{searchParams:Promise<{customer?:string;customerSearch?:string}>}) {
 const params=await searchParams,{db,user,scope,choices}=await requirePortalContext(params.customer,params.customerSearch);const picker=<PortalContextPicker scope={scope} choices={choices} search={params.customerSearch} />;
 let account:PortalAccount|null=null;
 if(scope.customer){const {data,error}=await db.rpc('portal_account',{p_customer:scope.customer.id});if(error)throw new Error('Nie udało się pobrać danych klienta.');account=data as PortalAccount;}
 return <>{picker}<PortalHeading eyebrow="Twoje dane" title="Moje konto"><p>Zarządzaj sesją i sprawdź dane przypisane do Twojego konta.</p></PortalHeading><section className="portal-card"><h2>Logowanie</h2><dl className="portal-facts"><div><dt>Adres e-mail konta</dt><dd>{user.email}</dd></div><div><dt>Potwierdzenie adresu</dt><dd>{user.email_confirmed_at?'Adres potwierdzony':'Adres niepotwierdzony'}</dd></div></dl><form action={logout}><button className="secondary">Wyloguj się</button></form></section>{account?<section className="portal-card"><h2>Dane klienta w firmie</h2><dl className="portal-facts"><div><dt>Nazwa</dt><dd>{account.name}</dd></div><div><dt>Typ</dt><dd>{account.type==='company'?'Firma':'Osoba prywatna'}</dd></div><div><dt>E-mail kontaktowy</dt><dd>{account.email||'Nie podano'}</dd></div><div><dt>Telefon kontaktowy</dt><dd>{account.phone||'Nie podano'}</dd></div></dl><p className="muted">Jeśli dane wymagają korekty, skontaktuj się z firmą obsługującą Twoją instalację.</p></section>:<PortalNoScope preview={scope.preview} headingLevel={2} />}</>;
}
