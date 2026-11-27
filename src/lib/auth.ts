import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { organizationChangedMessage } from '@/lib/organizations/scope';

export async function requireSession(expectedOrganization?: string) {
  const db = await (expectedOrganization === undefined ? createClient() : createClient(expectedOrganization));
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect('/login');
  const { data: access, error: accessError } = await db.rpc('current_access');
  if (accessError?.code === 'PT409') throw new Error(organizationChangedMessage);
  if (accessError || !access || !['admin','office','technician','client','none'].includes(access.role) || typeof access.blocked !== 'boolean') throw new Error('Nie udało się sprawdzić dostępu.');
  if (access?.blocked) redirect('/access-blocked');
  if (access?.role === 'none') redirect('/no-access');
  return { db, user, access: access as { role: string; blocked: boolean } };
}

export async function requireStaff(expectedOrganization?: string) {
  const session = await requireSession(expectedOrganization);
  const { data, error } = await session.db.rpc('can_manage_crm');
  if (error || data !== true) throw new Error('Dostęp wymaga uprawnień pracownika.');
  return session;
}

export async function requireAdmin(expectedOrganization?: string) {
  const session = await requireSession(expectedOrganization);
  const { data, error } = await session.db.rpc('is_admin');
  if (error || data !== true) throw new Error('Dostęp wymaga uprawnień administratora.');
  return session;
}
