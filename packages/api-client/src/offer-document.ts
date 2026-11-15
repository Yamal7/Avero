import { z } from 'zod';
const single=(max:number)=>z.string().trim().max(max).refine(v=>!/[\u0000-\u001f\u007f]/.test(v),'Usuń znaki specjalne.');
const prose=z.string().trim().max(2000).refine(v=>!/[\u0000-\u0008\u000b-\u001f\u007f]/.test(v)&&v.split('\n').length<=20,'Maksymalnie 20 wierszy.');
const date=z.string().regex(/^20\d{2}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===v;},'Nieprawidłowa data.');
export const companyLogoSchema=z.string().max(90000).regex(/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/);
export const offerDocumentFieldsSchema=z.object({
 companyName:single(160).refine(v=>v.length>0,'Podaj nazwę firmy.'),companyAddress:single(240).refine(v=>v.length>0,'Podaj adres firmy.'),taxId:single(40),
 email:z.union([z.literal(''),z.string().trim().email().max(160)]),phone:single(50),website:single(160),
 logoPng:companyLogoSchema.optional(),issuedOn:date,validUntil:date,intro:prose,paymentTerms:prose,completionTerms:prose,exclusions:prose,note:prose,
}).strict();
export const offerDocumentSchema=offerDocumentFieldsSchema.refine(v=>v.validUntil>=v.issuedOn,{path:['validUntil'],message:'Ważność nie może kończyć się przed datą wystawienia.'});
export type OfferDocument=z.infer<typeof offerDocumentSchema>;
export const savedOfferDocumentSchema=z.object({version:z.number().int().nonnegative(),data:offerDocumentSchema}).strict();
export const offerDocumentSaveSchema=z.object({version:z.number().int().nonnegative().nullable(),offerVersion:z.number().int().nonnegative(),data:offerDocumentSchema}).strict();
export function emptyOfferDocument(today=new Date().toISOString().slice(0,10)):OfferDocument{
 const end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+14);
 return {companyName:'',companyAddress:'',taxId:'',email:'',phone:'',website:'',issuedOn:today,validUntil:end.toISOString().slice(0,10),intro:'Dziękujemy za zainteresowanie. Przedstawiamy propozycję realizacji wraz z zakresem prac i wyceną.',paymentTerms:'',completionTerms:'',exclusions:'',note:''};
}
