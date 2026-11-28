import { dispatchEmail } from '@/lib/email/dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export function GET(request: Request) {
  return dispatchEmail(request, process.env.CRON_SECRET ?? '');
}
