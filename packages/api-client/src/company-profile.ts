import { z } from 'zod';
import { emptyOfferDocument,offerDocumentFieldsSchema,type OfferDocument } from './offer-document';
export const companyProfileFieldsSchema=offerDocumentFieldsSchema.omit({issuedOn:true,validUntil:true}).extend({validityDays:z.number().int().min(1).max(365)}).strict();
export const companyProfileSchema=z.object({version:z.number().int().nonnegative(),data:companyProfileFieldsSchema}).strict();
export const companyProfileSaveSchema=z.object({version:z.number().int().min(0).max(2147483646).nullable(),data:companyProfileFieldsSchema}).strict();
export type CompanyProfile=z.infer<typeof companyProfileSchema>;
export type CompanyProfileFields=z.infer<typeof companyProfileFieldsSchema>;
export function emptyCompanyProfile():CompanyProfileFields{const {issuedOn,validUntil,...fields}=emptyOfferDocument();void issuedOn;void validUntil;return {...fields,validityDays:14};}
export function documentFromCompanyProfile(profile:CompanyProfile|null,today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())):OfferDocument{
 const empty=emptyOfferDocument(today);if(!profile)return empty;
 const {validityDays,...fields}=companyProfileSchema.parse(profile).data,end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+validityDays);
 return {...fields,issuedOn:today,validUntil:end.toISOString().slice(0,10)};
}
