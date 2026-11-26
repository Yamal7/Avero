import { z } from 'zod';
import { emptyOfferDocument,offerDocumentFieldsSchema,type OfferDocument } from './offer-document';
/** Numer rachunku firmy (M0.1): pusty albo IBAN / polski NRB (26 cyfr) z poprawną sumą kontrolną mod 97. Ta sama reguła w SQL: valid_bank_account. */
export function validBankAccount(value:string):boolean{
 if(value==='')return true;
 if(value!==value.trim()||value.length>42||/[\u0000-\u001f\u007f]/.test(value))return false;
 let v=value.replace(/ /g,'').toUpperCase();if(/^\d{26}$/.test(v))v='PL'+v;
 if(!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v))return false;
 let rest=0;for(const ch of v.slice(4)+v.slice(0,4)){const part=/[A-Z]/.test(ch)?String(ch.charCodeAt(0)-55):ch;for(const d of part)rest=(rest*10+Number(d))%97;}
 return rest===1;
}
export const bankAccountSchema=z.string().max(42).refine(validBankAccount,'Podaj numer rachunku (IBAN lub 26 cyfr).');
/** Widok maskowany: tylko ostatnie 4 cyfry, np. „•••• 2874”. */
export function maskBankAccount(value:string|undefined|null):string{const digits=(value??'').replace(/\D/g,'');return digits?'•••• '+digits.slice(-4):'';}
export const companyProfileFieldsSchema=offerDocumentFieldsSchema.omit({issuedOn:true,validUntil:true}).extend({validityDays:z.number().int().min(1).max(365),bankAccount:bankAccountSchema.optional()}).strict();
/** Odczyt profilu: biuro dostaje numer rachunku zamaskowany przez company_profile() („•••• 2874”); zapis go nie przyjmuje. */
export const maskedBankAccountSchema=z.string().regex(/^•••• \d{4}$/);
export const companyProfileReadFieldsSchema=companyProfileFieldsSchema.extend({bankAccount:z.union([bankAccountSchema,maskedBankAccountSchema]).optional()}).strict();
export const companyProfileSchema=z.object({version:z.number().int().nonnegative(),data:companyProfileReadFieldsSchema}).strict();
export const companyProfileSaveSchema=z.object({version:z.number().int().min(0).max(2147483646).nullable(),data:companyProfileFieldsSchema}).strict();
export type CompanyProfile=z.infer<typeof companyProfileSchema>;
export type CompanyProfileFields=z.infer<typeof companyProfileFieldsSchema>;
export function emptyCompanyProfile():CompanyProfileFields{const {issuedOn,validUntil,...fields}=emptyOfferDocument();void issuedOn;void validUntil;return {...fields,validityDays:14};}
export function documentFromCompanyProfile(profile:CompanyProfile|null,today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())):OfferDocument{
 const empty=emptyOfferDocument(today);if(!profile)return empty;
 const {validityDays,bankAccount,...fields}=companyProfileSchema.parse(profile).data,end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+validityDays);void bankAccount;
 return {...fields,issuedOn:today,validUntil:end.toISOString().slice(0,10)};
}
