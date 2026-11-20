import Link from 'next/link';
import type { CustomerActivity } from '@hvac/api-client';
import { displayTime,localDate } from '@/lib/service/dates';
import { Icon,type IconName } from './icon';
const icons:Record<CustomerActivity['kind'],IconName>={customer:'users',contact:'users',offer:'file',work:'wrench',handover:'file',correction:'wrench',service:'wrench',maintenance:'calendar',crm_note:'file',crm_task:'calendar',crm_owner:'users'};
export function customerActivityHref(e:CustomerActivity,customer:string){switch(e.kind){case 'crm_note':return `/dashboard/customers/${customer}?tab=notes#crm-${e.entityId}`;case 'crm_task':return `/dashboard/customers/${customer}?tab=tasks&filter=all#crm-${e.entityId}`;case 'crm_owner':return `/dashboard/customers/${customer}?tab=tasks`;case 'customer':return `/dashboard/customers/${customer}?tab=activity`;case 'contact':return `/dashboard/customers/${customer}?tab=contacts`;case 'offer':return `/dashboard/offers/${e.entityId}`;case 'work':return `/dashboard/work-orders/${e.entityId}`;case 'handover':return `/dashboard/work-orders/${e.entityId}/handover#first-handover`;case 'correction':return `/dashboard/work-orders/${e.entityId}/handover${e.round?`#correction-round-${e.round}`:''}`;case 'service':return `/dashboard/service/${e.entityId}`;case 'maintenance':return `/dashboard/maintenance/${e.entityId}`;}}
function historyDay(value:string){return new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',dateStyle:'medium'}).format(new Date(value+'T12:00:00Z'));}
function TaskPlanChange({change}:{change:NonNullable<CustomerActivity['planChange']>}){
 return <div className="crm-plan-history">
  <p className="crm-plan-author">Zmienione przez <strong>{change.actorLabel}</strong></p>
  <dl>
   {change.dueOn&&<div><dt>Termin</dt><dd><span className="crm-plan-before"><time dateTime={change.dueOn.from}>{historyDay(change.dueOn.from)}</time></span><span className="crm-plan-arrow" aria-label="zmieniono na">→</span><strong><time dateTime={change.dueOn.to}>{historyDay(change.dueOn.to)}</time></strong></dd></div>}
   {change.assignee&&<div><dt>Wykonawca</dt><dd><span className="crm-plan-before">{change.assignee.fromLabel}</span><span className="crm-plan-arrow" aria-label="zmieniono na">→</span><strong>{change.assignee.toLabel}</strong></dd></div>}
  </dl>
 </div>;
}
export function CustomerActivityList({items,customer}:{items:CustomerActivity[];customer:string}){
 if(!items.length)return <div className="crm-empty"><Icon name="calendar" size={30}/><h3>Brak zdarzeń w tym widoku</h3><p className="muted">Zmień filtr albo wróć do wszystkich zdarzeń.</p></div>;
 return <ol className="crm-timeline">{items.map((e,index)=>{
  const day=localDate(e.at),heading=index===0||day!==localDate(items[index-1].at);
  return <li key={e.id}>
   {heading&&<h3 className="crm-timeline-day">{new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',dateStyle:'long'}).format(new Date(e.at))}</h3>}
   <div className="crm-event"><span className="crm-event-icon"><Icon name={icons[e.kind]} size={18}/></span>
    <div><Link className="crm-event-title" href={customerActivityHref(e,customer)}>{e.title}</Link><p>{e.detail}</p>{e.planChange&&<TaskPlanChange change={e.planChange}/>}</div>
    <time dateTime={e.at} className="muted">{displayTime(e.at)}</time>
   </div>
  </li>;
 })}</ol>;
}
