import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { stockReservationInputSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function POST(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const v=stockReservationInputSchema.parse(await readBody(request)),r=await db.rpc('reserve_stock',{p_id:v.id,p_item:v.itemId,p_ticket:v.ticketId,p_quantity:v.quantity});databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,z.object({ok:z.literal(true)}),{ok:true});});}
export function DELETE(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const {id}=z.object({id:z.string().uuid()}).strict().parse(await readBody(request)),r=await db.rpc('close_stock_reservation',{p_id:id});databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,z.object({ok:z.literal(true)}),{ok:true});});}
export function OPTIONS(request:Request){return preflight(request,['POST','DELETE']);}
