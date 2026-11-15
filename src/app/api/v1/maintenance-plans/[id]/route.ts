import { z } from 'zod';
import { maintenanceDetailSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
const pages=z.object({historyPage:z.coerce.number().int().min(1).max(100000).default(1),protocolPage:z.coerce.number().int().min(1).max(100000).default(1)}).strict();
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Karta planu jest dostępna dla pracowników.');
 const id=uuid.parse((await params).id),input=pages.parse(Object.fromEntries(new URL(request.url).searchParams));
 const result=await db.rpc('maintenance_plan_detail',{p_plan:id,p_history_page:input.historyPage,p_protocol_page:input.protocolPage});databaseError(result.error);
 return json(request,maintenanceDetailSchema,{...result.data,apiVersion:'1'});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
