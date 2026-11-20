import { ApiFault,authenticate,databaseError,endpoint,preflight } from '@/lib/api/http';
import { correctionParams } from '@/lib/handovers/correction-params';
import { handoverPdfResponse } from '@/lib/handovers/download';
export function GET(request:Request,{params}:{params:Promise<{id:string;round:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu.');const r=await db.rpc('correction_pdf',{...correctionParams(await params),p_customer:null});databaseError(r.error);if(!r.data)throw new ApiFault(404,'NOT_FOUND','Brak opublikowanego PDF.');return handoverPdfResponse(request,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
