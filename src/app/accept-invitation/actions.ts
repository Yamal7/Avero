'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { AccessActionResult } from '@/lib/access/types';
export async function acceptInvitation(id: string): Promise<AccessActionResult> {
  try {
    if (!z.string().uuid().safeParse(id).success) return { error: 'Nieprawidłowy link zaproszenia.' };
    const db = await createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { error: 'Potwierdź adres e-mail przez link z wiadomości.' };
    const { error } = await db.rpc('accept_access_invitation', { p_invitation: id });
    if (error) return { error: 'Zaproszenie wygasło, zostało cofnięte lub dotyczy innego adresu e-mail. Poproś administratora o sprawdzenie dostępu.' };
    revalidatePath('/dashboard', 'layout'); return { success: 'Zaproszenie przyjęte.' };
  } catch { return { error: 'Nie udało się przyjąć zaproszenia. Spróbuj ponownie.' }; }
}
