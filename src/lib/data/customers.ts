import { createClient } from '@/lib/supabase/server';

/** Reads only rows allowed by PostgreSQL RLS. No service-role bypass. */
export async function listCustomers() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthenticated');
  const { data, error } = await supabase
    .from('customers').select('id,name,type,created_at')
    .order('created_at', { ascending: false }).limit(50);
  if (error) throw new Error('Customer query failed');
  return data;
}
