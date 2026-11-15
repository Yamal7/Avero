import { revalidatePath } from 'next/cache';
import { acceptOfferSchema,offerPublicationSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(role!=='client')throw new ApiFault(403,'CLIENT_REQUIRED','Akceptacja jest dostępna wyłącznie na koncie klienta. Podgląd firmy jest tylko do odczytu.');
 const input=acceptOfferSchema.parse(await readBody(request)),result=await db.rpc('accept_offer_publication',{p_customer:input.customerId,p_id:uuid.parse((await params).id),p_variant:input.variantId,p_confirm:input.confirm});
 if(result.error?.code==='40001')throw new ApiFault(409,'CONFLICT','Ta wersja nie jest już dostępna do akceptacji. Odśwież ofertę, aby sprawdzić jej status.');
 databaseError(result.error);const response=json(request,offerPublicationSchema,result.data);revalidatePath('/portal','layout');revalidatePath('/dashboard/offers','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
