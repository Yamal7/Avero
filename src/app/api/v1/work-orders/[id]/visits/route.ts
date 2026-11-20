import { revalidatePath } from 'next/cache';
import { workOrderSchema,workVisitSaveSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function PUT(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Planowanie montaży wymaga uprawnień biura.');
 const input=workVisitSaveSchema.parse(await readBody(request)),result=await db.rpc('schedule_work_visit',{p_order:uuid.parse((await params).id),p_version:input.version,p_id:input.visitId,p_local_start:input.localStart,p_minutes:input.durationMinutes,p_crew:input.crewIds,p_notes:input.notes});
 if(result.error?.code==='23P01')throw new ApiFault(409,'SCHEDULE_CONFLICT','Co najmniej jedna osoba z ekipy ma już w tym czasie montaż lub wizytę serwisową. Wybierz inny termin lub ekipę.');
 if(result.error?.code==='P0001')throw new ApiFault(409,'CREW_UNAVAILABLE','Wybierz aktywnych techników przypisanych do tego klienta.');
 databaseError(result.error);const response=json(request,workOrderSchema,result.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['PUT']);}
