import Link from 'next/link';
import { requirePortalContext } from '@/lib/portal/context';
import { portalHref } from '@/lib/portal/routes';
import type { PortalVisit } from '@/lib/portal/types';
import { PortalContextPicker,PortalEmpty,PortalHeading,PortalNoScope,PortalPager,PortalVisitCard } from '@/components/portal-ui';
export default async function PortalVisitsPage({searchParams}:{searchParams:Promise<{customer?:string;customerSearch?:string;view?:string;page?:string}>}) {
 const params=await searchParams,{db,scope,choices}=await requirePortalContext(params.customer,params.customerSearch);const picker=<PortalContextPicker scope={scope} choices={choices} search={params.customerSearch} />;
 if(!scope.customer)return <>{picker}<PortalNoScope preview={scope.preview} /></>;
 const id=scope.customer.id,view=params.view==='history'?'history':'active',page=Math.min(100000,Math.max(1,Number.parseInt(params.page||'1')||1));
 const {data,error}=await db.rpc('portal_visits',{p_customer:id,p_view:view,p_page:page});if(error)throw new Error('Nie udało się pobrać wizyt.');const visits=data.visits as PortalVisit[];
 return <>{picker}<PortalHeading eyebrow="TERMINY SERWISU" title="Moje wizyty"><p>Zaplanowane wizyty i historia wykonanych prac. Godziny według czasu Warszawy.</p></PortalHeading><div className="portal-tabs"><Link href={portalHref('/portal/service',id)}>Zgłoszenia</Link><Link className="active" aria-current="page" href={portalHref('/portal/visits',id)}>Wizyty</Link></div><form action="/portal/visits" className="portal-search"><input type="hidden" name="customer" value={id} /><label>Pokaż wizyty<select name="view" defaultValue={view}><option value="active">Zaplanowane i w trakcie</option><option value="history">Zakończone i odwołane</option></select></label><button className="secondary">Pokaż</button></form>{visits.length?<div className="portal-grid">{visits.map(visit=><PortalVisitCard key={visit.id} visit={visit} customer={id} />)}</div>:<PortalEmpty icon="calendar" title="Brak wizyt w tym widoku"><p>Ustalone terminy pojawią się tutaj wraz ze statusem obsługi.</p></PortalEmpty>}<PortalPager page={page} total={data.total} href={value=>portalHref('/portal/visits',id,{view,page:String(value)})} /></>;
}
