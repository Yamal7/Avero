import { z } from 'zod';
export const MAX_DOCUMENT_BYTES=10*1024*1024;
export const documentTypeSchema=z.enum(['manual','warranty','photo','other']);
export const documentMimeSchema=z.enum(['application/pdf','image/jpeg','image/png']);
export const documentUploadSchema=z.object({requestId:z.string().uuid(),installationId:z.string().uuid(),ticketId:z.string().uuid().optional(),fileName:z.string().trim().min(1).max(240).refine(name=>!/[\\/\u0000-\u001f\u007f]/.test(name)&&!['.','..'].includes(name)),documentType:documentTypeSchema,byteSize:z.number().int().min(1).max(MAX_DOCUMENT_BYTES),mimeType:documentMimeSchema}).strict();
export const documentChangeSchema=z.object({version:z.number().int().nonnegative(),visible:z.boolean(),archived:z.boolean()}).strict().refine(input=>!input.archived||!input.visible);
export const documentRowSchema=z.object({id:z.string().uuid(),installation_id:z.string().uuid(),ticket_id:z.string().uuid().nullable(),file_name:z.string(),document_type:z.string(),byte_size:z.number().nullable(),mime_type:z.string().nullable(),visible_to_customer:z.boolean(),uploaded_by_client:z.boolean().default(false),archived_at:z.string().nullable(),version:z.number().int(),created_at:z.string()});
export const documentListSchema=z.object({apiVersion:z.literal('1'),documents:z.array(documentRowSchema),total:z.number().int().nonnegative(),page:z.number().int().positive(),pageSize:z.literal(20)});
export const documentSavedSchema=z.object({apiVersion:z.literal('1'),documentId:z.string().uuid()});
export type DocumentRow=z.infer<typeof documentRowSchema>;
export type DocumentUpload=z.infer<typeof documentUploadSchema>;
export type DocumentChange=z.infer<typeof documentChangeSchema>;

export const CLIENT_ATTACHMENTS_PER_TICKET=10;
export const CLIENT_ATTACHMENT_TICKET_BYTES=50*1024*1024;
export const CLIENT_ATTACHMENTS_PER_HOUR=10;
export const clientAttachmentUploadSchema=documentUploadSchema.pick({requestId:true,fileName:true,byteSize:true,mimeType:true}).extend({customerId:z.string().uuid()}).strict();
export type ClientAttachmentUpload=z.infer<typeof clientAttachmentUploadSchema>;
