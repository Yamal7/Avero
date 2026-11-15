import { validCompanyLogo } from '@/lib/offers/logo';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { offerDocumentSaveSchema,savedOfferDocumentSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function PUT(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do ofert.');
 const id=uuid.parse((await params).id),input=offerDocumentSaveSchema.parse(await readBody(request,131072));
 if(input.data.logoPng&&!validCompanyLogo(input.data.logoPng))throw new ApiFault(400,'INVALID_LOGO','Nieprawidłowe logo dokumentu.');
 const result=await db.rpc('save_offer_document',{p_id:id,p_data:input.data,p_version:input.version,p_offer_version:input.offerVersion});
 if(result.error?.code==='40001')throw new ApiFault(409,'CONFLICT','Oferta lub dane PDF zostały zmienione. Odśwież stronę przed kolejnym zapisem.');
 databaseError(result.error);const response=json(request,savedOfferDocumentSchema,result.data);revalidatePath(`/dashboard/offers/${id}/preview`);return response;
});}
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do ofert.');
 const id=uuid.parse((await params).id),result=await db.rpc('offer_document_context',{p_id:id});databaseError(result.error);
 if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono oferty.');
 return json(request,z.object({offerVersion:z.number().int().nonnegative(),document:savedOfferDocumentSchema.nullable()}).strict(),{offerVersion:result.data.offer?.version,document:result.data.document});
});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
