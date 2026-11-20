import { z } from 'zod';
import { workOrderCalendarSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do kalendarza montaży.');
 const from=z.string().date().parse(new URL(request.url).searchParams.get('from')),result=await db.rpc('calendar_work_visits',{p_from:from});databaseError(result.error);return json(request,workOrderCalendarSchema,result.data);
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
