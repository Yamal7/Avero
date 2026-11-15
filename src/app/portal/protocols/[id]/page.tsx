import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requirePortalContext } from '@/lib/portal/context';
import { portalHref } from '@/lib/portal/routes';
import type { PortalProtocol } from '@/lib/portal/types';
import { PortalContextPicker,PortalNoScope } from '@/components/portal-ui';
import { ProtocolDocument } from '@/components/protocol-document';
import { ProtocolPrintButton } from '@/components/service-forms';
export default async function PortalProtocolPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{customer?:string}>}) {
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const query=await searchParams,{db,scope,choices}=await requirePortalContext(query.customer);const picker=<PortalContextPicker scope={scope} choices={choices} />;
 if(!scope.customer)return <>{picker}<PortalNoScope preview={scope.preview} /></>;
 const {data,error}=await db.rpc('portal_protocol',{p_customer:scope.customer.id,p_protocol:id});if(error)throw new Error('Nie udało się pobrać protokołu.');if(!data||!data.snapshot)notFound();const protocol=data as PortalProtocol;
 return <>{picker}<ProtocolPrintButton backHref={portalHref('/portal/documents',scope.customer.id)} /><ProtocolDocument protocol={protocol} /></>;
}
