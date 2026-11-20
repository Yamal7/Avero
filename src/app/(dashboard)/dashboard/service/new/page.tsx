import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { NewServiceTicket } from '@/components/service-forms';
import type { InstallationOption } from '@/lib/service/types';
export default async function NewTicketPage({ searchParams }: { searchParams:Promise<{installation?:string}> }) {
 const {db}=await requireSession(); const {installation}=await searchParams;
 const [options,manager]=await Promise.all([db.rpc('find_service_installations',{p_search:''}),db.rpc('can_manage_crm')]);
 if(options.error||manager.error) throw new Error('Nie udało się pobrać instalacji.');
 const choices=options.data as InstallationOption[];
 if(installation && z.string().uuid().safeParse(installation).success && !choices.some(row=>row.id===installation)) {
  const {data}=await db.from('installations').select('id,type,locations!inner(address,city,customers!inner(name,archived_at))').eq('id',installation).neq('status','archived').single();
  const item=data as unknown as {id:string;type:string;locations:{address:string;city:string;customers:{name:string;archived_at:string|null}}}|null;
  if(item && !item.locations.customers.archived_at) choices.push({id:item.id,label:`${item.locations.customers.name} · ${item.locations.address}, ${item.locations.city} · ${item.type}`});
 }
 const selected=choices.some(row=>row.id===installation)?installation!:'';
 return <main><Link href="/dashboard/service">← Zgłoszenia serwisowe</Link><div className="page-heading"><div><p className="eyebrow">Obsługa serwisowa</p><h1>Nowe zgłoszenie</h1><p>Powiąż problem z konkretną instalacją i opisz objawy.</p></div></div><section className="card"><NewServiceTicket options={choices} selected={selected} manager={manager.data===true} requestId={randomUUID()} /></section></main>;
}
