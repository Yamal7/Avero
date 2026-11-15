import { revalidatePath } from 'next/cache';
import { workOrderSchema,workVisitChangeSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string;visitId:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do montażu.');
 const ids=await params,input=workVisitChangeSchema.parse(await readBody(request));if(role==='technician'&&input.state==='cancelled')throw new ApiFault(403,'ACCESS_DENIED','Odwołanie terminu wymaga uprawnień biura.');
 const result=await db.rpc('change_work_visit',{p_order:uuid.parse(ids.id),p_visit:uuid.parse(ids.visitId),p_version:input.version,p_state:input.state});databaseError(result.error);
 const response=json(request,workOrderSchema,result.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
