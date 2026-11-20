import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { workOrderCreateSchema,workOrderSchema,workOrderListSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do realizacji.');
 const input=z.object({search:z.string().trim().max(200).default(''),state:z.enum(['active','all','draft','planned','in_progress','completed','cancelled']).default('active'),page:z.coerce.number().int().min(1).max(100000).default(1)}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));
 const result=await db.rpc('list_work_orders',{p_search:input.search,p_state:input.state,p_page:input.page});databaseError(result.error);return json(request,workOrderListSchema,result.data);
});}
export function POST(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Tworzenie zleceń wymaga uprawnień biura.');
 const input=workOrderCreateSchema.parse(await readBody(request)),result=await db.rpc('create_work_order',{p_id:input.requestId,p_publication:input.publicationId,p_address:input.address,p_city:input.city,p_postal:input.postalCode});databaseError(result.error);
 const response=json(request,workOrderSchema,result.data);revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
