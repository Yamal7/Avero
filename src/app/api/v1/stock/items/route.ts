import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { stockItemInputSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function POST(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const i=stockItemInputSchema.parse(await readBody(request)),r=await db.rpc('save_stock_item',{p_id:i.id,p_code:i.code,p_name:i.name,p_category:i.category,p_unit:i.unit,p_min:i.minQuantity,p_bin:i.bin,p_class:i.refrigerantClass,p_gwp:i.gwp,p_container:i.container});if(r.error?.code==='23505')throw new ApiFault(409,'DUPLICATE_CODE','Ten indeks już jest w magazynie.');databaseError(r.error);revalidatePath('/dashboard/stock');return json(request,z.string().uuid(),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
