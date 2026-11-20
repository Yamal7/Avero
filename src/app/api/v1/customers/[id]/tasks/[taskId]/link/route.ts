import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { crmTaskLinkChangeSchema,crmTaskLinkOptionsSchema,crmTaskSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
type Context={params:Promise<{id:string;taskId:string}>};
const staff=['admin','office','technician'];
/** Work a task belongs to (design: Zadania, „powiązane zlecenie”): options for the picker and the change itself. */
export function GET(request:Request,{params}:Context){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!staff.includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do zadań.');z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const p=await params,r=await db.rpc('crm_task_link_options',{p_customer:uuid.parse(p.id)});databaseError(r.error);return json(request,crmTaskLinkOptionsSchema,r.data);});}
export function POST(request:Request,{params}:Context){return endpoint(request,async()=>{const {db,role,user}=await authenticate(request);if(!staff.includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do zadań.');const input=crmTaskLinkChangeSchema.parse(await readBody(request)),p=await params,id=uuid.parse(p.id),taskId=uuid.parse(p.taskId),r=await db.rpc('set_crm_task_link',{p_customer:id,p_id:taskId,p_version:input.version,p_kind:input.kind,p_target:input.targetId});databaseError(r.error);const response=json(request,crmTaskSchema.refine(t=>t.id===taskId&&(role!=='technician'||t.assigneeId===user.id)&&(t.link?.id??null)===input.targetId),r.data);revalidatePath(`/dashboard/customers/${id}`);revalidatePath('/dashboard/tasks');revalidatePath('/dashboard/team-tasks');return response;});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
