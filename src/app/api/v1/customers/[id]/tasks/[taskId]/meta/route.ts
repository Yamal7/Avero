import { revalidatePath } from 'next/cache';
import { crmTaskMetaSchema,crmTaskSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
/** Priority and label of a task (design: Zadania). Office or the assignee. */
export function POST(request:Request,{params}:{params:Promise<{id:string;taskId:string}>}){return endpoint(request,async()=>{const {db,role,user}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do zadań.');const input=crmTaskMetaSchema.parse(await readBody(request)),p=await params,id=uuid.parse(p.id),r=await db.rpc('crm_task_meta',{p_customer:id,p_id:uuid.parse(p.taskId),p_version:input.version,p_priority:input.priority,p_label:input.label});databaseError(r.error);const response=json(request,crmTaskSchema.refine(t=>role!=='technician'||t.assigneeId===user.id),r.data);revalidatePath(`/dashboard/customers/${id}`);revalidatePath('/dashboard/tasks');revalidatePath('/dashboard/team-tasks');return response;});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
