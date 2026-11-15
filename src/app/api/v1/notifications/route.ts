import { notificationListSchema,notificationQuerySchema } from '@hvac/api-client';
import { notificationStaff } from '@/lib/api/notifications';
import { databaseError,endpoint,json,preflight } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{const {db,user}=await notificationStaff(request),q=notificationQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)),r=await db.rpc('list_my_notifications',{p_state:q.state,p_category:q.category,p_page:q.page});databaseError(r.error);return json(request,notificationListSchema.refine(v=>v.viewerId===user.id),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
