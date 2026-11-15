import { offerDetailSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Oferty są dostępne dla administratora i biura.');
 const id=uuid.parse((await params).id),result=await db.rpc('offer_detail',{p_id:id});databaseError(result.error);if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono oferty.');return json(request,offerDetailSchema,{apiVersion:'1',offer:result.data});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
