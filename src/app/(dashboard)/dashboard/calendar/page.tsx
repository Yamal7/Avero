import Link from 'next/link';
import { z } from 'zod';
import { workOrderCalendarSchema,workVisitStates } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { addDays,displayTime,localDate,visitOnDate,weekStart } from '@/lib/service/dates';
import { visitLabels,type CalendarVisit,type Technician } from '@/lib/service/types';
import { PlanDay,type PlanDue,type PlanTech,type PlanTicket,type PlanVisit } from '@/components/plan-day';
import { DI,ticketCode } from '@/components/design-icons';
import { maintenanceListSchema } from '@hvac/api-client';
async function WeekView({params}:{params:{week?:string;technician?:string}}){
 const requested=z.string().date().safeParse(params.week),start=weekStart(requested.success?requested.data:localDate()),{db}=await requireSession();
 const [calendar,mounts,manager]=await Promise.all([db.rpc('calendar_service_visits',{p_from:start}),db.rpc('calendar_work_visits',{p_from:start}),db.rpc('can_manage_crm')]);
 if(calendar.error||mounts.error||manager.error)throw new Error('Nie udało się pobrać kalendarza.');let technicians:Technician[]=[];
 if(manager.data===true){const result=await db.rpc('service_technicians',{p_customer:null});if(result.error)throw new Error('Nie udało się pobrać techników.');technicians=result.data as Technician[];}
 const selected=manager.data===true&&technicians.some(t=>t.id===params.technician)?params.technician!:'';
 const service=(calendar.data as CalendarVisit[]).map(v=>({id:v.id,kind:'Serwis',startAt:v.scheduled_at,minutes:v.duration_minutes,status:v.status,label:visitLabels[v.status],number:'#'+String(v.ticket_number).padStart(5,'0'),title:v.subject,customer:v.customer_name,address:v.address,city:v.city,crew:v.assigned_to?[v.assigned_to]:[],href:`/dashboard/service/${v.ticket_id}`}));
 const work=workOrderCalendarSchema.parse(mounts.data).map(v=>({id:v.id,kind:'Montaż',startAt:v.startAt,minutes:v.durationMinutes,status:v.state,label:workVisitStates[v.state],number:v.number,title:v.title,customer:v.customerName,address:v.address,city:v.city,crew:v.crewIds,href:`/dashboard/work-orders/${v.orderId}`}));
 const events=[...service,...work].filter(v=>!selected||v.crew.includes(selected)).sort((a,b)=>a.startAt.localeCompare(b.startAt)||a.id.localeCompare(b.id)),href=(day:string)=>`/dashboard/calendar?${new URLSearchParams({week:day,technician:selected})}`;
 return <div><div className="page-heading"><div><p className="eyebrow">Plan pracy</p><h1>Kalendarz wizyt i montaży</h1><p>Tydzień {start} — {addDays(start,6)}. Godziny w strefie Europe/Warsaw.</p></div><div className="button-group"><Link className="button secondary" href="/dashboard/work-orders">Realizacje</Link><Link className="button secondary" href="/dashboard/service">Serwis</Link></div></div><section className="card"><form key={`${start}-${selected}`} action="/dashboard/calendar" className="search"><label>Dowolny dzień tygodnia<input type="date" name="week" defaultValue={start} required/></label>{manager.data===true&&<label>Technik<select name="technician" defaultValue={selected}><option value="">Wszyscy technicy</option>{technicians.map(t=><option value={t.id} key={t.id}>{t.email}</option>)}</select></label>}<button>Pokaż tydzień</button></form><div className="calendar-navigation"><Link href={href(addDays(start,-7))}>← Poprzedni tydzień</Link><Link href={href(localDate())}>Bieżący tydzień</Link><Link href={href(addDays(start,7))}>Następny tydzień →</Link></div></section><div className="calendar-week">{Array.from({length:7},(_,i)=>addDays(start,i)).map(day=>{const items=events.filter(v=>visitOnDate(v.startAt,v.minutes,day)),label=new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',weekday:'long',day:'numeric',month:'long'}).format(new Date(`${day}T12:00:00Z`));return <section className={`card calendar-day${day===localDate()?' calendar-today':''}`} key={day}><h2>{label}</h2>{items.length?items.map(v=><Link className={`calendar-event calendar-event-${v.status}`} href={v.href} key={`${v.kind}-${v.id}`}><div className="section-heading"><strong>{localDate(v.startAt)<day?`Kontynuacja do ${displayTime(new Date(new Date(v.startAt).getTime()+v.minutes*60000).toISOString())}`:`${displayTime(v.startAt)} · ${v.minutes} min`}</strong><span className="badge">{v.kind} · {v.label}</span></div><strong>{v.number} · {v.title}</strong><p>{v.customer}<br/>{v.address}, {v.city}</p>{manager.data===true&&<small>Ekipa: {v.crew.map(id=>technicians.find(t=>t.id===id)?.email||'Osoba nieaktywna lub bez przydziału').join(', ')||'Bez przydziału'}</small>}</Link>):<p className="muted calendar-no-visits">Brak zaplanowanych prac.</p>}</section>;})}</div></div>;
}


const sv={width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true,style:{flex:'0 0 auto'}};
const cal16=<svg {...sv} width={16} height={16}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const calDay=<svg {...sv}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const calWeek=<svg {...sv}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>;
const left=<svg {...sv} width={16} height={16}><path d="m15 18-6-6 6-6"/></svg>,right=<svg {...sv} width={16} height={16}><path d="m9 18 6-6-6-6"/></svg>;
const seg=(on:boolean):React.CSSProperties=>({height:24,display:'inline-flex',alignItems:'center',gap:6,padding:'0 8px',border:0,borderRadius:6,background:on?'var(--bg-surface)':'transparent',color:on?'var(--text-primary)':'var(--text-secondary)',fontSize:12,fontWeight:on?500:400});
const ib:React.CSSProperties={width:28,height:28,flex:'0 0 auto',display:'inline-flex',alignItems:'center',justifyContent:'center',border:0,borderRadius:'50%',background:'transparent',color:'var(--text-secondary)',padding:0};

export default async function CalendarPage({searchParams}:{searchParams:Promise<{week?:string;technician?:string;view?:string;day?:string}>}){
 const params=await searchParams;
 const today=localDate(),requested=z.string().date().safeParse(params.day),day=requested.success?requested.data:today,view=params.view==='week'||params.week?'week':'day';
 const dayLabel=new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',weekday:'long',day:'numeric',month:'long'}).format(new Date(`${day}T12:00:00Z`));
 const header=(meta?:React.ReactNode)=><>
  <div style={{display:'flex',alignItems:'center',gap:8,height:44,padding:'0 12px 0 20px'}}>
   <span style={{display:'inline-flex',color:'var(--text-secondary)'}}>{cal16}</span><span style={{color:'var(--text-secondary)'}}>Serwis</span><span style={{display:'inline-flex',color:'var(--text-tertiary)'}}>{DI.chev}</span>
   <h1 style={{margin:0,fontSize:13,lineHeight:'20px',fontWeight:500}}>Planowanie</h1><span style={{flex:'1 1 auto'}}/>{meta}
  </div>
  <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:4,padding:'8px 12px 8px 16px'}}>
   <Link href={view==='week'?'/dashboard/calendar?view=week':'/dashboard/calendar'} className="tab" style={{height:28,padding:'0 12px',borderRadius:14,background:'var(--bg-subtle)',color:'var(--text-primary)',fontWeight:500,display:'inline-flex',alignItems:'center'}}>Dziś</Link>
   {view==='day'&&<><Link className="ib" href={`/dashboard/calendar?day=${addDays(day,-1)}`} aria-label="Poprzedni dzień" title="Poprzedni dzień" style={ib}>{left}</Link><Link className="ib" href={`/dashboard/calendar?day=${addDays(day,1)}`} aria-label="Następny dzień" title="Następny dzień" style={ib}>{right}</Link><h2 title={dayLabel} style={{margin:'0 8px 0 4px',fontSize:15,lineHeight:'22px',fontWeight:600,letterSpacing:'-0.01em'}}>{dayLabel.charAt(0).toUpperCase()+dayLabel.slice(1)}</h2></>}
   <span style={{flex:'1 1 auto'}}/>
   <div role="group" aria-label="Widok" style={{display:'inline-flex',gap:2,padding:2,margin:'0 4px',borderRadius:8,background:'var(--bg-subtle)'}}>
    <Link href={`/dashboard/calendar?day=${day}`} aria-current={view==='day'?'page':undefined} title="Dzień" style={seg(view==='day')}>{calDay}Dzień</Link>
    <Link href={`/dashboard/calendar?view=week&week=${day}`} aria-current={view==='week'?'page':undefined} title="Tydzień" style={seg(view==='week')}>{calWeek}Tydzień</Link>
   </div>
   <Link href="/dashboard/service/new" className="pri" title="Nowe zgłoszenie" style={{height:28,display:'inline-flex',alignItems:'center',gap:6,padding:'0 10px 0 8px',border:0,borderRadius:8,background:'var(--accent)',color:'var(--on-accent)',fontWeight:500}}>{DI.plus14}Nowe zgłoszenie</Link>
  </div>
 </>;
 if(view==='week')return <main className="dk" style={{flex:'1 1 auto',minHeight:'100%',display:'flex',flexDirection:'column',background:'var(--bg-surface)'}}>{header()}<div className="legacy-week" style={{padding:'0 24px 24px'}}><WeekView params={params}/></div></main>;

 const {db,user}=await requireSession();
 const ticketCols='id,ticket_number,subject,priority,created_at,assigned_to,customer:customers(name),installation:installations(location:locations(address,city)),service_visits(status)';
 const [calendar,mounts,manager,open,schedule]=await Promise.all([db.rpc('calendar_service_visits',{p_from:day}),db.rpc('calendar_work_visits',{p_from:day}),db.rpc('can_manage_crm'),db.from('service_tickets').select(ticketCols).neq('status','closed').order('created_at').limit(200),db.rpc('maintenance_schedule')]);
 if(calendar.error||mounts.error||manager.error||open.error||schedule.error)throw new Error('Nie udało się pobrać planu dnia.');
 const canManage=manager.data===true;
 let techs:PlanTech[]=[];
 if(canManage){const r=await db.rpc('service_technicians',{p_customer:null});if(r.error)throw new Error('Nie udało się pobrać techników.');techs=(r.data as Technician[]).map(t=>({id:t.id,label:t.email}));}
 else techs=[{id:user.id,label:user.email||'Ja'}];
 const service=(calendar.data as CalendarVisit[]).filter(v=>v.status!=='cancelled'&&visitOnDate(v.scheduled_at,v.duration_minutes,day));
 const notes=new Map<string,string>();
 if(canManage&&service.length){const r=await db.from('service_visits').select('id,notes').in('id',service.map(v=>v.id));if(!r.error)for(const row of r.data as {id:string;notes:string|null}[])notes.set(row.id,row.notes||'');}
 const visits:PlanVisit[]=[...service.map(v=>({id:v.id,ticketId:v.ticket_id,number:ticketCode(v.ticket_number),title:v.subject,place:`${v.customer_name} · ${v.city}`,start:v.scheduled_at,minutes:v.duration_minutes,status:v.status,label:visitLabels[v.status],techIds:v.assigned_to?[v.assigned_to]:[],kind:'service' as const,href:`/dashboard/service/${v.ticket_id}`,notes:notes.get(v.id)??''})),
  ...workOrderCalendarSchema.parse(mounts.data).filter(v=>v.state!=='cancelled'&&visitOnDate(v.startAt,v.durationMinutes,day)).map(v=>({id:v.id,ticketId:null,number:v.number,title:v.title,place:`${v.customerName} · ${v.city}`,start:v.startAt,minutes:v.durationMinutes,status:v.state,label:workVisitStates[v.state],techIds:v.crewIds,kind:'work' as const,href:`/dashboard/work-orders/${v.orderId}`,notes:''}))];
 type Row={id:string;ticket_number:number;subject:string;priority:string;created_at:string;assigned_to:string|null;customer:{name:string}|null;installation:{location:{address:string;city:string}|null}|null;service_visits:{status:string}[]};
 const backlog:PlanTicket[]=((open.data||[]) as unknown as Row[]).filter(t=>!t.service_visits.some(v=>['planned','en_route','in_progress'].includes(v.status))).map(t=>({id:t.id,number:t.ticket_number,subject:t.subject,place:[t.customer?.name,t.installation?.location?.city].filter(Boolean).join(' · '),priority:t.priority,createdAt:t.created_at,assignedTo:t.assigned_to})).sort((a,b)=>(a.priority==='high'?0:1)-(b.priority==='high'?0:1)||a.createdAt.localeCompare(b.createdAt)).slice(0,30);
 const horizon=addDays(day,14);
 const due:PlanDue[]=maintenanceListSchema.parse({...schedule.data,apiVersion:'1',page:1,pageSize:20}).plans.filter(p=>p.state==='overdue'||(p.state==='upcoming'&&p.next_due_on<=horizon)).slice(0,6).map(p=>({id:p.id,title:p.title,place:`${p.customer_name} · ${p.city}`,due:p.next_due_on,overdue:p.state==='overdue',href:`/dashboard/maintenance/${p.id}`}));
 return <main className="dk" style={{flex:'1 1 auto',minHeight:'100%',display:'flex',flexDirection:'column',background:'var(--bg-surface)'}}>
  {header(<span className="num" style={{fontSize:12,color:'var(--text-tertiary)',marginRight:4}}>{visits.length} {visits.length===1?'wizyta':'wizyt'} · {backlog.length} do zaplanowania</span>)}
  <PlanDay day={day} isToday={day===today} nowIso={new Date().toISOString()} technicians={techs} visits={visits} backlog={backlog} due={due} canManage={canManage}/>
 </main>;
}
