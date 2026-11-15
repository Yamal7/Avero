import { ApiFault,authenticate,databaseError,endpoint,preflight,uuid } from '@/lib/api/http';
import { handoverPdfResponse } from '@/lib/handovers/download';
export const runtime='nodejs';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu do protokołu.');const result=await db.rpc('handover_pdf',{p_id:uuid.parse((await params).id),p_customer:null});databaseError(result.error);if(!result.data)throw new ApiFault(404,'NOT_FOUND','Nie znaleziono zatwierdzonego PDF.');return handoverPdfResponse(request,result.data);
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
