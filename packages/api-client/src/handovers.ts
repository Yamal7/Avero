import { z } from 'zod';
import { workOrderSchema } from './work-orders';
const short=(max:number)=>z.string().trim().max(max).refine(v=>!/[\u0000-\u001f\u007f]/.test(v));
const prose=(max:number)=>z.string().trim().max(max).refine(v=>!/[\u0000-\u0008\u000b-\u001f\u007f]/.test(v)&&v.split('\n').length<=80);
const date=z.string().date().regex(/^20\d{2}-/);
export const handoverDeviceSchema=z.object({id:z.string().uuid(),deviceId:z.string().uuid().nullable(),manufacturer:short(120),model:short(160),serialNumber:short(120),warrantyUntil:date.nullable(),warrantyTerms:prose(2000)}).strict();
export const handoverFieldsSchema=z.object({performedOn:date,performerName:short(160),workPerformed:prose(6000),checks:prose(6000),observations:prose(4000),recommendations:prose(4000),mode:z.enum(['new','existing']),installationId:z.string().uuid().nullable(),locationId:z.string().uuid().nullable(),installationType:short(160),devices:z.array(handoverDeviceSchema).max(20)}).strict().superRefine((v,c)=>{
 if(v.mode==='existing'&&!v.installationId)c.addIssue({code:'custom',path:['installationId'],message:'Wybierz istniejącą instalację.'});
 if(v.mode==='new'&&v.installationId)c.addIssue({code:'custom',message:'Nowa instalacja nie może wskazywać istniejącej.'});
 if(new Set(v.devices.map(d=>d.id)).size!==v.devices.length)c.addIssue({code:'custom',message:'Powtórzone identyfikatory urządzeń.'});
 for(const d of v.devices)if(!d.deviceId&&d.warrantyUntil&&d.warrantyUntil<v.performedOn)c.addIssue({code:'custom',message:'Gwarancja nie może kończyć się przed datą montażu.'});
});
export type HandoverFields=z.infer<typeof handoverFieldsSchema>;
export const handoverSaveSchema=z.object({version:z.number().int().nonnegative().nullable(),workVersion:z.number().int().nonnegative(),fields:handoverFieldsSchema,internalNote:prose(4000)}).strict();
export const handoverPublishSchema=z.object({version:z.number().int().nonnegative(),workVersion:z.number().int().nonnegative(),confirm:z.literal(true)}).strict();
export const handoverSnapshotSchema=z.object({number:z.string(),orderNumber:z.string(),title:z.string(),customerName:z.string(),company:z.object({name:z.string(),address:z.string(),taxId:z.string(),email:z.string(),phone:z.string(),website:z.string()}).strict(),site:z.object({address:z.string(),city:z.string(),postalCode:z.string()}).strict(),installation:z.object({id:z.string().uuid(),type:z.string()}).strict(),performedOn:date,performerName:z.string(),workPerformed:z.string(),checks:z.string(),observations:z.string(),recommendations:z.string(),devices:z.array(z.object({id:z.string().uuid(),manufacturer:z.string(),model:z.string(),serialNumber:z.string(),warrantyUntil:date.nullable(),warrantyTerms:z.string()}).strict()).max(20)}).strict();
export type HandoverSnapshot=z.infer<typeof handoverSnapshotSchema>;
export const handoverReceiptSchema=z.object({state:z.enum(['accepted','reservations']),comment:z.string(),receivedAt:z.string()}).strict();
export const handoverRecordSchema=z.object({id:z.string().uuid(),number:z.string(),orderId:z.string().uuid(),version:z.number().int().nonnegative(),state:z.enum(['draft','published']),fields:handoverFieldsSchema,internalNote:z.string(),publishedAt:z.string().nullable(),snapshot:handoverSnapshotSchema.nullable(),receipt:handoverReceiptSchema.nullable()}).strict();
export const publicHandoverSchema=z.object({id:z.string().uuid(),publishedAt:z.string(),snapshot:handoverSnapshotSchema,receipt:handoverReceiptSchema.nullable()}).strict();
export const handoverContextSchema=z.object({order:workOrderSchema,report:handoverRecordSchema.nullable(),locations:z.array(z.object({id:z.string().uuid(),address:z.string(),city:z.string(),postalCode:z.string()}).strict()),installations:z.array(z.object({id:z.string().uuid(),type:z.string(),locationId:z.string().uuid(),address:z.string(),city:z.string(),devices:z.array(handoverDeviceSchema.omit({deviceId:true}))}).strict()),readyToPublish:z.boolean()}).strict();
export type HandoverContext=z.infer<typeof handoverContextSchema>;
export const handoverAcknowledgeSchema=z.object({customerId:z.string().uuid(),state:z.enum(['accepted','reservations']),comment:prose(2000),confirm:z.literal(true)}).strict().refine(v=>v.state!=='reservations'||v.comment.length>0,{path:['comment'],message:'Opisz uwagi do odbioru.'});
export function emptyHandoverFields(today:string):HandoverFields{return {performedOn:today,performerName:'',workPerformed:'',checks:'',observations:'',recommendations:'',mode:'new',installationId:null,locationId:null,installationType:'',devices:[]};}
