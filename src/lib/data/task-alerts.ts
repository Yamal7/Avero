import { cache } from 'react';
import { taskAlertsSchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
// React cache is request-scoped; it never shares one person's alerts with another.
export const getTaskAlerts=cache(async()=>{const {db,user}=await requireSession(),r=await db.rpc('my_task_alerts');if(r.error)throw new Error('Nie udało się pobrać Twoich zadań.');return taskAlertsSchema.refine(v=>v.viewerId===user.id).parse(r.data);});
