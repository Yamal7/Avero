import { beforeEach, expect, it, vi } from 'vitest';
const { requireStaff, rpc, revalidatePath } = vi.hoisted(() => ({ requireStaff: vi.fn(), rpc: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireStaff }));
vi.mock('next/cache', () => ({ revalidatePath }));
import { previewImport, commitImport } from '@/app/(dashboard)/dashboard/customers/import/actions';
const mapping = { name: 0, email: 1, phone: null, type: null };
const batch = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
beforeEach(() => { vi.clearAllMocks(); requireStaff.mockResolvedValue({ db: { rpc } }); });
it('does not stage data without staff authorization', async () => {
  requireStaff.mockRejectedValue(new Error('Dostęp wymaga uprawnień pracownika.'));
  expect((await previewImport('nazwa;email\nTest;t@example.test', mapping, ';')).error).toBeTruthy();
  expect(rpc).not.toHaveBeenCalled();
});
it('validates malformed rows on the server and excludes them from staging', async () => {
  rpc.mockResolvedValue({ data: { batch_id: batch, rows: [{ row_number: 2, name: 'Test', status: 'ready' }] }, error: null });
  const result = await previewImport('nazwa;email\nTest;t@example.test\nBad;bad', mapping, ';');
  expect(rpc.mock.calls[0][1].p_rows).toHaveLength(1);
  expect(result.rows.map(row => row.status)).toEqual(['ready', 'invalid']);
});
it('does not create a batch when all rows are invalid', async () => {
  const result = await previewImport('nazwa;email\nTest;bad', mapping, ';');
  expect(result.batchId).toBeNull(); expect(result.rows[0].status).toBe('invalid'); expect(rpc).not.toHaveBeenCalled();
});
it('commits only a server-held batch, and invalidates dashboard after success', async () => {
  rpc.mockResolvedValue({ data: { imported: 1, skipped: 0, rows: [] }, error: null });
  expect((await commitImport(batch)).imported).toBe(1);
  expect(rpc).toHaveBeenCalledWith('commit_customer_import', { p_batch_id: batch });
  expect(revalidatePath).toHaveBeenCalledWith('/dashboard', 'layout');
});
it('never reports success or invalidates caches on a database failure', async () => {
  rpc.mockResolvedValue({ data: null, error: { message: 'expired' } });
  expect((await commitImport(batch)).error).toBeTruthy(); expect(revalidatePath).not.toHaveBeenCalled();
});
