import Link from 'next/link';
export default function Home() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return <main className="auth card"><p className="eyebrow">HVAC CRM</p><h1>Twoje instalacje pod kontrolą.</h1><p>Baza klientów, lokalizacje i urządzenia w jednym panelu.</p>{configured ? <Link className="button" href="/start">Otwórz panel</Link> : <><h2>Konfiguracja środowiska</h2><p>Utwórz plik <code>.env.local</code> na podstawie <code>.env.example</code> i uzupełnij dane Supabase. Następnie wykonaj migracje i uruchom aplikację ponownie.</p><p>Instrukcja znajduje się w README projektu.</p></>}</main>;
}
