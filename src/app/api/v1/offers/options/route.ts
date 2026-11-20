import { z } from 'zod';
import { offerCustomersSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight } from '@/lib/api/http';
const query=z.object({search:z.string().trim().max(200).default(''),customer:z.string().uuid().optional()}).strict();
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Wybór klienta wymaga uprawnień administratora lub biura.');
 const {search,customer}=query.parse(Object.fromEntries(new URL(request.url).searchParams));
 let requestQuery=db.from('customers').select('id,name,email,phone,locations(id,address,city,postal_code)').is('archived_at',null);
 if(customer)requestQuery=requestQuery.eq('id',customer);
 if(search)requestQuery=requestQuery.ilike('name',`%${search.replace(/[\\%_]/g,'\\$&')}%`);
 const result=await requestQuery.order('name').order('id').limit(25);databaseError(result.error);return json(request,offerCustomersSchema,{apiVersion:'1',customers:result.data});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
