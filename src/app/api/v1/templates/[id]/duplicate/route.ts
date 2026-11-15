import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { installationTemplateDuplicateSchema,installationTemplateSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Powielanie szablonów wymaga uprawnień biura.');
 z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));
 const source=uuid.parse((await params).id),input=installationTemplateDuplicateSchema.parse(await readBody(request)),r=await db.rpc('duplicate_installation_template',{p_source:source,p_input:input});
 if(r.error?.code==='40001')throw new ApiFault(409,'CONFLICT','Szablon źródłowy lub żądanie zostały zmienione. Wczytaj aktualny szablon przed ponowieniem.');
 if(r.error?.code==='22023')throw new ApiFault(400,'INVALID_INPUT','Sprawdź nazwę kopii i aktywność wszystkich pozycji katalogowych.');
 databaseError(r.error);const response=json(request,installationTemplateSchema.refine(t=>t.id===input.id&&t.id!==source),r.data,201);revalidatePath('/dashboard/templates','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
