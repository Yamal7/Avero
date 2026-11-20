import { Suspense,type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { PortalShell } from '@/components/portal-shell';
export const metadata={title:'Portal klienta',description:'Twoje instalacje, zgłoszenia i dokumenty w jednym miejscu.'};
export default async function PortalLayout({children}:{children:ReactNode}) {
 const {user,access}=await requireSession();
 if(access.role==='technician')redirect('/dashboard');
 return <Suspense fallback={<div className="portal-shell"><div className="portal-main">Wczytywanie portalu…</div></div>}><PortalShell email={user.email||'Konto'} preview={access.role!=='client'}>{children}</PortalShell></Suspense>;
}
