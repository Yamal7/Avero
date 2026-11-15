import { login } from './actions';
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth card"><p className="eyebrow">Panel firmy</p><h1>Zaloguj się</h1><p>Dostęp do klientów i instalacji Twojej firmy.</p><form action={login}>
    <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
    <label>Hasło<input name="password" type="password" required autoComplete="current-password" /></label>
    {error && <p className="error" role="alert">Logowanie nie powiodło się. Sprawdź dane i spróbuj ponownie.</p>}
    <button type="submit">Zaloguj</button>
  </form></main>;
}
