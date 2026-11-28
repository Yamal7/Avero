'use client';
/* Błąd w głównym layoucie — zgłoszenie do Sentry (KRA-73 M0.7). Zastępuje cały dokument, więc ładuje style samodzielnie. */
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { themeBootstrapScript } from '@/lib/theme';
import './tailwind.css';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <html lang="pl" data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} /></head>
      <body className="bg-surface font-sans text-primary">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-title font-semibold">Coś poszło nie tak</h1>
          <p className="text-body text-secondary">Spróbuj ponownie. Jeśli problem się powtarza, odśwież stronę i podaj kod błędu.</p>
          {error.digest ? <p className="font-mono text-small text-secondary">Kod błędu: {error.digest}</p> : null}
          <button type="button" className={buttonClasses({ variant: 'pri' })} onClick={reset}>Spróbuj ponownie</button>
        </main>
      </body>
    </html>
  );
}
