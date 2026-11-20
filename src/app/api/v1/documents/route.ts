import { createHash } from 'node:crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { documentListSchema,documentSavedSchema,documentUploadSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
import { completeDocumentUpload } from '@/lib/documents/upload';
import { readMultipart,validateFileBytes } from '@/lib/documents/files';
export const runtime='nodejs';
const querySchema=z.object({installation:uuid,ticket:uuid.optional(),customer:uuid.optional(),archived:z.enum(['true','false']).default('false'),page:z.coerce.number().int().min(1).max(100000).default(1)});
export function GET(request:Request){return endpoint(request,async()=>{
 const {db}=await authenticate(request),params=Object.fromEntries(new URL(request.url).searchParams),input=querySchema.parse(params);
 const result=await db.rpc('installation_documents',{p_installation:input.installation,p_ticket:input.ticket||null,p_page:input.page,p_archived:input.archived==='true',p_customer:input.customer||null});databaseError(result.error);
 return json(request,documentListSchema,{...result.data,apiVersion:'1',page:input.page,pageSize:20});
});}
export function POST(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Dodawanie plików wymaga uprawnień administratora lub biura.');
 const form=await readMultipart(request),file=form.get('file');
 if(!(file instanceof File))throw new ApiFault(400,'INVALID_FILE','Wybierz plik.');
 const input=documentUploadSchema.parse({requestId:form.get('requestId'),installationId:form.get('installationId'),ticketId:form.get('ticketId')||undefined,fileName:file.name,documentType:form.get('documentType'),byteSize:file.size,mimeType:file.type});
 const bytes=new Uint8Array(await file.arrayBuffer());validateFileBytes(bytes,input.mimeType);
 const prepared=await db.rpc('prepare_document',{p_id:input.requestId,p_installation:input.installationId,p_ticket:input.ticketId||null,p_name:input.fileName,p_type:input.documentType,p_size:input.byteSize,p_mime:input.mimeType,p_sha256:createHash('sha256').update(bytes).digest('hex')});databaseError(prepared.error);
 await completeDocumentUpload(db,prepared.data,input.requestId,bytes,input.mimeType);
 revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');
 return json(request,documentSavedSchema,{apiVersion:'1',documentId:input.requestId},201);
});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
