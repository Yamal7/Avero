import { capabilitiesSchema } from '@hvac/api-client';
import { endpoint,json,preflight } from '@/lib/api/http';
export const dynamic='force-dynamic';
export function GET(request:Request){return endpoint(request,async()=>json(request,capabilitiesSchema,{apiVersion:'1',authentication:['bearer','same-origin-cookie'],connection:'online',clients:{web:'available',desktop:'planned',mobile:'planned'},targets:['browser','windows','macos','android','ios']}));}
export function OPTIONS(request:Request){return preflight(request,['GET']);}
