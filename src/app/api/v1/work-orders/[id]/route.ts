import { revalidatePath } from 'next/cache';
import { workOrderAddressSchema,workOrderSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do realizacji.');
 const result=await db.rpc('work_order_detail',{p_id:uuid.parse((await params).id)});databaseError(result.error);if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono zlecenia.');return json(request,workOrderSchema,result.data);
});}
export function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Zmiana adresu wymaga uprawnień biura.');
 const input=workOrderAddressSchema.parse(await readBody(request)),result=await db.rpc('update_work_address',{p_id:uuid.parse((await params).id),p_version:input.version,p_address:input.address,p_city:input.city,p_postal:input.postalCode});databaseError(result.error);
 const response=json(request,workOrderSchema,result.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['GET','PATCH']);}
