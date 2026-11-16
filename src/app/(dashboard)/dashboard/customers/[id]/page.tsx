import { crmSummarySchema,crmNotesSchema,crmTasksSchema } from '@hvac/api-client';
import { CustomerCrmWork,CustomerCrmSummary } from '@/components/customer-crm-work';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { customerWorkspaceSchema,customerActivityListSchema,customerContactsSchema,customerRelatedSchema,offerWorkTypes } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { getCustomer } from '@/lib/data/crm';
import { uuid } from '@/lib/validation/crm';
import { RecordForm,ArchiveForm } from '@/components/record-form';
import { CustomerAssets } from '@/components/customer-assets';
import { CustomerContacts } from '@/components/customer-contacts';
import { CustomerActivityList } from '@/components/customer-activity';
import { OfferWizard } from '@/components/offer-wizard';
import { Icon } from '@/components/icon';
import { displayDateTime } from '@/lib/service/dates';
import { catalogMoney } from '@/lib/catalog/format';
const categories={all:'Wszystkie zdarzenia',customer:'Profil klienta',contact:'Osoby kontaktowe',offer:'Oferty',work:'Realizacje',handover:'Odbiory',correction:'Poprawki',service:'Serwis',maintenance:'Przeglądy',crm_note:'Notatki CRM',crm_task:'Zadania CRM',crm_owner:'Opiekun'};
const statuses:Record<string,string>={draft:'Robocza',published:'Udostępniona',accepted:'Zaakceptowana',superseded:'Poprzednia wersja',withdrawn:'Wycofana',archived:'Archiwalna',planned:'Zaplanowana',in_progress:'W trakcie',completed:'Zakończona',cancelled:'Anulowana',new:'Nowe',waiting:'Oczekuje',closed:'Zamknięte'};
export default async function CustomerPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{tab?:string;page?:string;kind?:string;archived?:string;filter?:string}>}){
 const {id}=await params;if(!uuid.safeParse(id).success)notFound();const q=await searchParams,{db}=await requireSession(),response=await db.rpc('customer_workspace',{p_customer:id});
 if(response.error?.code==='42501'||!response.data)notFound();if(response.error)throw new Error('Nie udało się pobrać profilu klienta.');
 const data=customerWorkspaceSchema.parse(response.data),customer=data.customer,editable=data.canManage&&!customer.archivedAt,tab=['activity','contacts','offers','work','assets','service','notes','tasks'].includes(q.tab||'')?q.tab!:'activity',page=Math.min(100000,Math.max(1,Number.parseInt(q.page||'1')||1)),archived=q.archived==='true',kind=Object.hasOwn(categories,q.kind||'')?q.kind as keyof typeof categories:'all';
 if(['offers','notes'].includes(tab)&&!data.canManage)notFound();
 const crmResponse=await db.rpc('customer_crm_summary',{p_customer:id});if(crmResponse.error)throw new Error('Nie udało się pobrać danych pracy z klientem.');const crm=crmSummarySchema.parse(crmResponse.data),filter=['open','overdue','closed','all'].includes(q.filter||'')?q.filter!:'open';
 const href=(t:string,p=1,extra:Record<string,string>={})=>`/dashboard/customers/${id}?${new URLSearchParams({tab:t,page:String(p),...extra})}`;
 let content:React.ReactNode,total=0;
 if(tab==='activity'){const r=await db.rpc('customer_activity',{p_customer:id,p_kind:kind,p_page:page});if(r.error)throw new Error('Nie udało się pobrać historii.');const list=customerActivityListSchema.refine(v=>data.canManage||v.items.every(e=>!e.planChange&&e.kind!=='offer'&&e.kind!=='crm_note')).parse(r.data);total=list.total;content=<><div className="crm-section-heading"><div><h2>Historia współpracy</h2><p className="muted">Zdarzenia z powiązanych modułów, od najnowszych.</p></div><span className="muted">{total} zdarzeń</span></div><form className="crm-filter" action={`/dashboard/customers/${id}`}><input type="hidden" name="tab" value="activity"/><label>Rodzaj zdarzeń<select name="kind" defaultValue={kind}>{Object.entries(categories).filter(([k])=>data.canManage||!['offer','crm_note'].includes(k)).map(([k,label])=><option value={k} key={k}>{label}</option>)}</select></label><button className="secondary">Pokaż</button></form><CustomerActivityList items={list.items} customer={id}/></>;}
 else if(tab==='contacts'){const r=await db.rpc('customer_contact_list',{p_customer:id,p_archived:archived,p_page:page});if(r.error)throw new Error('Nie udało się pobrać kontaktów.');const list=customerContactsSchema.parse(r.data);total=list.total;content=<><div className="crm-contact-tabs"><Link href={href('contacts')} aria-current={!archived?'page':undefined}>Aktywne</Link><Link href={href('contacts',1,{archived:'true'})} aria-current={archived?'page':undefined}>Archiwum</Link></div><CustomerContacts customer={id} initial={list.items} editable={editable} archived={archived}/></>;}
 else if(tab==='notes'||tab==='tasks'){const r=await db.rpc('crm_records',{p_customer:id,p_kind:tab,p_filter:tab==='notes'?(archived?'archived':'open'):filter,p_page:page});if(r.error)throw new Error('Nie udało się pobrać notatek lub zadań.');if(tab==='notes'){const list=crmNotesSchema.parse(r.data);total=list.total;content=<CustomerCrmWork key={tab} customer={id} mode="notes" notes={list.items} summary={crm} editable={!customer.archivedAt} archived={archived} filter={filter}/>;}else{const list=crmTasksSchema.parse(r.data);total=list.total;content=<CustomerCrmWork key={tab} customer={id} mode="tasks" tasks={list.items} summary={crm} editable={!customer.archivedAt} archived={archived} filter={filter}/>;}}
 else if(tab==='assets'){const assets=await getCustomer(id);if(!assets)notFound();content=<CustomerAssets customer={assets} editable={editable}/>;}
 else {const r=await db.rpc('customer_related_rows',{p_customer:id,p_kind:tab,p_page:page});if(r.error)throw new Error('Nie udało się pobrać powiązanych danych.');const list=customerRelatedSchema.parse(r.data);total=list.total;const title=tab==='offers'?'Oferty klienta':tab==='work'?'Realizacje klienta':'Zgłoszenia serwisowe',prefix=tab==='offers'?'offers':tab==='work'?'work-orders':'service';content=<><div className="crm-section-heading"><div><h2>{title}</h2><p className="muted">{total} powiązanych rekordów</p></div>{tab==='offers'&&editable&&<OfferWizard initialCustomerId={id}/>}</div>{list.items.length?<div className="table-scroll"><table className="crm-record-table"><thead><tr><th>Rekord / zakres</th><th>Status</th><th>{tab==='offers'?'Zaktualizowano':'Dodano'}</th>{data.canManage&&tab!=='service'&&<th>Wartość brutto</th>}</tr></thead><tbody>{list.items.map(row=><tr key={row.id}><td><Link href={`/dashboard/${prefix}/${row.id}`}><strong>{row.number}</strong></Link><span className="list-record-subtitle">{row.title}</span><small className="muted">{tab==='offers'?offerWorkTypes[row.subtitle as keyof typeof offerWorkTypes]||row.subtitle:row.subtitle}</small></td><td data-label="Status"><span className={`badge crm-status-${row.state}`}>{statuses[row.state]||row.state}</span></td><td data-label={tab==='offers'?'Zaktualizowano':'Dodano'}><time dateTime={row.at}>{displayDateTime(row.at)}</time></td>{data.canManage&&tab!=='service'&&<td data-label="Wartość brutto">{row.amountCents===null?'—':catalogMoney(row.amountCents)}</td>}</tr>)}</tbody></table></div>:<div className="crm-empty"><Icon name={tab==='offers'?'file':'wrench'} size={30}/><h3>Brak powiązanych rekordów</h3><p className="muted">Dane pojawią się tutaj po utworzeniu {tab==='offers'?'oferty':tab==='work'?'realizacji z zaakceptowanej oferty':'zgłoszenia serwisowego'}.</p></div>}</>;}
 const tabs=[{id:'activity',label:'Historia',count:null},{id:'tasks',label:'Zadania',count:crm.openTasks},...(data.canManage?[{id:'notes',label:'Notatki',count:crm.notes}]:[]),{id:'contacts',label:'Osoby',count:data.counts.contacts},...(data.canManage?[{id:'offers',label:'Oferty',count:data.counts.offers}]:[]),{id:'work',label:'Zlecenia',count:data.counts.work},{id:'assets',label:'Urządzenia',count:data.counts.installations},{id:'service',label:'Zgłoszenia',count:data.counts.service}];
 const initials=customer.name.split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase(),company=customer.type==='company';
 const since=new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',dateStyle:'medium'}).format(new Date(customer.createdAt));
 const facts=[{label:'Lokalizacje',value:data.counts.locations,note:'obiekty klienta'},{label:'Instalacje',value:data.counts.installations,note:`${data.counts.devices} urządzeń`},{label:'Otwarte zadania',value:crm.openTasks,note:'działania CRM'},{label:'Poprawki w toku',value:data.counts.openCorrections,note:'rundy po odbiorze'}];
 return <main className="pui-page rec">
  <div className="pui-page-head">
   <Icon name="building" size={16}/>
   <Link className="pui-page-sub rec-crumb" href="/dashboard/customers">Firmy i osoby</Link>
   <span className="pui-crumb-sep" aria-hidden="true"><Icon name="right" size={12}/></span>
   <h1 className="ell">{customer.name}</h1>
   <span className="pui-spacer"/>
   {customer.archivedAt&&<span className="pui-page-meta">w archiwum</span>}
  </div>
  <div className="rec-body">
   <div className="rec-main">
    <header className="rec-hero">
     <span className={`rec-mark${company?'':' is-person'}`} aria-hidden="true">{initials}</span>
     <div className="rec-title"><h2>{customer.name}</h2><p>{company?'Firma':'Osoba prywatna'} · w bazie od {since}{!data.canManage&&' · widok ograniczony do Twoich przypisań'}</p></div>
     <div className="rec-actions"><Link className="button secondary" href="/dashboard/service/new"><Icon name="alert" size={14}/>Nowe zgłoszenie</Link>{editable&&<OfferWizard initialCustomerId={id}/>}</div>
    </header>
    <nav className="rec-tabs" aria-label="Zakładki karty klienta">{tabs.map(t=><Link key={t.id} href={href(t.id)} aria-current={tab===t.id?'page':undefined}>{t.label}{t.count!==null&&<span className="num">{t.count}</span>}</Link>)}</nav>
    <div className="rec-content">
     {tab==='activity'&&<dl className="rec-facts">{facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd className="num">{fact.value}</dd><dd>{fact.note}</dd></div>)}</dl>}
     {content}
     {tab!=='assets'&&total>0&&<nav className="crm-pagination" aria-label="Strony karty klienta">{page>1?<Link href={href(tab,page-1,{kind,archived:String(archived),filter})}>Poprzednia</Link>:<span/>}<span className="num">Strona {page} · {total} rekordów</span>{page*20<total?<Link href={href(tab,page+1,{kind,archived:String(archived),filter})}>Następna</Link>:<span/>}</nav>}
    </div>
   </div>
   <aside className="rec-side" aria-label="Szczegóły klienta">
    <section className="rec-section"><h3>Szczegóły</h3>
     <dl className="rec-props">
      <dt>E-mail</dt><dd>{customer.email?<a href={`mailto:${customer.email}`}>{customer.email}</a>:<span className="rec-none">Nie podano</span>}</dd>
      <dt>Telefon</dt><dd className="num">{customer.phone?<a href={`tel:${customer.phone}`}>{customer.phone}</a>:<span className="rec-none">Nie podano</span>}</dd>
      <dt>Typ</dt><dd>{company?'Firma':'Osoba prywatna'}</dd>
      <dt>W bazie od</dt><dd className="num">{since}</dd>
     </dl>
     {editable&&<details className="rec-edit"><summary>Edytuj dane</summary><RecordForm entity="customers" record={{id,name:customer.name,email:customer.email,phone:customer.phone,type:customer.type}}/></details>}
    </section>
    <div className="rec-section rec-crm"><CustomerCrmSummary customer={id} data={crm} editable={editable}/></div>
    <section className="rec-section"><div className="rec-section-head"><h3>Główny kontakt</h3><Link href={href('contacts')}>Wszystkie osoby</Link></div>
     {data.primaryContact?<dl className="rec-props"><dt>Osoba</dt><dd>{data.primaryContact.name}</dd><dt>Rola</dt><dd>{data.primaryContact.role||'Osoba kontaktowa'}</dd>{data.primaryContact.email&&<><dt>E-mail</dt><dd><a href={`mailto:${data.primaryContact.email}`}>{data.primaryContact.email}</a></dd></>}{data.primaryContact.phone&&<><dt>Telefon</dt><dd className="num"><a href={`tel:${data.primaryContact.phone}`}>{data.primaryContact.phone}</a></dd></>}</dl>:<p className="rec-none">Nie wskazano głównej osoby kontaktowej.</p>}
    </section>
    {data.canManage&&<section className="rec-section"><h3>Portal klienta</h3><Link className="rec-link" href={`/portal?customer=${id}`}><Icon name="eye" size={14}/>Podgląd portalu klienta</Link>{editable&&<details className="rec-edit"><summary>Archiwizacja klienta</summary><ArchiveForm id={id}/></details>}</section>}
   </aside>
  </div>
 </main>;
}
