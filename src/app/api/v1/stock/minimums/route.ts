import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { stockVehicleMinInputSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
/** Minimum of an item in one van (0 removes it). Office only (checked in the database). */
export function PUT(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const v=stockVehicleMinInputSchema.parse(await readBody(request)),r=await db.rpc('set_stock_vehicle_min',{p_location:v.locationId,p_item:v.itemId,p_min:v.minQuantity});databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,z.object({ok:z.literal(true)}),{ok:true});});}
export function OPTIONS(request:Request){return preflight(request,['PUT']);}
