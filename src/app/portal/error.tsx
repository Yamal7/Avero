'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
export default function PortalError({error,reset}:{error:Error&{digest?:string};reset:()=>void}) {
 useEffect(()=>{ Sentry.captureException(error); },[error]);
 return <section className="portal-card portal-empty"><h1>Nie udało się wczytać danych</h1><p>Sprawdź połączenie i spróbuj ponownie. Jeśli dostęp się zmienił, zaloguj się ponownie.</p><button onClick={reset}>Spróbuj ponownie</button></section>;
}
