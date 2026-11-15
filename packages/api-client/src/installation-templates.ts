import { z } from 'zod';
import { offerVariantSchema,offerWorkTypeSchema,offerLineSchema,type OfferLine } from './offers';
export const templateQuantitySources={fixed:'Stała ilość',length:'Długość instalacji (m)',area:'Powierzchnia (m²)',labor:'Czas pracy (godz.)',travel:'Dojazd łącznie (km)'} as const;
export const templateParameterUnits={length:'m',area:'m²',labor:'godz.',travel:'km'} as const;
export const templateQuantitySourceSchema=z.enum(['fixed','length','area','labor','travel']);
export const templateParametersSchema=z.object({lengthMills:z.number().int().min(0).max(10000000),areaMills:z.number().int().min(0).max(10000000),laborMills:z.number().int().min(0).max(10000000),travelMills:z.number().int().min(0).max(10000000)}).strict();
export type TemplateParameters=z.infer<typeof templateParametersSchema>;
export type TemplateQuantitySource=z.infer<typeof templateQuantitySourceSchema>;
const text=(max:number,min=0)=>z.string().trim().min(min).max(max).refine(v=>!/[\u0000-\u001f\u007f]/.test(v));
export const installationTemplateFieldsSchema=z.object({name:text(160,1),description:text(1000),workType:offerWorkTypeSchema,archived:z.boolean(),lines:z.array(z.object({id:z.string().uuid(),catalogId:z.string().uuid(),quantityMills:z.number().int().min(1).max(10000000),quantitySource:templateQuantitySourceSchema.optional()}).strict()).min(1).max(30)}).strict().refine(v=>new Set(v.lines.map(l=>l.id)).size===v.lines.length,{message:'Powtórzone identyfikatory pozycji.'});
export const installationTemplateSaveSchema=z.object({id:z.string().uuid(),version:z.number().int().min(0).max(2147483646).nullable(),fields:installationTemplateFieldsSchema}).strict();
export const installationTemplateSchema=z.object({id:z.string().uuid(),version:z.number().int().nonnegative(),fields:installationTemplateFieldsSchema,createdAt:z.string(),updatedAt:z.string()}).strict();
export const installationTemplateDetailSchema=z.object({template:installationTemplateSchema,lines:z.array(offerLineSchema).max(30),unavailable:z.array(z.string().uuid()).max(30)}).strict().superRefine((v,ctx)=>{const expected=v.template.fields.lines;if(expected.length!==v.lines.length+v.unavailable.length||new Set([...v.lines.map(l=>l.id),...v.unavailable]).size!==expected.length||expected.some(l=>!v.unavailable.includes(l.id)&&!v.lines.some(r=>r.id===l.id&&r.catalogId===l.catalogId&&r.quantityMills===l.quantityMills)))ctx.addIssue({code:'custom',message:'Niekompletne pozycje szablonu.'});});
export const installationTemplateQuerySchema=z.object({search:z.string().trim().max(200).default(''),state:z.enum(['active','archived','all']).default('active'),workType:z.enum(['all','split','multi_split','heat_pump','underfloor','plumbing','other']).default('all'),page:z.coerce.number().int().min(1).max(100000).default(1)}).strict();
export const installationTemplateListSchema=z.object({total:z.number().int().nonnegative(),items:z.array(installationTemplateSchema).max(25)}).strict();
export type InstallationTemplate=z.infer<typeof installationTemplateSchema>;
export type InstallationTemplateDetail=z.infer<typeof installationTemplateDetailSchema>;
export function templateRequiredParameters(detail:InstallationTemplateDetail){return [...new Set(detail.template.fields.lines.map(l=>l.quantitySource||'fixed').filter((v):v is Exclude<TemplateQuantitySource,'fixed'>=>v!=='fixed'))];}
export function templateLineQuantity(line:InstallationTemplate['fields']['lines'][number],parameters:TemplateParameters){
 const source=templateQuantitySourceSchema.parse(line.quantitySource||'fixed'),amount=z.number().int().min(1).max(10000000).parse(line.quantityMills);
 if(source==='fixed')return amount;
 const p=templateParametersSchema.parse(parameters),input=p[`${source}Mills`];
 if(input<=0)throw new Error(`Podaj dodatnią wartość: ${templateQuantitySources[source]}.`);
 const quantity=Number((BigInt(amount)*BigInt(input)+BigInt(500))/BigInt(1000));
 if(quantity<1||quantity>10000000)throw new Error('Wyliczona ilość musi mieścić się w zakresie 0,001–10 000. Zmień parametr lub mnożnik w szablonie.');
 return quantity;
}
export function templateOfferLines(detail:InstallationTemplateDetail,newId:()=>string,parameters:TemplateParameters={lengthMills:0,areaMills:0,laborMills:0,travelMills:0}):OfferLine[]{
 installationTemplateDetailSchema.parse(detail);templateParametersSchema.parse(parameters);
 if(detail.template.fields.archived||detail.unavailable.length)throw new Error('Szablon lub jego pozycje są nieaktywne. Popraw szablon przed użyciem.');
 return detail.lines.map(line=>({...line,id:newId(),quantityMills:templateLineQuantity(detail.template.fields.lines.find(l=>l.id===line.id)!,parameters)}));
}

export type TemplateVariantSelection={key:string;name:string;detail:InstallationTemplateDetail};
export function templateVariantSelections(input:TemplateVariantSelection[]){
 const result=z.array(z.object({key:text(80,1),name:text(80,1),detail:installationTemplateDetailSchema}).strict()).min(1).max(5).parse(input);
 if(new Set(result.map(s=>s.key)).size!==result.length)throw new Error('Powtórzony identyfikator wariantu.');
 if(new Set(result.map(s=>s.name.toLocaleLowerCase('pl-PL'))).size!==result.length)throw new Error('Nadaj każdemu wariantowi inną nazwę.');
 return result;
}
export function templateOfferVariants(input:TemplateVariantSelection[],parameters:TemplateParameters,identity:(key:string)=>string){
 const selections=templateVariantSelections(input),variants=selections.map(s=>{
  let index=0;
  const lines=templateOfferLines(s.detail,()=>identity(`line:${s.key}:${s.detail.lines[index++].id}`),parameters);
  return {id:identity(`variant:${s.key}`),name:s.name,lines,internalNote:'',customerNote:'',targetMarginBasisPoints:3000,overrideNetCents:null};
 });
 const ids=variants.flatMap(v=>[v.id,...v.lines.map(l=>l.id)]);
 if(new Set(ids).size!==ids.length)throw new Error('Powtórzone identyfikatory kalkulacji.');
 return variants.map(v=>offerVariantSchema.parse(v));
}

export const offerVariantTemplateContextSchema=z.object({offerId:z.string().uuid(),offerVersion:z.number().int().nonnegative(),variantId:z.string().uuid(),variantName:text(80,1),workType:offerWorkTypeSchema,lines:z.array(z.object({lineId:z.string().uuid(),name:text(160,1),unit:offerLineSchema.shape.unit,quantityMills:z.number().int().min(1).max(10000000),catalog:z.object({id:z.string().uuid(),name:text(160,1),unit:offerLineSchema.shape.unit}).strict().nullable()}).strict()).max(30)}).strict().superRefine((v,ctx)=>{if(new Set(v.lines.map(l=>l.lineId)).size!==v.lines.length||v.lines.some(l=>l.catalog&&l.catalog.unit!==l.unit))ctx.addIssue({code:'custom',message:'Niespójne pozycje źródłowe.'});});
export const offerVariantTemplateSaveSchema=z.object({id:z.string().uuid(),offerVersion:z.number().int().min(0).max(2147483646),name:text(160,1),description:text(1000),mappings:z.array(z.object({lineId:z.string().uuid(),catalogId:z.string().uuid()}).strict()).min(1).max(30)}).strict().refine(v=>new Set(v.mappings.map(m=>m.lineId)).size===v.mappings.length,{message:'Powtórzone pozycje źródłowe.'});
export type OfferVariantTemplateContext=z.infer<typeof offerVariantTemplateContextSchema>;

export const installationTemplateDuplicateSchema=z.object({id:z.string().uuid(),sourceVersion:z.number().int().min(0).max(2147483646),name:text(160,1)}).strict();
