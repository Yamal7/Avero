import { stockMovesSchema } from '@hvac/api-client';
import { authenticate,databaseError,endpoint,json,preflight,uuid } from '@/lib/api/http';
export function GET(request:Request,{params}:{params:Promise<{id:string}>}){return endpoint(request,async()=>{const {db}=await authenticate(request);const r=await db.rpc('stock_item_moves',{p_item:uuid.parse((await params).id)});databaseError(r.error);return json(request,stockMovesSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
