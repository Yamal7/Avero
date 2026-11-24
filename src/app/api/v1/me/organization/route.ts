import { z } from 'zod';
import { organizationsSchema,setActiveOrganizationSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
/** M0.1: firmy zalogowanej osoby (GET) i przełączenie aktywnej firmy (PUT { orgId }). Uprawnienie sprawdza RPC set_active_org. */
export function GET(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const r=await db.rpc('my_organizations');databaseError(r.error);return json(request,organizationsSchema,r.data);});}
export function PUT(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const input=setActiveOrganizationSchema.parse(await readBody(request,1024));
 // Rama pracownika przełącza tylko firmy, w których osoba jest pracownikiem; firmy portalu (rola client) obsługuje portal.
 const mine=await db.rpc('my_organizations');databaseError(mine.error);const target=organizationsSchema.parse(mine.data).find(o=>o.id===input.orgId);
 if(!target||target.role==='client')throw new ApiFault(403,'ACCESS_DENIED','Tej firmy nie można wybrać w panelu pracownika.');
 const r=await db.rpc('set_active_org',{p_org:input.orgId});databaseError(r.error);return json(request,organizationsSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
