import { beforeEach, expect, it, vi } from 'vitest';
const { requireStaff, from, rpc, redirect, revalidatePath } = vi.hoisted(() => ({ requireStaff: vi.fn(), from: vi.fn(), rpc: vi.fn(), redirect: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireStaff }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('next/cache', () => ({ revalidatePath }));
import { saveRecord } from '../src/app/(dashboard)/dashboard/actions';
const customer = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const organization = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const parent = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function form(values: Record<string, string>) { const f = new FormData(); Object.entries({ _organization: organization, ...values }).forEach(([k,v]) => f.set(k,v)); return f; }
beforeEach(() => { vi.clearAllMocks(); requireStaff.mockResolvedValue({ db: { from, rpc } }); });
it('refuses writes when staff authorization fails', async () => {
  requireStaff.mockRejectedValue(new Error('denied'));
  const state = await saveRecord({}, form({ _entity: 'customers', name: 'Test', type: 'company' }));
  expect(state.error).toBeTruthy(); expect(from).not.toHaveBeenCalled(); expect(revalidatePath).not.toHaveBeenCalled();
});
it('rejects forged installation ownership before inserting a device', async () => {
  const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id: customer }, error: null }) };
  from.mockReturnValue(query); rpc.mockResolvedValue({ data: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', error: null });
  const state = await saveRecord({}, form({ _entity: 'devices', _customer: customer, _parent: parent, manufacturer: 'Test', model: '', serial_number: '', warranty_until: '' }));
  expect(state.error).toContain('nie należy'); expect(from).toHaveBeenCalledTimes(1); expect(revalidatePath).not.toHaveBeenCalled();
});
it('never takes arbitrary table names from form input', async () => {
  const state = await saveRecord({}, form({ _entity: 'staff_users', user_id: customer }));
  expect(state.error).toBeTruthy(); expect(requireStaff).not.toHaveBeenCalled();
});
it('saves an authorized update and invalidates the dashboard cache', async () => {
  const query = { select: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id: customer }, error: null }) };
  from.mockReturnValue(query);
  const state = await saveRecord({}, form({ _entity: 'customers', _id: customer, name: 'Nowa nazwa', type: 'company' }));
  expect(state.success).toBeTruthy(); expect(requireStaff).toHaveBeenCalledWith(organization); expect(query.update).toHaveBeenCalledWith({ name: 'Nowa nazwa', type: 'company' }); expect(revalidatePath).toHaveBeenCalledWith('/dashboard', 'layout');
});
it('does not report success when an update affects no row', async () => {
  const query = { select: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValueOnce({ data: { id: customer }, error: null }).mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) };
  from.mockReturnValue(query);
  const state = await saveRecord({}, form({ _entity: 'customers', _id: customer, name: 'Test', type: 'company' }));
  expect(state.error).toBeTruthy(); expect(revalidatePath).not.toHaveBeenCalled();
});

it('does not write from a form that lacks a valid organization context', async () => {
  const state = await saveRecord({}, form({
    _entity: 'customers', name: 'Test', type: 'company', _organization: '',
  }));
  expect(state.error).toContain('Aktywna firma');
  expect(requireStaff).not.toHaveBeenCalled();
  expect(from).not.toHaveBeenCalled();
});
