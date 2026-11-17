import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requirePortalContext } from '@/lib/portal/context';
import { portalHref } from '@/lib/portal/routes';
import type { InstallationOption } from '@/lib/service/types';
import { PortalContextPicker,PortalEmpty,PortalHeading,PortalNoScope } from '@/components/portal-ui';
import { PortalTicketForm } from '@/components/portal-ticket-form';
export default async function PortalNewTicketPage({searchParams}:{searchParams:Promise<{customer?:string;installation?:string}>}) {
 const params=await searchParams,{db,scope,choices}=await requirePortalContext(params.customer);const picker=<PortalContextPicker scope={scope} choices={choices} />;
 if(!scope.customer)return <>{picker}<PortalNoScope preview={scope.preview} /></>;
 const id=scope.customer.id;
 if(scope.preview)return <>{picker}<PortalEmpty title="Podgląd jest tylko do odczytu"><p>Klient będzie mógł tutaj wysłać zgłoszenie dotyczące swojej instalacji. Jako pracownik możesz utworzyć sprawę w panelu firmy.</p><Link className="button" href="/dashboard/service/new">Nowe zgłoszenie w panelu firmy</Link></PortalEmpty></>;
 if(scope.customer.archived_at)return <>{picker}<PortalEmpty title="Konto klienta jest archiwalne"><p>Historia pozostaje dostępna. W sprawie nowych zgłoszeń skontaktuj się z firmą.</p></PortalEmpty></>;
 const {data,error}=await db.rpc('portal_installation_options',{p_customer:id,p_search:''});if(error)throw new Error('Nie udało się pobrać instalacji.');const options=data as InstallationOption[];
 if(params.installation&&z.string().uuid().safeParse(params.installation).success&&!options.some(row=>row.id===params.installation)){
 const {data:item}=await db.rpc('portal_installation',{p_customer:id,p_installation:params.installation});
 if(item&&item.status!=='archived')options.push({id:item.id,label:`${item.type} · ${item.address}, ${item.city}`});
 }
 const selected=options.some(row=>row.id===params.installation)?params.installation!:'';
 return <>{picker}<Link className="portal-back" href={portalHref('/portal/service',id)}>← Moje zgłoszenia</Link><PortalHeading eyebrow="Jesteśmy do pomocy" title="Zgłoś problem"><p>Wybierz instalację i opisz, w czym możemy pomóc.</p></PortalHeading><PortalTicketForm customerId={id} options={options} selected={selected} requestId={randomUUID()} /></>;
}
