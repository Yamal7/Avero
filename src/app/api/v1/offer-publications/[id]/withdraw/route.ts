import { revalidatePath } from 'next/cache';
import { offerPublicationSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do publikacji ofert.');
 const result=await db.rpc('withdraw_offer_publication',{p_id:uuid.parse((await params).id)});databaseError(result.error);
 const response=json(request,offerPublicationSchema,result.data);revalidatePath('/dashboard/offers','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
