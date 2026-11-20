import { z } from 'zod';
import { ApiFault,databaseError,uuid,type authenticate } from '@/lib/api/http';
type Database=Awaited<ReturnType<typeof authenticate>>['db'];
export async function completeDocumentUpload(db:Database,data:unknown,id:string,bytes:Uint8Array,mime:string){
 const staged=z.object({id:uuid,storage_path:z.string(),upload_state:z.enum(['pending','ready'])}).safeParse(data);
 if(!staged.success||staged.data.id!==id)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się przygotować zapisu pliku.');
 if(staged.data.upload_state==='pending'){
  const uploaded=await db.storage.from('hvac-documents').upload(staged.data.storage_path,bytes,{contentType:mime,upsert:false});
  const finished=await db.rpc('finish_document',{p_id:id});
  if(finished.error){
   if(finished.error.code==='42501')databaseError(finished.error);
   if(uploaded.error)throw new ApiFault(503,'UPLOAD_FAILED','Przesyłanie nie zostało zakończone. Spróbuj ponownie z tym samym plikiem.');
   databaseError(finished.error);
  }
  if(finished.data!==id)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się potwierdzić zapisu pliku.');
 }
 return id;
}
