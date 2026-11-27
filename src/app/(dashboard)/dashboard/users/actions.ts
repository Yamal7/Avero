'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient as createAnonymousClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth';
import { invitationSchema, roleSchema, type AccessActionResult, type CustomerOption } from '@/lib/access/types';

const uuid = z.string().uuid();
function refresh() { revalidatePath('/dashboard', 'layout'); revalidatePath('/portal', 'layout'); }
export async function changeRole(userId: string, role: string, organizationId?: string): Promise<AccessActionResult> {
  try {
    const { db } = await requireAdmin(organizationId);
    if (!uuid.safeParse(userId).success || !roleSchema.safeParse(role).success) return { error: 'Nieprawidłowa rola lub konto.' };
    const { error } = await db.rpc('set_access_role', { p_user: userId, p_role: role });
    if (error) return { error: 'Nie udało się zmienić roli. Nie można odebrać dostępu ostatniemu aktywnemu administratorowi.' };
    refresh(); return { success: 'Rola została zmieniona. Oczekujące zaproszenia tego konta zostały unieważnione.' };
  } catch { return { error: 'Zmiana wymaga uprawnień administratora.' }; }
}
export async function changeBlocked(userId: string, blocked: boolean, organizationId?: string): Promise<AccessActionResult> {
  try {
    const { db } = await requireAdmin(organizationId);
    if (!uuid.safeParse(userId).success || typeof blocked !== 'boolean') return { error: 'Nieprawidłowe konto.' };
    const { error } = await db.rpc('set_access_blocked', { p_user: userId, p_blocked: blocked });
    if (error) return { error: 'Nie udało się zmienić dostępu. Ostatni aktywny administrator musi zachować dostęp.' };
    refresh(); return { success: blocked ? 'Dostęp do programu został zablokowany.' : 'Dostęp do programu został przywrócony.' };
  } catch { return { error: 'Zmiana wymaga uprawnień administratora.' }; }
}
export async function assignCustomer(userId: string, customerId: string, kind: string, remove: boolean, organizationId?: string): Promise<AccessActionResult> {
  try {
    const { db } = await requireAdmin(organizationId);
    if (![userId, customerId].every(value => uuid.safeParse(value).success) || !['member', 'technician'].includes(kind) || typeof remove !== 'boolean') return { error: 'Nieprawidłowe przypisanie.' };
    const { error } = await db.rpc('set_customer_access', { p_user: userId, p_customer: customerId, p_kind: kind, p_remove: remove });
    if (error) return { error: 'Nie udało się zmienić przypisania. Sprawdź rolę konta i status klienta.' };
    refresh(); return { success: remove ? 'Przypisanie zostało usunięte.' : 'Klient został przypisany.' };
  } catch { return { error: 'Zmiana wymaga uprawnień administratora.' }; }
}
export async function findAccessCustomers(query: string, organizationId?: string): Promise<CustomerOption[]> {
  try {
    const { db } = await requireAdmin(organizationId);
    if (typeof query !== 'string' || query.length > 200) return [];
    const { data, error } = await db.rpc('search_customers', { search_text: query, show_archived: false }).select('id,name').limit(50);
    return error ? [] : data as CustomerOption[];
  } catch { return []; }
}
function applicationUrl() {
  const raw = process.env.APP_URL;
  if (!raw) throw new Error('Missing APP_URL');
  const url = new URL(raw);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('Invalid APP_URL');
  return url.origin;
}
async function sendInvitation(invitationId: string, organizationId?: string): Promise<AccessActionResult> {
  const { db } = await requireAdmin(organizationId);
  const origin = applicationUrl();
  const { data, error } = await db.rpc('reserve_invitation_delivery', { p_invitation: invitationId });
  if (error || !data) return { error: 'Zaproszenie wygasło, zostało cofnięte lub wysyłka była ponawiana przed upływem 60 sekund.' };
  let sent = false;
  try {
    // A separate anonymous client uses implicit email flow: no verifier from the
    // administrator's browser is required by the recipient, and no admin key is used.
    const mailClient = createAnonymousClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const response = await mailClient.auth.signInWithOtp({ email: data.email, options: { shouldCreateUser: true, emailRedirectTo: `${origin}/accept-invitation?id=${invitationId}` } });
    sent = !response.error;
  } catch { sent = false; }
  const { error: trackingError } = await db.rpc('finish_invitation_delivery', { p_invitation: invitationId, p_sent: sent });
  refresh();
  if (trackingError) return { error: 'Nie udało się potwierdzić wyniku wysyłki. Sprawdź skrzynkę odbiorcy przed ponowieniem.' };
  return sent ? { success: 'Wiadomość została przekazana do usługi pocztowej. Dostęp zostanie nadany po przyjęciu zaproszenia.' } : { error: 'Wysyłka nie powiodła się. Zaproszenie pozostaje oczekujące; sprawdź usługę pocztową i ponów wysyłkę.' };
}
export async function inviteAccount(input: unknown, organizationId?: string): Promise<AccessActionResult> {
  try {
    const { db } = await requireAdmin(organizationId);
    applicationUrl();
    const parsed = invitationSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { data, error } = await db.rpc('create_access_invitation', { p_email: parsed.data.email, p_role: parsed.data.role, p_customer: parsed.data.customerId });
    if (error) return { error: 'Nie można utworzyć zaproszenia. Sprawdź klienta, oczekujące zaproszenia oraz czy adres nie należy do pracownika lub zablokowanego konta.' };
    return await sendInvitation(String(data), organizationId);
  } catch { return { error: 'Nie udało się wysłać zaproszenia. Sprawdź uprawnienia administratora, APP_URL i konfigurację Supabase.' }; }
}
export async function retryInvitation(id: string, organizationId?: string): Promise<AccessActionResult> {
  try {
    if (!uuid.safeParse(id).success) return { error: 'Nieprawidłowe zaproszenie.' };
    return await sendInvitation(id, organizationId);
  } catch { return { error: 'Sprawdź uprawnienia administratora oraz konfigurację wysyłki.' }; }
}
export async function revokeInvitation(id: string, organizationId?: string): Promise<AccessActionResult> {
  try {
    const { db } = await requireAdmin(organizationId);
    if (!uuid.safeParse(id).success) return { error: 'Nieprawidłowe zaproszenie.' };
    const { error } = await db.rpc('revoke_access_invitation', { p_invitation: id });
    if (error) return { error: 'Nie udało się unieważnić zaproszenia.' };
    refresh(); return { success: 'Zaproszenie zostało unieważnione.' };
  } catch { return { error: 'Zmiana wymaga uprawnień administratora.' }; }
}
