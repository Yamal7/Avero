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
import { CommandPalette,type PaletteEntry } from './command-palette';
import { Bell, CaretDown, MagnifyingGlass, NotePencil, Plus } from '@phosphor-icons/react/ssr';
import { cx } from '@/lib/cx';

/* Rama aplikacji (M0.2): wyłącznie klasy Tailwinda na tokenach. Klasy pui-shell, av i pui-main zostają jako
   zaczepienia dla arkuszy ekranów sprzed przebudowy (np. .pui-main h1, .av .ib) — nie niosą już stylów ramy. */
const focusRing='focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';
const shell={
 root:'pui-shell av flex h-dvh flex-col bg-shell text-primary print:h-auto print:bg-transparent',
 top:'flex h-12 flex-none items-center gap-2 pl-2 pr-3 max-desktop:px-2 print:hidden',
 topLeft:'flex min-w-0 shrink-0 grow-0 basis-54 items-center gap-1 max-desktop:shrink max-desktop:basis-auto',
 round:`relative size-7 min-h-0 flex-none items-center justify-center rounded-pill border-0 p-0 text-secondary no-underline transition-colors hover:bg-shell-hover ${focusRing}`,
 workspace:`flex h-8 min-h-0 min-w-0 flex-auto items-center justify-start gap-2 rounded-md border-0 bg-transparent px-2 text-left text-body leading-5 font-medium text-primary transition-colors hover:bg-shell-hover ${focusRing}`,
 mark:'inline-flex size-5 flex-none items-center justify-center rounded-xs bg-primary text-micro font-semibold text-shell',
 tabs:'flex min-w-0 flex-initial items-center overflow-hidden max-desktop:flex-auto',
 pinnedTab:`inline-flex size-7 flex-none items-center justify-center rounded-sm border-0 p-0 no-underline transition-colors ${focusRing}`,
 tab:`inline-flex h-7 min-w-0 max-w-50 flex-initial items-center rounded-sm border-0 text-small no-underline transition-colors ${focusRing}`,
 tabOn:'bg-surface text-primary',
 tabOff:'bg-transparent hover:bg-shell-hover hover:text-primary',
 newTab:`inline-flex size-6 min-h-0 flex-none items-center justify-center rounded-sm border-0 bg-transparent p-0 text-tertiary transition-colors hover:bg-subtle hover:text-primary ${focusRing}`,
 badge:'pointer-events-none absolute h-3.5 min-w-3.5 rounded-pill bg-primary text-center font-semibold text-shell tabular-nums',
 avatar:'inline-flex size-6 items-center justify-center rounded-pill border-0 bg-surface font-medium text-secondary',
 backdrop:'fixed inset-0 z-55 hidden size-full min-h-0 rounded-none border-0 bg-scrim p-0 max-desktop:block print:hidden',
 side:'flex flex-none basis-sidebar flex-col gap-4 overflow-x-hidden overflow-y-auto px-2 pt-1 pb-4 max-desktop:fixed max-desktop:inset-y-0 max-desktop:left-0 max-desktop:z-60 max-desktop:w-68 max-desktop:border-r max-desktop:border-border max-desktop:bg-shell max-desktop:pt-3 max-desktop:transition-all max-desktop:duration-base print:hidden',
 groupHead:`flex h-7 min-h-0 w-full items-center justify-start gap-1 rounded-sm border-0 bg-transparent px-2 text-left text-small leading-4 font-medium text-tertiary transition-colors hover:bg-transparent hover:text-secondary max-desktop:h-11 ${focusRing}`,
 nav:`group flex h-7 w-full items-center justify-start gap-2 rounded-sm border-0 px-2 text-left no-underline transition-colors max-desktop:h-11 ${focusRing}`,
 navIdle:'bg-transparent font-normal text-secondary hover:bg-shell-hover hover:text-primary',
 navActive:'bg-shell-hover font-medium text-primary',
 navIcon:'shrink-0 text-tertiary transition-colors group-hover:text-primary',
 main:'pui-main relative mr-2 mb-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-edge bg-surface max-desktop:mx-1 max-desktop:mb-1 max-desktop:rounded-lg print:m-0 print:overflow-visible print:rounded-none print:border-0',
};
/* eslint-disable avero/tailwind-tokens -- Wartości 1:1 z makiety ramy spoza siatki 4 px i spoza tokenów (2, 6, 10 px, 1 px,
   tekst 10 px). Zostawione, żeby rama wyglądała jak przed M0.2; do decyzji projektu (docs/STATUS.md › Pytania do projektu). */
const offGrid={
 tabsGap:'gap-0.5',
 pinnedEnd:'mr-1.5',
 tab:'gap-1.5 px-2.5',
 navGap:'gap-px',
 badge:'top-0.5 right-0.5 px-0.75 text-[10px] leading-3.5',
 avatarText:'text-[10px]',
};
/* eslint-enable avero/tailwind-tokens */
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
  {href:'/dashboard/stock',label:'Magazyn',icon:'archive'},
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
const paletteActions=(role:string):PaletteEntry[]=>[{href:'/dashboard/service/new',label:'Nowe zgłoszenie serwisowe',icon:'alert'},...(staff.includes(role)?[{href:'/dashboard/customers/new',label:'Nowy klient',icon:'building' as IconName},{href:'/dashboard/offers',label:'Nowa oferta',icon:'offer' as IconName},{href:'/dashboard/catalog/new',label:'Nowa pozycja katalogu',icon:'book' as IconName}]:[])];
export function AppShell({children,email,displayName,role,alerts,taskAlerts,companyName}:{taskAlerts:TaskAlerts;children:ReactNode;email:string;displayName:string;role:string;alerts:{overdue:number;upcoming:number;urgent:number};companyName?:string|null}){
 const company=(companyName||'').trim()||'Avero';
 const router=useRouter();
 const [notificationUnread,setNotificationUnread]=useState(0);
 const mobileButton=useRef<HTMLButtonElement>(null),sidebar=useRef<HTMLElement>(null),wasOpen=useRef(false),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null);
 const [taskData,setTaskData]=useState<TaskAlerts|null>(taskAlerts),[taskLoading,setTaskLoading]=useState(false),[taskError,setTaskError]=useState(''),[alertReload,setAlertReload]=useState(0);
 useEffect(()=>{setTaskData(taskAlerts);},[taskAlerts]);
 const [palette,setPalette]=useState(false);
 const [mobileOpen,setMobileOpen]=useState(false),[panel,setPanel]=useState<Panel|null>(null),pathname=usePathname();
 useEffect(()=>{if(!mobileOpen)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setMobileOpen(false);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[mobileOpen]);
 useEffect(()=>{if(mobileOpen)sidebar.current?.querySelector<HTMLAnchorElement>('a')?.focus();else if(wasOpen.current)mobileButton.current?.focus();wasOpen.current=mobileOpen;},[mobileOpen]);
 useEffect(()=>{const desktop=window.matchMedia('(min-width:761px)');const close=()=>{if(desktop.matches)setMobileOpen(false);};desktop.addEventListener('change',close);return()=>desktop.removeEventListener('change',close);},[]);
 useEffect(()=>{if(panel&&!dialog.current?.open){dialog.current?.showModal();if(panel==='search')dialog.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();}else if(!panel&&dialog.current?.open)dialog.current.close();},[panel]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();trigger.current=document.activeElement as HTMLElement;setMobileOpen(false);setPalette(true);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
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
 const pinned=[top[0],allEntries.find(e=>e.href==='/dashboard/calendar')!];
 const recent=useRecentTabs(pathname,current,viewerKey(taskAlerts.viewerId),pinned.map(e=>e.href).join('|'));
 const currentTabHref=recent.find(t=>t.href===pathname)?.href??current?.href;
 /* Tab shortcuts from the design: ⌘T new tab (palette), ⌘1–9 switch tabs. Browsers keep ⌘T and ⌘1–9 for their own tabs,
    so ⌥T and ⌥1–9 do the same everywhere; ⌘ works where the browser passes it on (installed app window). */
 const tabHrefs=[...pinned.map(e=>e.href),...recent.map(t=>t.href)];
 const tabsRef=useRef(tabHrefs);tabsRef.current=tabHrefs;
 useEffect(()=>{const key=(event:KeyboardEvent)=>{
  if(!(event.metaKey||event.ctrlKey||event.altKey)||event.shiftKey)return;
  const t=event.target as HTMLElement|null;if(event.altKey&&!event.metaKey&&!event.ctrlKey&&t&&(t.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(t.tagName)))return;
  const digit=/^Digit([1-9])$/.exec(event.code);
  if(event.code==='KeyT'){event.preventDefault();trigger.current=document.activeElement as HTMLElement;setMobileOpen(false);setPalette(true);return;}
  if(digit){const href=digit[1]==='9'?tabsRef.current[tabsRef.current.length-1]:tabsRef.current[Number(digit[1])-1];if(href){event.preventDefault();router.push(href);}}
 };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[router]);
 function item(entry:NavEntry){
  const active=current?.href===entry.href;
  return <Link key={entry.href} href={entry.href} className={cx(shell.nav,active?shell.navActive:shell.navIdle)} aria-current={active?'page':undefined} title={entry.soon?`${entry.label} — w przygotowaniu`:undefined} onClick={()=>setMobileOpen(false)}>
   <Icon name={entry.icon} size={16} className={active?'shrink-0 text-primary':shell.navIcon}/><span className="min-w-0 flex-auto truncate">{entry.label}</span>
   {!entry.soon&&entry.count?<span className="text-small text-tertiary tabular-nums">{entry.count}</span>:null}
  </Link>;
 }
 return <div className={shell.root}>
 <header className={cx(shell.top,'no-print')}>
  <div className={shell.topLeft}>
   <button ref={mobileButton} type="button" className={cx(shell.round,'hidden bg-transparent hover:text-primary max-desktop:inline-flex')} aria-label={mobileOpen?'Zamknij menu':'Otwórz menu'} aria-expanded={mobileOpen} aria-controls="app-sidebar" onClick={()=>setMobileOpen(!mobileOpen)}><Icon name="menu" size={16}/></button>
   <button type="button" className={shell.workspace} title={`${company} · ${displayName}`} onClick={event=>openPanel('profile',event.currentTarget)}><span className={shell.mark}>{company.trim()[0]?.toUpperCase()||'A'}</span><span className="min-w-0 truncate font-medium max-desktop:hidden">{company}</span><CaretDown size={14} className="shrink-0 text-tertiary" aria-hidden /></button>
   <button type="button" className={cx(shell.round,'inline-flex bg-transparent')} aria-label="Szukaj" title="Szukaj  ⌘K" aria-keyshortcuts="Meta+K" onClick={()=>{setMobileOpen(false);setPalette(true);}}><MagnifyingGlass size={16} aria-hidden /></button>
   <Link className={cx(shell.round,'inline-flex bg-surface')} href="/dashboard/service/new" aria-label="Nowe zgłoszenie" title="Nowe zgłoszenie  C" aria-keyshortcuts="C"><NotePencil size={16} aria-hidden /></Link>
  </div>
  <div role="tablist" aria-label="Karty" className={cx(shell.tabs,offGrid.tabsGap)}>
   {pinned.map((entry,i)=>{const on=current?.href===entry.href;return <Link key={entry.href} role="tab" aria-selected={on} href={entry.href} className={cx(shell.pinnedTab,on?shell.tabOn:cx(shell.tabOff,i===0?'text-tertiary':'text-secondary'),i===pinned.length-1&&offGrid.pinnedEnd)} aria-label={`${entry.label}, karta przypięta`} title={entry.label}><Icon name={entry.icon} size={14}/></Link>;})}
   {recent.map(tabEntry=>{const on=tabEntry.href===currentTabHref;return <Link key={tabEntry.href} role="tab" aria-selected={on} href={tabEntry.href} className={cx(shell.tab,offGrid.tab,on?cx(shell.tabOn,'font-medium'):cx(shell.tabOff,'font-normal text-secondary'))} title={tabEntry.label}><Icon name={tabEntry.icon} size={14}/><span className="min-w-0 truncate">{tabEntry.label}</span></Link>;})}
  </div>
  <button type="button" className={shell.newTab} aria-label="Nowa karta" title="Nowa karta  ⌥T  ·  przełączanie kart ⌥1–9" aria-keyshortcuts="Alt+T" onClick={()=>{setMobileOpen(false);setPalette(true);}}><Plus size={14} aria-hidden /></button>
  <span className="flex-auto"/>
  <div className="flex flex-none items-center gap-1">
   <span className="relative inline-flex"><button type="button" className={cx(shell.round,'inline-flex bg-transparent')} aria-label={`Powiadomienia${notificationUnread?` — nieprzeczytane: ${notificationUnread}`:totalAlerts?` — bieżące sprawy: ${totalAlerts}`:''}`} title="Powiadomienia  G I" onClick={event=>openPanel('alerts',event.currentTarget)}><Bell size={16} aria-hidden /></button>{badge>0&&<span aria-hidden="true" className={cx(shell.badge,offGrid.badge)}>{badge>99?'99+':badge}</span>}</span>
   <button type="button" className={cx(shell.round,'inline-flex bg-transparent')} aria-label={`${displayName}, ${roleLabels[role as AccessRole]||role}`} title={`${displayName} · ${roleLabels[role as AccessRole]||role}`} onClick={event=>openPanel('profile',event.currentTarget)}><span className={cx(shell.avatar,offGrid.avatarText)}>{initials||'U'}</span></button>
  </div>
 </header>
 <div className="flex min-h-0 flex-auto items-stretch">
  {mobileOpen&&<button className={shell.backdrop} aria-label="Zamknij menu" onClick={()=>setMobileOpen(false)}/>}
  <aside ref={sidebar} className={cx(shell.side,mobileOpen?'max-desktop:visible max-desktop:translate-x-0':'max-desktop:invisible max-desktop:-translate-x-full','no-print')} id="app-sidebar" aria-label="Nawigacja główna">
   <nav className={cx('flex flex-col',offGrid.navGap)} aria-label="Start">{top.map(entry=>item(entry.href==='/dashboard/notifications'?{...entry,count:notificationUnread}:entry))}</nav>
   {groups.map(group=>{const items=group.items.filter(allowed);return items.length?<NavigationGroup key={group.id} id={group.id} title={group.title} viewerId={taskAlerts.viewerId}>{items.map(item)}</NavigationGroup>:null;})}
   <span className="flex-auto"/>
   <nav className={cx('flex flex-col',offGrid.navGap)} aria-label="Administracja">{bottom.filter(allowed).map(item)}</nav>
  </aside>
 <CommandPalette open={palette} onClose={()=>setPalette(false)} actions={paletteActions(role)} places={allEntries.filter(entry=>allowed(entry)&&!entry.soon).map(entry=>({href:entry.href,label:entry.label,icon:entry.icon}))}/>
 <dialog ref={dialog} className="shell-dialog" aria-labelledby="shell-dialog-title" onCancel={closePanel} onClose={finishClose}><div className="shell-dialog-heading"><h2 id="shell-dialog-title">{panel==='search'?'Szukaj':panel==='alerts'?'Powiadomienia':'Twój profil'}</h2><button className="sidebar-icon-button" aria-label="Zamknij okno" onClick={closePanel}>×</button></div>
 {panel==='search'&&<form action="/dashboard/customers"><label>Klient, adres, instalacja lub numer seryjny<input name="q" type="search" autoFocus maxLength={200} placeholder="Wpisz, czego szukasz…" required/></label><div className="shell-dialog-footer"><span className="muted">Enter — szukaj · Esc — zamknij</span><button type="submit"><Icon name="search" size={18}/>Szukaj</button></div></form>}
 <div hidden={panel!=='alerts'}><NotificationBellSummary open={panel==='alerts'} viewerId={taskAlerts.viewerId} onCount={setNotificationUnread} onNavigate={closePanel}/></div>
 {panel==='alerts'&&<div className="shell-alert-list"><p className="muted">Bieżące działania w Twoim dostępie. Zadania znikają z tej listy po wykonaniu lub przesunięciu terminu na przyszłość.</p><section className="shell-task-alerts" aria-labelledby="shell-task-alerts-title"><h3 id="shell-task-alerts-title">Twoje zadania</h3>{taskLoading?<p role="status" className="muted">Odświeżanie zadań…</p>:taskError?<div role="alert"><p className="error">{taskError}</p><button className="secondary" onClick={()=>setAlertReload(n=>n+1)}>Spróbuj ponownie</button></div>:taskData&&taskAlertTotal(taskData)>0?taskAlertLinks(taskData).map(item=><Link href={item.href} key={item.href} onClick={closePanel}><Icon name="check"/><span>{item.label}<strong>{item.count}</strong></span><Icon name="chevron" size={16}/></Link>):<p className="shell-no-alerts">Nie masz zaległych ani dzisiejszych zadań.</p>}<Link className="shell-task-agenda" href="/dashboard/tasks?filter=open" onClick={closePanel}>Otwórz moje zadania <Icon name="arrow" size={16}/></Link></section>{serviceAlerts>0&&<section aria-labelledby="shell-service-alerts-title"><h3 id="shell-service-alerts-title">Serwis i przeglądy</h3>{alerts.urgent>0&&<Link href="/dashboard/service?status=open" onClick={closePanel}><Icon name="wrench"/><span>Pilne zgłoszenia<strong>{alerts.urgent}</strong></span><Icon name="chevron" size={16}/></Link>}{alerts.overdue>0&&<Link href="/dashboard/maintenance?view=overdue" onClick={closePanel}><Icon name="calendar"/><span>Przeglądy po terminie<strong>{alerts.overdue}</strong></span><Icon name="chevron" size={16}/></Link>}{alerts.upcoming>0&&<Link href="/dashboard/maintenance?view=upcoming" onClick={closePanel}><Icon name="calendar"/><span>Przeglądy w ciągu 30 dni<strong>{alerts.upcoming}</strong></span><Icon name="chevron" size={16}/></Link>}</section>}</div>}
 {panel==='profile'&&<div className="profile-panel"><span className="avatar" aria-hidden="true">{initials||'U'}</span><h3>{displayName}</h3><p>{email}</p><p className="muted">{roleLabels[role as AccessRole]||role}</p><div className="pui-theme-row"><span>Ciemny motyw</span><ThemeCapsule/></div><Link className="button secondary" href="/dashboard/settings" onClick={closePanel}>Ustawienia konta</Link><form action={logout}><button className="profile-signout" type="submit">Wyloguj się</button></form></div>}</dialog>
 <div className={shell.main} inert={mobileOpen}><div className="workspace">{children}</div></div>
 </div></div>;
}

/* Collapsed sidebar groups are kept on the account (design: they follow the person between devices); localStorage only
   makes the first paint match before the account answers. */
let accountPrefs:Promise<Record<string,unknown>>|null=null;
function loadPrefs(){accountPrefs??=fetch('/api/v1/me/preferences',{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}));return accountPrefs;}
function NavigationGroup({id,title,viewerId,children}:{id:string;title:string;viewerId:string;children:ReactNode}) {
 const [collapsed,setCollapsed]=useState(false);
 const storageKey='hvac.navigation.'+viewerId+'.'+id,prefKey='nav.'+id.toLowerCase().replace(/[^a-z0-9_.-]/g,'-');
 useEffect(()=>{let live=true;try{setCollapsed(localStorage.getItem(storageKey)==='collapsed');}catch{setCollapsed(false);}
  void loadPrefs().then(p=>{const v=p[prefKey];if(live&&typeof v==='boolean'){setCollapsed(v);try{localStorage.setItem(storageKey,v?'collapsed':'expanded');}catch{/* ignore */}}});
  return()=>{live=false;};},[storageKey,prefKey]);
 function toggle(){const next=!collapsed;setCollapsed(next);try{localStorage.setItem(storageKey,next?'collapsed':'expanded');}catch{/* Navigation remains usable when storage is unavailable. */}
  accountPrefs=null;void fetch('/api/v1/me/preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:prefKey,value:next})}).catch(()=>{});}
 return <section className={cx('flex flex-col',offGrid.navGap)}><button type="button" className={shell.groupHead} aria-expanded={!collapsed} aria-controls={'nav-group-'+id} onClick={toggle}>{title}<span className={cx('inline-flex transition-transform',collapsed&&'-rotate-90')} aria-hidden="true"><Icon name="down" size={12}/></span></button><div id={'nav-group-'+id} className={cx(collapsed?'hidden':'flex','flex-col',offGrid.navGap)} hidden={collapsed}>{children}</div></section>;
}


/* Recently opened screens shown as tabs in the top bar (design: "Karty"). Kept per user in localStorage; module pages use their
   navigation label, record pages the page heading. */
type RecentTab={href:string;label:string;icon:IconName};
const viewerKey=(id:string)=>'hvac.tabs.'+id;
function useRecentTabs(pathname:string,current:NavEntry|undefined,key:string,excludeKey:string){
 const [tabs,setTabs]=useState<RecentTab[]>([]);
 useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(raw))setTabs(raw.filter((t:RecentTab)=>t&&typeof t.href==='string'&&typeof t.label==='string').slice(0,5));}catch{/* tabs are a convenience */}},[key]);
 useEffect(()=>{
  if(!current||excludeKey.split('|').includes(pathname)||pathname.startsWith('/dashboard/soon'))return;
  const timer=window.setTimeout(()=>{
   const isModule=current.href===pathname;
   const heading=document.querySelector('.pui-main main h1')?.textContent?.replace(/\s+/g,' ').trim();
   if(document.querySelector('.pui-main .error-state, .pui-main [data-error-boundary]')||heading==='Nie udało się wczytać danych')return;
   const label=isModule?current.label:(heading&&heading.length<=60?heading:current.label);
   setTabs(prev=>{const next=[{href:pathname,label,icon:current.icon},...prev.filter(t=>t.href!==pathname)].slice(0,5);try{localStorage.setItem(key,JSON.stringify(next));}catch{/* ignore */}return next;});
  },400);
  return()=>window.clearTimeout(timer);
 },[pathname,current,key,excludeKey]);
 return tabs;
}
