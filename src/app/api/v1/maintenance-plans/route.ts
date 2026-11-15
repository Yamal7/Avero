import { revalidatePath } from 'next/cache';
import { maintenanceListSchema,maintenanceQuerySchema,maintenanceSavedSchema,maintenanceSaveSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Harmonogram firmy jest dostępny dla pracowników.');
 const input=maintenanceQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
 const result=await db.rpc('maintenance_schedule',{p_search:input.search,p_view:input.view,p_page:input.page,p_installation:input.installation||null});databaseError(result.error);
 return json(request,maintenanceListSchema,{...result.data,apiVersion:'1',page:input.page,pageSize:20});
});}
export function POST(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Zmiana planów wymaga uprawnień administratora lub biura.');
 const input=maintenanceSaveSchema.parse(await readBody(request));
 const result=await db.rpc('save_maintenance_plan',{p_id:input.id,p_installation:input.installationId,p_title:input.title,p_interval:input.intervalMonths,p_due:input.nextDueOn,p_active:input.active,p_version:input.version});databaseError(result.error);
 if(result.data!==input.id)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się potwierdzić zapisu planu.');
 revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return json(request,maintenanceSavedSchema,{apiVersion:'1',planId:result.data},input.version===null?201:200);
});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
