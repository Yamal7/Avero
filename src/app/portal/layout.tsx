import { OrganizationProvider } from '@/components/organization-context';
import { activeOrganization, organizationsSchema } from '@hvac/api-client';
import { Suspense,type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { PortalShell } from '@/components/portal-shell';
export const metadata={title:'Portal klienta',description:'Twoje instalacje, zgłoszenia i dokumenty w jednym miejscu.'};
export default async function PortalLayout({children}:{children:ReactNode}) {
 const {db,user,access}=await requireSession();
 if(access.role==='technician')redirect('/dashboard');
 const { data, error } = await db.rpc('my_organizations');
 if (error) throw new Error('Nie udało się odczytać aktywnej firmy.');
 const active = activeOrganization(organizationsSchema.parse(data));
 if (!active) throw new Error('Brakuje aktywnej firmy.');
 return <OrganizationProvider key={active.id} id={active.id}><Suspense fallback={<div className="portal-shell"><div className="portal-main">Wczytywanie portalu…</div></div>}><PortalShell email={user.email||'Konto'} preview={access.role!=='client'}>{children}</PortalShell></Suspense></OrganizationProvider>;
}
