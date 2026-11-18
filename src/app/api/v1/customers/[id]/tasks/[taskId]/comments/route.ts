import { revalidatePath } from 'next/cache';
import { crmTaskCommentInputSchema,crmTaskCommentSchema,crmTaskCommentsSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
const staff=['admin','office','technician'];
/** Comment thread of a task (design: Zadania, panel "Aktywność"). Office or the assignee. */
export function GET(request:Request,{params}:{params:Promise<{id:string;taskId:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!staff.includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do zadań.');const p=await params,r=await db.rpc('crm_task_comments',{p_customer:uuid.parse(p.id),p_task:uuid.parse(p.taskId)});databaseError(r.error);return json(request,crmTaskCommentsSchema,r.data);});}
export function POST(request:Request,{params}:{params:Promise<{id:string;taskId:string}>}){return endpoint(request,async()=>{const {db,role,user}=await authenticate(request);if(!staff.includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do zadań.');const input=crmTaskCommentInputSchema.parse(await readBody(request)),p=await params,id=uuid.parse(p.id),r=await db.rpc('add_crm_task_comment',{p_customer:id,p_task:uuid.parse(p.taskId),p_id:input.id,p_body:input.body});databaseError(r.error);const response=json(request,crmTaskCommentSchema.refine(c=>c.authorId===user.id),r.data);revalidatePath('/dashboard/tasks');return response;});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
