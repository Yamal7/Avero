import { z } from 'zod';
import { authenticate, databaseError, endpoint, json, preflight } from '@/lib/api/http';

// Global search for the command palette (⌘K). Every query runs through the caller's RLS,
// so results are limited to records the signed-in account can already open.
const hitSchema = z.object({ kind: z.enum(['customer', 'offer', 'ticket']), id: z.string().uuid(), number: z.string().nullable(), title: z.string(), subtitle: z.string() });
const searchResultSchema = z.object({ query: z.string(), items: z.array(hitSchema).max(15) });
const querySchema = z.object({ q: z.string().trim().max(120).default('') });

export function OPTIONS(request: Request) { return preflight(request, ['GET']); }
export function GET(request: Request) {
  return endpoint(request, async () => {
    const { db, role } = await authenticate(request);
    const { q } = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    if (q.length < 2) return json(request, searchResultSchema, { query: q, items: [] });
    const staff = ['admin', 'office'].includes(role);
    const like = `%${q.replace(/[%_\\]/g, m => '\\' + m)}%`;
    const [customers, tickets, offers] = await Promise.all([
      db.rpc('search_customers', { search_text: q, show_archived: false }).range(0, 4),
      db.from('service_tickets').select('id,ticket_number,subject,customers(name)').ilike('subject', like).order('created_at', { ascending: false }).limit(5),
      staff ? db.rpc('list_offers', { p_search: q, p_state: 'all', p_page: 1 }) : Promise.resolve({ data: null, error: null }),
    ]);
    databaseError(customers.error); databaseError(tickets.error); databaseError(offers.error);
    const items: z.infer<typeof hitSchema>[] = [];
    for (const c of (customers.data || []) as { id: string; name: string; type: string; email: string | null }[]) items.push({ kind: 'customer', id: c.id, number: null, title: c.name, subtitle: c.type === 'company' ? 'Firma' : 'Osoba prywatna' });
    for (const o of ((offers.data as { items?: { id: string; number: string; title: string; customerName: string }[] } | null)?.items || []).slice(0, 5)) items.push({ kind: 'offer', id: o.id, number: o.number, title: o.title, subtitle: o.customerName });
    for (const t of (tickets.data || []) as unknown as { id: string; ticket_number: number; subject: string; customers: { name: string } | null }[]) items.push({ kind: 'ticket', id: t.id, number: `#${String(t.ticket_number).padStart(5, '0')}`, title: t.subject, subtitle: t.customers?.name || '' });
    return json(request, searchResultSchema, { query: q, items });
  });
}
