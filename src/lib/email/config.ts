import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { validateApiOrigin } from '@hvac/api-client';
export type MailConfig={mode:'local'|'resend';from:string;appUrl:string;allowed:string[];serviceKey:string;supabaseUrl:string;workerSecret:string;apiKey?:string};
export function mailConfig(env:Record<string,string|undefined>=process.env, workerSecret=env.NOTIFICATION_WORKER_SECRET || env.CRON_SECRET):MailConfig|null{try{
 if(!['local','resend'].includes(env.NOTIFICATION_MAIL_MODE||''))return null;const mode=env.NOTIFICATION_MAIL_MODE as 'local'|'resend',from=z.string().email().max(200).parse(env.NOTIFICATION_MAIL_FROM),appUrl=validateApiOrigin(env.APP_URL||'',mode==='local'),allowed=(env.NOTIFICATION_MAIL_RECIPIENTS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);if(!allowed.length||allowed.length>100||allowed.some(v=>!z.string().email().safeParse(v).success)||!env.SUPABASE_SERVICE_ROLE_KEY||!workerSecret||workerSecret.length<32)return null;
 if(mode==='local'&&!['localhost','127.0.0.1','[::1]'].includes(new URL(appUrl).hostname))return null;
 if(mode==='resend'&&(!env.RESEND_API_KEY||new URL(appUrl).protocol!=='https:'))return null;
 const supabaseUrl=new URL(env.NEXT_PUBLIC_SUPABASE_URL||'');if(!['https:','http:'].includes(supabaseUrl.protocol)||supabaseUrl.username||supabaseUrl.password||supabaseUrl.protocol==='http:'&&!['localhost','127.0.0.1','[::1]'].includes(supabaseUrl.hostname))return null;
 return {mode,from,appUrl,allowed,serviceKey:env.SUPABASE_SERVICE_ROLE_KEY,supabaseUrl:supabaseUrl.origin,workerSecret,apiKey:env.RESEND_API_KEY};
 }catch{return null;}}
export function workerAuthorized(header:string|null,secret:string){if(!header?.startsWith('Bearer '))return false;const given=Buffer.from(header.slice(7)),expected=Buffer.from(secret);return given.length===expected.length&&timingSafeEqual(given,expected);}
