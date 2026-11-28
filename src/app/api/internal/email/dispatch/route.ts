import { dispatchEmail } from '@/lib/email/dispatch';

export const runtime = 'nodejs';
export const maxDuration = 120;

export function POST(request: Request) {
  return dispatchEmail(request, process.env.NOTIFICATION_WORKER_SECRET ?? '');
}
