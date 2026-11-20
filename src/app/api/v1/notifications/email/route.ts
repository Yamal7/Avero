import { emailHistoryQuerySchema,emailPreferenceSaveSchema,emailViewSchema } from '@hvac/api-client';
import { mailConfig } from '@/lib/email/config';
import { notificationStaff,emptyNotificationQuery } from '@/lib/api/notifications';
import { databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
function view(data:unknown,email:string|null){const config=mailConfig();return {history:data,email,mode:config?.mode??'disabled',configured:!!config};}
export function GET(request:Request){return endpoint(request,async()=>{const {db,user}=await notificationStaff(request),q=emailHistoryQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)),r=await db.rpc('my_email_notifications',{p_page:q.page});databaseError(r.error);return json(request,emailViewSchema.refine(v=>v.history.viewerId===user.id),view(r.data,user.email??null));});}
export function PUT(request:Request){return endpoint(request,async()=>{const {db,user}=await notificationStaff(request);emptyNotificationQuery(request);const input=emailPreferenceSaveSchema.parse(await readBody(request)),r=await db.rpc('save_my_email_notifications',{p_enabled:input.enabled,p_version:input.version});databaseError(r.error);return json(request,emailViewSchema.refine(v=>v.history.viewerId===user.id),view(r.data,user.email??null));});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
