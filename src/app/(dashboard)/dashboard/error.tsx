'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="card"><h1>Nie udało się wczytać danych</h1><p>Sprawdź konfigurację Supabase, wykonanie migracji i uprawnienia konta.</p><button onClick={reset}>Spróbuj ponownie</button></main>;
}
