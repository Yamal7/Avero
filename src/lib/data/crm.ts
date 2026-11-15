import { requireSession } from '@/lib/auth';

export type Device = { id: string; manufacturer: string; model: string | null; serial_number: string | null; warranty_until: string | null };
export type Installation = { id: string; type: string; installed_on: string | null; status: string; devices: Device[] };
export type Location = { id: string; address: string; city: string; postal_code: string | null; installations: Installation[] };
export type Customer = { id: string; name: string; type: string; email: string | null; phone: string | null; archived_at: string | null; locations: Location[] };

export async function getCustomer(id: string) {
  const { db } = await requireSession();
  const { data, error } = await db.from('customers')
    .select('id,name,type,email,phone,archived_at,locations(id,address,city,postal_code,installations(id,type,installed_on,status,devices(id,manufacturer,model,serial_number,warranty_until)))')
    .eq('id', id).single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw new Error('Nie udało się pobrać klienta.');
  return data as Customer;
}
