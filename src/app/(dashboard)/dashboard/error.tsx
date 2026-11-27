'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <main className="card"><h1>Nie udało się wczytać danych</h1><p>Sprawdź konfigurację Supabase, wykonanie migracji i uprawnienia konta.</p><button onClick={reset}>Spróbuj ponownie</button></main>;
}
