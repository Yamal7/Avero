import { z } from 'zod';
import { ApiFault,authenticate,databaseError,endpoint,preflight,responseHeaders,uuid } from '@/lib/api/http';
export const runtime='nodejs';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','client'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do ofert.');
 const result=await db.rpc('offer_publication_pdf',{p_customer:uuid.parse(new URL(request.url).searchParams.get('customer')),p_id:uuid.parse((await params).id)});databaseError(result.error);if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono dokumentu.');
 const data=z.object({number:z.string(),revision:z.number().int().positive(),base64:z.string().max(2900000)}).strict().parse(result.data),bytes=Buffer.from(data.base64,'base64');
 if(bytes.length>2097152||bytes.subarray(0,5).toString()!=='%PDF-')throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się odczytać dokumentu.');
 const headers=responseHeaders(request);headers.set('Content-Type','application/pdf');headers.set('Content-Length',String(bytes.length));headers.set('Content-Disposition',`attachment; filename="Oferta-${data.number.replace(/[^A-Za-z0-9_-]/g,'-')}-v${data.revision}.pdf"`);return new Response(new Uint8Array(bytes),{headers});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
