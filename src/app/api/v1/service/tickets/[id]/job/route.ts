import { serviceJobSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
/** Measurements, materials and comments of a service ticket (staff with edit access). */
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db}=await authenticate(request);const r=await db.rpc('service_job_details',{p_ticket:uuid.parse((await params).id)});databaseError(r.error);return json(request,serviceJobSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
