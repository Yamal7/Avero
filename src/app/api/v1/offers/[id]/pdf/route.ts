import { z } from 'zod';
import { customerOfferPreview,offerRecordSchema,savedOfferDocumentSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,preflight,responseHeaders,uuid } from '@/lib/api/http';
import { renderOfferPdf } from '@/lib/offers/pdf';
export const runtime='nodejs';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do ofert.');
 const id=uuid.parse((await params).id),query=z.object({offerVersion:z.coerce.number().int().nonnegative(),documentVersion:z.coerce.number().int().nonnegative()}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));
 const result=await db.rpc('offer_document_context',{p_id:id});databaseError(result.error);
 if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono oferty.');
 const context=z.object({offer:offerRecordSchema,document:savedOfferDocumentSchema.nullable()}).parse(result.data);
 if(!context.document)throw new ApiFault(409,'DOCUMENT_REQUIRED','Uzupełnij i zapisz dane dokumentu przed pobraniem PDF.');
 if(context.offer.version!==query.offerVersion||context.document.version!==query.documentVersion)throw new ApiFault(409,'CONFLICT','Oferta została zmieniona. Odśwież podgląd i pobierz aktualny PDF.');
 if(context.offer.variants.some(v=>!v.lines.length))throw new ApiFault(409,'EMPTY_VARIANT','Dodaj pozycje do każdego wariantu przed pobraniem PDF.');
 const bytes=await renderOfferPdf(customerOfferPreview(context.offer),context.document.data);
 const headers=responseHeaders(request);headers.set('Content-Type','application/pdf');headers.set('Content-Disposition',`attachment; filename="Oferta-${context.offer.number.replace(/[^A-Za-z0-9_-]/g,'-')}.pdf"`);headers.set('Content-Length',String(bytes.length));
 return new Response(new Uint8Array(bytes),{headers});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
