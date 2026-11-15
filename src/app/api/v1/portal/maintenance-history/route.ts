import { z } from 'zod';
import { portalMaintenanceHistorySchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
const query=z.object({customer:uuid,installation:uuid,page:z.coerce.number().int().min(1).max(100000).default(1)}).strict();
export function GET(request:Request){return endpoint(request,async()=>{
 const {db}=await authenticate(request),input=query.parse(Object.fromEntries(new URL(request.url).searchParams));
 const result=await db.rpc('portal_maintenance_history',{p_customer:input.customer,p_installation:input.installation,p_page:input.page});databaseError(result.error);
 return json(request,portalMaintenanceHistorySchema,{...result.data,apiVersion:'1',page:input.page,pageSize:20});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
