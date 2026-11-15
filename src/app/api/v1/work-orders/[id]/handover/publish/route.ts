import { revalidatePath } from 'next/cache';
import { handoverContextSchema,handoverPublishSchema,handoverRecordSchema,handoverSnapshotSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
import { renderHandoverPdf } from '@/lib/handovers/pdf';
export const runtime='nodejs';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Zatwierdzanie protokołu wymaga uprawnień biura.');
 const id=uuid.parse((await params).id),input=handoverPublishSchema.parse(await readBody(request)),context=await db.rpc('handover_context',{p_order:id});databaseError(context.error);const data=handoverContextSchema.parse(context.data);
 if(data.report?.state==='published'){if(![data.report.version,data.report.version-1].includes(input.version))throw new ApiFault(409,'CONFLICT','Nieaktualna wersja protokołu.');return json(request,handoverRecordSchema,data.report);}
 const prepared=await db.rpc('prepare_handover',{p_order:id,p_version:input.version,p_work_version:input.workVersion});databaseError(prepared.error);const snapshot=handoverSnapshotSchema.parse(prepared.data),pdf=await renderHandoverPdf(snapshot);
 if(pdf.length>2097152)throw new ApiFault(400,'PDF_TOO_LARGE','Dokument przekracza limit 2 MB. Skróć opisy.');
 const result=await db.rpc('publish_handover',{p_order:id,p_version:input.version,p_work_version:input.workVersion,p_snapshot:snapshot,p_pdf_base64:pdf.toString('base64')});databaseError(result.error);
 const response=json(request,handoverRecordSchema,result.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
