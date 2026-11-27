'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { organizationChangedMessage } from '@/lib/organizations/scope';
import { crmSchemas, entitySchema, formValues, uuid, type FormState } from '@/lib/validation/crm';

export async function saveRecord(_: FormState, form: FormData): Promise<FormState> {
  const entity = entitySchema.safeParse(form.get('_entity'));
  if (!entity.success) return { error: 'Nieprawidłowy formularz.' };
  const id = form.get('_id');
  if (id && !uuid.safeParse(id).success) return { error: 'Nieprawidłowy identyfikator.' };
  const parsed = crmSchemas[entity.data].safeParse(formValues(form));
  if (!parsed.success) return { error: 'Sprawdź pola formularza: ' + parsed.error.issues.map(i => i.path.join('.')).join(', ') };
  const customerId = form.get('_customer');
  if (entity.data !== 'customers' && !uuid.safeParse(customerId).success) return { error: 'Nieprawidłowy klient.' };

  let destination = `/dashboard/customers/${customerId}`;
  const organization = uuid.safeParse(form.get('_organization'));
  if (!organization.success) return { error: organizationChangedMessage };
  try {
    const { db } = await requireStaff(organization.data);
    // Verify the whole ownership chain, including hidden form identifiers.
    const rootId = entity.data === 'customers' ? id : customerId;
    if (rootId) {
      const { data, error } = await db.from('customers').select('id').eq('id', rootId).is('archived_at', null).single();
      if (error || !data) return { error: 'Klient nie istnieje lub został zarchiwizowany.' };
    }
    const payload: Record<string, unknown> = { ...parsed.data };
    let parentKey: string | undefined;
    let parentId: string | undefined;
    if (entity.data === 'locations') { parentKey = 'customer_id'; parentId = String(customerId); }
    if (entity.data === 'installations' || entity.data === 'devices') {
      const parent = uuid.safeParse(form.get('_parent'));
      if (!parent.success) return { error: 'Nieprawidłowe powiązanie.' };
      if (entity.data === 'installations') {
        const { data, error } = await db.from('locations').select('id').eq('id', parent.data).eq('customer_id', String(customerId)).single();
        if (error || !data) return { error: 'Lokalizacja nie należy do klienta.' };
        parentKey = 'location_id';
      } else {
        const { data, error } = await db.rpc('customer_for_installation', { p_installation: parent.data });
        if (error || data !== customerId) return { error: 'Instalacja nie należy do klienta.' };
        parentKey = 'installation_id';
      }
      parentId = parent.data;
    }
    if (parentKey) payload[parentKey] = parentId;
    let query;
    if (id) {
      query = db.from(entity.data).update(payload).eq('id', String(id));
      if (parentKey) query = query.eq(parentKey, parentId!);
    } else query = db.from(entity.data).insert(payload);
    const { data, error } = await query.select('id').single();
    if (error?.code === 'PT409') return { error: organizationChangedMessage };
    if (error || !data) return { error: 'Nie udało się zapisać danych. Odśwież stronę i spróbuj ponownie.' };
    if (entity.data === 'customers') destination = `/dashboard/customers/${data.id}`;
  } catch (error) {
    return { error: error instanceof Error && error.message === organizationChangedMessage
      ? organizationChangedMessage : 'Nie udało się zapisać. Sprawdź sesję i uprawnienia pracownika.' };
  }
  revalidatePath('/dashboard', 'layout');
  if (!id) redirect(destination);
  return { success: 'Zmiany zapisane.' };
}

export async function archiveCustomer(_: FormState, form: FormData): Promise<FormState> {
  const id = uuid.safeParse(form.get('_id'));
  if (!id.success) return { error: 'Nieprawidłowy klient.' };
  const organization = uuid.safeParse(form.get('_organization'));
  if (!organization.success) return { error: organizationChangedMessage };
  try {
    const { db } = await requireStaff(organization.data);
    const { error, data } = await db.from('customers').update({ archived_at: new Date().toISOString() }).eq('id', id.data).is('archived_at', null).select('id').single();
    if (error?.code === 'PT409') return { error: organizationChangedMessage };
    if (error || !data) return { error: 'Nie udało się zarchiwizować klienta.' };
  } catch (error) {
    return { error: error instanceof Error && error.message === organizationChangedMessage
      ? organizationChangedMessage : 'Brak dostępu do archiwizacji.' };
  }
  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard/customers');
}

export async function logout() {
  const db = await createClient();
  await db.auth.signOut();
  redirect('/login');
}
