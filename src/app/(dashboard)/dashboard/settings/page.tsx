import { CompanyProfileForm } from '@/components/company-profile-form';
import { companyProfileSchema } from '@hvac/api-client';
import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { roleLabels,type AccessRole } from '@/lib/access/types';
import { ThemeCapsule } from '@/components/theme-switcher';
export default async function SettingsPage(){
 const {db,user,access}=await requireSession(),metadata=user.user_metadata||{},candidate=metadata.full_name||metadata.display_name||metadata.name;
 const name=typeof candidate==='string'&&candidate.trim()?candidate.trim().slice(0,80):(user.email?.split('@')[0]||'Użytkownik');
 let profile=null;if(['admin','office'].includes(access.role)){const result=await db.rpc('company_profile');if(result.error)throw new Error('Nie udało się pobrać profilu firmy.');profile=companyProfileSchema.nullable().parse(result.data);}
 return <main><div className="page-heading"><div><h1>Ustawienia</h1><p>Dane firmy, domyślne oferty, wygląd programu i Twoje konto.</p></div></div>{['admin','office'].includes(access.role)&&<CompanyProfileForm initial={profile} editable={access.role==='admin'}/>}<section className="card settings-appearance"><div><h2>Wygląd aplikacji</h2><p className="muted">Przełącz jasne i ciemne tło. Wybór jest zapamiętywany w tej przeglądarce.</p></div><ThemeCapsule/></section><section className="card"><h2>Twoje konto</h2><dl className="portal-facts"><div><dt>Nazwa użytkownika</dt><dd>{name}</dd></div><div><dt>E-mail</dt><dd>{user.email}</dd></div><div><dt>Rola</dt><dd>{roleLabels[access.role as AccessRole]||access.role}</dd></div></dl><p className="muted">Menu konta otworzysz, klikając profil na dole bocznego panelu.</p>{access.role==='admin'&&<Link href="/dashboard/users">Zarządzaj użytkownikami i dostępem →</Link>}</section></main>;
}
