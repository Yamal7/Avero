import { correctionHistorySchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office','client'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu.');const r=await db.rpc('portal_corrections',{p_id:uuid.parse((await params).id),p_customer:uuid.parse(new URL(request.url).searchParams.get('customer'))});databaseError(r.error);return json(request,correctionHistorySchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
