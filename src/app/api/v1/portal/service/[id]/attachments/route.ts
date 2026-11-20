import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { clientAttachmentUploadSchema,documentSavedSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
import { readMultipart,validateFileBytes } from '@/lib/documents/files';
import { completeDocumentUpload } from '@/lib/documents/upload';
export const runtime='nodejs';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);
 if(role!=='client')throw new ApiFault(403,'PREVIEW_READ_ONLY','Podgląd pracownika jest tylko do odczytu.');
 const ticket=uuid.parse((await params).id),form=await readMultipart(request),file=form.get('file');
 if(!(file instanceof File))throw new ApiFault(400,'INVALID_FILE','Wybierz plik.');
 const input=clientAttachmentUploadSchema.parse({requestId:form.get('requestId'),customerId:form.get('customerId'),fileName:file.name,byteSize:file.size,mimeType:file.type});
 const bytes=new Uint8Array(await file.arrayBuffer());validateFileBytes(bytes,input.mimeType);
 const prepared=await db.rpc('prepare_client_attachment',{p_customer:input.customerId,p_ticket:ticket,p_id:input.requestId,p_name:input.fileName,p_size:input.byteSize,p_mime:input.mimeType,p_sha256:createHash('sha256').update(bytes).digest('hex')});
 if(prepared.error?.code==='P0001'){
  if(prepared.error.message==='Client attachment rate limit reached')throw new ApiFault(429,'ATTACHMENT_RATE_LIMIT','Osiągnięto limit 10 plików na godzinę. Spróbuj później.');
  if(prepared.error.message==='Client attachment ticket limit reached')throw new ApiFault(429,'ATTACHMENT_TICKET_LIMIT','Zgłoszenie osiągnęło limit 10 plików lub 50 MB. Skontaktuj się z firmą.');
 }
 databaseError(prepared.error);
 await completeDocumentUpload(db,prepared.data,input.requestId,bytes,input.mimeType);
 revalidatePath('/portal','layout');revalidatePath('/dashboard','layout');
 return json(request,documentSavedSchema,{apiVersion:'1',documentId:input.requestId},201);
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
