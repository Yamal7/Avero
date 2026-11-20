import { z } from 'zod';
export const catalogCategories={device:'Urządzenia',material:'Materiały',service:'Usługi',travel:'Dojazd'} as const;
export const catalogUnits={piece:'szt.',set:'kpl.',meter:'m',square_meter:'m²',hour:'godz.',kilometer:'km',visit:'wizyta'} as const;
export const catalogCategorySchema=z.enum(['device','material','service','travel']);
export const catalogUnitSchema=z.enum(['piece','set','meter','square_meter','hour','kilometer','visit']);
const text=(max:number,min=0)=>z.string().trim().min(min).max(max).refine(value=>!/[\u0000-\u001f\u007f]/.test(value),'Usuń znaki sterujące.');
export const catalogFieldsSchema=z.object({code:text(64,1).transform(value=>value.toUpperCase()),name:text(160,1),category:catalogCategorySchema,unit:catalogUnitSchema,costCents:z.number().int().min(0).max(999999999),saleCents:z.number().int().min(0).max(999999999),vatBasisPoints:z.number().int().min(0).max(10000),manufacturer:text(100).default(''),model:text(100).default(''),supplier:text(160).default(''),description:z.string().trim().max(2000).refine(value=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)).default(''),archived:z.boolean()}).strict();
export const catalogSaveSchema=catalogFieldsSchema.extend({id:z.string().uuid(),version:z.number().int().min(0).max(2147483646).nullable()}).strict();
export const catalogRowSchema=catalogFieldsSchema.extend({id:z.string().uuid(),version:z.number().int().nonnegative(),createdAt:z.string(),updatedAt:z.string()});
export const catalogQuerySchema=z.object({search:z.string().trim().max(200).default(''),category:z.enum(['all','device','material','service','travel']).default('all'),state:z.enum(['active','archived','all']).default('active'),page:z.coerce.number().int().min(1).max(100000).default(1)}).strict();
export const catalogListSchema=z.object({apiVersion:z.literal('1'),items:z.array(catalogRowSchema),total:z.number().int().nonnegative(),page:z.number().int().positive(),pageSize:z.literal(25)});
export const catalogSavedSchema=z.object({apiVersion:z.literal('1'),itemId:z.string().uuid()});
export type CatalogItem=z.infer<typeof catalogRowSchema>;
export type CatalogSave=z.infer<typeof catalogSaveSchema>;
export type CatalogQuery=z.input<typeof catalogQuerySchema>;
// Parse decimal text directly into integer hundredths, without floating-point money arithmetic.
export function decimalToHundredths(raw:string,max=999999999){
 const value=raw.trim().replace(',','.');if(!/^\d{1,7}(\.\d{1,2})?$/.test(value))throw new Error('Podaj liczbę nieujemną z maksymalnie dwoma miejscami po przecinku.');
 const [whole,fraction='']=value.split('.'),result=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 if(result>max)throw new Error('Podana wartość jest zbyt duża.');return result;
}
export function hundredthsToDecimal(value:number){return `${Math.floor(value/100)}.${String(value%100).padStart(2,'0')}`;}
export function catalogGrossCents(netCents:number,vatBasisPoints:number){return Math.floor((netCents*(10000+vatBasisPoints)+5000)/10000);}
export function catalogMargin(costCents:number,saleCents:number){return saleCents>0?(saleCents-costCents)/saleCents*100:null;}

export const catalogDetailSchema=z.object({apiVersion:z.literal('1'),item:catalogRowSchema});
