import { beforeEach, expect, it, vi } from 'vitest';
const { requireAdmin, rpc, revalidatePath, anonymous, signInWithOtp } = vi.hoisted(() => ({ requireAdmin: vi.fn(), rpc: vi.fn(), revalidatePath: vi.fn(), anonymous: vi.fn(), signInWithOtp: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireAdmin }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('@supabase/supabase-js', () => ({ createClient: anonymous }));
import { changeRole, changeBlocked, inviteAccount, assignCustomer } from '@/app/(dashboard)/dashboard/users/actions';
const user='a3000000-0000-4000-8000-000000000001', customer='c3000000-0000-4000-8000-000000000001';
beforeEach(() => {
 vi.clearAllMocks(); requireAdmin.mockResolvedValue({ db: { rpc } });
 anonymous.mockReturnValue({ auth: { signInWithOtp } }); signInWithOtp.mockResolvedValue({ error: null });
 process.env.APP_URL='http://localhost:3100';
});
it('denies privileged changes before any RPC for non-admin callers', async () => {
 requireAdmin.mockRejectedValue(new Error('denied'));
 expect((await changeRole(user,'admin')).error).toBeTruthy(); expect((await inviteAccount({email:'client@example.test',role:'client',customerId:customer})).error).toBeTruthy();
 expect(rpc).not.toHaveBeenCalled(); expect(anonymous).not.toHaveBeenCalled();
});
it('does not take arbitrary roles or forged assignment kinds', async () => {
 expect((await changeRole(user,'superadmin')).error).toBeTruthy();
 expect((await assignCustomer(user,customer,'staff_users',false)).error).toBeTruthy(); expect(rpc).not.toHaveBeenCalled();
});
it('does not treat last-admin protection as a successful update', async () => {
 rpc.mockResolvedValue({error:{message:'Cannot remove last admin'}});
 expect((await changeBlocked(user,true)).error).toBeTruthy(); expect(revalidatePath).not.toHaveBeenCalled();
});
it('requires a customer for client invitations', async () => {
 expect((await inviteAccount({email:'client@example.test',role:'client',customerId:null})).error).toBeTruthy(); expect(rpc).not.toHaveBeenCalled();
});
it('uses an independent implicit email flow and a configured origin', async () => {
 rpc.mockResolvedValueOnce({data:user,error:null}).mockResolvedValueOnce({data:{id:user,email:'client@example.test'},error:null}).mockResolvedValueOnce({error:null});
 expect((await inviteAccount({email:'client@example.test',role:'client',customerId:customer})).success).toBeTruthy();
 expect(anonymous.mock.calls[0][2].auth.flowType).toBe('implicit');
 expect(signInWithOtp).toHaveBeenCalledWith({email:'client@example.test',options:{shouldCreateUser:true,emailRedirectTo:`http://localhost:3100/accept-invitation?id=${user}`}});
});
it('tracks failed mail delivery and does not claim the invitation was sent', async () => {
 rpc.mockResolvedValueOnce({data:user,error:null}).mockResolvedValueOnce({data:{id:user,email:'client@example.test'},error:null}).mockResolvedValueOnce({error:null});
 signInWithOtp.mockResolvedValue({error:{message:'mail unavailable'}});
 expect((await inviteAccount({email:'client@example.test',role:'client',customerId:customer})).error).toBeTruthy();
 expect(rpc).toHaveBeenLastCalledWith('finish_invitation_delivery',{p_invitation:user,p_sent:false});
});
it('rejects unsafe or missing origin before creating an invitation', async () => {
 process.env.APP_URL='http://untrusted.example';
 expect((await inviteAccount({email:'client@example.test',role:'client',customerId:customer})).error).toBeTruthy(); expect(rpc).not.toHaveBeenCalled();
});
