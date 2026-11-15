import { revalidatePath } from 'next/cache';
import { documentChangeSchema,documentSavedSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody,uuid } from '@/lib/api/http';
export function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Zmiana dokumentów wymaga uprawnień administratora lub biura.');
 const id=uuid.parse((await params).id),input=documentChangeSchema.parse(await readBody(request));
 const result=await db.rpc('change_document',{p_id:id,p_version:input.version,p_visible:input.visible,p_archived:input.archived});databaseError(result.error);
 if(result.data!==id)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się potwierdzić zmiany.');
 revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return json(request,documentSavedSchema,{apiVersion:'1',documentId:id});
});}
export function OPTIONS(request:Request){return preflight(request,['PATCH']);}
