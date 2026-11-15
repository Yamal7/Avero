import { revalidatePath } from 'next/cache';
import { handoverAcknowledgeSchema,publicHandoverSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(role!=='client')throw new ApiFault(403,'CLIENT_REQUIRED','Odbiór potwierdza klient na swoim koncie. Podgląd firmy jest tylko do odczytu.');
 const input=handoverAcknowledgeSchema.parse(await readBody(request)),result=await db.rpc('acknowledge_handover',{p_customer:input.customerId,p_id:uuid.parse((await params).id),p_state:input.state,p_comment:input.comment,p_confirm:input.confirm});databaseError(result.error);const response=json(request,publicHandoverSchema,result.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
