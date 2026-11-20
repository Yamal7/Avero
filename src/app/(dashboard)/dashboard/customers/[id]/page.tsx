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
import { maintenanceListSchema } from '@hvac/api-client';
import { colorMap } from '@/lib/crm/category-colors';
import { DI, PersonAvatar, StatusIcon, TicketStatusIcon, personInitials, taskNumber, ticketCode } from '@/components/design-icons';
import { CustomerCategories } from '@/components/customer-categories';
const categories={all:'Wszystkie zdarzenia',customer:'Profil klienta',contact:'Osoby kontaktowe',offer:'Oferty',work:'Realizacje',handover:'Odbiory',correction:'Poprawki',service:'Serwis',maintenance:'Przeglądy',crm_note:'Notatki CRM',crm_task:'Zadania CRM',crm_owner:'Opiekun'};
const statuses:Record<string,string>={draft:'Robocza',published:'Udostępniona',accepted:'Zaakceptowana',superseded:'Poprzednia wersja',withdrawn:'Wycofana',archived:'Archiwalna',planned:'Zaplanowana',in_progress:'W trakcie',completed:'Zakończona',cancelled:'Anulowana',new:'Nowe',waiting:'Oczekuje',closed:'Zamknięte'};
export default async function CustomerPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{tab?:string;page?:string;kind?:string;archived?:string;filter?:string}>}){
 const {id}=await params;if(!uuid.safeParse(id).success)notFound();const q=await searchParams,{db}=await requireSession(),response=await db.rpc('customer_workspace',{p_customer:id});
 if(response.error?.code==='42501'||!response.data)notFound();if(response.error)throw new Error('Nie udało się pobrać profilu klienta.');
 const data=customerWorkspaceSchema.parse(response.data),customer=data.customer,editable=data.canManage&&!customer.archivedAt,tab=['overview','activity','contacts','offers','work','assets','service','notes','tasks'].includes(q.tab||'')?q.tab!:'overview',page=Math.min(100000,Math.max(1,Number.parseInt(q.page||'1')||1)),archived=q.archived==='true',kind=Object.hasOwn(categories,q.kind||'')?q.kind as keyof typeof categories:'all';
 if(['offers','notes'].includes(tab)&&!data.canManage)notFound();
 const crmResponse=await db.rpc('customer_crm_summary',{p_customer:id});if(crmResponse.error)throw new Error('Nie udało się pobrać danych pracy z klientem.');const crm=crmSummarySchema.parse(crmResponse.data),filter=['open','overdue','closed','all'].includes(q.filter||'')?q.filter!:'open';
 const href=(t:string,p=1,extra:Record<string,string>={})=>`/dashboard/customers/${id}?${new URLSearchParams({tab:t,page:String(p),...extra})}`;
 let content:React.ReactNode,total=0;
 if(tab==='activity'){const r=await db.rpc('customer_activity',{p_customer:id,p_kind:kind,p_page:page});if(r.error)throw new Error('Nie udało się pobrać historii.');const list=customerActivityListSchema.refine(v=>data.canManage||v.items.every(e=>!e.planChange&&e.kind!=='offer'&&e.kind!=='crm_note')).parse(r.data);total=list.total;content=<><div className="crm-section-heading"><div><h2>Historia współpracy</h2><p className="muted">Zdarzenia z powiązanych modułów, od najnowszych.</p></div><span className="muted">{total} zdarzeń</span></div><form className="crm-filter" action={`/dashboard/customers/${id}`}><input type="hidden" name="tab" value="activity"/><label>Rodzaj zdarzeń<select name="kind" defaultValue={kind}>{Object.entries(categories).filter(([k])=>data.canManage||!['offer','crm_note'].includes(k)).map(([k,label])=><option value={k} key={k}>{label}</option>)}</select></label><button className="secondary">Pokaż</button></form><CustomerActivityList items={list.items} customer={id}/></>;}
 else if(tab==='contacts'){const r=await db.rpc('customer_contact_list',{p_customer:id,p_archived:archived,p_page:page});if(r.error)throw new Error('Nie udało się pobrać kontaktów.');const list=customerContactsSchema.parse(r.data);total=list.total;content=<><div className="crm-contact-tabs"><Link href={href('contacts')} aria-current={!archived?'page':undefined}>Aktywne</Link><Link href={href('contacts',1,{archived:'true'})} aria-current={archived?'page':undefined}>Archiwum</Link></div><CustomerContacts customer={id} initial={list.items} editable={editable} archived={archived}/></>;}
 else if(tab==='notes'||tab==='tasks'){const r=await db.rpc('crm_records',{p_customer:id,p_kind:tab,p_filter:tab==='notes'?(archived?'archived':'open'):filter,p_page:page});if(r.error)throw new Error('Nie udało się pobrać notatek lub zadań.');if(tab==='notes'){const list=crmNotesSchema.parse(r.data);total=list.total;content=<CustomerCrmWork key={tab} customer={id} mode="notes" notes={list.items} summary={crm} editable={!customer.archivedAt} archived={archived} filter={filter}/>;}else{const list=crmTasksSchema.parse(r.data);total=list.total;content=<CustomerCrmWork key={tab} customer={id} mode="tasks" tasks={list.items} summary={crm} editable={!customer.archivedAt} archived={archived} filter={filter}/>;}}
 else if(tab==='assets'){const assets=await getCustomer(id);if(!assets)notFound();content=<CustomerAssets customer={assets} editable={editable}/>;}
 else if(tab!=='overview'){const r=await db.rpc('customer_related_rows',{p_customer:id,p_kind:tab,p_page:page});if(r.error)throw new Error('Nie udało się pobrać powiązanych danych.');const list=customerRelatedSchema.parse(r.data);total=list.total;const title=tab==='offers'?'Oferty klienta':tab==='work'?'Realizacje klienta':'Zgłoszenia serwisowe',prefix=tab==='offers'?'offers':tab==='work'?'work-orders':'service';content=<><div className="crm-section-heading"><div><h2>{title}</h2><p className="muted">{total} powiązanych rekordów</p></div>{tab==='offers'&&editable&&<OfferWizard initialCustomerId={id}/>}</div>{list.items.length?<div className="table-scroll"><table className="crm-record-table"><thead><tr><th>Rekord / zakres</th><th>Status</th><th>{tab==='offers'?'Zaktualizowano':'Dodano'}</th>{data.canManage&&tab!=='service'&&<th>Wartość brutto</th>}</tr></thead><tbody>{list.items.map(row=><tr key={row.id}><td><Link href={`/dashboard/${prefix}/${row.id}`}><strong>{row.number}</strong></Link><span className="list-record-subtitle">{row.title}</span><small className="muted">{tab==='offers'?offerWorkTypes[row.subtitle as keyof typeof offerWorkTypes]||row.subtitle:row.subtitle}</small></td><td data-label="Status"><span className={`badge crm-status-${row.state}`}>{statuses[row.state]||row.state}</span></td><td data-label={tab==='offers'?'Zaktualizowano':'Dodano'}><time dateTime={row.at}>{displayDateTime(row.at)}</time></td>{data.canManage&&tab!=='service'&&<td data-label="Wartość brutto">{row.amountCents===null?'—':catalogMoney(row.amountCents)}</td>}</tr>)}</tbody></table></div>:<div className="crm-empty"><Icon name={tab==='offers'?'file':'wrench'} size={30}/><h3>Brak powiązanych rekordów</h3><p className="muted">Dane pojawią się tutaj po utworzeniu {tab==='offers'?'oferty':tab==='work'?'realizacji z zaakceptowanej oferty':'zgłoszenia serwisowego'}.</p></div>}</>;}
 const [extraR,ticketsR,openTasksR,plansR,contactsR,cityR,catR]=await Promise.all([
  db.from('customers').select('tax_id,payment_terms,categories').eq('id',id).single(),
  db.from('service_tickets').select('id,ticket_number,subject,status,priority,assigned_to,created_at',{count:'exact'}).eq('customer_id',id).neq('status','closed').order('created_at').limit(6),
  db.rpc('crm_records',{p_customer:id,p_kind:'tasks',p_filter:'open',p_page:1}),
  db.rpc('maintenance_schedule'),
  db.rpc('customer_contact_list',{p_customer:id,p_archived:false,p_page:1}),
  db.from('locations').select('address,city,postal_code').eq('customer_id',id).order('created_at').limit(1),
  db.rpc('customer_category_list',{p_kind:customer.type==='individual'?'individual':'company'}),
 ]);
 if(extraR.error||ticketsR.error||openTasksR.error||plansR.error||contactsR.error||cityR.error)throw new Error('Nie udało się pobrać karty klienta.');
 const extra=extraR.data as {tax_id:string|null;payment_terms:string|null;categories:string[]};
 const openTickets=(ticketsR.data||[]) as {id:string;ticket_number:number;subject:string;status:string;priority:string;assigned_to:string|null;created_at:string}[];
 const openTasks=crmTasksSchema.parse(openTasksR.data);
 const plans=maintenanceListSchema.parse({...plansR.data,apiVersion:'1',page:1,pageSize:20}).plans.filter(pl=>pl.customer_id===id&&['overdue','upcoming','later'].includes(pl.state)).slice(0,5);
 const contacts=customerContactsSchema.parse(contactsR.data).items.slice(0,6);
 const seat=(cityR.data||[])[0] as {address:string;city:string;postal_code:string|null}|undefined;
 const openCount=(ticketsR.count||0)+crm.openTasks;
 const tabs=[{id:'overview',label:'Przegląd',count:null},{id:'assets',label:'Obiekty i urządzenia',count:data.counts.devices},{id:'work',label:'Zlecenia',count:data.counts.work},{id:'service',label:'Zgłoszenia',count:data.counts.service},...(data.canManage?[{id:'offers',label:'Oferty',count:data.counts.offers}]:[]),{id:'tasks',label:'Zadania',count:crm.openTasks},...(data.canManage?[{id:'notes',label:'Notatki',count:crm.notes}]:[]),{id:'contacts',label:'Osoby',count:data.counts.contacts},{id:'activity',label:'Aktywność',count:null}];
 const company=customer.type==='company',monthYear=new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',month:'long',year:'numeric'}).format(new Date(customer.createdAt));
 const sv={width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true,style:{flex:'0 0 auto'}};
 const ic={building:<svg {...sv} width={16} height={16}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>,hash:<svg {...sv}><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>,pin:<svg {...sv}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,store:<svg {...sv}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>,cube:<svg {...sv}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>,alert:<svg {...sv}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,tool:<svg {...sv}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,phone:<svg {...sv}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,mail:<svg {...sv}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,card:<svg {...sv}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,since:<svg {...sv}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,eye:<svg {...sv}><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></svg>};
 const muted=(node:React.ReactNode)=><span style={{display:'inline-flex',flex:'0 0 auto',color:'var(--text-tertiary)'}}>{node}</span>;
 const prop=(icon:React.ReactNode,value:React.ReactNode,title:string,href?:string)=>{const st:React.CSSProperties={width:'100%',minHeight:32,display:'flex',alignItems:'center',gap:10,padding:'6px 8px',border:0,borderRadius:8,background:'transparent',textAlign:'left',lineHeight:'20px'};const inner=<>{muted(icon)}<span className="ell" style={{flex:'0 1 auto',minWidth:0}}>{value}</span><span style={{flex:'1 1 auto'}}/></>;return href?<a className="prop" href={href} title={title} style={st}>{inner}</a>:<div className="prop" title={title} style={st}>{inner}</div>;};
 const none=(t:string)=><span style={{color:'var(--text-tertiary)'}}>{t}</span>;
 const factStyle={display:'flex',flexDirection:'column' as const,gap:2};
 const dt=(icon:React.ReactNode,label:string)=><dt style={{display:'flex',alignItems:'center',gap:6,fontSize:12,lineHeight:'16px',color:'var(--text-secondary)'}}>{muted(icon)}{label}</dt>;
 const dd=(v:React.ReactNode)=><dd className="num" style={{margin:0,fontSize:18,lineHeight:'26px',fontWeight:600}}>{v}</dd>;
 const ticketGlyph=(st:string)=><TicketStatusIcon status={st}/>;
 const ticketLabel:Record<string,string>={new:'Nowe',in_progress:'W trakcie',waiting:'Oczekuje',closed:'Zamknięte'};
 const short=(d:string)=>new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',day:'numeric',month:'short'}).format(new Date(d.length===10?d+'T12:00:00Z':d)).replace('.','');

 const overview=<div style={{display:'flex',flexDirection:'column',gap:24,padding:'20px 24px 32px',maxWidth:920}}>
  <dl style={{margin:0,display:'grid',gridTemplateColumns:'repeat(4, minmax(0px, 1fr))',gap:16}}>
   <div title={`${data.counts.installations} instalacji`} style={factStyle}>{dt(ic.cube,'Urządzenia')}{dd(data.counts.devices)}</div>
   <div title="Otwarte zgłoszenia i zadania" style={factStyle}>{dt(ic.alert,'Otwarte sprawy')}{dd(openCount)}</div>
   <div title="Lokalizacje klienta" style={factStyle}>{dt(ic.pin,'Obiekty')}{dd(data.counts.locations)}</div>
   <div title={data.counts.openCorrections?`${data.counts.openCorrections} poprawek w toku`:'Zlecenia klienta'} style={factStyle}>{dt(ic.tool,'Zlecenia')}{dd(data.counts.work)}</div>
  </dl>
  <section style={{display:'flex',flexDirection:'column',gap:4}}>
   <div style={{display:'flex',alignItems:'center',gap:8,height:32}}><h3 style={{margin:0,fontSize:13,lineHeight:'20px',fontWeight:500}}>Otwarte sprawy</h3><span className="num" style={{fontSize:12,color:'var(--text-tertiary)'}}>{openCount}</span></div>
   <div style={{margin:'0 -8px'}}>
    {openTickets.map(t=><Link key={t.id} href={`/dashboard/service/${t.id}`} className="row" style={{display:'grid',gridTemplateColumns:'64px 14px minmax(0px, 1fr) auto 20px',alignItems:'center',columnGap:12,height:36,padding:'0 8px',borderRadius:10}}><span className="num" style={{color:'var(--text-tertiary)'}}>{ticketCode(t.ticket_number)}</span><span role="img" aria-label={ticketLabel[t.status]} title={ticketLabel[t.status]} style={{display:'inline-flex'}}>{ticketGlyph(t.status)}</span><span className="ell" style={{fontWeight:500}}>{t.subject}</span><span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text-secondary)'}}><span className="num">{short(t.created_at)}</span></span><span style={{display:'flex',justifyContent:'flex-end'}}>{t.assigned_to?<PersonAvatar id={t.assigned_to} label="Technik"/>:<span title="Bez technika" style={{width:20,height:20,borderRadius:'50%',border:'1px dashed var(--border-strong)'}}/>}</span></Link>)}
    {openTasks.items.slice(0,6).map(t=><Link key={t.id} href={href('tasks')+`#crm-${t.id}`} className="row" style={{display:'grid',gridTemplateColumns:'64px 14px minmax(0px, 1fr) auto 20px',alignItems:'center',columnGap:12,height:36,padding:'0 8px',borderRadius:10}}><span className="num" style={{color:'var(--text-tertiary)'}}>{taskNumber(t.number)}</span><span role="img" aria-label={t.state==='in_progress'?'W toku':'Do zrobienia'} style={{display:'inline-flex'}}><StatusIcon state={t.state}/></span><span className="ell" title="zadanie" style={{fontWeight:500}}>{t.title}</span><span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:t.priority==='urgent'||t.priority==='high'?'var(--text-primary)':'var(--text-secondary)',fontWeight:t.priority==='urgent'||t.priority==='high'?500:400}}><span className="num">{t.priority==='urgent'?'pilne · ':''}{short(t.dueOn)}</span></span><span style={{display:'flex',justifyContent:'flex-end'}}><PersonAvatar id={t.assigneeId} label={t.assigneeLabel}/></span></Link>)}
    {!openTickets.length&&!openTasks.items.length&&<p style={{margin:0,padding:'4px 8px',color:'var(--text-secondary)'}}>Brak otwartych zgłoszeń i zadań.</p>}
   </div>
  </section>
  <section style={{display:'flex',flexDirection:'column',gap:4}}>
   <div style={{display:'flex',alignItems:'center',gap:8,height:32}}><h3 style={{flex:'1 1 auto',margin:0,fontSize:13,lineHeight:'20px',fontWeight:500}}>Najbliższe przeglądy</h3><Link href="/dashboard/maintenance" className="ghost" style={{height:28,display:'inline-flex',alignItems:'center',padding:'0 8px',border:0,borderRadius:8,color:'var(--text-secondary)',fontSize:12}}>Wszystkie przeglądy</Link></div>
   {plans.length?<><div style={{display:'grid',gridTemplateColumns:'minmax(0px, 1fr) 160px 80px 88px',columnGap:12,alignItems:'center',height:28,padding:0,fontSize:12,lineHeight:'16px',color:'var(--text-tertiary)'}}><span>Przegląd</span><span>Instalacja</span><span>Częstotliwość</span><span style={{textAlign:'right'}}>Termin</span></div>
   <div style={{margin:'0 -8px'}}>{plans.map(pl=><Link key={pl.id} href={`/dashboard/maintenance/${pl.id}`} className="row" style={{display:'grid',gridTemplateColumns:'minmax(0px, 1fr) 160px 80px 88px',columnGap:12,alignItems:'center',height:36,padding:'0 8px',borderRadius:10}}><span className="ell" title={`${pl.address}, ${pl.city}`} style={{fontWeight:500}}>{pl.title}</span><span className="ell" style={{color:'var(--text-secondary)'}}>{pl.installation_type}</span><span style={{fontSize:12,color:'var(--text-secondary)'}}>co {pl.interval_months} mies.</span><span title={pl.next_due_on} style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:6,color:pl.state==='overdue'?'var(--danger)':'var(--text-primary)',fontWeight:500}}>{pl.state==='overdue'?DI.calLate:DI.calToday}<span className="num">{short(pl.next_due_on)}</span></span></Link>)}</div></>:<p style={{margin:0,color:'var(--text-secondary)'}}>Brak zaplanowanych przeglądów.</p>}
  </section>
 </div>;

 return <main className="dk" style={{flex:'1 1 auto',minHeight:'100%',display:'flex',flexDirection:'column',background:'var(--bg-surface)'}}>
  <div style={{display:'flex',alignItems:'center',gap:8,height:44,padding:'0 12px 0 20px'}}>
   <span style={{display:'inline-flex',color:'var(--text-secondary)'}}>{ic.building}</span>
   <Link href="/dashboard/customers" className="flink" style={{color:'var(--text-secondary)'}}>Firmy i osoby</Link>
   <span style={{display:'inline-flex',color:'var(--text-tertiary)'}}>{DI.chev}</span>
   <h1 className="ell" style={{margin:0,fontSize:13,lineHeight:'20px',fontWeight:500}}>{customer.name}</h1>
   <span style={{flex:'1 1 auto'}}/>
   {customer.archivedAt&&<span className="num" style={{fontSize:12,color:'var(--text-tertiary)'}}>w archiwum</span>}
  </div>
  <div className="rec-split" style={{flex:'1 1 auto',display:'flex',alignItems:'stretch',minHeight:0}}>
   <div style={{flex:'1 1 auto',minWidth:0,display:'flex',flexDirection:'column'}}>
    <div style={{display:'flex',alignItems:'flex-start',gap:16,padding:'16px 24px',flexWrap:'wrap'}}>
     <span aria-hidden="true" style={{width:40,height:40,flex:'0 0 auto',borderRadius:company?12:'50%',background:'var(--bg-subtle)',border:0,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:'var(--text-secondary)'}}>{personInitials(customer.name)}</span>
     <div style={{flex:'1 1 auto',minWidth:0,display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
       <h2 style={{margin:0,fontSize:18,lineHeight:'26px',fontWeight:600,letterSpacing:'-0.015em'}}>{customer.name}</h2>
       <div style={{display:'flex',flexWrap:'wrap',gap:'4px 16px',fontSize:12,lineHeight:'16px',color:'var(--text-secondary)'}}>
        <span title="Obiekty klienta" style={{display:'inline-flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>{ic.store}{data.counts.locations} {data.counts.locations===1?'obiekt':'obiekty'}</span>
        {extra.tax_id&&<span title="NIP" style={{display:'inline-flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>{ic.hash}<span className="mono" style={{fontSize:11}}>{extra.tax_id}</span></span>}
        {seat&&<span title={`Siedziba: ${seat.city}, ${seat.address}`} style={{display:'inline-flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>{ic.pin}{seat.city}</span>}
        {!data.canManage&&<span>Widok ograniczony do Twoich przypisań</span>}
       </div>
      </div>
      <CustomerCategories customer={id} initial={extra.categories} editable={editable} colors={catR.error?undefined:colorMap(catR.data as {name:string;color:string}[])}/>
     </div>
     <div style={{display:'flex',alignItems:'center',gap:8,flex:'0 0 auto'}}>
      <Link href="/dashboard/service/new" className="sec" title="Nowe zgłoszenie" style={{height:32,display:'inline-flex',alignItems:'center',gap:6,padding:'0 12px 0 10px',border:0,borderRadius:10,background:'var(--bg-subtle)',fontWeight:500}}>{DI.plus14}Nowe zgłoszenie</Link>
      {editable&&<OfferWizard initialCustomerId={id}/>}
     </div>
    </div>
    <nav role="tablist" aria-label="Sekcje firmy" style={{display:'flex',gap:4,padding:'0 16px',borderBottom:'1px solid var(--edge)',overflowX:'auto'}}>
     {tabs.map(t=>{const on=tab===t.id;return <Link key={t.id} role="tab" aria-selected={on} href={href(t.id)} className="tab" style={{height:36,display:'inline-flex',alignItems:'center',gap:6,padding:'0 8px',marginBottom:-1,borderBottom:on?'2px solid var(--text-primary)':'2px solid transparent',background:'transparent',color:on?'var(--text-primary)':'var(--text-secondary)',fontWeight:on?500:400,whiteSpace:'nowrap'}}><span>{t.label}</span>{t.count!==null&&<span className="num" style={{fontSize:12,color:'var(--text-tertiary)',fontWeight:400}}>{t.count}</span>}</Link>;})}
    </nav>
    {tab==='overview'?overview:<div className="rec-content" style={{padding:'20px 24px 32px'}}>
     {content}
     {tab!=='assets'&&total>0&&<nav className="crm-pagination" aria-label="Strony karty klienta">{page>1?<Link href={href(tab,page-1,{kind,archived:String(archived),filter})}>Poprzednia</Link>:<span/>}<span className="num">Strona {page} · {total} rekordów</span>{page*20<total?<Link href={href(tab,page+1,{kind,archived:String(archived),filter})}>Następna</Link>:<span/>}</nav>}
    </div>}
   </div>
   <aside aria-label="Szczegóły firmy" className="rec-aside" style={{flex:'0 0 340px',minWidth:0,borderLeft:'1px solid var(--edge)',display:'flex',flexDirection:'column',gap:20,padding:'16px 12px 24px'}}>
    <section style={{display:'flex',flexDirection:'column',gap:2}}>
     <div style={{display:'flex',alignItems:'center',gap:8,height:24,padding:'0 0 0 8px'}}><h3 style={{flex:'1 1 auto',margin:0,fontSize:12,lineHeight:'16px',fontWeight:500,color:'var(--text-secondary)'}}>Szczegóły</h3></div>
     {prop(ic.hash,extra.tax_id?<span className="mono" style={{fontSize:12}}>{extra.tax_id}</span>:none('NIP nie podano'),'NIP')}
     {prop(ic.pin,seat?`${seat.address}, ${seat.city}`:none('Brak adresu'),seat?`Siedziba: ${seat.address}, ${seat.postal_code||''} ${seat.city}`:'Adres')}
     {prop(ic.phone,customer.phone?<span className="num">{customer.phone}</span>:none('Telefon nie podano'),'Telefon',customer.phone?`tel:${customer.phone.replace(/\s+/g,'')}`:undefined)}
     {prop(ic.mail,customer.email||none('E-mail nie podano'),'E-mail',customer.email?`mailto:${customer.email}`:undefined)}
     {prop(ic.card,extra.payment_terms||none('Warunki płatności nie podano'),'Płatność')}
     {prop(ic.since,`Od ${monthYear}`,'Klient od')}
     {editable&&<details className="rec-edit" style={{padding:'0 8px'}}><summary style={{fontSize:12,color:'var(--text-secondary)',cursor:'pointer'}}>Edytuj dane</summary><RecordForm entity="customers" record={{id,name:customer.name,email:customer.email,phone:customer.phone,type:customer.type,tax_id:extra.tax_id,payment_terms:extra.payment_terms}}/></details>}
    </section>
    <div className="rec-section rec-crm" style={{padding:'0 8px'}}><CustomerCrmSummary customer={id} data={crm} editable={editable}/></div>
    <section style={{display:'flex',flexDirection:'column',gap:2}}>
     <div style={{display:'flex',alignItems:'center',gap:8,height:24,padding:'0 0 0 8px'}}><h3 style={{flex:'1 1 auto',margin:0,fontSize:12,lineHeight:'16px',fontWeight:500,color:'var(--text-secondary)'}}>Osoby</h3><Link href={href('contacts')} className="ib" aria-label="Wszystkie osoby" title="Wszystkie osoby" style={{width:24,height:24,flex:'0 0 auto',display:'inline-flex',alignItems:'center',justifyContent:'center',border:0,borderRadius:'50%',background:'transparent',color:'var(--text-tertiary)',padding:0}}>{DI.plus16}</Link></div>
     {contacts.length?contacts.map(c=><Link key={c.id} href={href('contacts')} className="row" title={[c.role,c.isPrimary?'główny kontakt':''].filter(Boolean).join(' · ')||c.name} style={{display:'flex',alignItems:'center',gap:10,minHeight:32,padding:'6px 8px',borderRadius:8}}><span aria-hidden="true" style={{width:20,height:20,flex:'0 0 auto',borderRadius:'50%',background:'var(--bg-subtle)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'var(--text-secondary)'}}>{personInitials(c.name)}</span><span className="ell" style={{flex:'1 1 auto',fontWeight:500}}>{c.name}</span>{c.isPrimary&&<span title="Główny kontakt" style={{width:8,height:8,borderRadius:'50%',background:'rgb(75, 91, 214)'}}/>}</Link>):<p style={{margin:0,padding:'4px 8px',fontSize:12,color:'var(--text-secondary)'}}>Brak osób kontaktowych.</p>}
    </section>
    {data.canManage&&<section style={{display:'flex',flexDirection:'column',gap:2}}>
     <div style={{display:'flex',alignItems:'center',gap:8,height:24,padding:'0 0 0 8px'}}><h3 style={{flex:'1 1 auto',margin:0,fontSize:12,lineHeight:'16px',fontWeight:500,color:'var(--text-secondary)'}}>Portal klienta</h3></div>
     {prop(ic.eye,'Podgląd portalu klienta','Podgląd portalu',`/portal?customer=${id}`)}
     {editable&&<details className="rec-edit" style={{padding:'0 8px'}}><summary style={{fontSize:12,color:'var(--text-secondary)',cursor:'pointer'}}>Archiwizacja klienta</summary><ArchiveForm id={id}/></details>}
    </section>}
   </aside>
  </div>
 </main>;
}
