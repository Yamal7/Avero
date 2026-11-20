import { createClient } from '@supabase/supabase-js';
import { mailConfig,workerAuthorized } from '@/lib/email/config';
import { runEmailWorker } from '@/lib/email/worker';
export const runtime='nodejs';
export const maxDuration=120;
export async function POST(request:Request){const config=mailConfig();const headers={'Cache-Control':'no-store'};if(!config)return Response.json({error:'MAIL_DISABLED'},{status:503,headers});if(!workerAuthorized(request.headers.get('Authorization'),config.workerSecret))return Response.json({error:'UNAUTHORIZED'},{status:401,headers});try{const db=createClient(config.supabaseUrl,config.serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});return Response.json(await runEmailWorker(db,config),{headers});}catch{return Response.json({error:'QUEUE_UNAVAILABLE'},{status:503,headers});}}
