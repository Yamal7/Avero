import { revalidatePath } from 'next/cache';
import { maintenanceCompletionSchema,maintenanceCompletionSavedSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Potwierdzenie przeglądu wymaga uprawnień administratora lub biura.');
 const id=uuid.parse((await params).id),input=maintenanceCompletionSchema.parse(await readBody(request));
 const result=await db.rpc('record_maintenance_completion',{p_plan:id,p_protocol:input.protocolId,p_request:input.requestId,p_version:input.version,p_expected_due:input.expectedNextDueOn});
 if(result.error?.code==='P0001'){
  const errors:Record<string,[string,string]>={'Protocol already recorded for plan':['PROTOCOL_ALREADY_RECORDED','Ten protokół został już uwzględniony w tym planie.'],'Protocol precedes latest completion':['OLDER_COMPLETION','Ten protokół nie jest późniejszy od ostatniego zapisanego wykonania.'],'Plan must be active':['PLAN_PAUSED','Najpierw wznów plan przeglądów.']};
  const error=errors[result.error.message];if(error)throw new ApiFault(409,error[0],error[1]);
 }
 databaseError(result.error);
 const parsed=maintenanceCompletionSavedSchema.safeParse({...result.data,apiVersion:'1'});
 if(!parsed.success||parsed.data.planId!==id||parsed.data.completionId!==input.requestId||parsed.data.nextDueOn!==input.expectedNextDueOn)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się potwierdzić zapisu wykonania.');
 const response=json(request,maintenanceCompletionSavedSchema,parsed.data);
 revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
