import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { organizationHeader } from '@/lib/organizations/scope';

export async function createClient(expectedOrganization?: string) {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: expectedOrganization === undefined ? undefined : {
        headers: { [organizationHeader]: z.string().uuid().parse(expectedOrganization) },
      },
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(items: { name: string; value: string; options: CookieOptions }[]) {
          try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* Server Component: middleware handles session refresh. */ }
        },
      },
    },
  );
}
