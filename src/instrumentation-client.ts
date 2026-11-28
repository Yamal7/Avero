/* Sentry w przeglądarce — KRA-73 M0.7. Bez Session Replay (dane klientów). Bez DSN nic nie jest inicjalizowane. */
import * as Sentry from '@sentry/nextjs';
import { sentryDsn, sentryOptions } from '@/lib/monitoring/sentry-options';

if (sentryDsn()) Sentry.init(sentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
