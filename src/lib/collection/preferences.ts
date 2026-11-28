/* Zapis preferencji konta z przeglądarki (PUT /api/v1/me/preferences → RPC set_my_preference).
   Preferencje są na koncie, nie w firmie (tabela user_preferences bez org_id) — zwykły fetch, jak w app-shell.tsx;
   zapisy danych firmy idą przez useOrganizationFetch() (tests/organization-fetch.test.ts). */
export async function savePreference(key: string, value: unknown) {
  try {
    const r = await fetch('/api/v1/me/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    return r.ok;
  } catch { return false; }
}
