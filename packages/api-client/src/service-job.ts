import { z } from 'zod';
/* Zlecenie (design ZS-1047): structured measurements, materials and comments of a service ticket. */
const line=(max:number)=>z.string().trim().max(max).refine(v=>!/[\u0000-\u001f\u007f]/.test(v));
export const serviceMeasurementSchema=z.object({id:z.string().uuid(),parameter:z.string(),norm:z.string(),before:z.string(),after:z.string(),outOfNorm:z.boolean(),updatedAt:z.string()}).strict();
export const serviceMaterialSchema=z.object({id:z.string().uuid(),name:z.string(),quantity:z.number().positive(),unit:z.string(),document:z.string(),source:z.string(),netCents:z.number().int().nonnegative(),createdAt:z.string()}).strict();
export const serviceCommentSchema=z.object({id:z.string().uuid(),authorId:z.string().uuid(),authorLabel:z.string(),body:z.string(),createdAt:z.string()}).strict();
export const serviceJobSchema=z.object({measurements:z.array(serviceMeasurementSchema).max(40),materials:z.array(serviceMaterialSchema).max(60),comments:z.array(serviceCommentSchema).max(200)}).strict();
export const serviceMeasurementInputSchema=z.object({id:z.string().uuid(),parameter:line(120).refine(v=>v.length>0,'Podaj parametr.'),norm:line(80),before:line(80),after:line(80),outOfNorm:z.boolean()}).strict();
export const serviceMaterialInputSchema=z.object({id:z.string().uuid(),name:line(160).refine(v=>v.length>0,'Podaj nazwę.'),quantity:z.number().positive().max(100000).refine(v=>Math.round(v*1000)===v*1000,'Najwyżej 3 miejsca po przecinku.'),unit:line(12).refine(v=>v.length>0),document:line(40),source:line(80),netCents:z.number().int().min(0).max(99999999999)}).strict();
export const serviceCommentInputSchema=z.object({id:z.string().uuid(),body:z.string().trim().min(1).max(2000).refine(v=>!/[\u0000-\u0008\u000b-\u001f\u007f]/.test(v)&&v.split('\n').length<=80)}).strict();
export const serviceJobDeleteSchema=z.object({id:z.string().uuid()}).strict();
export type ServiceJob=z.infer<typeof serviceJobSchema>;
export type ServiceMeasurement=z.infer<typeof serviceMeasurementSchema>;
export type ServiceMaterial=z.infer<typeof serviceMaterialSchema>;
