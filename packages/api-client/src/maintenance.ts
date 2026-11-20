import { z } from 'zod';
export const maintenanceDateSchema=z.string().date().refine(date=>date>='1900-01-01'&&date<='2199-12-31');
export const maintenanceSaveSchema=z.object({id:z.string().uuid(),installationId:z.string().uuid(),title:z.string().trim().min(1).max(160),intervalMonths:z.number().int().min(1).max(120),nextDueOn:maintenanceDateSchema,active:z.boolean(),version:z.number().int().nonnegative().nullable()}).strict();
export const maintenanceQuerySchema=z.object({installation:z.string().uuid().optional(),search:z.string().trim().max(200).default(''),view:z.enum(['attention','overdue','upcoming','all','paused']).default('attention'),page:z.coerce.number().int().min(1).max(100000).default(1)}).strict();
export const maintenanceRowSchema=z.object({id:z.string().uuid(),installation_id:z.string().uuid(),customer_id:z.string().uuid(),title:z.string(),interval_months:z.number().int(),next_due_on:maintenanceDateSchema,active:z.boolean(),version:z.number().int(),customer_name:z.string(),installation_type:z.string(),address:z.string(),city:z.string(),parent_active:z.boolean(),state:z.enum(['overdue','upcoming','later','paused','archived'])});
export const maintenanceListSchema=z.object({apiVersion:z.literal('1'),today:maintenanceDateSchema,total:z.number().int().nonnegative(),plans:z.array(maintenanceRowSchema),summary:z.object({overdue:z.number().int().nonnegative(),upcoming:z.number().int().nonnegative(),active:z.number().int().nonnegative(),paused:z.number().int().nonnegative()}),page:z.number().int().positive(),pageSize:z.literal(20)});
export const maintenanceSavedSchema=z.object({apiVersion:z.literal('1'),planId:z.string().uuid()});
export type MaintenancePlan=z.infer<typeof maintenanceRowSchema>;
export type MaintenanceSave=z.infer<typeof maintenanceSaveSchema>;
export type MaintenanceQuery=z.input<typeof maintenanceQuerySchema>;
// Calendar months, clamped to the last day of the target month; no local timezone conversion.
export function nextMaintenanceDate(base:string,months:number){
 maintenanceDateSchema.parse(base);z.number().int().min(1).max(120).parse(months);
 const [year,month,day]=base.split('-').map(Number),target=new Date(Date.UTC(year,month-1+months,1));
 const lastDay=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
 target.setUTCDate(Math.min(day,lastDay));return maintenanceDateSchema.parse(target.toISOString().slice(0,10));
}
export const maintenanceCompletionSchema=z.object({requestId:z.string().uuid(),protocolId:z.string().uuid(),version:z.number().int().nonnegative(),expectedNextDueOn:maintenanceDateSchema}).strict();
export const maintenanceCompletionSavedSchema=z.object({apiVersion:z.literal('1'),completionId:z.string().uuid(),planId:z.string().uuid(),nextDueOn:maintenanceDateSchema});
export const maintenanceProtocolSchema=z.object({id:z.string().uuid(),protocol_number:z.number().int(),ticket_id:z.string().uuid(),ticket_number:z.number().int(),subject:z.string(),completed_at:z.string(),performed_on:maintenanceDateSchema});
export const maintenanceHistoryRowSchema=z.object({id:z.string().uuid(),plan_id:z.string().uuid(),protocol_id:z.string().uuid(),protocol_number:z.number().int(),visit_id:z.string().uuid(),ticket_id:z.string().uuid(),ticket_number:z.number().int(),plan_title:z.string(),interval_months:z.number().int(),performed_at:z.string(),performed_on:maintenanceDateSchema,previous_due_on:maintenanceDateSchema,next_due_on:maintenanceDateSchema,recorded_at:z.string(),can_read_protocol:z.boolean()});
export const maintenanceHistorySchema=z.object({total:z.number().int().nonnegative(),items:z.array(maintenanceHistoryRowSchema)});
export const maintenanceDetailSchema=z.object({apiVersion:z.literal('1'),plan:maintenanceRowSchema,canComplete:z.boolean(),protocols:z.object({total:z.number().int().nonnegative(),items:z.array(maintenanceProtocolSchema)}),history:maintenanceHistorySchema});
export type MaintenanceCompletion=z.infer<typeof maintenanceCompletionSchema>;
export type MaintenanceHistory=z.infer<typeof maintenanceHistoryRowSchema>;
export type MaintenanceProtocol=z.infer<typeof maintenanceProtocolSchema>;
export const portalMaintenanceHistorySchema=maintenanceHistorySchema.extend({apiVersion:z.literal('1'),page:z.number().int().positive(),pageSize:z.literal(20)});
