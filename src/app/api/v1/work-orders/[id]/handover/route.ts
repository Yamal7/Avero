import { revalidatePath } from 'next/cache';
import { handoverContextSchema,handoverSaveSchema,handoverRecordSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do protokołu.');
 const result=await db.rpc('handover_context',{p_order:uuid.parse((await params).id)});databaseError(result.error);return json(request,handoverContextSchema,result.data);
});}
export function PUT(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do protokołu.');
 const input=handoverSaveSchema.parse(await readBody(request,262144)),result=await db.rpc('save_handover',{p_order:uuid.parse((await params).id),p_version:input.version,p_work_version:input.workVersion,p_fields:input.fields,p_internal_note:input.internalNote});databaseError(result.error);
 const response=json(request,handoverRecordSchema,result.data);revalidatePath('/dashboard/work-orders','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
