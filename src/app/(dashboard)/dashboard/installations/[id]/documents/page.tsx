import Link from 'next/link';
import { ListHeader,ListTabs } from '@/components/list-layout';
import { notFound,redirect } from 'next/navigation';
import { z } from 'zod';
import { documentListSchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { DocumentUploadForm,ManagedDocumentTable } from '@/components/document-manager';
export default async function InstallationDocuments({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{ticket?:string;page?:string;archived?:string}>}){
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const query=await searchParams;if(query.ticket&&!z.string().uuid().safeParse(query.ticket).success)notFound();
 const {db,access}=await requireSession();if(access.role==='client')redirect('/portal');
 const manager=['admin','office'].includes(access.role),archived=manager&&query.archived==='true',page=Math.min(100000,Math.max(1,Number.parseInt(query.page||'1')||1));
 const {data:installation,error}=await db.from('installations').select('id,type,status,locations!inner(customer_id,address,city,customers!inner(id,name,archived_at))').eq('id',id).maybeSingle();
 if(error)throw new Error('Nie udało się pobrać instalacji.');if(!installation)notFound();
 const detail=installation as unknown as {type:string;status:string;locations:{customer_id:string;address:string;city:string;customers:{name:string;archived_at:string|null}}};
 let ticket:{subject:string;ticket_number:number}|null=null;
 if(query.ticket){const result=await db.from('service_tickets').select('subject,ticket_number').eq('id',query.ticket).eq('installation_id',id).maybeSingle();if(result.error)throw new Error('Nie udało się pobrać zgłoszenia.');if(!result.data)notFound();ticket=result.data;}
 const result=await db.rpc('installation_documents',{p_installation:id,p_ticket:query.ticket||null,p_page:page,p_archived:archived,p_customer:null});if(result.error)throw new Error('Nie udało się pobrać dokumentów.');
 const handovers=await db.rpc('installation_handover_links',{p_installation:id,p_customer:null});if(handovers.error)throw new Error('Nie udało się pobrać protokołów.');const protocols=z.array(z.object({id:z.string().uuid(),number:z.string()})).parse(handovers.data);
 const list=documentListSchema.parse({...result.data,apiVersion:'1',page,pageSize:20});
 const href=(nextPage:number,archive=archived)=>{const params=new URLSearchParams({page:String(nextPage),archived:String(archive)});if(query.ticket)params.set('ticket',query.ticket);return `?${params}`;};
 return <main className="list-page"><Link href={query.ticket?`/dashboard/service/${query.ticket}`:`/dashboard/customers/${detail.locations.customer_id}`}>← {ticket?'Zgłoszenie serwisowe':'Karta klienta'}</Link><ListHeader category={ticket?`Zgłoszenie #${String(ticket.ticket_number).padStart(5,'0')}`:'Dokumentacja instalacji'} title={ticket?'Załączniki zgłoszenia':'Dokumenty instalacji'}/><p>{detail.locations.customers.name} · {detail.type} · {detail.locations.address}, {detail.locations.city}</p>{ticket&&<p>{ticket.subject}</p>}
 {manager&&!archived&&detail.status!=='archived'&&!detail.locations.customers.archived_at&&<details className="card list-create-form"><summary>{ticket?'Dodaj załącznik do zgłoszenia':'Dodaj dokument instalacji'}</summary><DocumentUploadForm installation={id} ticket={query.ticket} /></details>}
 <section className="card"><h2>Protokoły odbioru montażu</h2>{protocols.map(h=><p key={h.id}><Link href={`/dashboard/work-orders/${h.id}/handover`}>{h.number} →</Link></p>)}{!protocols.length&&<p>Brak zatwierdzonych protokołów.</p>}</section><p className="muted">Pliki: {list.total}</p>{manager&&<ListTabs label="Widok dokumentów" items={[{label:'Aktywne',href:href(1,false),active:!archived},{label:'Archiwum',href:href(1,true),active:archived}]}/>}{archived&&<p className="muted">Pliki archiwalne pozostają zachowane. Pobieranie jest zablokowane; przywrócenie ustawia dostęp tylko dla firmy.</p>}{list.documents.length?<ManagedDocumentTable documents={list.documents} editable={manager}/>:<p className="empty">{archived?'Archiwum jest puste.':'Nie dodano jeszcze plików.'}</p>}<div className="pagination">{page>1&&<Link href={href(page-1)}>← Poprzednia</Link>}<span>Strona {page}</span>{page*20<list.total&&<Link href={href(page+1)}>Następna →</Link>}</div>{ticket&&<Link href={`/dashboard/installations/${id}/documents`}>Wszystkie dokumenty tej instalacji →</Link>}</main>;
}
