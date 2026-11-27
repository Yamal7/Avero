'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { mapCustomers, parseCsv, type ColumnMapping, type ImportReportRow } from '@/lib/import/csv';

export type ImportPreview = { batchId: string | null; rows: ImportReportRow[]; error?: string };
export type ImportResult = { imported: number; skipped: number; rows: Pick<ImportReportRow, 'row_number' | 'status' | 'reason' | 'customer_id'>[]; error?: string };
const mappingSchema = z.object({ name: z.number().int().min(0).max(49), email: z.number().int().min(0).max(49).nullable(), phone: z.number().int().min(0).max(49).nullable(), type: z.number().int().min(0).max(49).nullable() }).strict();

export async function previewImport(text: string, mapping: ColumnMapping, separator: string, organizationId?: string): Promise<ImportPreview> {
  try {
    const { db } = await requireStaff(organizationId);
    if (typeof text !== 'string' || ![',', ';', '\t'].includes(separator)) throw new Error('Nieprawidłowy plik lub separator.');
    const columns = mappingSchema.safeParse(mapping);
    if (!columns.success) throw new Error('Wybierz kolumnę z nazwą i sprawdź mapowanie pól.');
    const { candidates, invalid } = mapCustomers(parseCsv(text, separator as ',' | ';' | '\t'), columns.data);
    if (!candidates.length) return { batchId: null, rows: invalid };
    const { data, error } = await db.rpc('preview_customer_import', { p_rows: candidates });
    if (error) return { batchId: null, rows: [], error: 'Nie udało się sprawdzić danych w bazie. Sprawdź połączenie i wykonanie migracji.' };
    return { batchId: data.batch_id, rows: [...data.rows, ...invalid].sort((a, b) => a.row_number - b.row_number) };
  } catch (error) {
    return { batchId: null, rows: [], error: error instanceof Error && !error.message.includes('Dostęp') && !error.message.includes('NEXT_REDIRECT') ? error.message : 'Import wymaga aktywnej sesji pracownika.' };
  }
}

export async function commitImport(batchId: string, organizationId?: string): Promise<ImportResult> {
  try {
    const { db } = await requireStaff(organizationId);
    if (!z.string().uuid().safeParse(batchId).success) throw new Error('Invalid batch');
    const { data, error } = await db.rpc('commit_customer_import', { p_batch_id: batchId });
    if (error) return { imported: 0, skipped: 0, rows: [], error: 'Nie udało się zatwierdzić importu. Podgląd wygasa po godzinie. Odśwież podgląd lub ponów próbę; zatwierdzenie tego samego podglądu jest bezpieczne.' };
    revalidatePath('/dashboard', 'layout');
    return data as ImportResult;
  } catch { return { imported: 0, skipped: 0, rows: [], error: 'Import wymaga aktywnej sesji pracownika.' }; }
}

export async function discardImport(batchId: string, organizationId?: string): Promise<boolean> {
  try {
    const { db } = await requireStaff(organizationId);
    if (!z.string().uuid().safeParse(batchId).success) return false;
    const { error } = await db.rpc('discard_customer_import', { p_batch_id: batchId });
    return !error;
  } catch { return false; }
}
