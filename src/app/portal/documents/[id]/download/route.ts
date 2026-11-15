import { z } from 'zod';
import { requirePortalContext } from '@/lib/portal/context';
import { safeDownloadHeaders } from '@/lib/portal/routes';
import type { PortalFile } from '@/lib/portal/types';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)return new Response('Nie znaleziono dokumentu.',{status:404});
 const url=new URL(request.url),{db,scope}=await requirePortalContext(url.searchParams.get('customer')||undefined);
 if(!scope.customer)return new Response('Wybierz konto klienta.',{status:404});
 const {data,error}=await db.rpc('portal_file',{p_customer:scope.customer.id,p_document:id});
 if(error||!data)return new Response('Nie znaleziono dokumentu.',{status:404,headers:{'Cache-Control':'private, no-store'}});
 const file=data as PortalFile,{data:blob,error:storageError}=await db.storage.from('hvac-documents').download(file.storage_path);
 if(storageError||!blob)return new Response('Plik jest obecnie niedostępny. Skontaktuj się z firmą.',{status:404,headers:{'Cache-Control':'private, no-store'}});
 return new Response(blob.stream(),{headers:safeDownloadHeaders(file.file_name,blob.type)});
}
