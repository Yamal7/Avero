import { notificationMarkSchema,notificationMarkResultSchema } from '@hvac/api-client';
import { notificationStaff,emptyNotificationQuery } from '@/lib/api/notifications';
import { databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db}=await notificationStaff(request);emptyNotificationQuery(request);const id=uuid.parse((await params).id),input=notificationMarkSchema.parse(await readBody(request)),r=await db.rpc('mark_my_notification',{p_id:id,p_version:input.version,p_read:input.read});databaseError(r.error);return json(request,notificationMarkResultSchema.refine(v=>v.id===id),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['PATCH']);}
