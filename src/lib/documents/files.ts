import { MAX_DOCUMENT_BYTES,documentMimeSchema } from '@hvac/api-client';
import { ApiFault } from '@/lib/api/http';

export function validateFileBytes(bytes:Uint8Array,mime:string){
 if(!bytes.length||bytes.length>MAX_DOCUMENT_BYTES)throw new ApiFault(400,'INVALID_FILE','Wybierz niepusty plik do 10 MB.');
 documentMimeSchema.parse(mime);
 const matches=mime==='application/pdf'?bytes.length>=5&&String.fromCharCode(...bytes.subarray(0,5))==='%PDF-':mime==='image/png'?[137,80,78,71,13,10,26,10].every((byte,index)=>bytes[index]===byte):bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(!matches)throw new ApiFault(400,'INVALID_FILE','Zawartość pliku nie odpowiada wybranemu formatowi PDF, JPG lub PNG.');
}
export async function readMultipart(request:Request){
 if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('multipart/form-data;'))throw new ApiFault(415,'MULTIPART_REQUIRED','Wybierz plik do przesłania.');
 const limit=MAX_DOCUMENT_BYTES+65536,reader=request.body?.getReader();if(!reader)throw new ApiFault(400,'INVALID_FILE','Brak pliku.');
 const chunks:Uint8Array[]=[];let length=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw new ApiFault(413,'BODY_TOO_LARGE','Plik jest za duży. Maksymalny rozmiar to 10 MB.');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return await new Response(bytes,{headers:{'Content-Type':request.headers.get('Content-Type')!}}).formData();}catch{throw new ApiFault(400,'INVALID_FILE','Nie udało się odczytać pliku.');}
}
