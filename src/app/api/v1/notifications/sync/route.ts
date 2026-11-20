import { z } from 'zod';
import { notificationSyncSchema } from '@hvac/api-client';
import { notificationStaff,emptyNotificationQuery } from '@/lib/api/notifications';
import { databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function POST(request:Request){return endpoint(request,async()=>{const {db}=await notificationStaff(request);emptyNotificationQuery(request);z.object({}).strict().parse(await readBody(request));const r=await db.rpc('sync_my_notifications');databaseError(r.error);return json(request,notificationSyncSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
