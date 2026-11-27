import { createClient } from '@supabase/supabase-js';
import { mailConfig, workerAuthorized } from '@/lib/email/config';
import { runEmailWorker } from '@/lib/email/worker';

export async function dispatchEmail(request: Request, secret: string) {
  const headers = { 'Cache-Control': 'no-store' };
  const reply = (body: unknown, status: number) => Response.json(body, { status, headers });
  const config = mailConfig(process.env, secret);
  if (!config) return reply({ error: 'MAIL_DISABLED' }, 503);
  if (!workerAuthorized(request.headers.get('Authorization'), config.workerSecret)) {
    return reply({ error: 'UNAUTHORIZED' }, 401);
  }

  try {
    const db = createClient(config.supabaseUrl, config.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return reply(await runEmailWorker(db, config), 200);
  } catch {
    return reply({ error: 'QUEUE_UNAVAILABLE' }, 503);
  }
}
