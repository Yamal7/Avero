import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { customerOfferPreview,offerRecordSchema,savedOfferDocumentSchema,offerPublicationSchema,staffPublicationsSchema,publishOfferSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
import { renderOfferPdf } from '@/lib/offers/pdf';
export const runtime='nodejs';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do publikacji ofert.');
 const result=await db.rpc('staff_offer_publications',{p_offer:uuid.parse((await params).id)});databaseError(result.error);return json(request,staffPublicationsSchema,result.data);
});}
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Udostępnianie ofert wymaga uprawnień administratora lub biura.');
 const id=uuid.parse((await params).id),input=publishOfferSchema.parse(await readBody(request));
 // Return the exact first edition on retries, including after a later draft edit or withdrawal.
 const previous=await db.rpc('staff_offer_publications',{p_offer:id});databaseError(previous.error);
 const existing=staffPublicationsSchema.parse(previous.data).items.find(p=>p.id===input.requestId);
 if(existing){if(existing.offerVersion!==input.offerVersion||existing.documentVersion!==input.documentVersion)throw new ApiFault(409,'CONFLICT','Identyfikator operacji dotyczy innej wersji.');return json(request,offerPublicationSchema,existing);}
 const result=await db.rpc('offer_document_context',{p_id:id});databaseError(result.error);if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono oferty.');
 const context=z.object({offer:offerRecordSchema,document:savedOfferDocumentSchema.nullable()}).parse(result.data);
 if(!context.document||context.offer.version!==input.offerVersion||context.document.version!==input.documentVersion)throw new ApiFault(409,'CONFLICT','Zapisz dane PDF i odśwież aktualny podgląd przed udostępnieniem.');
 if(context.offer.variants.some(v=>!v.lines.length))throw new ApiFault(409,'EMPTY_VARIANT','Uzupełnij pozycje wszystkich wariantów.');
 const bytes=await renderOfferPdf(customerOfferPreview(context.offer),context.document.data);
 if(bytes.length>2097152)throw new ApiFault(400,'PDF_TOO_LARGE','Dokument przekracza limit 2 MB. Skróć opisy lub liczbę pozycji.');
 const published=await db.rpc('publish_offer',{p_id:input.requestId,p_offer:id,p_offer_version:input.offerVersion,p_document_version:input.documentVersion,p_pdf_base64:bytes.toString('base64')});
 if(published.error?.code==='40001')throw new ApiFault(409,'CONFLICT','Nie można udostępnić tej wersji. Sprawdź aktualność danych, daty ważności oraz czy oferta nie została już zaakceptowana.');
 databaseError(published.error);const response=json(request,offerPublicationSchema,published.data);revalidatePath('/dashboard/offers','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
