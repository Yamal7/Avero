import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { customerCategoriesInputSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
/** Customer categories (design: Firmy i osoby, Karta firmy). Office only. */
export function PUT(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Kategorie zmienia biuro.');const input=customerCategoriesInputSchema.parse(await readBody(request)),id=uuid.parse((await params).id),r=await db.rpc('set_customer_categories',{p_customer:id,p_categories:input.categories});databaseError(r.error);const response=json(request,z.array(z.string()).max(8),r.data);revalidatePath('/dashboard/customers');revalidatePath(`/dashboard/customers/${id}`);return response;});}
export function OPTIONS(request:Request){return preflight(request,['PUT']);}
