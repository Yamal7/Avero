import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon,type IconName } from './icon';
import { portalHref } from '@/lib/portal/routes';
import type { PortalCustomer,PortalDocument,PortalScope,PortalTicket,PortalVisit } from '@/lib/portal/types';
import { displayDateTime } from '@/lib/service/dates';
import { ticketLabels,visitLabels } from '@/lib/service/types';
export function PortalContextPicker({scope,choices,search=''}:{scope:PortalScope;choices:PortalCustomer[];search?:string}) {
 const show=scope.preview||choices.length>1;
 return <section className="portal-context no-print" aria-label="Wybrany klient"><div><p className="eyebrow">{scope.preview?'PODGLĄD WYBRANEGO KLIENTA':'TWOJE KONTO KLIENTA'}</p><strong>{scope.customer?.name||'Wybierz klienta do podglądu'}</strong>{scope.customer?.archived_at&&<p className="muted">Konto archiwalne — dostępna historia, bez nowych zgłoszeń.</p>}</div>{show&&<details open={!scope.customer}><summary>{scope.customer?'Zmień klienta':'Wybierz klienta'}</summary>{scope.preview&&<form action="/portal" className="portal-context-search"><label>Szukaj klienta<input name="customerSearch" defaultValue={search} maxLength={200} placeholder="Nazwa klienta" /></label><button className="secondary">Znajdź</button></form>}<form action="/portal" className="portal-context-select"><input type="hidden" name="customerSearch" value={search} /><label>Klient<select name="customer" defaultValue={scope.customer?.id||''} required disabled={!choices.length}><option value="">Wybierz klienta</option>{choices.map(customer=><option key={customer.id} value={customer.id}>{customer.name}{customer.archived_at?' · archiwalny':''}</option>)}</select></label><button disabled={!choices.length}>Pokaż</button></form></details>}</section>;
}
export function PortalNoScope({preview,headingLevel=1}:{preview:boolean;headingLevel?:1|2}) {
 return <PortalEmpty headingLevel={headingLevel} icon="users" title={preview?'Wybierz klienta do podglądu':'Brak aktywnego przypisania'}>{preview?<><p>Wybierz konto klienta powyżej. Jeśli baza jest jeszcze pusta, najpierw dodaj klienta i jego instalacje.</p><Link className="button" href="/dashboard/customers">Przejdź do klientów</Link></>:<p>Poproś firmę o sprawdzenie przypisania Twojego konta.</p>}</PortalEmpty>;
}
export function PortalEmpty({icon='file',title,children,headingLevel=2}:{icon?:IconName;title:string;children:ReactNode;headingLevel?:1|2}) {
 const Heading=headingLevel===1?'h1':'h2';
 return <section className="portal-card portal-empty"><span className="empty-icon"><Icon name={icon} size={30} /></span><Heading>{title}</Heading>{children}</section>;
}
export function PortalHeading({eyebrow,title,children}:{eyebrow?:string;title:string;children?:ReactNode}) {
 return <div className="portal-page-heading">{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{children}</div>;
}
export function PortalPager({page,total,href}:{page:number;total:number;href:(page:number)=>string}) {
 return <div className="pagination no-print">{page>1&&<Link href={href(page-1)}>← Poprzednia</Link>}<span>Strona {page}</span>{page*20<total&&<Link href={href(page+1)}>Następna →</Link>}</div>;
}
export function PortalTicketCard({ticket,customer}:{ticket:Pick<PortalTicket,'id'|'ticket_number'|'subject'|'status'|'created_at'> & Partial<PortalTicket>;customer:string}) {
 return <Link className="portal-card portal-record" href={portalHref(`/portal/service/${ticket.id}`,customer)}><div className="portal-record-top"><span className="muted">Zgłoszenie #{String(ticket.ticket_number).padStart(5,'0')}</span><span className={`badge ticket-${ticket.status}`}>{ticketLabels[ticket.status]}</span></div><h3>{ticket.subject}</h3>{ticket.installation_type&&<p>{ticket.installation_type} · {ticket.address}, {ticket.city}</p>}<div className="portal-record-footer"><span>{displayDateTime(ticket.created_at)}</span><Icon name="chevron" size={18} /></div></Link>;
}
export function PortalVisitCard({visit,customer}:{visit:PortalVisit;customer:string}) {
 return <Link className="portal-card portal-record" href={portalHref(`/portal/service/${visit.ticket_id}`,customer)}><div className="portal-record-top"><span className="portal-record-icon"><Icon name="calendar" /></span><span className={`badge visit-${visit.status}`}>{visitLabels[visit.status]}</span></div><h3>{displayDateTime(visit.scheduled_at)}</h3><p>{visit.subject}</p><p className="muted">{visit.address}, {visit.city} · {visit.duration_minutes} min</p>{visit.overdue&&<p className="portal-overdue">Zaplanowany termin minął. Sprawdź aktualny status zgłoszenia.</p>}<div className="portal-record-footer"><span>Zgłoszenie #{String(visit.ticket_number).padStart(5,'0')}</span><Icon name="chevron" size={18} /></div></Link>;
}
export function PortalDocumentCard({document,customer}:{document:PortalDocument;customer:string}) {
 const href=document.kind==='handover'?portalHref(`/portal/handovers/${document.id}`,customer):document.kind==='protocol'?portalHref(`/portal/protocols/${document.id}`,customer):portalHref(`/portal/documents/${document.id}/download`,customer);
 return <article className="portal-card portal-document-row"><span className="portal-record-icon"><Icon name="file" /></span><div><span className="muted">{document.kind==='handover'?'Protokół odbioru montażu':document.kind==='protocol'?'Protokół serwisowy':'Plik udostępniony przez firmę'}</span><h3>{document.title}</h3><p>{document.installation_type} · {document.address}, {document.city}</p><small className="muted">{displayDateTime(document.created_at)}</small></div>{document.kind!=='file'?<Link className="button secondary" href={href}>Otwórz</Link>:<a className="button secondary" href={href}>Pobierz</a>}</article>;
}
