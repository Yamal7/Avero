import { installationTemplateDetailSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Szablony są dostępne dla biura.');const id=uuid.parse((await params).id),r=await db.rpc('installation_template_detail',{p_id:id});databaseError(r.error);return json(request,installationTemplateDetailSchema.refine(v=>v.template.id===id),r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
