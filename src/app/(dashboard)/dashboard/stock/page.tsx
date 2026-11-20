import { redirect } from 'next/navigation';
import { stockOverviewSchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { StockView, type StockTask, type StockTicket } from '@/components/stock-view';
import type { Technician } from '@/lib/service/types';

export default async function StockPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: v } = await searchParams;
  const view = v === 'refrigerant' || v === 'below' || v === 'vehicles' ? v : 'all';
  const { db, access } = await requireSession();
  if (!['admin', 'office', 'technician'].includes(access.role)) redirect('/portal');
  const [overview, open] = await Promise.all([
    db.rpc('stock_overview'),
    db.from('service_tickets').select('id,ticket_number,subject,customer:customers(name),installation:installations(devices(id,manufacturer,model,serial_number))').neq('status', 'closed').order('created_at', { ascending: false }).limit(100),
  ]);
  if (overview.error || open.error) throw new Error('Nie udało się pobrać magazynu.');
  const data = stockOverviewSchema.parse(overview.data);
  type Row = { id: string; ticket_number: number; subject: string; customer: { name: string } | null; installation: { devices: { id: string; manufacturer: string; model: string | null; serial_number: string | null }[] } | null };
  const tickets: StockTicket[] = ((open.data || []) as unknown as Row[]).map(t => ({ id: t.id, number: t.ticket_number, subject: t.subject, customer: t.customer?.name ?? '', devices: (t.installation?.devices ?? []).map(d => ({ id: d.id, label: [d.manufacturer, d.model, d.serial_number && `nr ${d.serial_number}`].filter(Boolean).join(' ') })) }));
  let technicians: { id: string; label: string }[] = [], tasks: StockTask[] = [];
  if (data.canManage) {
    const [r, t] = await Promise.all([db.rpc('service_technicians', { p_customer: null }), db.rpc('stock_task_options')]);
    if (!r.error) technicians = (r.data as Technician[]).map(x => ({ id: x.id, label: x.email }));
    if (!t.error) tasks = t.data as StockTask[];
  }
  return <StockView data={data} view={view} tickets={tickets} tasks={tasks} technicians={technicians} />;
}
