'use client';
export default function PortalError({reset}:{reset:()=>void}) {
 return <section className="portal-card portal-empty"><h1>Nie udało się wczytać danych</h1><p>Sprawdź połączenie i spróbuj ponownie. Jeśli dostęp się zmienił, zaloguj się ponownie.</p><button onClick={reset}>Spróbuj ponownie</button></section>;
}
