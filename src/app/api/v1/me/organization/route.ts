import { z } from 'zod';
import { organizationsSchema,setActiveOrganizationSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
/** M0.1: firmy zalogowanej osoby (GET) i przełączenie aktywnej firmy (PUT { orgId }). Uprawnienie sprawdza RPC set_active_org. */
export function GET(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const r=await db.rpc('my_organizations');databaseError(r.error);return json(request,organizationsSchema,r.data);});}
export function PUT(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const input=setActiveOrganizationSchema.parse(await readBody(request,1024));const r=await db.rpc('set_active_org',{p_org:input.orgId});databaseError(r.error);return json(request,organizationsSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
