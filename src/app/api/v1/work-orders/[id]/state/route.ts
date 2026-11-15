import { revalidatePath } from 'next/cache';
import { workOrderSchema,workOrderChangeSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Zamykanie zleceń wymaga uprawnień biura.');
 const input=workOrderChangeSchema.parse(await readBody(request)),result=await db.rpc('change_work_order',{p_id:uuid.parse((await params).id),p_version:input.version,p_state:input.state});databaseError(result.error);
 const response=json(request,workOrderSchema,result.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
