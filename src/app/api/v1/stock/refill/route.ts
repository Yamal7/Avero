import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { stockRefillResultSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
/** „Uzupełnij braki”: one MM per van below its minimums, from the main warehouse. Retry with the same requestId is safe. */
export function POST(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const {requestId}=z.object({requestId:z.string().uuid()}).strict().parse(await readBody(request)),r=await db.rpc('refill_vehicles',{p_request:requestId});databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,stockRefillResultSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
