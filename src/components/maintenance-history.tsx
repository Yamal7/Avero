import Link from 'next/link';
import type { MaintenanceHistory } from '@hvac/api-client';
import { portalHref } from '@/lib/portal/routes';
import { displayDateTime } from '@/lib/service/dates';
export function MaintenanceHistoryList({items,customer}:{items:MaintenanceHistory[];customer?:string}){
 return items.length?<div>{items.map(item=><article className="maintenance-history-item" key={item.id}><h3>{item.plan_title}</h3><p>Wykonano: <strong>{item.performed_on}</strong> · cykl {item.interval_months} miesięcy</p><p>Termin przed przeglądem: {item.previous_due_on}<br />Termin ustalony po przeglądzie: <strong>{item.next_due_on}</strong></p><p className="muted">Zapisano: {displayDateTime(item.recorded_at)} · zgłoszenie #{item.ticket_number}</p>{item.can_read_protocol?<Link href={customer?portalHref(`/portal/protocols/${item.protocol_id}`,customer):`/dashboard/service/protocols/${item.protocol_id}`}>Protokół PS-{String(item.protocol_number).padStart(6,'0')} →</Link>:<p>Protokół PS-{String(item.protocol_number).padStart(6,'0')}</p>}</article>)}</div>:<p className="muted">Nie zapisano jeszcze wykonanych przeglądów.</p>;
}
