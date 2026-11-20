import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireSession() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect('/login');
  const { data: access, error: accessError } = await db.rpc('current_access');
  if (accessError || !access || !['admin','office','technician','client','none'].includes(access.role) || typeof access.blocked !== 'boolean') throw new Error('Nie udało się sprawdzić dostępu.');
  if (access?.blocked) redirect('/access-blocked');
  if (access?.role === 'none') redirect('/no-access');
  return { db, user, access: access as { role: string; blocked: boolean } };
}

export async function requireStaff() {
  const session = await requireSession();
  const { data, error } = await session.db.rpc('can_manage_crm');
  if (error || data !== true) throw new Error('Dostęp wymaga uprawnień pracownika.');
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const { data, error } = await session.db.rpc('is_admin');
  if (error || data !== true) throw new Error('Dostęp wymaga uprawnień administratora.');
  return session;
}
