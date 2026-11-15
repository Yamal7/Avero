import { portalOverviewResponseSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db}=await authenticate(request),customer=uuid.parse(new URL(request.url).searchParams.get('customer'));
 const result=await db.rpc('portal_overview',{p_customer:customer});databaseError(result.error);
 return json(request,portalOverviewResponseSchema,{apiVersion:'1',customerId:customer,overview:result.data});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
