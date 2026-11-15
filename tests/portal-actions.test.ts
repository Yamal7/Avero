import { beforeEach,it,expect,vi } from 'vitest';
const {requireSession,rpc,revalidatePath}=vi.hoisted(()=>({requireSession:vi.fn(),rpc:vi.fn(),revalidatePath:vi.fn()}));
vi.mock('@/lib/auth',()=>({requireSession}));vi.mock('next/cache',()=>({revalidatePath}));
import { createPortalTicket } from '@/app/portal/actions';
const id='a5000000-0000-4000-8000-000000000001';
const input={customerId:id,installationId:id,subject:' Problem ',description:' Details ',priority:'normal',requestId:id};
beforeEach(()=>{vi.clearAllMocks();requireSession.mockResolvedValue({db:{rpc},access:{role:'client',blocked:false}});});
it('does not allow a staff preview to create a client ticket',async()=>{
 requireSession.mockResolvedValue({db:{rpc},access:{role:'admin',blocked:false}});
 expect((await createPortalTicket(input)).error).toContain('do odczytu');expect(rpc).not.toHaveBeenCalled();
});
it('rejects forged priority or customer identifiers',async()=>{
 expect((await createPortalTicket({...input,priority:'high'})).error).toBeTruthy();
 expect((await createPortalTicket({...input,customerId:'bad'})).error).toBeTruthy();expect(rpc).not.toHaveBeenCalled();
});
it('passes selected customer and stable request id to the guarded RPC',async()=>{
 rpc.mockResolvedValue({data:id,error:null});expect((await createPortalTicket(input)).id).toBe(id);
 expect(rpc).toHaveBeenCalledWith('portal_create_ticket',{p_customer:id,p_installation:id,p_subject:'Problem',p_description:'Details',p_request:id});
 expect(revalidatePath).toHaveBeenCalledWith('/portal','layout');expect(revalidatePath).toHaveBeenCalledWith('/dashboard','layout');
});
it('does not claim a successful write on a context or database rejection',async()=>{
 rpc.mockResolvedValue({data:null,error:{code:'42501'}});expect((await createPortalTicket(input)).error).toBeTruthy();expect(revalidatePath).not.toHaveBeenCalled();
});
it('does not write after a lost or blocked session',async()=>{
 requireSession.mockRejectedValue(new Error('blocked'));expect((await createPortalTicket(input)).error).toBeTruthy();expect(rpc).not.toHaveBeenCalled();
});
