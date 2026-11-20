import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { stockDraftInputSchema,stockDraftSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
/** Document drafts (design: RW „Zapisz szkic”). Each person sees only their own; posting the document removes its draft. */
export function PUT(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const v=stockDraftInputSchema.parse(await readBody(request)),r=await db.rpc('save_stock_draft',{p_id:v.id,p_kind:v.kind,p_payload:v.payload});databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,stockDraftSchema,r.data);});}
export function DELETE(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const {id}=z.object({id:z.string().uuid()}).strict().parse(await readBody(request)),r=await db.rpc('delete_stock_draft',{p_id:id});databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,z.object({ok:z.literal(true)}),{ok:true});});}
export function OPTIONS(request:Request){return preflight(request,['PUT','DELETE']);}
