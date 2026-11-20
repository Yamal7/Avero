import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { stockVehicleInputSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function POST(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const v=stockVehicleInputSchema.parse(await readBody(request)),r=await db.rpc('save_stock_vehicle',{p_id:v.id,p_technician:v.technicianId,p_name:v.name,p_plate:v.plate});databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,z.string().uuid(),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
