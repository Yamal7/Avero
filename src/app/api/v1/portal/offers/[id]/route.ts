import { offerPublicationSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','client'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do ofert.');
 const result=await db.rpc('portal_offer',{p_customer:uuid.parse(new URL(request.url).searchParams.get('customer')),p_id:uuid.parse((await params).id)});databaseError(result.error);
 if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono udostępnionej oferty.');return json(request,offerPublicationSchema,result.data);
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
