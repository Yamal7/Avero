import Link from 'next/link';
import { ClientAttachmentForm } from '@/components/client-attachment-form';
import { PortalFiles } from '@/components/portal-files';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requirePortalContext } from '@/lib/portal/context';
import { portalHref } from '@/lib/portal/routes';
import type { PortalTicketDetail } from '@/lib/portal/types';
import { PortalContextPicker,PortalHeading,PortalNoScope } from '@/components/portal-ui';
import { ticketLabels,visitLabels } from '@/lib/service/types';
import { displayDateTime } from '@/lib/service/dates';
export default async function PortalTicketPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{customer?:string}>}) {
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const query=await searchParams,{db,scope,choices}=await requirePortalContext(query.customer);const picker=<PortalContextPicker scope={scope} choices={choices} />;
 if(!scope.customer)return <>{picker}<PortalNoScope preview={scope.preview} /></>;
 const customer=scope.customer.id,{data,error}=await db.rpc('portal_ticket',{p_customer:customer,p_ticket:id});if(error)throw new Error('Nie udało się pobrać zgłoszenia.');if(!data)notFound();const ticket=data as PortalTicketDetail;
 const permission=scope.preview?{data:false,error:null}:await db.rpc('can_attach_to_ticket',{p_customer:customer,p_ticket:id});if(permission.error)throw new Error('Nie udało się sprawdzić dostępu do załączników.');
 return <>{picker}<Link className="portal-back" href={portalHref('/portal/service',customer)}>← Moje zgłoszenia</Link><PortalHeading eyebrow={`Zgłoszenie #${String(ticket.ticket_number).padStart(5,'0')}`} title={ticket.subject}><span className={`badge ticket-${ticket.status}`}>{ticketLabels[ticket.status]}</span></PortalHeading><section className="portal-card"><h2>Opis problemu</h2><p className="preserve-lines">{ticket.description}</p><p className="muted">Przyjęto: {displayDateTime(ticket.created_at)}</p><Link href={portalHref(`/portal/installations/${ticket.installation_id}`,customer)}>{ticket.installation_type} · {ticket.address}, {ticket.city} →</Link></section><>{permission.data===true?<ClientAttachmentForm key={`${customer}:${id}`} customer={customer} ticket={id} />:!scope.preview&&<p className="portal-card muted">Dodawanie plików jest dostępne dla otwartych zgłoszeń aktywnych instalacji i klientów.</p>}</><PortalFiles installation={ticket.installation_id} ticket={id} customer={customer} /><div className="portal-section-heading"><h2>Wizyty i protokoły</h2></div>{ticket.visits.length?ticket.visits.map(visit=><section className="portal-card" key={visit.id}><div className="portal-record-top"><h3>{displayDateTime(visit.scheduled_at)}</h3><span className={`badge visit-${visit.status}`}>{visitLabels[visit.status]}</span></div><p className="muted">Czas wizyty: {visit.duration_minutes} min</p>{visit.notes&&<p className="preserve-lines">{visit.notes}</p>}{visit.completed_at&&<p className="muted">Zakończono: {displayDateTime(visit.completed_at)}</p>}{visit.protocol&&<Link className="button secondary" href={portalHref(`/portal/protocols/${visit.protocol.id}`,customer)}>Otwórz protokół PS-{String(visit.protocol.protocol_number).padStart(6,'0')}</Link>}</section>):<PortalEmptyVisit />}</>;
}
function PortalEmptyVisit(){return <section className="portal-card"><p>Serwis nie ustalił jeszcze terminu wizyty. Termin pojawi się tutaj po zaplanowaniu.</p></section>;}
