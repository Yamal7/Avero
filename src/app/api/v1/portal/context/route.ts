import { z } from 'zod';
import { portalContextResponseSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(role==='technician')throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do portalu klienta.');
 const params=new URL(request.url).searchParams,customer=params.get('customer');if(customer!==null)uuid.parse(customer);
 const search=z.string().trim().max(200).parse(params.get('search')||'');
 const scope=await db.rpc('portal_context',{p_customer:customer});databaseError(scope.error);
 const choices=await db.rpc('portal_account_options',{p_search:search});databaseError(choices.error);
 const parsed=portalContextResponseSchema.safeParse({apiVersion:'1',scope:scope.data,customers:choices.data});
 if(!parsed.success)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się odczytać kont klienta.');
 const payload=parsed.data;
 if(payload.scope.preview!==(role!=='client'))throw new ApiFault(503,'ACCESS_UNAVAILABLE','Nie udało się potwierdzić uprawnień.');
 if(payload.scope.customer&&!payload.customers.some(c=>c.id===payload.scope.customer!.id))payload.customers.unshift(payload.scope.customer);
 return json(request,portalContextResponseSchema,payload);
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
