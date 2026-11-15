// Run with Node --env-file=.env.local. This process never logs credentials or addresses.
const target=process.env.APP_URL,secret=process.env.NOTIFICATION_WORKER_SECRET;
if(!target||!secret||secret.length<32){console.error('Configure APP_URL and NOTIFICATION_WORKER_SECRET first.');process.exit(1);}
const parsed=new URL(target);if(parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash||!(parsed.protocol==='https:'||parsed.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(parsed.hostname))){throw new Error('Invalid worker URL');}
let running=false,stop=false;
async function tick(){if(running||stop)return;running=true;try{const response=await fetch(parsed.origin+'/api/internal/email/dispatch',{method:'POST',headers:{Authorization:'Bearer '+secret},redirect:'error',signal:AbortSignal.timeout(110000)});console.log(new Date().toISOString(),response.ok?'Email queue cycle completed.':'Email queue cycle unavailable: '+response.status);return response.ok;}catch{console.error('Email queue cycle failed.');return false;}finally{running=false;}}
process.on('SIGTERM',()=>{stop=true;clearInterval(timer);});process.on('SIGINT',()=>{stop=true;clearInterval(timer);});
const timer=setInterval(()=>void tick(),60000);const ok=await tick();if(process.argv.includes('--once')){clearInterval(timer);process.exitCode=ok?0:1;}
