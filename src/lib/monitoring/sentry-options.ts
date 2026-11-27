/* Wspólne ustawienia Sentry dla serwera, edge i przeglądarki (KRA-73 M0.7).
   Bez NEXT_PUBLIC_SENTRY_DSN Sentry nie jest nawet inicjalizowane — lokalnie i w CI nic się nie zmienia. */
import { scrubBreadcrumb, scrubEvent } from './scrub';

export function sentryDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;
}

export function sentryOptions() {
  const dsn = sentryDsn();
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
    // Bez danych osobowych: IP, ciasteczka i treść żądań nie są zbierane; nagrywanie sesji wyłączone.
    sendDefaultPii: false,
    // 10% żądań do śledzenia wydajności — w darmowym limicie przy ruchu pilotażu.
    tracesSampleRate: 0.1,
    // Przekierowania i 404 z server actions to sterowanie przepływem, nie błędy.
    ignoreErrors: ['NEXT_REDIRECT', 'NEXT_NOT_FOUND', 'ResizeObserver loop'],
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  };
}
