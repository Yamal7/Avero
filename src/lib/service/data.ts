import { requireSession } from '@/lib/auth';
import type { Ticket } from './types';
export async function getServiceTicket(id: string) {
  const { db } = await requireSession();
  const { data, error } = await db.from('service_tickets').select('id,ticket_number,subject,description,status,priority,assigned_to,created_at,customer_id,customers(name),installations(id,type,locations(address,city,postal_code)),service_visits(id,scheduled_at,completed_at,duration_minutes,status,notes,service_protocols(id,protocol_number,status,version,diagnosis,work_performed,materials,measurements,recommendations,published_at,snapshot))').eq('id',id).single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw new Error('Nie udało się pobrać zgłoszenia.');
  return data as unknown as Ticket;
}
