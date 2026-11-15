import { publicWorkOrderSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','client'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do realizacji.');
 const result=await db.rpc('portal_work_order',{p_customer:uuid.parse(new URL(request.url).searchParams.get('customer')),p_publication:uuid.parse((await params).id)});databaseError(result.error);return json(request,publicWorkOrderSchema.nullable(),result.data);
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
