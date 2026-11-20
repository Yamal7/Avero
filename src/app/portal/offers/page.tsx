import Link from 'next/link';
import { portalOffersSchema,publicationLabels } from '@hvac/api-client';
import { requirePortalContext } from '@/lib/portal/context';
import { portalHref } from '@/lib/portal/routes';
import { PortalContextPicker,PortalEmpty,PortalHeading,PortalNoScope,PortalPager } from '@/components/portal-ui';
import { catalogMoney } from '@/lib/catalog/format';
export default async function PortalOffers({searchParams}:{searchParams:Promise<{customer?:string;customerSearch?:string;page?:string}>}){
 const params=await searchParams,{db,scope,choices}=await requirePortalContext(params.customer,params.customerSearch),picker=<PortalContextPicker scope={scope} choices={choices} search={params.customerSearch}/>;
 if(!scope.customer)return <>{picker}<PortalNoScope preview={scope.preview}/></>;
 const customer=scope.customer.id,page=Math.min(100000,Math.max(1,Number.parseInt(params.page||'1')||1)),result=await db.rpc('portal_offers',{p_customer:customer,p_page:page});
 if(result.error)throw new Error('Nie udało się pobrać ofert.');const list=portalOffersSchema.parse(result.data);
 return <>{picker}<PortalHeading eyebrow="Propozycje dla ciebie" title="Moje oferty"><p>Porównaj warianty, pobierz PDF i wybierz zakres realizacji.</p></PortalHeading>{list.items.length?<div className="portal-grid">{list.items.map(p=><Link className="portal-card portal-record" key={p.id} href={portalHref(`/portal/offers/${p.id}`,customer)}><div className="portal-record-top"><span className="muted">{p.number} · wersja {p.revision}</span><span className="badge">{p.expired&&p.state==='published'?'Termin minął':publicationLabels[p.state]}</span></div><h2>{p.title}</h2><p><strong>{catalogMoney(p.grossCents)} brutto</strong><br/><span className="muted">{p.state==='accepted'?'Wybrany wariant':'Cena wariantu głównego'} · ważna do {p.validUntil.split('-').reverse().join('.')}</span></p><span>Otwórz ofertę →</span></Link>)}</div>:<PortalEmpty title="Nie masz jeszcze ofert"><p>Oferty udostępnione przez firmę pojawią się w tym miejscu.</p></PortalEmpty>}<PortalPager page={page} total={list.total} href={p=>portalHref('/portal/offers',customer,{page:String(p)})}/></>;
}
