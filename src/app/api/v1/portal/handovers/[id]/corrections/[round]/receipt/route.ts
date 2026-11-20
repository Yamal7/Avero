import { revalidatePath } from 'next/cache';
import { handoverAcknowledgeSchema,publicHandoverSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
import { correctionParams } from '@/lib/handovers/correction-params';
export function POST(request:Request,{params}:{params:Promise<{id:string;round:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(role!=='client')throw new ApiFault(403,'CLIENT_REQUIRED','Odbiór potwierdza klient na swoim koncie.');const input=handoverAcknowledgeSchema.parse(await readBody(request)),r=await db.rpc('acknowledge_correction',{...correctionParams(await params),p_customer:input.customerId,p_state:input.state,p_comment:input.comment,p_confirm:input.confirm});databaseError(r.error);const response=json(request,publicHandoverSchema,r.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
