import { sessionSchema } from '@hvac/api-client';
import { authenticate,endpoint,json,preflight } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{
 const {user,role}=await authenticate(request);
 return json(request,sessionSchema,{apiVersion:'1',user:{id:user.id,email:user.email||null,role},permissions:{manageCrm:role==='admin'||role==='office',manageAccess:role==='admin'}});
});}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
