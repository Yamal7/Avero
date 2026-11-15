'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { roleLabels, type AccessRole } from '@/lib/access/types';
import { acceptInvitation } from '@/app/accept-invitation/actions';
type Details = { email: string; role: AccessRole; status: string; expired: boolean; customer_name: string | null; needs_password: boolean };
export function AcceptInvitation({ id }: { id: string }) {
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error('Nieprawidłowy link zaproszenia.');
        const db = createClient();
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const access = fragment.get('access_token'), refresh = fragment.get('refresh_token');
        if (fragment.has('error')) throw new Error('Link logowania wygasł. Poproś administratora o ponowną wysyłkę.');
        if (access && refresh) {
          const { error } = await db.auth.setSession({ access_token: access, refresh_token: refresh });
          if (error) throw new Error('Link logowania jest nieprawidłowy lub wygasł.');
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        const { data: { user }, error: authError } = await db.auth.getUser();
        if (authError || !user) throw new Error('Otwórz pełny link z wiadomości e-mail. Jeśli masz już konto, możesz się zalogować, a następnie ponownie otworzyć zaproszenie.');
        const { data, error: invitationError } = await db.rpc('read_my_invitation', { p_invitation: id });
        if (invitationError || !data) throw new Error('Zaproszenie nie dotyczy zalogowanego konta lub dostęp jest zablokowany.');
        if (active) setDetails(data as Details);
      } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Nie udało się odczytać zaproszenia.'); }
      finally { if (active) setLoading(false); }
    }
    initialize();
    return () => { active = false; };
  }, [id]);
  async function submit(form: React.FormEvent<HTMLFormElement>) {
    form.preventDefault(); setBusy(true); setError('');
    try {
      const values = new FormData(form.currentTarget);
      const password = String(values.get('password') || '');
      if (password && (password.length < 12 || password !== values.get('confirm'))) throw new Error('Hasło musi mieć co najmniej 12 znaków, a oba pola muszą być zgodne.');
      if (password) {
        const { error } = await createClient().auth.updateUser({ password });
        if (error) throw new Error('Nie udało się ustawić hasła. Sprawdź wymagania hasła lub ponów logowanie z linku.');
      }
      const result = await acceptInvitation(id);
      if (result.error) throw new Error(result.error);
      router.replace('/start'); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się przyjąć zaproszenia.'); }
    finally { setBusy(false); }
  }
  if (loading) return <p role="status">Sprawdzanie zaproszenia…</p>;
  return <>{error && <p className="error" role="alert">{error}</p>}{details && (details.status === 'accepted' ? <><p>To zaproszenie zostało już przyjęte.</p><Link className="button" href="/start">Przejdź do programu</Link></> : details.expired || details.status !== 'pending' ? <p>Zaproszenie wygasło lub zostało unieważnione. Poproś administratora o nowe zaproszenie.</p> : <form onSubmit={submit}><p><strong>{details.email}</strong><br />Rola: {roleLabels[details.role]}{details.customer_name && <><br />Klient: {details.customer_name}</>}</p><p className="muted">Ustaw hasło do kolejnego logowania. Jeśli masz już hasło, możesz pozostawić pola puste.</p><label>Nowe hasło<input name="password" type="password" required={details.needs_password} minLength={12} maxLength={128} autoComplete="new-password" disabled={busy} /></label><label>Powtórz hasło<input name="confirm" type="password" required={details.needs_password} maxLength={128} autoComplete="new-password" disabled={busy} /></label><label className="checkbox"><input required type="checkbox" disabled={busy} />Chcę przyjąć zaproszenie i uzyskać wskazany dostęp.</label><button disabled={busy}>{busy ? 'Przyjmowanie…' : 'Przyjmij zaproszenie'}</button></form>)}<p><Link href="/login">Przejdź do logowania</Link></p></>;
}
