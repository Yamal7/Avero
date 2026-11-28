/* Preferencje kont dla list (M0.4): komponent serwerowy czyta je razem z danymi, żeby tabela od razu miała
   wybrane kolumny i zwinięte grupy (bez mignięcia po wczytaniu w przeglądarce). Błąd = ustawienia domyślne. */
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

export async function loadPreferences(db: Pick<SupabaseClient, 'rpc'>): Promise<Record<string, unknown>> {
  const r = await db.rpc('my_preferences');
  if (r.error) return {};
  const p = z.record(z.string(), z.unknown()).safeParse(r.data);
  return p.success ? p.data : {};
}
