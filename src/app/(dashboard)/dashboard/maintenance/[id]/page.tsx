import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { maintenanceDetailSchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { MaintenanceCompletionForm } from '@/components/maintenance-completion';
import { MaintenanceHistoryList } from '@/components/maintenance-history';
export default async function MaintenanceDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{historyPage?:string;protocolPage?:string}>}){
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const query=await searchParams;
 const page=(raw?:string)=>Math.min(100000,Math.max(1,Number.parseInt(raw||'1')||1)),historyPage=page(query.historyPage),protocolPage=page(query.protocolPage),{db}=await requireSession();
 const result=await db.rpc('maintenance_plan_detail',{p_plan:id,p_history_page:historyPage,p_protocol_page:protocolPage});if(result.error?.code==='42501')notFound();if(result.error)throw new Error('Nie udało się pobrać planu przeglądów.');
 const detail=maintenanceDetailSchema.parse({...result.data,apiVersion:'1'}),plan=detail.plan;
 const href=(history:number,protocol:number)=>`?historyPage=${history}&protocolPage=${protocol}`;
 return <main><Link href={`/dashboard/maintenance?installation=${plan.installation_id}&view=all`}>← Plany tej instalacji</Link><div className="page-heading"><div><p className="eyebrow">Wykonanie i historia przeglądów</p><h1>{plan.title}</h1><p>{plan.customer_name} · {plan.installation_type}</p><p>{plan.address}, {plan.city}</p></div><span className="badge">{!plan.parent_active?'Widok archiwalny':plan.active?'Plan aktywny':'Plan wstrzymany'}</span></div><section className="card"><h2>Aktualny plan</h2><p>Następny termin: <strong>{plan.next_due_on}</strong> · cykl co {plan.interval_months} miesięcy</p><p className="muted">Potwierdzenie na podstawie protokołu zapisuje historię i wyznacza następny termin. Samo zatwierdzenie protokołu wizyty nie rozlicza automatycznie wszystkich planów instalacji.</p></section>
 <section className="card"><h2>Potwierdź wykonanie przeglądu</h2>{detail.canComplete?<MaintenanceCompletionForm key={`${plan.id}:${plan.version}:${protocolPage}`} plan={plan} protocols={detail.protocols.items} />:<p className="muted">Potwierdzenie jest dostępne dla administratora i biura, gdy plan jest aktywny, a instalacja i klient nie są archiwalni.</p>}{detail.canComplete&&(detail.protocols.total>20||protocolPage>1)&&<div className="pagination">{protocolPage>1&&<Link href={href(historyPage,protocolPage-1)}>← Nowsze protokoły</Link>}<span>Protokoły — strona {protocolPage}</span>{protocolPage*20<detail.protocols.total&&<Link href={href(historyPage,protocolPage+1)}>Starsze protokoły →</Link>}</div>}</section>
 <section className="card"><h2>Historia wykonanych przeglądów ({detail.history.total})</h2><p className="muted">Daty, nazwa planu i cykl są zachowane z chwili potwierdzenia. Późniejsza edycja planu nie zmienia tych wpisów.</p><MaintenanceHistoryList items={detail.history.items} /><div className="pagination">{historyPage>1&&<Link href={href(historyPage-1,protocolPage)}>← Nowsze wpisy</Link>}<span>Historia — strona {historyPage}</span>{historyPage*20<detail.history.total&&<Link href={href(historyPage+1,protocolPage)}>Starsze wpisy →</Link>}</div></section></main>;
}
