/* Sentry na serwerze Node i w middleware (edge) — KRA-73 M0.7. Bez DSN nic nie jest inicjalizowane. */
import * as Sentry from '@sentry/nextjs';
import { sentryDsn, sentryOptions } from '@/lib/monitoring/sentry-options';

export function register() {
  if (!sentryDsn()) return;
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sentryOptions());
  }
}

// Błędy z server components, server actions i route handlers (bez init — no-op).
export const onRequestError = Sentry.captureRequestError;
