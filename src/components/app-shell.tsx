'use client';
import { useEffect,useRef,useState,type ReactNode } from 'react';
import Link from 'next/link';
import { NotificationBellSummary } from './notification-center';
import { taskAlertsSchema,type TaskAlerts } from '@hvac/api-client';
import { taskAlertTotal,taskAlertLinks } from '@/lib/crm/task-alerts';
import { usePathname,useRouter } from 'next/navigation';
import { logout } from '@/app/(dashboard)/dashboard/actions';
import { roleLabels,type AccessRole } from '@/lib/access/types';
import { Icon,type IconName } from './icon';
import { ThemeCapsule } from './theme-switcher';
type NavEntry={href:string;label:string;icon:IconName;soon?:boolean;roles?:string[];count?:number};
type NavGroup={id:string;title:string;items:NavEntry[]};
const soon=(slug:string)=>'/dashboard/soon/'+slug;
const staff=['admin','office'];
// Full navigation from the design. Entries marked `soon` lead to a "w przygotowaniu" page until the module exists.
const groups:NavGroup[]=[
 {id:'sales',title:'Sprzedaż',items:[
  {href:soon('leady'),label:'Leady',icon:'userPlus',soon:true,roles:staff},
  {href:soon('szanse'),label:'Szanse',icon:'target',soon:true,roles:staff},
  {href:'/dashboard/offers',label:'Oferty',icon:'offer',roles:staff},
  {href:'/dashboard/templates',label:'Szablony instalacji',icon:'layers',roles:staff}]},
 {id:'crm',title:'Klienci',items:[
  {href:'/dashboard/customers',label:'Firmy i osoby',icon:'building'},
  {href:soon('obiekty'),label:'Obiekty',icon:'place',soon:true},
  {href:'/dashboard/installations',label:'Urządzenia',icon:'cube'},
  {href:soon('umowy'),label:'Umowy',icon:'contract',soon:true,roles:staff}]},
 {id:'service',title:'Serwis',items:[
  {href:'/dashboard/service',label:'Zgłoszenia',icon:'alert'},
  {href:'/dashboard/work-orders',label:'Zlecenia',icon:'tool'},
  {href:'/dashboard/calendar',label:'Planowanie',icon:'plan'},
  {href:'/dashboard/maintenance',label:'Przeglądy',icon:'cycle'}]},
 {id:'projects',title:'Projekty',items:[
  {href:soon('projekty'),label:'Projekty',icon:'stack',soon:true},
  {href:'/dashboard/tasks',label:'Zadania',icon:'task'},
  {href:'/dashboard/team-tasks',label:'Zadania zespołu',icon:'people',roles:staff}]},
 {id:'finance',title:'Finanse i magazyn',items:[
  {href:soon('faktury'),label:'Faktury',icon:'invoice',soon:true,roles:staff},
  {href:'/dashboard/catalog',label:'Katalog',icon:'book',roles:staff},
  {href:soon('magazyn'),label:'Magazyn',icon:'archive',soon:true},
  {href:soon('zakupy'),label:'Zakupy',icon:'cart',soon:true,roles:staff}]},
];
const bottom:NavEntry[]=[
 {href:soon('raporty'),label:'Raporty',icon:'chart',soon:true,roles:staff},
 {href:'/dashboard/users',label:'Użytkownicy',icon:'people',roles:['admin']},
 {href:'/portal',label:'Podgląd portalu klienta',icon:'eye',roles:staff},
 {href:'/dashboard/settings',label:'Ustawienia',icon:'sliders'},
];
const top:NavEntry[]=[{href:'/dashboard/notifications',label:'Skrzynka',icon:'inbox'},{href:'/dashboard',label:'Mój dzień',icon:'day'}];
const allEntries=[...top,...groups.flatMap(group=>group.items),...bottom];
const isActive=(href:string,pathname:string)=>href==='/dashboard'?pathname===href:pathname===href||pathname.startsWith(href+'/');
type Panel='search'|'alerts'|'profile';
export function AppShell({children,email,displayName,role,alerts,taskAlerts}:{taskAlerts:TaskAlerts;children:ReactNode;email:string;displayName:string;role:string;alerts:{overdue:number;upcoming:number;urgent:number}}){
 const router=useRouter();
 const [notificationUnread,setNotificationUnread]=useState(0);
 const mobileButton=useRef<HTMLButtonElement>(null),sidebar=useRef<HTMLElement>(null),wasOpen=useRef(false),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null);
 const [taskData,setTaskData]=useState<TaskAlerts|null>(taskAlerts),[taskLoading,setTaskLoading]=useState(false),[taskError,setTaskError]=useState(''),[alertReload,setAlertReload]=useState(0);
 useEffect(()=>{setTaskData(taskAlerts);},[taskAlerts]);
 const [mobileOpen,setMobileOpen]=useState(false),[panel,setPanel]=useState<Panel|null>(null),pathname=usePathname();
 useEffect(()=>{if(!mobileOpen)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setMobileOpen(false);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[mobileOpen]);
 useEffect(()=>{if(mobileOpen)sidebar.current?.querySelector<HTMLAnchorElement>('a')?.focus();else if(wasOpen.current)mobileButton.current?.focus();wasOpen.current=mobileOpen;},[mobileOpen]);
 useEffect(()=>{const desktop=window.matchMedia('(min-width:761px)');const close=()=>{if(desktop.matches)setMobileOpen(false);};desktop.addEventListener('change',close);return()=>desktop.removeEventListener('change',close);},[]);
 useEffect(()=>{if(panel&&!dialog.current?.open){dialog.current?.showModal();if(panel==='search')dialog.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();}else if(!panel&&dialog.current?.open)dialog.current.close();},[panel]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();trigger.current=document.activeElement as HTMLElement;setMobileOpen(false);setPanel('search');}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{if(panel!=='alerts')return;const controller=new AbortController();setTaskLoading(true);setTaskError('');
  void (async()=>{try{const r=await fetch('/api/v1/tasks/alerts',{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error('Nie udało się odświeżyć zadań.');const parsed=taskAlertsSchema.refine(v=>v.viewerId===taskAlerts.viewerId).parse(await r.json());if(!controller.signal.aborted)setTaskData(parsed);}catch{if(!controller.signal.aborted){setTaskData(null);setTaskError('Nie udało się odświeżyć Twoich zadań. Spróbuj ponownie.');}}finally{if(!controller.signal.aborted)setTaskLoading(false);}})();
  return()=>controller.abort();
 },[panel,alertReload,taskAlerts.viewerId]);
 function openPanel(value:Panel,element:HTMLElement){if(value==='alerts'){setTaskLoading(true);router.refresh();}trigger.current=element;setMobileOpen(false);setPanel(value);}
 function closePanel(){setPanel(null);}
 function finishClose(){setPanel(null);const mobile=window.matchMedia('(max-width:760px)').matches;if(mobile)mobileButton.current?.focus();else trigger.current?.focus();}
 const serviceAlerts=alerts.overdue+alerts.upcoming+alerts.urgent,totalAlerts=serviceAlerts+(taskData?taskAlertTotal(taskData):0);
 const initials=displayName.split(/\s+/).filter(Boolean).map(part=>part[0]).slice(0,2).join('').toUpperCase();
 const allowed=(entry:NavEntry)=>!entry.roles||entry.roles.includes(role);
 const current=allEntries.filter(entry=>isActive(entry.href,pathname)).sort((x,y)=>y.href.length-x.href.length)[0];
 const badge=notificationUnread||totalAlerts;
 function item(entry:NavEntry){
  const active=current?.href===entry.href;
  return <Link key={entry.href} href={entry.href} className={`pui-nav${active?' is-active':''}`} aria-current={active?'page':undefined} title={entry.soon?`${entry.label} — w przygotowaniu`:undefined} onClick={()=>setMobileOpen(false)}>
   <Icon name={entry.icon} size={16}/><span className="ell">{entry.label}</span>
   {entry.soon?<span className="pui-nav-soon">wkrótce</span>:entry.count?<span className="pui-nav-count num">{entry.count}</span>:null}
  </Link>;
 }
 return <div className={`pui-shell${mobileOpen?' is-nav-open':''}`}>
 <header className="pui-top no-print">
  <div className="pui-top-left">
   <button ref={mobileButton} type="button" className="pui-round pui-menu" aria-label={mobileOpen?'Zamknij menu':'Otwórz menu'} aria-expanded={mobileOpen} aria-controls="app-sidebar" onClick={()=>setMobileOpen(!mobileOpen)}><Icon name="menu" size={16}/></button>
   <Link className="pui-ws" href="/dashboard" aria-label="Avero — przejdź do Mojego dnia"><span className="pui-ws-mark" aria-hidden="true">A</span><span className="ell">Avero</span></Link>
   <button type="button" className="pui-round" aria-label="Szukaj" title="Szukaj  ⌘K" onClick={event=>openPanel('search',event.currentTarget)}><Icon name="find" size={16}/></button>
   <Link className="pui-round is-raised" href="/dashboard/service/new" aria-label="Nowe zgłoszenie" title="Nowe zgłoszenie"><Icon name="compose" size={16}/></Link>
  </div>
  <div className="pui-tabs" aria-label="Bieżący widok">{current&&<span className="pui-tab"><Icon name={current.icon} size={14}/><span className="ell">{current.label}</span></span>}</div>
  <span className="pui-top-spacer"/>
  <div className="pui-top-right">
   <button type="button" className="pui-round" aria-label={`Powiadomienia${notificationUnread?` — nieprzeczytane: ${notificationUnread}`:totalAlerts?` — bieżące sprawy: ${totalAlerts}`:''}`} title="Powiadomienia" onClick={event=>openPanel('alerts',event.currentTarget)}><Icon name="ring" size={16}/>{badge>0&&<span className="pui-count-dot num" aria-hidden="true">{badge>99?'99+':badge}</span>}</button>
   <button type="button" className="pui-round" aria-label={`Profil użytkownika: ${displayName}`} title={`${displayName} · ${roleLabels[role as AccessRole]||role}`} onClick={event=>openPanel('profile',event.currentTarget)}><span className="pui-avatar" aria-hidden="true">{initials||'U'}</span></button>
  </div>
 </header>
 <div className="pui-body">
  {mobileOpen&&<button className="pui-backdrop no-print" aria-label="Zamknij menu" onClick={()=>setMobileOpen(false)}/>}
  <aside ref={sidebar} className="pui-side no-print" id="app-sidebar" aria-label="Nawigacja główna">
   <nav className="pui-nav-group" aria-label="Start">{top.map(entry=>item(entry.href==='/dashboard/notifications'?{...entry,count:notificationUnread}:entry))}</nav>
   {groups.map(group=>{const items=group.items.filter(allowed);return items.length?<NavigationGroup key={group.id} id={group.id} title={group.title} viewerId={taskAlerts.viewerId}>{items.map(item)}</NavigationGroup>:null;})}
   <span className="pui-side-spacer"/>
   <nav className="pui-nav-group" aria-label="Administracja">{bottom.filter(allowed).map(item)}</nav>
  </aside>
 <dialog ref={dialog} className="shell-dialog" aria-labelledby="shell-dialog-title" onCancel={closePanel} onClose={finishClose}><div className="shell-dialog-heading"><h2 id="shell-dialog-title">{panel==='search'?'Szukaj':panel==='alerts'?'Powiadomienia':'Twój profil'}</h2><button className="sidebar-icon-button" aria-label="Zamknij okno" onClick={closePanel}>×</button></div>
 {panel==='search'&&<form action="/dashboard/customers"><label>Klient, adres, instalacja lub numer seryjny<input name="q" type="search" autoFocus maxLength={200} placeholder="Wpisz, czego szukasz…" required/></label><div className="shell-dialog-footer"><span className="muted">Enter — szukaj · Esc — zamknij</span><button type="submit"><Icon name="search" size={18}/>Szukaj</button></div></form>}
 <div hidden={panel!=='alerts'}><NotificationBellSummary open={panel==='alerts'} viewerId={taskAlerts.viewerId} onCount={setNotificationUnread} onNavigate={closePanel}/></div>
 {panel==='alerts'&&<div className="shell-alert-list"><p className="muted">Bieżące działania w Twoim dostępie. Zadania znikają z tej listy po wykonaniu lub przesunięciu terminu na przyszłość.</p><section className="shell-task-alerts" aria-labelledby="shell-task-alerts-title"><h3 id="shell-task-alerts-title">Twoje zadania</h3>{taskLoading?<p role="status" className="muted">Odświeżanie zadań…</p>:taskError?<div role="alert"><p className="error">{taskError}</p><button className="secondary" onClick={()=>setAlertReload(n=>n+1)}>Spróbuj ponownie</button></div>:taskData&&taskAlertTotal(taskData)>0?taskAlertLinks(taskData).map(item=><Link href={item.href} key={item.href} onClick={closePanel}><Icon name="check"/><span>{item.label}<strong>{item.count}</strong></span><Icon name="chevron" size={16}/></Link>):<p className="shell-no-alerts">Nie masz zaległych ani dzisiejszych zadań.</p>}<Link className="shell-task-agenda" href="/dashboard/tasks?filter=open" onClick={closePanel}>Otwórz moje zadania <Icon name="arrow" size={16}/></Link></section>{serviceAlerts>0&&<section aria-labelledby="shell-service-alerts-title"><h3 id="shell-service-alerts-title">Serwis i przeglądy</h3>{alerts.urgent>0&&<Link href="/dashboard/service?status=open" onClick={closePanel}><Icon name="wrench"/><span>Pilne zgłoszenia<strong>{alerts.urgent}</strong></span><Icon name="chevron" size={16}/></Link>}{alerts.overdue>0&&<Link href="/dashboard/maintenance?view=overdue" onClick={closePanel}><Icon name="calendar"/><span>Przeglądy po terminie<strong>{alerts.overdue}</strong></span><Icon name="chevron" size={16}/></Link>}{alerts.upcoming>0&&<Link href="/dashboard/maintenance?view=upcoming" onClick={closePanel}><Icon name="calendar"/><span>Przeglądy w ciągu 30 dni<strong>{alerts.upcoming}</strong></span><Icon name="chevron" size={16}/></Link>}</section>}</div>}
 {panel==='profile'&&<div className="profile-panel"><span className="avatar" aria-hidden="true">{initials||'U'}</span><h3>{displayName}</h3><p>{email}</p><p className="muted">{roleLabels[role as AccessRole]||role}</p><div className="pui-theme-row"><span>Ciemny motyw</span><ThemeCapsule/></div><Link className="button secondary" href="/dashboard/settings" onClick={closePanel}>Ustawienia konta</Link><form action={logout}><button className="profile-signout" type="submit">Wyloguj się</button></form></div>}</dialog>
 <div className="pui-main" inert={mobileOpen}><div className="workspace">{children}</div></div>
 </div></div>;
}

function NavigationGroup({id,title,viewerId,children}:{id:string;title:string;viewerId:string;children:ReactNode}) {
 const [collapsed,setCollapsed]=useState(false);
 const storageKey='hvac.navigation.'+viewerId+'.'+id;
 useEffect(()=>{try{setCollapsed(localStorage.getItem(storageKey)==='collapsed');}catch{setCollapsed(false);}},[storageKey]);
 function toggle(){const next=!collapsed;setCollapsed(next);try{localStorage.setItem(storageKey,next?'collapsed':'expanded');}catch{/* Navigation remains usable when storage is unavailable. */}}
 return <section className="pui-nav-group"><button type="button" className="pui-group-h" aria-expanded={!collapsed} aria-controls={'nav-group-'+id} onClick={toggle}>{title}<span className={`pui-caret${collapsed?' is-closed':''}`} aria-hidden="true"><Icon name="down" size={12}/></span></button><div id={'nav-group-'+id} className="pui-nav-group" hidden={collapsed}>{children}</div></section>;
}
