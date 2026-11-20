import { notificationPreferencesSchema,notificationPreferenceInputSchema } from '@hvac/api-client';
import { notificationStaff,emptyNotificationQuery } from '@/lib/api/notifications';
import { databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{const {db,user}=await notificationStaff(request);emptyNotificationQuery(request);const r=await db.rpc('my_notification_preferences');databaseError(r.error);return json(request,notificationPreferencesSchema.refine(v=>v.viewerId===user.id),r.data);});}
export function PUT(request:Request){return endpoint(request,async()=>{const {db,user}=await notificationStaff(request);emptyNotificationQuery(request);const input=notificationPreferenceInputSchema.parse(await readBody(request)),r=await db.rpc('save_notification_preferences',{p_version:input.version,p_tasks:input.tasks,p_service:input.service,p_maintenance:input.maintenance});databaseError(r.error);return json(request,notificationPreferencesSchema.refine(v=>v.viewerId===user.id),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
