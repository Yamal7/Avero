import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getServiceTicket } from '@/lib/service/data';
import { displayDateTime } from '@/lib/service/dates';
import { priorityLabels,ticketLabels,visitLabels,type Technician } from '@/lib/service/types';
import { serviceJobSchema } from '@hvac/api-client';
import { DI, PersonAvatar, PriorityIcon, ProgressGlyph, personName, ticketCode } from '@/components/design-icons';
import { ServiceJobSections, type JobEvent } from '@/components/service-job';
import { AssignServiceTechnician,ScheduleVisit,TicketStatusForm,VisitActions } from '@/components/service-forms';
export default async function TicketPage({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;if(!z.string().uuid().safeParse(id).success) notFound();
 const ticket=await getServiceTicket(id);if(!ticket) notFound();
 const {db}=await requireSession();const [manager,editor]=await Promise.all([db.rpc('can_manage_crm'),db.rpc('can_edit_service_ticket',{p_ticket:id})]);
 if(manager.error||editor.error) throw new Error('Nie udało się sprawdzić dostępu do zgłoszenia.');
 const canManage=manager.data===true, canEdit=editor.data===true;
 let technicians:Technician[]=[];
 if(canManage) { const {data,error}=await db.rpc('service_technicians',{p_customer:ticket.customer_id});if(error) throw new Error('Nie udało się pobrać techników.');technicians=data as Technician[]; }
 const visits=[...ticket.service_visits].filter((v):v is typeof v&{scheduled_at:string}=>!!v.scheduled_at).sort((a,b)=>a.scheduled_at.localeCompare(b.scheduled_at));
 const location=ticket.installations.locations;
 const technician=technicians.find(t=>t.id===ticket.assigned_to);
 const jobR=canEdit?await db.rpc('service_job_details',{p_ticket:id}):null;
 if(jobR?.error)throw new Error('Nie udało się pobrać pomiarów i materiałów.');
 const job=jobR?serviceJobSchema.parse(jobR.data):{measurements:[],materials:[],comments:[]};
 const active=visits.find(v=>v.status==='in_progress'||v.status==='en_route')??visits.find(v=>v.status==='planned');
 const lastDone=[...visits].reverse().find(v=>v.status==='completed');
 const zone='Europe/Warsaw';
 const day=(v:string)=>new Intl.DateTimeFormat('pl-PL',{timeZone:zone,day:'numeric',month:'short'}).format(new Date(v)).replace('.','');
 const hm=(v:string)=>new Intl.DateTimeFormat('pl-PL',{timeZone:zone,hour:'2-digit',minute:'2-digit'}).format(new Date(v));
 const isToday=(v:string)=>new Intl.DateTimeFormat('sv-SE',{timeZone:zone}).format(new Date(v))===new Intl.DateTimeFormat('sv-SE',{timeZone:zone}).format(new Date());
 const end=(v:{scheduled_at:string;duration_minutes:number})=>new Date(new Date(v.scheduled_at).getTime()+v.duration_minutes*60000).toISOString();
 const dur=(m:number)=>m>=60?`${Math.floor(m/60)} h${m%60?` ${String(m%60).padStart(2,'0')}`:''}`:`${m} min`;
 const ageH=Math.floor((Date.now()-new Date(ticket.created_at).getTime())/3600000);
 const glyph=(st:string)=>st==='completed'?<ProgressGlyph color="var(--success)" done/>:st==='in_progress'?<ProgressGlyph color="var(--st-progress)" fraction={2/3}/>:st==='en_route'?<ProgressGlyph color="var(--st-progress)" fraction={1/3}/>:st==='cancelled'?<ProgressGlyph color="var(--text-tertiary)" dashed/>:<ProgressGlyph color="var(--text-secondary)"/>;
 const ticketGlyph=ticket.status==='closed'?<ProgressGlyph color="var(--accent)" done/>:ticket.status==='in_progress'?<ProgressGlyph color="var(--st-progress)" fraction={2/3}/>:ticket.status==='waiting'?<ProgressGlyph color="var(--warning)" fraction={1/3}/>:<ProgressGlyph color="var(--text-secondary)"/>;
 const protocols=visits.filter(v=>v.service_protocols?.status==='published');
 const techLabel=technician?.email??(ticket.assigned_to?'Technik':null);
 const events:JobEvent[]=[{at:ticket.created_at,who:null,whoId:null,text:'Utworzono zgłoszenie',ref:ticketCode(ticket.ticket_number)},...visits.flatMap(v=>[{at:v.scheduled_at,who:null,whoId:null,text:`Wizyta ${visitLabels[v.status].toLowerCase()} · ${day(v.scheduled_at)} ${hm(v.scheduled_at)}`},...(v.service_protocols?.status==='published'&&v.service_protocols.published_at?[{at:v.service_protocols.published_at,who:null,whoId:null,text:'Zatwierdzono protokół',ref:`PS-${String(v.service_protocols.protocol_number).padStart(6,'0')}`}]:[])])];
 const sv={width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true,style:{flex:'0 0 auto'}};
 const ic={tool:<svg {...sv} width={16} height={16}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,building:<svg {...sv}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>,pin:<svg {...sv}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,cube:<svg {...sv}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>,clock:<svg {...sv}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,file:<svg {...sv}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8"/></svg>,cal:<svg {...sv}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,clip:<svg {...sv}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>};
 const chip=(icon:React.ReactNode,text:React.ReactNode,title:string)=><span title={title} style={{height:22,display:'inline-flex',alignItems:'center',gap:4,padding:'0 8px 0 6px',borderRadius:11,background:'var(--bg-surface)',fontSize:12,lineHeight:'16px',color:'var(--text-secondary)',whiteSpace:'nowrap'}}>{icon}<span>{text}</span></span>;
 const capd:React.CSSProperties={height:28,display:'inline-flex',alignItems:'center',gap:6,padding:'0 10px 0 8px',border:0,borderRadius:14,background:'var(--bg-subtle)'};
 const prop=(icon:React.ReactNode,value:React.ReactNode,title:string,href?:string)=>{const st:React.CSSProperties={width:'100%',minHeight:32,display:'flex',alignItems:'center',gap:10,padding:'6px 8px',border:0,borderRadius:8,background:'transparent',lineHeight:'20px'};const inner=<><span style={{display:'inline-flex',color:'var(--text-tertiary)'}}>{icon}</span><span className="ell" style={{flex:'0 1 auto',minWidth:0}}>{value}</span></>;return href?<Link className="prop" href={href} title={title} style={st}>{inner}</Link>:<div className="prop" title={title} style={st}>{inner}</div>;};
 const sideHead=(t:string)=><div style={{display:'flex',alignItems:'center',gap:8,height:24,padding:'0 0 0 8px'}}><h3 style={{flex:'1 1 auto',margin:0,fontSize:12,lineHeight:'16px',fontWeight:500,color:'var(--text-secondary)'}}>{t}</h3></div>;
 const tabs=[{id:'przeglad',label:'Przegląd',count:null},{id:'wizyty',label:'Wizyty',count:visits.length},{id:'pomiary',label:'Pomiary',count:canEdit?job.measurements.length:null},{id:'materialy',label:'Materiały',count:canEdit?job.materials.length:null},{id:'aktywnosc',label:'Aktywność',count:canEdit?events.length+job.comments.length:null}];

 return <main className="dk" style={{flex:'1 1 auto',minHeight:'100%',display:'flex',flexDirection:'column',background:'var(--bg-surface)'}}>
  <div style={{display:'flex',alignItems:'center',gap:8,height:44,padding:'0 12px 0 20px'}}>
   <span style={{display:'inline-flex',color:'var(--text-secondary)'}}>{ic.tool}</span>
   <span style={{color:'var(--text-secondary)'}}>Serwis</span><span style={{display:'inline-flex',color:'var(--text-tertiary)'}}>{DI.chev}</span>
   <Link href="/dashboard/service" className="flink" style={{color:'var(--text-secondary)'}}>Zgłoszenia</Link><span style={{display:'inline-flex',color:'var(--text-tertiary)'}}>{DI.chev}</span>
   <h1 className="num" style={{margin:0,fontSize:13,lineHeight:'20px',fontWeight:500}}>{ticketCode(ticket.ticket_number)}</h1>
   <span style={{flex:'1 1 auto'}}/>
   <Link className="ib" href="/dashboard/calendar" aria-label="Planowanie" title="Planowanie" style={{width:24,height:24,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',color:'var(--text-secondary)'}}>{ic.cal}</Link>
  </div>
  <div className="rec-split" style={{flex:'1 1 auto',display:'flex',alignItems:'stretch',minHeight:0}}>
   <div style={{flex:'1 1 auto',minWidth:0,display:'flex',flexDirection:'column'}}>
    <div style={{display:'flex',alignItems:'flex-start',gap:16,padding:'12px 24px 16px',flexWrap:'wrap'}}>
     <div style={{flex:'1 1 auto',minWidth:0,display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',flexDirection:'column',gap:4}}>
       <h2 style={{margin:0,fontSize:18,lineHeight:'26px',fontWeight:600,letterSpacing:'-0.015em'}}>{ticket.subject}</h2>
       <div style={{display:'flex',flexWrap:'wrap',gap:'4px 16px',fontSize:12,lineHeight:'16px',color:'var(--text-secondary)'}}>
        <Link href={`/dashboard/customers/${ticket.customer_id}`} style={{display:'inline-flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>{ic.building}{ticket.customers.name}</Link>
        <span title={`${location.address}, ${location.postal_code||''} ${location.city}`} style={{display:'inline-flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>{ic.pin}{location.address}, {location.city}</span>
        <Link href={`/dashboard/installations/${ticket.installations.id}`} style={{display:'inline-flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>{ic.cube}{ticket.installations.type}</Link>
       </div>
      </div>
      <div aria-label="Właściwości zlecenia" style={{display:'flex',flexWrap:'wrap',gap:6}}>
       <span className="capd" title="Status" style={capd}>{ticketGlyph}{ticketLabels[ticket.status]}</span>
       <span className="capd" title="Priorytet" style={capd}><PriorityIcon priority={ticket.priority==='high'?'high':ticket.priority==='low'?'low':'normal'}/>{priorityLabels[ticket.priority]}</span>
       {techLabel?<span className="capd" title={`Technik: ${techLabel}`} style={{...capd,padding:'0 10px 0 4px'}}><PersonAvatar id={ticket.assigned_to!} label={techLabel}/>{personName(techLabel)}</span>:<span className="capd" title="Bez technika" style={{...capd,color:'var(--text-secondary)'}}><span style={{width:14,height:14,borderRadius:'50%',border:'1px dashed var(--border-strong)'}}/>Bez technika</span>}
       {active&&<span className="capd" title={`Najbliższa wizyta: ${active.scheduled_at}`} style={{...capd,fontWeight:500}}>{DI.calToday}{isToday(active.scheduled_at)?'Dziś':day(active.scheduled_at)}, {hm(active.scheduled_at)}</span>}
      </div>
     </div>
     {canManage&&ticket.status!=='closed'&&ticket.assigned_to&&<div style={{display:'flex',alignItems:'center',gap:8,flex:'0 0 auto'}}><a href="#nowa-wizyta" className="sec" style={{height:32,display:'inline-flex',alignItems:'center',gap:6,padding:'0 12px 0 10px',border:0,borderRadius:10,background:'var(--bg-subtle)',fontWeight:500}}>{DI.plus14}Nowa wizyta</a></div>}
    </div>
    <div style={{padding:'0 24px 16px'}}>
     <div role="status" style={{display:'flex',alignItems:'center',gap:8,minHeight:40,padding:'8px 8px 8px 12px',borderRadius:12,background:'var(--bg-raised)',flexWrap:'wrap'}}>
      {active?<>{glyph(active.status)}<span style={{fontWeight:500,marginRight:4}}>{visitLabels[active.status]}</span>{chip(ic.clock,`${isToday(active.scheduled_at)?'dziś':day(active.scheduled_at)} ${hm(active.scheduled_at)}`,'Termin wizyty')}{chip(ic.cal,`plan ${dur(active.duration_minutes)}`,'Planowany czas')}</>:lastDone?<>{glyph('completed')}<span style={{fontWeight:500,marginRight:4}}>Ostatnia wizyta zakończona</span>{chip(ic.clock,day(lastDone.completed_at||lastDone.scheduled_at),'Data zakończenia')}</>:<><ProgressGlyph color="var(--text-secondary)"/><span style={{fontWeight:500}}>{ticket.status==='closed'?'Zlecenie zamknięte':'Brak zaplanowanej wizyty'}</span></>}
      <span style={{flex:'1 1 auto'}}/>
      {ticket.status!=='closed'&&chip(ic.clock,ageH<48?`${ageH} h`:`${Math.floor(ageH/24)} dni`,`Od zgłoszenia: ${displayDateTime(ticket.created_at)}`)}
     </div>
    </div>
    <nav role="tablist" aria-label="Sekcje zlecenia" style={{display:'flex',gap:4,padding:'0 16px',borderBottom:'1px solid var(--edge)',overflowX:'auto'}}>
     {tabs.filter(t=>canEdit||!['pomiary','materialy','aktywnosc'].includes(t.id)).map((t,i)=><a key={t.id} role="tab" aria-selected={i===0} href={`#${t.id}`} className="tab" style={{height:36,display:'inline-flex',alignItems:'center',gap:6,padding:'0 8px',marginBottom:-1,borderBottom:i===0?'2px solid var(--text-primary)':'2px solid transparent',color:i===0?'var(--text-primary)':'var(--text-secondary)',fontWeight:i===0?500:400,whiteSpace:'nowrap'}}><span>{t.label}</span>{t.count!==null&&<span className="num" style={{fontSize:12,color:'var(--text-tertiary)',fontWeight:400}}>{t.count}</span>}</a>)}
    </nav>
    <div id="przeglad" style={{display:'flex',flexDirection:'column',gap:28,padding:'20px 24px 32px',maxWidth:960}}>
     <section style={{display:'flex',flexDirection:'column',gap:4}}>
      <div style={{display:'flex',alignItems:'center',gap:8,height:28}}><h3 style={{margin:0,fontSize:13,lineHeight:'20px',fontWeight:500}}>Zgłoszenie</h3><span style={{flex:'1 1 auto'}}/><span className="mono" style={{fontSize:11,color:'var(--text-tertiary)'}}>{ticketCode(ticket.ticket_number)}</span></div>
      <div style={{display:'flex',flexDirection:'column',gap:8,padding:'12px 14px',borderRadius:12,background:'var(--bg-raised)'}}><p className="preserve-lines" style={{margin:0}}>{ticket.description}</p><span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,lineHeight:'16px',color:'var(--text-secondary)'}}><span>{ticket.customers.name}</span><span className="num" title={displayDateTime(ticket.created_at)} style={{color:'var(--text-tertiary)'}}>{day(ticket.created_at)}, {hm(ticket.created_at)}</span></span></div>
     </section>
     <section id="wizyty" style={{display:'flex',flexDirection:'column',gap:4}}>
      <div style={{display:'flex',alignItems:'center',gap:8,height:28}}><h3 style={{margin:0,fontSize:13,lineHeight:'20px',fontWeight:500}}>Wizyty</h3><span className="num" style={{fontSize:12,color:'var(--text-tertiary)'}}>{visits.length}</span><span style={{flex:'1 1 auto'}}/><Link href="/dashboard/calendar" className="ghost" style={{height:28,display:'inline-flex',alignItems:'center',gap:6,padding:'0 8px',borderRadius:8,color:'var(--text-secondary)',fontSize:12}}>{ic.cal}W planowaniu</Link></div>
      {visits.length?<ol style={{margin:'0 -8px',padding:0,listStyle:'none',display:'flex',flexDirection:'column'}}>{visits.map(v=>{const proto=v.service_protocols;return <li key={v.id}>
       <div className="row" title={v.notes||undefined} style={{display:'grid',gridTemplateColumns:'14px 52px 120px minmax(0px, 1fr) auto 20px',columnGap:12,alignItems:'center',minHeight:40,padding:'6px 8px',borderRadius:10}}>
        <span role="img" aria-label={visitLabels[v.status]} title={visitLabels[v.status]} style={{display:'inline-flex'}}>{glyph(v.status)}</span>
        <span className="num" style={{color:'var(--text-secondary)'}}>{isToday(v.scheduled_at)?'dziś':day(v.scheduled_at)}</span>
        <span className="num" style={{fontSize:12,color:'var(--text-tertiary)'}}>{hm(v.scheduled_at)}–{hm(v.completed_at||end(v))}</span>
        <span className="ell" style={{fontWeight:500}}>{v.notes?v.notes.split('\n')[0]:visitLabels[v.status]}</span>
        <span style={{display:'flex',gap:4}}>{proto?.status==='published'&&<Link href={`/dashboard/service/protocols/${proto.id}`} title={`Protokół PS-${String(proto.protocol_number).padStart(6,'0')}`} aria-label="Otwórz protokół" style={{height:22,display:'inline-flex',alignItems:'center',gap:4,padding:'0 8px 0 6px',borderRadius:11,background:'var(--bg-subtle)',fontSize:12,lineHeight:'16px',color:'var(--text-secondary)'}}>{ic.file}<span className="mono" style={{fontSize:11}}>PS-{String(proto.protocol_number).padStart(6,'0')}</span></Link>}<span title="Czas wizyty" style={{height:22,display:'inline-flex',alignItems:'center',gap:4,padding:'0 8px 0 6px',borderRadius:11,background:'var(--bg-subtle)',fontSize:12,lineHeight:'16px',color:'var(--text-secondary)'}}>{ic.clock}<span>{dur(v.duration_minutes)}</span></span></span>
        <span>{ticket.assigned_to&&techLabel&&<PersonAvatar id={ticket.assigned_to} label={techLabel}/>}</span>
       </div>
       {canEdit&&ticket.status!=='closed'&&<div className="rec-item" style={{border:0,padding:'0 8px 8px 34px'}}><VisitActions key={v.status} visit={v} manager={canManage}/>
        {canManage&&['planned','cancelled'].includes(v.status)&&<details className="rec-edit"><summary style={{fontSize:12,color:'var(--text-secondary)',cursor:'pointer'}}>{v.status==='cancelled'?'Ustal ponownie termin':'Zmień termin wizyty'}</summary><ScheduleVisit key={`${v.scheduled_at}-${v.duration_minutes}`} ticketId={id} visit={v}/></details>}
        {proto&&proto.status!=='published'&&<Link href={`/dashboard/service/protocols/${proto.id}`} style={{fontSize:12}}>Otwórz szkic protokołu</Link>}
       </div>}
      </li>;})}</ol>:<p style={{margin:0,color:'var(--text-secondary)'}}>Nie zaplanowano jeszcze wizyty.</p>}
      {canManage&&ticket.status!=='closed'&&<div id="nowa-wizyta" className="rec-block" style={{marginTop:8,padding:'12px 14px',borderRadius:12,background:'var(--bg-raised)'}}><h3 style={{margin:0,fontSize:13,fontWeight:500}}>Zaplanuj nową wizytę</h3>{ticket.assigned_to?<ScheduleVisit ticketId={id}/>:<p style={{margin:0,fontSize:12,color:'var(--text-secondary)'}}>Najpierw przypisz aktywnego technika do zgłoszenia.</p>}</div>}
     </section>
     {canEdit&&<ServiceJobSections ticketId={id} initial={job} events={events} editable={canEdit} closed={ticket.status==='closed'} visitLabel={lastDone?day(lastDone.completed_at||lastDone.scheduled_at):null}/>}
    </div>
   </div>
   <aside aria-label="Szczegóły zlecenia" className="rec-aside" style={{flex:'0 0 340px',minWidth:0,borderLeft:'1px solid var(--edge)',display:'flex',flexDirection:'column',gap:20,padding:'16px 12px 24px'}}>
    <section style={{display:'flex',flexDirection:'column',gap:2}}>
     {sideHead('Szczegóły')}
     {prop(ic.building,ticket.customers.name,'Klient',`/dashboard/customers/${ticket.customer_id}`)}
     {prop(ic.pin,`${location.address}, ${location.postal_code||''} ${location.city}`,'Adres')}
     {prop(ic.cube,ticket.installations.type,'Instalacja',`/dashboard/installations/${ticket.installations.id}`)}
     {prop(ic.clock,`Zgłoszono ${displayDateTime(ticket.created_at)}`,'Utworzono')}
     {protocols.length>0&&prop(ic.file,`${protocols.length} ${protocols.length===1?'protokół':'protokoły'}`,'Protokoły')}
    </section>
    {(canManage||canEdit)&&<section style={{display:'flex',flexDirection:'column',gap:8}}>
     {sideHead('Obsługa')}
     <div className="rec-section" style={{padding:'0 8px',border:0}}>
      {canManage&&<AssignServiceTechnician key={ticket.assigned_to||'unassigned'} id={id} assigned={ticket.assigned_to} technicians={technicians}/>}
      {canEdit&&<TicketStatusForm key={`${ticket.status}-${ticket.priority}`} id={id} status={ticket.status} priority={ticket.priority} manager={canManage}/>}
     </div>
    </section>}
    <section style={{display:'flex',flexDirection:'column',gap:2}}>
     {sideHead('Załączniki')}
     {prop(ic.clip,'Dokumenty i zdjęcia zgłoszenia','Załączniki',`/dashboard/installations/${ticket.installations.id}/documents?ticket=${id}`)}
    </section>
   </aside>
  </div>
 </main>;
}
