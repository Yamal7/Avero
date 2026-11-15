import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getServiceTicket } from '@/lib/service/data';
import { displayDateTime } from '@/lib/service/dates';
import { priorityLabels,ticketLabels,visitLabels,type Technician } from '@/lib/service/types';
import { AssignServiceTechnician,ScheduleVisit,ServiceProtocolForm,TicketStatusForm,VisitActions } from '@/components/service-forms';
export default async function TicketPage({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;if(!z.string().uuid().safeParse(id).success) notFound();
 const ticket=await getServiceTicket(id);if(!ticket) notFound();
 const {db}=await requireSession();const [manager,editor]=await Promise.all([db.rpc('can_manage_crm'),db.rpc('can_edit_service_ticket',{p_ticket:id})]);
 if(manager.error||editor.error) throw new Error('Nie udało się sprawdzić dostępu do zgłoszenia.');
 const canManage=manager.data===true, canEdit=editor.data===true;
 let technicians:Technician[]=[];
 if(canManage) { const {data,error}=await db.rpc('service_technicians',{p_customer:ticket.customer_id});if(error) throw new Error('Nie udało się pobrać techników.');technicians=data as Technician[]; }
 const visits=[...ticket.service_visits].sort((a,b)=>(a.scheduled_at||'').localeCompare(b.scheduled_at||''));
 const location=ticket.installations.locations;
 return <main><Link href="/dashboard/service">← Zgłoszenia serwisowe</Link><div className="page-heading"><div><p className="eyebrow">ZGŁOSZENIE #{String(ticket.ticket_number).padStart(5,'0')}</p><h1>{ticket.subject}</h1><p>{ticket.customers.name} · {ticket.installations.type}</p></div><div className="button-group"><span className={`badge ticket-${ticket.status}`}>{ticketLabels[ticket.status]}</span><span className={`badge priority-${ticket.priority}`}>{priorityLabels[ticket.priority]}</span></div></div>
 <div className="service-detail-grid"><section className="card"><h2>Opis problemu</h2><p className="preserve-lines">{ticket.description}</p><div className="service-location"><strong>{location.address}</strong><p>{location.postal_code} {location.city}</p><Link href={`/dashboard/customers/${ticket.customer_id}`}>Otwórz kartę klienta →</Link></div><p className="muted">Utworzono: {displayDateTime(ticket.created_at)}</p></section><section className="card"><h2>Obsługa zgłoszenia</h2>{canManage?<AssignServiceTechnician key={ticket.assigned_to||'unassigned'} id={id} assigned={ticket.assigned_to} technicians={technicians} />:<p>{ticket.assigned_to?'Technik został przydzielony.':'Zgłoszenie oczekuje na przydzielenie technika.'}</p>}{canEdit&&<TicketStatusForm key={`${ticket.status}-${ticket.priority}`} id={id} status={ticket.status} priority={ticket.priority} manager={canManage} />}</section></div>
 <section className="card"><h2>Załączniki zgłoszenia</h2><p>Dokumenty i zdjęcia związane z tym zgłoszeniem. Pliki wewnętrzne i udostępnione klientowi mają oddzielne oznaczenia.</p><Link className="button secondary" href={`/dashboard/installations/${ticket.installations.id}/documents?ticket=${id}`}>Otwórz załączniki</Link></section><div className="section-heading"><h2>Wizyty i protokoły</h2><Link href="/dashboard/calendar">Zobacz kalendarz →</Link></div>
 {visits.length?visits.map(visit=><section className="card service-visit" key={visit.id}><div className="section-heading"><div><p className="eyebrow">WIZYTA SERWISOWA</p><h3>{displayDateTime(visit.scheduled_at)}</h3><p className="muted">Czas: {visit.duration_minutes} min{visit.completed_at?` · Zakończono: ${displayDateTime(visit.completed_at)}`:''}</p></div><span className={`badge visit-${visit.status}`}>{visitLabels[visit.status]}</span></div>{visit.notes&&<div className="service-visit-note"><strong>Informacja dla klienta</strong><p className="preserve-lines">{visit.notes}</p></div>}
 {canEdit&&ticket.status!=='closed'&&<VisitActions key={visit.status} visit={visit} manager={canManage} />}
 {canManage&&ticket.status!=='closed'&&['planned','cancelled'].includes(visit.status)&&<details><summary>{visit.status==='cancelled'?'Ustal ponownie termin':'Zmień termin wizyty'}</summary><ScheduleVisit key={`${visit.scheduled_at}-${visit.duration_minutes}`} ticketId={id} visit={visit} /></details>}
 {visit.service_protocols?.status==='published'?<div className="published-protocol"><strong>Protokół PS-{String(visit.service_protocols.protocol_number).padStart(6,'0')}</strong><p className="muted">Zatwierdzono: {displayDateTime(visit.service_protocols.published_at)}</p><Link className="button secondary" href={`/dashboard/service/protocols/${visit.service_protocols.id}`}>Otwórz protokół / wydruk</Link></div>:canEdit&&visit.status==='in_progress'?<div className="draft-protocol"><h3>Protokół serwisowy {visit.service_protocols?`· wersja robocza ${visit.service_protocols.version}`:''}</h3><ServiceProtocolForm key={visit.service_protocols?.version||0} visitId={visit.id} protocol={visit.service_protocols} /></div>:null}
 </section>):<section className="card empty">Nie zaplanowano jeszcze wizyty.</section>}
 {canManage&&ticket.status!=='closed'&&<section className="card"><h2>Zaplanuj nową wizytę</h2>{ticket.assigned_to?<ScheduleVisit ticketId={id} />:<p>Najpierw przypisz aktywnego technika do zgłoszenia.</p>}</section>}
 </main>;
}
