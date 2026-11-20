import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import type { Protocol } from '@/lib/service/types';
import { ProtocolDocument } from '@/components/protocol-document';
import { ProtocolPrintButton } from '@/components/service-forms';
export default async function ProtocolPage({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;if(!z.string().uuid().safeParse(id).success) notFound();const {db}=await requireSession();
 const {data,error}=await db.from('service_protocols').select('id,protocol_number,status,version,diagnosis,work_performed,materials,measurements,recommendations,published_at,snapshot').eq('id',id).eq('status','published').single();
 if(error?.code==='PGRST116') notFound();if(error) throw new Error('Nie udało się pobrać protokołu.');
 const protocol=data as Protocol;if(!protocol.snapshot) notFound();
 return <main><ProtocolPrintButton /><ProtocolDocument protocol={protocol} /></main>;
}
