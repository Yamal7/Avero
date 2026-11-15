import { z } from 'zod';
import { ApiFault,authenticate,databaseError,endpoint,preflight,responseHeaders,uuid } from '@/lib/api/http';
import { safeDownloadHeaders } from '@/lib/portal/routes';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db}=await authenticate(request),id=uuid.parse((await params).id),result=await db.rpc('document_file',{p_id:id});databaseError(result.error);
 if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono dokumentu.');
 const file=z.object({id:uuid,file_name:z.string(),storage_path:z.string()}).safeParse(result.data);
 if(!file.success)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się odczytać dokumentu.');
 const {data:blob,error}=await db.storage.from('hvac-documents').download(file.data.storage_path);
 if(error||!blob)throw new ApiFault(404,'NOT_FOUND','Plik jest obecnie niedostępny.');
 const headers=responseHeaders(request);Object.entries(safeDownloadHeaders(file.data.file_name,blob.type)).forEach(([name,value])=>headers.set(name,value));return new Response(blob.stream(),{headers});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
