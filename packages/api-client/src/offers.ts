import { z } from 'zod';
import { catalogCategorySchema,catalogUnitSchema } from './catalog';
export const offerWorkTypes={split:'Klimatyzacja split',multi_split:'Multi-split',heat_pump:'Pompa ciepła',underfloor:'Podłogówka',plumbing:'Wod-kan',other:'Inna kalkulacja'} as const;
export const offerWorkTypeSchema=z.enum(['split','multi_split','heat_pump','underfloor','plumbing','other']);
const short=(max:number,min=0)=>z.string().trim().min(min).max(max).refine(v=>!/[\u0000-\u001f\u007f]/.test(v));
const note=z.string().max(2000).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v));
export const offerLineSchema=z.object({id:z.string().uuid(),catalogId:z.string().uuid().nullable(),code:short(64),name:short(160,1),description:short(500),category:catalogCategorySchema,unit:catalogUnitSchema,quantityMills:z.number().int().min(1).max(10000000),costCents:z.number().int().min(0).max(999999999),saleCents:z.number().int().min(0).max(999999999),vatBasisPoints:z.number().int().min(0).max(10000),discountBasisPoints:z.number().int().min(0).max(10000)}).strict();
export const offerVariantSchema=z.object({id:z.string().uuid(),name:short(80,1),lines:z.array(offerLineSchema).max(30),internalNote:note,customerNote:note,targetMarginBasisPoints:z.number().int().min(0).max(9500),overrideNetCents:z.number().int().min(0).max(999999999999).nullable()}).strict().superRefine((v,ctx)=>{if(new Set(v.lines.map(l=>l.id)).size!==v.lines.length)ctx.addIssue({code:'custom',message:'Powtórzone identyfikatory pozycji.'});});
export const offerTechnicalSchema=z.object({areaMills:z.number().int().min(0).max(10000000).optional(),lengthMills:z.number().int().min(0).max(10000000),laborMills:z.number().int().min(0).max(10000000),travelMills:z.number().int().min(0).max(10000000)}).strict();
export const offerFieldsSchema=z.object({customerId:z.string().uuid(),locationId:z.string().uuid().nullable(),title:short(160,1),workType:offerWorkTypeSchema,technical:offerTechnicalSchema,variants:z.array(offerVariantSchema).min(1).max(5),mainVariantId:z.string().uuid(),archived:z.boolean()}).strict();
export const offerSaveSchema=offerFieldsSchema.extend({id:z.string().uuid(),version:z.number().int().min(0).max(2147483646).nullable()}).strict().superRefine((v,ctx)=>{
 if(new Set(v.variants.map(x=>x.id)).size!==v.variants.length||!v.variants.some(x=>x.id===v.mainVariantId))ctx.addIssue({code:'custom',message:'Wybierz jeden z wariantów jako główny.'});
 try{v.variants.forEach(calculateOfferVariant);}catch(error){ctx.addIssue({code:'custom',message:error instanceof Error?error.message:'Nieprawidłowa kalkulacja.'});}
});
export type OfferLine=z.infer<typeof offerLineSchema>;
export type OfferVariant=z.infer<typeof offerVariantSchema>;
export type OfferSave=z.infer<typeof offerSaveSchema>;
export type OfferFields=z.infer<typeof offerFieldsSchema>;
const lineTotalSchema=z.object({id:z.string().uuid(),baseNetCents:z.number().int(),netCents:z.number().int(),costCents:z.number().int(),vatCents:z.number().int(),grossCents:z.number().int()});
export const offerTotalsSchema=z.object({baseNetCents:z.number().int().nonnegative(),netCents:z.number().int().nonnegative(),costCents:z.number().int().nonnegative(),vatCents:z.number().int().nonnegative(),grossCents:z.number().int().nonnegative(),profitCents:z.number().int(),lines:z.array(lineTotalSchema)});
export const offerRecordSchema=offerFieldsSchema.extend({id:z.string().uuid(),version:z.number().int().nonnegative(),number:z.string(),createdAt:z.string(),updatedAt:z.string(),customerSnapshot:z.object({name:z.string(),email:z.string().nullable(),phone:z.string().nullable(),address:z.string().nullable(),city:z.string().nullable(),postalCode:z.string().nullable()}),computed:z.record(offerTotalsSchema)});
export type OfferRecord=z.infer<typeof offerRecordSchema>;
export const offerDetailSchema=z.object({apiVersion:z.literal('1'),offer:offerRecordSchema});
export const offerQuerySchema=z.object({search:z.string().trim().max(200).default(''),state:z.enum(['active','archived','all']).default('active'),page:z.coerce.number().int().min(1).max(100000).default(1)}).strict();
export const offerListSchema=z.object({apiVersion:z.literal('1'),total:z.number().int().nonnegative(),page:z.number().int().positive(),pageSize:z.literal(25),items:z.array(z.object({id:z.string().uuid(),number:z.string(),title:z.string(),customerName:z.string(),workType:offerWorkTypeSchema,archived:z.boolean(),netCents:z.number().int(),costCents:z.number().int(),grossCents:z.number().int(),updatedAt:z.string()}))});
export const offerCustomersSchema=z.object({apiVersion:z.literal('1'),customers:z.array(z.object({id:z.string().uuid(),name:z.string(),email:z.string().nullable(),phone:z.string().nullable(),locations:z.array(z.object({id:z.string().uuid(),address:z.string(),city:z.string(),postal_code:z.string().nullable()}))})).max(25)});
export type OfferCustomer=z.infer<typeof offerCustomersSchema>['customers'][number];
export function quantityToMills(raw:string){const v=raw.trim().replace(',','.');if(!/^\d{1,5}(\.\d{1,3})?$/.test(v))throw new Error('Ilość: maksymalnie 3 miejsca po przecinku.');const [whole,part='']=v.split('.'),n=Number(whole)*1000+Number(part.padEnd(3,'0'));if(n>10000000)throw new Error('Maksymalna ilość to 10 000.');return n;}
export function millsToQuantity(value:number){return (value/1000).toFixed(3).replace(/\.?0+$/,'')||'0';}
const B=BigInt;
const round=(n:bigint,d:bigint)=>Number((n+d/B(2))/d);
export function calculateOfferVariant(v:Pick<OfferVariant,'lines'|'overrideNetCents'>){
 const base=v.lines.map(l=>round(B(l.quantityMills)*B(l.saleCents)*B(10000-l.discountBasisPoints),B(10000000)));
 const costs=v.lines.map(l=>round(B(l.quantityMills)*B(l.costCents),B(1000)));
 const baseTotal=base.reduce((a,b)=>a+b,0),target=v.overrideNetCents??baseTotal;
 if(!Number.isSafeInteger(target)||target<0||target>999999999999)throw new Error('Kwota kalkulacji przekracza limit.');
 if(baseTotal===0&&target!==0)throw new Error('Ręczna cena wymaga pozycji o dodatniej wartości.');
 let net=base.slice();
 if(v.overrideNetCents!==null&&baseTotal>0){
  const shares=base.map((amount,i)=>({i,net:Number(B(amount)*B(target)/B(baseTotal)),remainder:B(amount)*B(target)%B(baseTotal)}));
  let remaining=target-shares.reduce((a,s)=>a+s.net,0);
  const order=shares.slice().sort((a,b)=>a.remainder===b.remainder?a.i-b.i:a.remainder>b.remainder?-1:1);
  for(const share of order){if(remaining<=0)break;share.net++;remaining--;}
  net=shares.map(s=>s.net);
 }
 const lines=v.lines.map((l,i)=>{const vat=round(B(net[i])*B(l.vatBasisPoints),B(10000));return {id:l.id,baseNetCents:base[i],netCents:net[i],costCents:costs[i],vatCents:vat,grossCents:net[i]+vat};});
 const costCents=costs.reduce((a,b)=>a+b,0),vatCents=lines.reduce((a,b)=>a+b.vatCents,0);
 if([baseTotal,costCents,target+vatCents].some(n=>!Number.isSafeInteger(n)||n>999999999999))throw new Error('Kwota kalkulacji przekracza limit.');
 return {baseNetCents:baseTotal,netCents:target,costCents,vatCents,grossCents:target+vatCents,profitCents:target-costCents,lines};
}
export function suggestedOfferNet(costCents:number,marginBasisPoints:number){return Number((B(costCents)*B(10000)+B(9999-marginBasisPoints))/B(10000-marginBasisPoints));}
export function offerInput(record:OfferRecord):OfferSave{const {id,version,customerId,locationId,title,workType,technical,variants,mainVariantId,archived}=record;return {id,version,customerId,locationId,title,workType,technical,variants,mainVariantId,archived};}
export function offerMoneyToCents(raw:string){const value=raw.trim().replace(',','.');if(!/^\d{1,10}(\.\d{1,2})?$/.test(value))throw new Error('Cena: maksymalnie 2 miejsca po przecinku.');const [whole,part='']=value.split('.'),n=Number(whole)*100+Number(part.padEnd(2,'0'));if(n>999999999999)throw new Error('Kwota przekracza limit.');return n;}
// Explicit client-facing projection: never pass costs or internal notes to a preview component.
export function customerOfferPreview(record:OfferRecord){return {number:record.number,title:record.title,customer:record.customerSnapshot,mainVariantId:record.mainVariantId,variants:record.variants.map(v=>{const total=record.computed[v.id];return {id:v.id,name:v.name,note:v.customerNote,netCents:total.netCents,vatCents:total.vatCents,grossCents:total.grossCents,lines:v.lines.map((l,i)=>({name:l.name,description:l.description,unit:l.unit,quantityMills:l.quantityMills,vatBasisPoints:l.vatBasisPoints,netCents:total.lines[i].netCents,vatCents:total.lines[i].vatCents,grossCents:total.lines[i].grossCents}))};})};}
