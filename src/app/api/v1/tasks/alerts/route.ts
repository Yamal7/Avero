import { z } from 'zod';
import { taskAlertsSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{const {db,role,user}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do zadań.');z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const r=await db.rpc('my_task_alerts');databaseError(r.error);return json(request,taskAlertsSchema.refine(v=>v.viewerId===user.id),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
