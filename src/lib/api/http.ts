import { z } from 'zod';
import { createClient as bearerClient } from '@supabase/supabase-js';
import { createClient as cookieClient } from '@/lib/supabase/server';
import { roleSchema,validateApiOrigin } from '@hvac/api-client';
import { organizationHeader, organizationChangedMessage } from '@/lib/organizations/scope';

export class ApiFault extends Error {
 constructor(public status:number,public code:string,message:string){super(message);}
}
function fail(status:number,code:string,message:string):never{throw new ApiFault(status,code,message);}
function policy(request:Request){
 const canonical=process.env.APP_URL;
 if(!canonical)fail(503,'CONFIGURATION','Usługa jest obecnie niedostępna.');
 let own:string;
 try{own=validateApiOrigin(canonical,true);}catch{fail(503,'CONFIGURATION','Usługa jest obecnie niedostępna.');}
 const origin=request.headers.get('Origin');
 const allowed=(process.env.NATIVE_ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);
 if(origin&&(origin==='null'||(origin!==own&&!allowed.includes(origin))))fail(403,'ORIGIN_DENIED','Niedozwolone źródło żądania.');
 return {origin,own};
}
export function responseHeaders(request:Request){
 const {origin}=policy(request);
 const headers=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'});
 if(origin){headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Expose-Headers','Content-Disposition, Content-Type');}
 return headers;
}
export function preflight(request:Request,methods:string[]){
 return endpoint(request,async()=>{
  const requested=request.headers.get('Access-Control-Request-Method');
  if(!requested||!methods.includes(requested))fail(405,'METHOD_NOT_ALLOWED','Niedozwolona metoda.');
  const requestedHeaders=(request.headers.get('Access-Control-Request-Headers')||'').toLowerCase().split(',').map(v=>v.trim()).filter(Boolean);
  if(requestedHeaders.some(v=>!['authorization','content-type','x-hvac-client',organizationHeader].includes(v)))fail(403,'HEADERS_DENIED','Niedozwolone nagłówki.');
  const headers=responseHeaders(request);
  headers.set('Access-Control-Allow-Methods',methods.join(', '));headers.set('Access-Control-Allow-Headers',`Authorization, Content-Type, X-HVAC-Client, ${organizationHeader}`);
  return new Response(null,{status:204,headers});
 });
}
export async function endpoint(request:Request,run:()=>Promise<Response>){
 try{policy(request);return await run();}
 catch(error){
  const fault=error instanceof ApiFault?error:error instanceof z.ZodError?new ApiFault(400,'INVALID_INPUT','Sprawdź przesłane dane.'):new ApiFault(500,'INTERNAL_ERROR','Nie udało się wykonać żądania.');
  let headers:Headers;try{headers=responseHeaders(request);}catch{headers=new Headers({'Cache-Control':'private, no-store','Vary':'Origin'});}
  return Response.json({error:{code:fault.code,message:fault.message}},{status:fault.status,headers});
 }
}
export function json<T>(request:Request,schema:z.ZodType<T>,value:unknown,status=200){
 const parsed=schema.safeParse(value);if(!parsed.success)fail(502,'INVALID_RESPONSE','Nie udało się odczytać odpowiedzi serwera.');
 return Response.json(parsed.data,{status,headers:responseHeaders(request)});
}
export async function authenticate(request:Request){
 const {origin,own}=policy(request),authorization=request.headers.get('Authorization');
 const organization=request.headers.get(organizationHeader);
 const expectedOrganization=organization===null?undefined:uuid.parse(organization);
 let db:Awaited<ReturnType<typeof cookieClient>>;
 let token:string|undefined;
 if(authorization!==null){
  const match=/^Bearer ([^\s]+)$/i.exec(authorization);
  if(!match||match[1].length>16384)fail(401,'AUTH_REQUIRED','Zaloguj się ponownie.');
  token=match[1];
  db=bearerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:`Bearer ${token}`,...(expectedOrganization ? {[organizationHeader]:expectedOrganization} : {})}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 }else{
  if(origin&&origin!==own)fail(401,'BEARER_REQUIRED','Aplikacja wymaga zalogowania.');
  if(!['GET','HEAD','OPTIONS'].includes(request.method)&&origin!==own)fail(403,'ORIGIN_REQUIRED','Nie udało się potwierdzić źródła żądania.');
  db=await (expectedOrganization ? cookieClient(expectedOrganization) : cookieClient());
 }
 const {data,error}=await db.auth.getUser(token);
 if(error||!data.user)fail(401,'AUTH_REQUIRED','Zaloguj się ponownie.');
 const access=await db.rpc('current_access');
 if(access.error?.code==='PT409')databaseError(access.error);
 if(access.error)fail(503,'ACCESS_UNAVAILABLE','Nie udało się sprawdzić uprawnień.');
 const parsed=z.object({role:roleSchema,blocked:z.boolean()}).safeParse(access.data);
 if(!parsed.success||parsed.data.blocked)fail(403,'ACCESS_DENIED','Brak dostępu do aplikacji.');
 return {db,user:data.user,role:parsed.data.role};
}
export function databaseError(error:{code?:string}|null){
 if(!error)return;
 if(error.code==='PT409')fail(409,'ORGANIZATION_CHANGED',organizationChangedMessage);
 if(error.code==='42501')fail(403,'ACCESS_DENIED','Brak dostępu do tych danych.');
 if(['22023','22P02'].includes(error.code||''))fail(400,'INVALID_INPUT','Sprawdź przesłane dane.');
 if(['23505','23P01','40001','P0001'].includes(error.code||''))fail(409,'CONFLICT','Nie można wykonać operacji. Odśwież dane i spróbuj ponownie.');
 fail(503,'DATA_UNAVAILABLE','Dane są obecnie niedostępne.');
}
export async function readBody(request:Request,maxBytes=65536){
 if(request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')fail(415,'JSON_REQUIRED','Wymagany format JSON.');
 const reader=request.body?.getReader();if(!reader)fail(400,'INVALID_INPUT','Brak danych.');
 const parts:Uint8Array[]=[];let length=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>maxBytes){await reader.cancel();fail(413,'BODY_TOO_LARGE','Przesłano zbyt dużo danych.');}parts.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)) as unknown;}catch{fail(400,'INVALID_JSON','Nieprawidłowy format JSON.');}
}
export const uuid=z.string().uuid();
