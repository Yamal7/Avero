'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireSession, requireStaff } from '@/lib/auth';
import { newTicketSchema, prioritySchema, protocolSchema, scheduleSchema, ticketStatusSchema, type InstallationOption, type ServiceResult } from '@/lib/service/types';
const uuid = z.string().uuid();
function refresh() { revalidatePath('/dashboard', 'layout'); revalidatePath('/portal', 'layout'); }
function failure(error: { code?: string } | null, fallback: string): ServiceResult {
  if (error?.code === '23P01') return { error: 'Technik ma już wizytę w tym terminie. Wybierz inną godzinę lub technika.' };
  if (error?.code === '40001') return { error: 'Protokół zmienił się w innej sesji. Odśwież stronę przed kolejnym zapisem.' };
  return { error: fallback };
}
export async function findInstallations(query: string): Promise<InstallationOption[]> {
  try { const { db } = await requireSession(); if (typeof query !== 'string' || query.length > 200) return [];
    const { data, error } = await db.rpc('find_service_installations', { p_search: query }); return error ? [] : data as InstallationOption[];
  } catch { return []; }
}
export async function createTicket(input: unknown): Promise<ServiceResult> {
  try { const { db } = await requireSession(); const parsed = newTicketSchema.safeParse(input);
    if (!parsed.success) return { error: 'Wybierz instalację, podaj temat oraz opis problemu.' };
    const value = parsed.data;
    const { data, error } = await db.rpc('create_service_ticket', { p_installation: value.installationId, p_subject: value.subject, p_description: value.description, p_priority: value.priority, p_request: value.requestId });
    if (error) return failure(error, 'Nie udało się dodać zgłoszenia. Sprawdź dostęp do aktywnej instalacji i priorytet. Limit zgłoszeń klienta lub technika: 20 na godzinę.');
    refresh(); return { success: 'Zgłoszenie dodane.', id: data as string };
  } catch { return { error: 'Nie udało się dodać zgłoszenia. Sprawdź sesję i połączenie.' }; }
}
export async function assignTechnician(ticketId: string, technicianId: string | null): Promise<ServiceResult> {
  try { const { db } = await requireStaff(); if (!uuid.safeParse(ticketId).success || (technicianId !== null && !uuid.safeParse(technicianId).success)) return { error: 'Nieprawidłowe przypisanie.' };
    const { error } = await db.rpc('assign_service_ticket', { p_ticket: ticketId, p_technician: technicianId });
    if (error) return failure(error, 'Nie udało się zmienić technika. Technik musi mieć aktywne przypisanie do klienta. Rozpoczęte wizyty lub zaplanowane terminy mogą blokować zmianę.');
    refresh(); return { success: 'Przypisanie technika zapisane.' };
  } catch { return { error: 'Przypisanie technika wymaga uprawnień biura.' }; }
}
export async function updateTicket(ticketId: string, status: string, priority: string): Promise<ServiceResult> {
  try { const { db } = await requireSession(); if (!uuid.safeParse(ticketId).success || !ticketStatusSchema.safeParse(status).success || !prioritySchema.safeParse(priority).success) return { error: 'Nieprawidłowy status.' };
    const { error } = await db.rpc('update_service_ticket', { p_ticket: ticketId, p_status: status, p_priority: priority });
    if (error) return failure(error, 'Nie udało się zmienić zgłoszenia. Przed zamknięciem zakończ lub odwołaj otwarte wizyty. Technik musi mieć zatwierdzony protokół i nie może zmieniać priorytetu.');
    refresh(); return { success: 'Zgłoszenie zaktualizowane.' };
  } catch { return { error: 'Sprawdź sesję i uprawnienia do zgłoszenia.' }; }
}
export async function scheduleVisit(input: unknown): Promise<ServiceResult> {
  try { const { db } = await requireStaff(); const parsed = scheduleSchema.safeParse(input); if (!parsed.success) return { error: 'Podaj termin oraz czas trwania od 15 do 480 minut.' };
    const v = parsed.data; const { data, error } = await db.rpc('schedule_service_visit', { p_ticket: v.ticketId, p_local_start: v.localStart, p_minutes: v.duration, p_notes: v.notes, p_visit: v.visitId });
    if (error) return failure(error, 'Nie udało się zaplanować wizyty. Sprawdź otwarcie zgłoszenia, przypisanie aktywnego technika i poprawność terminu. Rozpoczętej wizyty nie można przeplanować.');
    refresh(); return { success: 'Termin wizyty zapisany.', id: data as string };
  } catch { return { error: 'Planowanie wizyt wymaga uprawnień biura.' }; }
}
export async function changeVisit(visitId: string, status: string): Promise<ServiceResult> {
  try { const { db } = await requireSession(); if (!uuid.safeParse(visitId).success || !['en_route','in_progress','cancelled'].includes(status)) return { error: 'Nieprawidłowy status wizyty.' };
    const { error } = await db.rpc('change_service_visit_state', { p_visit: visitId, p_status: status });
    if (error) return failure(error, 'Nie udało się zmienić wizyty. Sprawdź jej aktualny status i uprawnienia.');
    refresh(); return { success: 'Status wizyty zapisany.' };
  } catch { return { error: 'Sprawdź sesję i dostęp do wizyty.' }; }
}
export async function saveProtocol(input: unknown): Promise<ServiceResult> {
  try { const { db } = await requireSession(); const parsed = protocolSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const v = parsed.data; const { data, error } = await db.rpc('save_service_protocol', { p_visit: v.visitId, p_fields: v.fields, p_version: v.version, p_publish: v.publish });
    if (error) return failure(error, 'Nie udało się zapisać protokołu. Wizyta musi być rozpoczęta, a zatwierdzony protokół nie podlega zmianom.');
    refresh(); return { success: v.publish ? 'Protokół zatwierdzony i udostępniony klientowi. Wizyta została zakończona.' : 'Wersja robocza zapisana.', id: data as string };
  } catch { return { error: 'Sprawdź sesję i uprawnienia do wizyty.' }; }
}
