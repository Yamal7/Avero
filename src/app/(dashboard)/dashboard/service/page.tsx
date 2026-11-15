import Link from 'next/link';
import { ListHeader,ListSearch,ListTabs,ListTable } from '@/components/list-layout';
import { RecordActions } from '@/components/record-actions';
import { Icon } from '@/components/icon';
import { requireSession } from '@/lib/auth';
import { ticketLabels,priorityLabels,type TicketRow } from '@/lib/service/types';
import { displayDateTime } from '@/lib/service/dates';
export default async function ServicePage({searchParams}:{searchParams:Promise<{q?:string;status?:string;page?:string}>}) {
 const params=await searchParams; const q=(params.q||'').trim().slice(0,200), status=['open','all',...Object.keys(ticketLabels)].includes(params.status||'')?params.status!:'open';
 const page=Math.min(100000,Math.max(1,Number.parseInt(params.page||'1')||1));
 const {db}=await requireSession(); const {data,error}=await db.rpc('list_service_tickets',{p_search:q,p_status:status,p_page:page});
 if(error) throw new Error('Nie udało się pobrać zgłoszeń.'); const tickets=data.tickets as TicketRow[];
 const href=(value:number)=>`/dashboard/service?${new URLSearchParams({q,status,page:String(value)})}`;
 const filters={open:'Otwarte',all:'Wszystkie',...ticketLabels};
 return <main className="list-page"><ListHeader category="Obsługa klienta" title="Serwis"><Link className="button secondary" href="/dashboard/calendar">Kalendarz wizyt</Link><Link className="button" href="/dashboard/service/new"><Icon name="plus" size={19}/>Nowe zgłoszenie</Link></ListHeader>
 <div className="list-toolbar"><ListSearch action="/dashboard/service" value={q} placeholder="Szukaj numeru, tematu lub klienta" hidden={{status}}/><ListTabs label="Status zgłoszeń" items={Object.entries(filters).map(([value,label])=>({label,active:value===status,href:`/dashboard/service?${new URLSearchParams({q,status:value})}`}))}/></div>
 <ListTable label="Lista zgłoszeń serwisowych"><thead><tr><th>Zgłoszenie</th><th>Klient / instalacja</th><th>Status</th><th>Priorytet</th><th><span className="sr-only">Działania</span></th></tr></thead><tbody>{tickets.map(ticket=><tr key={ticket.id}><td><Link className="list-record-title" href={`/dashboard/service/${ticket.id}`}>#{String(ticket.ticket_number).padStart(5,'0')} · {ticket.subject}</Link><span className="list-record-subtitle">{displayDateTime(ticket.created_at)}</span></td><td>{ticket.customer_name}<span className="list-record-subtitle">{ticket.address}, {ticket.city}</span></td><td><span className={`badge ticket-${ticket.status}`}>{ticketLabels[ticket.status]}</span></td><td><span className={`badge priority-${ticket.priority}`}>{priorityLabels[ticket.priority]}</span></td><td className="list-actions"><RecordActions label={ticket.subject}><Link href={`/dashboard/service/${ticket.id}`}>Otwórz zgłoszenie<Icon name="arrow" size={18}/></Link></RecordActions></td></tr>)}</tbody></ListTable>
 {!tickets.length&&<div className="list-empty"><Icon name="wrench" size={30}/><h2>Brak zgłoszeń w tym widoku</h2><p>Dodaj zgłoszenie dotyczące instalacji lub zmień filtr.</p></div>}
 <div className="list-footer"><span className="muted">Wyniki: {data.total}</span><div className="pagination">{page>1&&<Link href={href(page-1)}>← Poprzednia</Link>}<span>Strona {page}</span>{page*25<data.total&&<Link href={href(page+1)}>Następna →</Link>}</div></div></main>;
}
