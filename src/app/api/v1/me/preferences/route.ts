import { z } from 'zod';
import { authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
const prefs=z.record(z.string(),z.unknown());
/** Interface preferences of the signed-in person, kept on the account (e.g. collapsed sidebar groups). */
export function GET(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const r=await db.rpc('my_preferences');databaseError(r.error);return json(request,prefs,r.data);});}
export function PUT(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const v=z.object({key:z.string().regex(/^[a-z][a-z0-9_.-]{0,63}$/),value:z.union([z.string().max(200),z.boolean(),z.number(),z.array(z.unknown()).max(50),z.record(z.string(),z.unknown())]).refine(v=>JSON.stringify(v).length<=4000,'Za duże ustawienie.')}).strict().parse(await readBody(request)),r=await db.rpc('set_my_preference',{p_key:v.key,p_value:v.value});databaseError(r.error);return json(request,z.object({ok:z.literal(true)}),{ok:true});});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
