import { revalidatePath } from 'next/cache';
import { serviceCommentInputSchema,serviceJobSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db}=await authenticate(request);const id=uuid.parse((await params).id),c=serviceCommentInputSchema.parse(await readBody(request)),r=await db.rpc('add_service_ticket_comment',{p_ticket:id,p_id:c.id,p_body:c.body});databaseError(r.error);revalidatePath(`/dashboard/service/${id}`);return json(request,serviceJobSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
