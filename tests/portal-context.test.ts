import { beforeEach,it,expect,vi } from 'vitest';
const {requireSession,rpc,notFound,redirect}=vi.hoisted(()=>({requireSession:vi.fn(),rpc:vi.fn(),notFound:vi.fn(),redirect:vi.fn()}));
vi.mock('@/lib/auth',()=>({requireSession}));vi.mock('next/navigation',()=>({notFound,redirect}));
import { requirePortalContext } from '@/lib/portal/context';
const customer={id:'c5000000-0000-4000-8000-000000000001',name:'Client',archived_at:null};
beforeEach(()=>{vi.clearAllMocks();requireSession.mockResolvedValue({db:{rpc},access:{role:'client',blocked:false}});notFound.mockImplementation(()=>{throw new Error('NOT_FOUND');});redirect.mockImplementation((url:string)=>{throw new Error('REDIRECT:'+url);});});
it('refuses an unauthorized selected customer before listing any options',async()=>{
 rpc.mockResolvedValueOnce({data:null,error:{code:'42501'}});await expect(requirePortalContext(customer.id)).rejects.toThrow('NOT_FOUND');expect(rpc).toHaveBeenCalledTimes(1);
});
it('keeps a selected permitted account in the picker after a narrowed search',async()=>{
 rpc.mockResolvedValueOnce({data:{preview:false,customer},error:null}).mockResolvedValueOnce({data:[],error:null});
 expect((await requirePortalContext(customer.id,'Other')).choices).toEqual([customer]);
});
it('routes technicians to their company view',async()=>{
 requireSession.mockResolvedValue({db:{rpc},access:{role:'technician',blocked:false}});await expect(requirePortalContext()).rejects.toThrow('REDIRECT:/dashboard');expect(rpc).not.toHaveBeenCalled();
});
it('fails closed on a malformed context instead of silently selecting a wider scope',async()=>{
 rpc.mockResolvedValueOnce({data:{preview:true,customer},error:null}).mockResolvedValueOnce({data:[customer],error:null});await expect(requirePortalContext(customer.id)).rejects.toThrow('potwierdzić kontekstu');
});
