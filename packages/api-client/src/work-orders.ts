import { z } from 'zod';
import { catalogUnitSchema } from './catalog';
const text=(max:number,min=0)=>z.string().trim().min(min).max(max).refine(v=>!/[\u0000-\u001f\u007f]/.test(v));
export const workOrderStates={draft:'Do zaplanowania',planned:'Zaplanowane',in_progress:'W realizacji',completed:'Zakończone',cancelled:'Anulowane'} as const;
export const workVisitStates={planned:'Zaplanowany',in_progress:'W trakcie',completed:'Zakończony',cancelled:'Odwołany'} as const;
export const workOrderStateSchema=z.enum(['draft','planned','in_progress','completed','cancelled']);
export const workVisitStateSchema=z.enum(['planned','in_progress','completed','cancelled']);
export const workOrderCreateSchema=z.object({requestId:z.string().uuid(),publicationId:z.string().uuid(),address:text(240,1),city:text(120,1),postalCode:text(20)}).strict();
export const workVisitSaveSchema=z.object({version:z.number().int().nonnegative(),visitId:z.string().uuid(),localStart:z.string().regex(/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/).refine(v=>z.string().date().safeParse(v.slice(0,10)).success&&Number(v.slice(11,13))<24&&Number(v.slice(14,16))<60),durationMinutes:z.number().int().min(15).max(480),crewIds:z.array(z.string().uuid()).min(1).max(10).refine(v=>new Set(v).size===v.length),notes:z.string().trim().max(2000)}).strict();
export const workOrderChangeSchema=z.object({version:z.number().int().nonnegative(),state:z.enum(['completed','cancelled','draft'])}).strict();
export const workVisitChangeSchema=z.object({version:z.number().int().nonnegative(),state:z.enum(['in_progress','completed','cancelled'])}).strict();
export const workVisitSchema=z.object({id:z.string().uuid(),startAt:z.string(),durationMinutes:z.number().int().min(15).max(480),state:workVisitStateSchema,crewIds:z.array(z.string().uuid()),notes:z.string()}).strict();
export const workOrderSchema=z.object({id:z.string().uuid(),number:z.string(),publicationId:z.string().uuid(),customerId:z.string().uuid(),customerName:z.string(),offerNumber:z.string(),title:z.string(),variantName:z.string(),scopeNote:z.string(),address:z.string(),city:z.string(),postalCode:z.string(),state:workOrderStateSchema,version:z.number().int().nonnegative(),grossCents:z.number().int().nonnegative().nullable(),netCents:z.number().int().nonnegative().nullable(),lines:z.array(z.object({name:z.string(),description:z.string(),quantityMills:z.number().int().positive(),unit:catalogUnitSchema}).strict()),visits:z.array(workVisitSchema),canManage:z.boolean()}).strict().refine(v=>v.canManage||v.grossCents===null&&v.netCents===null,'Technician response must not contain prices.');
export type WorkOrder=z.infer<typeof workOrderSchema>;
export const workOrderListSchema=z.object({total:z.number().int().nonnegative(),items:z.array(workOrderSchema).max(25)}).strict();
export const workOrderCalendarSchema=z.array(z.object({id:z.string().uuid(),orderId:z.string().uuid(),number:z.string(),title:z.string(),customerName:z.string(),address:z.string(),city:z.string(),startAt:z.string(),durationMinutes:z.number().int(),state:workVisitStateSchema,crewIds:z.array(z.string().uuid())}).strict());
export const publicWorkOrderSchema=z.object({id:z.string().uuid(),number:z.string(),state:workOrderStateSchema,address:z.string(),city:z.string(),visits:z.array(workVisitSchema.omit({crewIds:true,notes:true}))}).strict();

export const workOrderAddressSchema=workOrderCreateSchema.pick({address:true,city:true,postalCode:true}).extend({version:z.number().int().nonnegative()}).strict();
