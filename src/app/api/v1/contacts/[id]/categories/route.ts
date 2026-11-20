import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contactCategoriesInputSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
/** Person categories of a company contact (design: Osoby — Decyzyjny, Techniczny, Płatnik, Zarządca). Office only. */
export function PUT(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db}=await authenticate(request);const v=contactCategoriesInputSchema.parse(await readBody(request)),r=await db.rpc('set_contact_categories',{p_contact:uuid.parse((await params).id),p_categories:v.categories});databaseError(r.error);revalidatePath('/dashboard/customers');return json(request,z.array(z.string()),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['PUT']);}
