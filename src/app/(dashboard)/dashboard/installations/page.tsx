import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { Icon } from '@/components/icon';
import { ListHeader,ListSearch,ListTabs,ListTable } from '@/components/list-layout';
import { RecordActions } from '@/components/record-actions';
type InstallationRow={id:string;type:string;status:string;installed_on:string|null;locations:{address:string;city:string;customers:{id:string;name:string}};devices:{id:string;manufacturer:string;model:string|null;serial_number:string|null}[]};
const statuses:Record<string,string>={active:'Aktywne',inactive:'Nieaktywne',archived:'Archiwalne'};
export default async function Installations({searchParams}:{searchParams:Promise<{page?:string;q?:string;status?:string}>}){
 const params=await searchParams,q=(params.q||'').trim().slice(0,200),status=Object.keys(statuses).includes(params.status||'')?params.status!:'all';
 const page=Math.min(100000,Math.max(1,Number.parseInt(params.page||'1',10)||1));
 const {db}=await requireSession();
 let query=db.from('installations').select('id,type,status,installed_on,locations!inner(address,city,customers!inner(id,name)),devices(id,manufacturer,model,serial_number)',{count:'exact'});
 if(q)query=query.ilike('type',`%${q.replace(/[\\%_]/g,'\\$&')}%`);
 if(status!=='all')query=query.eq('status',status);
 const {data,error,count}=await query.order('created_at',{ascending:false}).order('id').range((page-1)*25,page*25-1);
 if(error)throw new Error('Nie udało się pobrać instalacji.');
 const installations=data as unknown as InstallationRow[];
 const href=(value:string,nextPage=1)=>`/dashboard/installations?${new URLSearchParams({q,status:value,page:String(nextPage)})}`;
 const labels:Record<string,string>={active:'Aktywna',inactive:'Nieaktywna',archived:'Archiwalna'};
 return <main className="list-page"><ListHeader category="Klienci" title="Urządzenia"><Link className="button secondary" href="/dashboard/customers"><Icon name="users" size={19}/>Klienci i lokalizacje</Link></ListHeader>
 <div className="list-toolbar"><ListSearch action="/dashboard/installations" value={q} placeholder="Szukaj typu instalacji" hidden={{status}}/><ListTabs label="Status instalacji" items={Object.entries({all:'Wszystkie',...statuses}).map(([value,label])=>({label,href:href(value),active:status===value}))}/></div>
 <ListTable label="Lista instalacji"><thead><tr><th>Instalacja</th><th>Klient / lokalizacja</th><th>Status</th><th>Urządzenia</th><th>Montaż</th><th><span className="sr-only">Działania</span></th></tr></thead><tbody>{installations.map(i=><tr key={i.id}><td><Link className="list-record-title" href={`/dashboard/installations/${i.id}/documents`}>{i.type}</Link><span className="list-record-subtitle">{i.locations.city}</span></td><td><Link className="list-cell-link" href={`/dashboard/customers/${i.locations.customers.id}`}>{i.locations.customers.name}</Link><span className="list-record-subtitle">{i.locations.address}, {i.locations.city}</span></td><td><span className={`badge ${i.status==='active'?'list-status-success':'neutral-badge'}`}>{labels[i.status]||i.status}</span></td><td>{i.devices.length?i.devices.map(d=><div className="list-device" key={d.id}>{d.manufacturer} {d.model}<span className="list-record-subtitle">SN: {d.serial_number||'—'}</span></div>):<span className="muted">Brak urządzeń</span>}</td><td>{i.installed_on||'—'}</td><td className="list-actions"><RecordActions label={i.type}><Link href={`/dashboard/customers/${i.locations.customers.id}`}>Karta klienta<Icon name="arrow" size={18}/></Link><Link href={`/dashboard/installations/${i.id}/documents`}>Dokumenty instalacji<Icon name="file" size={18}/></Link><Link href={`/dashboard/maintenance?installation=${i.id}&view=all`}>Plany przeglądów<Icon name="calendar" size={18}/></Link></RecordActions></td></tr>)}</tbody></ListTable>
 {!installations.length&&<div className="list-empty"><Icon name="device" size={30}/><h2>Brak instalacji w tym widoku</h2><p>{q||status!=='all'?'Zmień wyszukiwanie lub filtr statusu.':'Dodaj lokalizację i instalację w karcie klienta.'}</p><Link href="/dashboard/customers">Przejdź do klientów →</Link></div>}
 <div className="list-footer"><span className="muted">Wyniki: {count||0}</span><div className="pagination">{page>1&&<Link href={href(status,page-1)}>← Poprzednia</Link>}<span>Strona {page}</span>{page*25<(count||0)&&<Link href={href(status,page+1)}>Następna →</Link>}</div></div></main>;
}
