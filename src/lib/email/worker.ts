import { z } from 'zod';
import type { MailConfig } from './config';
import { emailPayload,emailPayloadSchema,sendNotificationEmail,checkEmailDelivery } from './transport';
type Database={rpc:(name:string,args?:Record<string,unknown>)=>PromiseLike<{data:unknown;error:unknown}>};
const jobSchema=z.object({id:z.string().uuid(),lease:z.string().uuid(),recipient:z.string().email(),sender:z.string().email(),appUrl:z.string(),category:z.enum(['tasks','service','maintenance']),payload:emailPayloadSchema.nullable()}).strict();
export async function runEmailWorker(db:Database,config:MailConfig,fetcher:typeof fetch=fetch,delay:(ms:number)=>Promise<void>=ms=>new Promise(resolve=>setTimeout(resolve,ms))){
 async function rpc(name:string,args?:Record<string,unknown>){const r=await db.rpc(name,args);if(r.error)throw new Error('Mail queue unavailable');return r.data;}
 const enqueued=z.number().int().nonnegative().parse(await rpc('prepare_notification_emails',{p_allowed:config.allowed}));let processed=0,checked=0;
 for(let n=0;n<5;n++){const raw=await rpc('claim_notification_email',{p_transport:config.mode,p_sender:config.from,p_app_url:config.appUrl,p_allowed:config.allowed});if(!raw)break;const job=jobSchema.parse(raw),payload=await rpc('bind_notification_email',{p_id:job.id,p_lease:job.lease,p_payload:job.payload??emailPayload(job)});if(!payload)continue;const result=await sendNotificationEmail(config,job.id,emailPayloadSchema.parse(payload),fetcher);await rpc('finish_notification_email',{p_id:job.id,p_lease:job.lease,p_outcome:result.outcome,p_provider:result.provider,p_reason:result.reason});processed++;if(config.mode==='resend')await delay(600);}
 if(config.mode==='resend'){const jobs=z.array(z.object({id:z.string().uuid(),providerId:z.string(),recipient:z.string().email()}).strict()).max(5).parse(await rpc('notification_email_checks'));for(const job of jobs){const state=await checkEmailDelivery(config,job.providerId,job.recipient,fetcher);await rpc('finish_notification_email_check',{p_id:job.id,p_state:state});checked++;await delay(600);}}
 return {enqueued,processed,checked};
}
