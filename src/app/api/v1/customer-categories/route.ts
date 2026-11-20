import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { customerCategoryListSchema,customerCategorySaveSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
/** Categories in use with their colour and number of customers; the office sets colours and renames (design: „Zarządzaj kategoriami”). */
export function GET(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const {kind}=z.object({kind:z.enum(['company','individual']).default('company')}).strict().parse(Object.fromEntries(new URL(request.url).searchParams)),r=await db.rpc('customer_category_list',{p_kind:kind});databaseError(r.error);return json(request,customerCategoryListSchema,r.data);});}
export function PUT(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const v=customerCategorySaveSchema.parse(await readBody(request)),r=await db.rpc('save_customer_category',{p_name:v.name,p_color:v.color,p_rename:v.rename??null});databaseError(r.error);revalidatePath('/dashboard/customers','layout');return json(request,z.object({ok:z.literal(true)}),{ok:true});});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
