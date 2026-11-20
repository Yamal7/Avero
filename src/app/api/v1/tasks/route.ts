import { myTasksQuerySchema,myTasksSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{const {db,role,user}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do zadań.');const input=myTasksQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)),r=await db.rpc('my_crm_tasks',{p_filter:input.filter,p_search:input.search,p_page:input.page});databaseError(r.error);return json(request,myTasksSchema.refine(v=>v.viewerId===user.id),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
