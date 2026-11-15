'use client';
import { useTransition,type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname,useRouter,useSearchParams } from 'next/navigation';
import { ThemeCapsule } from './theme-switcher';
import { AppLogo } from './app-logo';
import { Icon,type IconName } from './icon';
import { portalHref,portalSection } from '@/lib/portal/routes';
const tabs:{key:string;path:string;label:string;icon:IconName}[]=[
 {key:'home',path:'/portal',label:'Start',icon:'home'},
 {key:'offers',path:'/portal/offers',label:'Oferty',icon:'file'},
 {key:'installations',path:'/portal/installations',label:'Instalacje',icon:'device'},
 {key:'service',path:'/portal/service',label:'Serwis',icon:'calendar'},
 {key:'documents',path:'/portal/documents',label:'Dokumenty',icon:'file'},
 {key:'account',path:'/portal/account',label:'Konto',icon:'users'},
];
export function PortalShell({children,email,preview}:{children:ReactNode;email:string;preview:boolean}) {
 const pathname=usePathname(),params=useSearchParams(),customer=params.get('customer');
 const active=portalSection(pathname),router=useRouter();const [pending,startTransition]=useTransition();
 return <div className="portal-shell"><a className="sr-only portal-skip no-print" href="#portal-content">Przejdź do treści</a><header className="portal-topbar no-print"><Link className="portal-brand" href={portalHref('/portal',customer)}><AppLogo size={28}/><span>Portal klienta</span></Link><div className="portal-topbar-actions"><ThemeCapsule/><button className="portal-refresh" disabled={pending} onClick={()=>startTransition(()=>router.refresh())} aria-label="Odśwież dane portalu">{pending?'Odświeżanie…':'Odśwież'}</button><Link className="portal-avatar" href={portalHref('/portal/account',customer)} aria-label="Moje konto">{email.slice(0,2).toUpperCase()}</Link></div></header>{preview&&<div className="portal-preview-banner no-print"><span>Podgląd portalu klienta · tylko do odczytu</span><Link href="/dashboard">Wróć do panelu firmy →</Link></div>}<main id="portal-content" className="portal-main">{children}</main><nav className="portal-bottom-nav no-print" aria-label="Nawigacja portalu klienta">{tabs.map(tab=><Link key={tab.key} href={portalHref(tab.path,customer)} className={`portal-nav-item${active===tab.key?' active':''}`} aria-current={active===tab.key?'page':undefined}><Icon name={tab.icon} size={22} /><span>{tab.label}</span></Link>)}</nav></div>;
}
