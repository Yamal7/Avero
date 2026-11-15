import { revalidatePath } from 'next/cache';
import { catalogListSchema,catalogQuerySchema,catalogSaveSchema,catalogSavedSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Katalog cen jest dostępny dla administratora i biura.');
 const input=catalogQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
 const result=await db.rpc('list_catalog_items',{p_search:input.search,p_category:input.category,p_state:input.state,p_page:input.page});databaseError(result.error);
 return json(request,catalogListSchema,{...result.data,apiVersion:'1',page:input.page,pageSize:25});
});}
export function POST(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Zmiana katalogu wymaga uprawnień administratora lub biura.');
 const {id,version,...item}=catalogSaveSchema.parse(await readBody(request));
 const result=await db.rpc('save_catalog_item',{p_id:id,p_item:item,p_version:version});
 if(result.error?.code==='23505')throw new ApiFault(409,'DUPLICATE_CODE','Ten kod już istnieje w katalogu, także w archiwum. Użyj innego kodu.');
 if(result.error?.code==='40001')throw new ApiFault(409,'CONFLICT','Pozycja została zmieniona lub zapis już wykonano. Odśwież dane przed kolejną próbą.');
 databaseError(result.error);if(result.data!==id)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się potwierdzić zapisu pozycji.');
 revalidatePath('/dashboard/catalog','layout');return json(request,catalogSavedSchema,{apiVersion:'1',itemId:id},version===null?201:200);
});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
