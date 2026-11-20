import { z } from 'zod';
import { portalOffersSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','client'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do ofert.');
 const input=z.object({customer:uuid,page:z.coerce.number().int().min(1).max(100000).default(1)}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));
 const result=await db.rpc('portal_offers',{p_customer:input.customer,p_page:input.page});databaseError(result.error);return json(request,portalOffersSchema,result.data);
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
