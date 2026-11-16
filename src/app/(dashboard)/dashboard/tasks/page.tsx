import Link from 'next/link';
import { redirect } from 'next/navigation';
import { myTasksQuerySchema,myTasksSchema,type MyTasksQuery } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { MyTasksBoard } from '@/components/my-tasks';
import { Icon } from '@/components/icon';
const filters:Record<MyTasksQuery['filter'],string>={today:'Dzisiaj',overdue:'Po terminie',upcoming:'Nadchodzące',open:'Otwarte',closed:'Zamknięte'};
export default async function MyTasksPage({searchParams}:{searchParams:Promise<{filter?:string;search?:string;page?:string}>}){
 const {db,user,access}=await requireSession();if(!['admin','office','technician'].includes(access.role))redirect('/portal');
 const parsed=myTasksQuerySchema.safeParse(await searchParams),query=parsed.success?parsed.data:myTasksQuerySchema.parse({}),r=await db.rpc('my_crm_tasks',{p_filter:query.filter,p_search:query.search,p_page:query.page});if(r.error)throw new Error('Nie udało się pobrać Twoich zadań.');const data=myTasksSchema.refine(v=>v.viewerId===user.id).parse(r.data);
 const href=(filter:MyTasksQuery['filter'],page=1)=>`/dashboard/tasks?${new URLSearchParams({filter,search:query.search,page:String(page)})}`;
 const dateLabel=new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',dateStyle:'long'}).format(new Date(data.today+'T12:00:00Z'));
 return <main className="my-tasks-page">
  <div className="pui-page-head cv-head">
   <span className="pui-page-sub">Projekty</span><span className="pui-crumb-sep" aria-hidden="true"><Icon name="right" size={12}/></span><h1>Zadania</h1>
   <span className="pui-spacer"/>
   <time className="pui-page-meta" dateTime={data.today}>{dateLabel}</time>
   {['admin','office'].includes(access.role)&&<div className="cv-actions"><Link className="button secondary" href="/dashboard/team-tasks">Zadania zespołu</Link></div>}
  </div>
  {!parsed.success&&<p className="error" role="alert">Filtry były nieprawidłowe. Przywrócono domyślny widok.</p>}
  <div className="list-toolbar" style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:8,padding:'8px 12px 8px 16px'}}>
   <nav className="pui-pills" aria-label="Widoki moich zadań">{Object.entries(filters).map(([filter,label])=><Link key={filter} className={`pui-pill${query.filter===filter?' is-active':''}`} href={href(filter as MyTasksQuery['filter'])} aria-current={query.filter===filter?'page':undefined}>{label}<span className="pui-pill-count">{data.counts[filter as MyTasksQuery['filter']]}</span></Link>)}</nav>
   <form action="/dashboard/tasks" className="cv-search" role="search" style={{marginLeft:'auto'}}><input type="hidden" name="filter" value={query.filter}/><label><span className="sr-only">Szukaj zadania lub klienta</span><Icon name="find" size={14}/><input type="search" name="search" maxLength={160} defaultValue={query.search} placeholder="Szukaj zadania lub klienta"/></label><button type="submit" className="sr-only">Szukaj</button></form>
  </div>
  <section aria-label={`Zadania: ${filters[query.filter]}`}><MyTasksBoard key={`${query.filter}-${query.search}-${query.page}`} data={data}/></section>
  {data.total>0&&<nav className="crm-pagination" aria-label="Strony moich zadań">{query.page>1?<Link href={href(query.filter,query.page-1)}>Poprzednia</Link>:<span/>}<span className="num">Strona {query.page} · zadań: {data.total}{query.search?' · wyszukiwanie aktywne':''}</span>{query.page*20<data.total?<Link href={href(query.filter,query.page+1)}>Następna</Link>:<span/>}</nav>}
  <p className="my-tasks-footnote">Daty według czasu polskiego. Zadania nie rezerwują terminów ekip w kalendarzu.</p>
 </main>;
}
