import { z } from 'zod';
import { ApiFault,responseHeaders } from '@/lib/api/http';
export function handoverPdfResponse(request:Request,value:unknown){
 const data=z.object({number:z.string(),base64:z.string().max(2900000)}).strict().parse(value),bytes=Buffer.from(data.base64,'base64');if(bytes.length>2097152||bytes.subarray(0,5).toString()!=='%PDF-')throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się odczytać PDF.');
 const headers=responseHeaders(request);headers.set('Content-Type','application/pdf');headers.set('Content-Length',String(bytes.length));headers.set('Content-Disposition',`attachment; filename="Protokol-${data.number.replace(/[^A-Za-z0-9_-]/g,'-')}.pdf"`);return new Response(new Uint8Array(bytes),{headers});
}
