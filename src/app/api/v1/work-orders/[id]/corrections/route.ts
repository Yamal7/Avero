import { correctionContextSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu.');const r=await db.rpc('correction_context',{p_id:uuid.parse((await params).id)});databaseError(r.error);return json(request,correctionContextSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
