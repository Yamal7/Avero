/* Magazyn (M0.4, KRA-31): zapytanie listy w adresie → stock_item_list (filtry, sortowanie, grupy, strony w SQL);
   stock_overview dla okien dokumentów, macierzy „W samochodach” i lokalizacji. */
import { redirect } from 'next/navigation';
import { stockItemListParamsSchema, stockItemListSchema, stockOverviewSchema, type StockItemList } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { parseQuery } from '@/lib/collection/query';
import { stockSpec } from '@/lib/collection/specs';
import { collectionPrefs } from '@/lib/collection/views';
import { loadPreferences } from '@/lib/collection/server';
import { StockView, type StockTask, type StockTicket } from '@/components/stock-view';
import type { Technician } from '@/lib/service/types';

export default async function StockPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseQuery(stockSpec, await searchParams);
  const { db, access } = await requireSession();
  if (!['admin', 'office', 'technician'].includes(access.role)) redirect('/portal');
  const vehicles = query.view === 'vehicles';
  const listParams = vehicles ? null : stockItemListParamsSchema.parse({ p_view: query.view, p_search: query.q, p_categories: query.filters.cat ?? [], p_sort: query.sort, p_group: query.group, p_page: query.page });
  const [overview, open, listResult, prefsAll] = await Promise.all([
    db.rpc('stock_overview'),
    db.from('service_tickets').select('id,ticket_number,subject,customer:customers(name),installation:installations(devices(id,manufacturer,model,serial_number))').neq('status', 'closed').order('created_at', { ascending: false }).limit(100),
    listParams ? db.rpc('stock_item_list', listParams) : Promise.resolve(null),
    loadPreferences(db),
  ]);
  if (overview.error || open.error) throw new Error('Nie udało się pobrać magazynu.');
  const data = stockOverviewSchema.parse(overview.data);
  // Błąd samej listy pokazuje komunikat w tabeli (z „Spróbuj ponownie”), a nie stronę błędu.
  const parsedList = listResult && !listResult.error ? stockItemListSchema.safeParse(listResult.data) : null;
  const list: StockItemList | null = parsedList?.success ? parsedList.data : null;
  type Row = { id: string; ticket_number: number; subject: string; customer: { name: string } | null; installation: { devices: { id: string; manufacturer: string; model: string | null; serial_number: string | null }[] } | null };
  const tickets: StockTicket[] = ((open.data || []) as unknown as Row[]).map(t => ({ id: t.id, number: t.ticket_number, subject: t.subject, customer: t.customer?.name ?? '', devices: (t.installation?.devices ?? []).map(d => ({ id: d.id, label: [d.manufacturer, d.model, d.serial_number && `nr ${d.serial_number}`].filter(Boolean).join(' ') })) }));
  let technicians: { id: string; label: string }[] = [], tasks: StockTask[] = [];
  if (data.canManage) {
    const [r, t] = await Promise.all([db.rpc('service_technicians', { p_customer: null }), db.rpc('stock_task_options')]);
    if (!r.error) technicians = (r.data as Technician[]).map(x => ({ id: x.id, label: x.email }));
    if (!t.error) tasks = t.data as StockTask[];
  }
  return <StockView data={data} list={list} query={query} prefs={collectionPrefs(stockSpec, prefsAll)} tickets={tickets} tasks={tasks} technicians={technicians} />;
}
