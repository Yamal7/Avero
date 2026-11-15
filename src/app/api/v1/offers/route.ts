import { revalidatePath } from 'next/cache';
import { offerDetailSchema,offerListSchema,offerQuerySchema,offerSaveSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Oferty są dostępne dla administratora i biura.');
 const p=offerQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)),result=await db.rpc('list_offers',{p_search:p.search,p_state:p.state,p_page:p.page});databaseError(result.error);
 return json(request,offerListSchema,{...result.data,apiVersion:'1',page:p.page,pageSize:25});
});}
export function POST(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Zmiana ofert wymaga uprawnień administratora lub biura.');
 const {id,version,...data}=offerSaveSchema.parse(await readBody(request,262144));
 const result=await db.rpc('save_offer',{p_id:id,p_data:data,p_version:version});
 if(result.error?.code==='40001')throw new ApiFault(409,'CONFLICT','Oferta została zmieniona lub zapis już wykonano. Odśwież dane przed ponowną edycją.');
 databaseError(result.error);
 const response=json(request,offerDetailSchema,{apiVersion:'1',offer:result.data},version===null?201:200);
 if(result.data?.id!==id)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się potwierdzić zapisu oferty.');
 revalidatePath('/dashboard/offers','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
