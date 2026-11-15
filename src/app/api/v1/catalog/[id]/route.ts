import { catalogDetailSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
import { catalogColumns,catalogRecord } from '@/lib/catalog/data';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Katalog cen jest dostępny dla administratora i biura.');
 const id=uuid.parse((await params).id),result=await db.from('catalog_items').select(catalogColumns).eq('id',id).maybeSingle();databaseError(result.error);if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono pozycji.');
 return json(request,catalogDetailSchema,{apiVersion:'1',item:catalogRecord(result.data)});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
