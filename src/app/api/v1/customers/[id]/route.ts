import { customerWorkspaceSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do profilu CRM.');const r=await db.rpc('customer_workspace',{p_customer:uuid.parse((await params).id)});databaseError(r.error);return json(request,customerWorkspaceSchema.refine(v=>v.canManage===['admin','office'].includes(role)),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
