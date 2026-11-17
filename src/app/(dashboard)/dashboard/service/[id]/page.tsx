import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getServiceTicket } from '@/lib/service/data';
import { displayDateTime } from '@/lib/service/dates';
import { priorityLabels,ticketLabels,visitLabels,type Technician } from '@/lib/service/types';
import { Icon } from '@/components/icon';
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
 const number=`#${String(ticket.ticket_number).padStart(5,'0')}`;
 const technician=technicians.find(t=>t.id===ticket.assigned_to);
 return <main className="pui-page rec">
  <div className="pui-page-head">
   <Icon name="alert" size={16}/>
   <Link className="pui-page-sub rec-crumb" href="/dashboard/service">Zgłoszenia</Link>
   <span className="pui-crumb-sep" aria-hidden="true"><Icon name="right" size={12}/></span>
   <h1 className="num">{number}</h1>
   <span className="pui-spacer"/>
   <Link className="pui-ib" href="/dashboard/calendar" aria-label="Planowanie" title="Planowanie"><Icon name="plan" size={14}/></Link>
  </div>
  <div className="rec-body">
   <div className="rec-main">
    <header className="rec-hero">
     <div className="rec-title"><h2>{ticket.subject}</h2><p>{ticket.customers.name} · {ticket.installations.type}</p></div>
    </header>
    <div className="rec-content">
     <section className="rec-block"><h3>Opis problemu</h3><p className="preserve-lines">{ticket.description}</p></section>
     <section className="rec-block">
      <div className="rec-section-head"><h3>Wizyty i protokoły</h3><span className="day-count num">{visits.length}</span></div>
      {visits.length?visits.map(visit=><article className="rec-item" key={visit.id}>
       <div className="rec-item-head"><strong className="num">{displayDateTime(visit.scheduled_at)}</strong><span className="rec-item-meta num">{visit.duration_minutes} min{visit.completed_at?` · zakończono ${displayDateTime(visit.completed_at)}`:''}</span><span className="pui-spacer"/><span className={`badge visit-${visit.status}`}>{visitLabels[visit.status]}</span></div>
       {visit.notes&&<p className="preserve-lines rec-item-note">{visit.notes}</p>}
       {canEdit&&ticket.status!=='closed'&&<VisitActions key={visit.status} visit={visit} manager={canManage} />}
       {canManage&&ticket.status!=='closed'&&['planned','cancelled'].includes(visit.status)&&<details className="rec-edit"><summary>{visit.status==='cancelled'?'Ustal ponownie termin':'Zmień termin wizyty'}</summary><ScheduleVisit key={`${visit.scheduled_at}-${visit.duration_minutes}`} ticketId={id} visit={visit} /></details>}
       {visit.service_protocols?.status==='published'?<div className="rec-item-row"><Icon name="contract" size={14}/><span>Protokół <span className="num">PS-{String(visit.service_protocols.protocol_number).padStart(6,'0')}</span></span><span className="rec-item-meta num">zatwierdzono {displayDateTime(visit.service_protocols.published_at)}</span><span className="pui-spacer"/><Link className="button secondary" href={`/dashboard/service/protocols/${visit.service_protocols.id}`}>Otwórz protokół</Link></div>:canEdit&&visit.status==='in_progress'?<div className="draft-protocol"><h3>Protokół serwisowy {visit.service_protocols?`· wersja robocza ${visit.service_protocols.version}`:''}</h3><ServiceProtocolForm key={visit.service_protocols?.version||0} visitId={visit.id} protocol={visit.service_protocols} /></div>:null}
      </article>):<p className="rec-none">Nie zaplanowano jeszcze wizyty.</p>}
     </section>
     {canManage&&ticket.status!=='closed'&&<section className="rec-block"><h3>Zaplanuj nową wizytę</h3>{ticket.assigned_to?<ScheduleVisit ticketId={id} />:<p className="rec-none">Najpierw przypisz aktywnego technika do zgłoszenia.</p>}</section>}
    </div>
   </div>
   <aside className="rec-side" aria-label="Szczegóły zgłoszenia">
    <section className="rec-section"><h3>Szczegóły</h3>
     <dl className="rec-props">
      <dt>Status</dt><dd><span className={`badge ticket-${ticket.status}`}>{ticketLabels[ticket.status]}</span></dd>
      <dt>Priorytet</dt><dd>{priorityLabels[ticket.priority]}</dd>
      <dt>Technik</dt><dd>{technician?technician.email:ticket.assigned_to?'Przydzielony':<span className="rec-none">Bez przydziału</span>}</dd>
      <dt>Klient</dt><dd><Link href={`/dashboard/customers/${ticket.customer_id}`}>{ticket.customers.name}</Link></dd>
      <dt>Instalacja</dt><dd>{ticket.installations.type}</dd>
      <dt>Adres</dt><dd>{location.address}, {location.postal_code} {location.city}</dd>
      <dt>Utworzono</dt><dd className="num">{displayDateTime(ticket.created_at)}</dd>
     </dl>
    </section>
    {(canManage||canEdit)&&<section className="rec-section"><h3>Obsługa</h3>
     {canManage&&<AssignServiceTechnician key={ticket.assigned_to||'unassigned'} id={id} assigned={ticket.assigned_to} technicians={technicians} />}
     {canEdit&&<TicketStatusForm key={`${ticket.status}-${ticket.priority}`} id={id} status={ticket.status} priority={ticket.priority} manager={canManage} />}
    </section>}
    <section className="rec-section"><h3>Załączniki</h3><Link className="rec-link" href={`/dashboard/installations/${ticket.installations.id}/documents?ticket=${id}`}><Icon name="contract" size={14}/>Dokumenty i zdjęcia zgłoszenia</Link></section>
   </aside>
  </div>
 </main>;
}
