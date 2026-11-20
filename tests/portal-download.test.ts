import { beforeEach,it,expect,vi } from 'vitest';
const {requirePortalContext,rpc,from,download}=vi.hoisted(()=>({requirePortalContext:vi.fn(),rpc:vi.fn(),from:vi.fn(),download:vi.fn()}));
vi.mock('@/lib/portal/context',()=>({requirePortalContext}));
import { GET } from '@/app/portal/documents/[id]/download/route';
const customer='c5000000-0000-4000-8000-000000000001',id='f5000000-0000-4000-8000-000000000001';
const request=()=>new Request(`http://localhost:3100/portal/documents/${id}/download?customer=${customer}`);
beforeEach(()=>{vi.clearAllMocks();requirePortalContext.mockResolvedValue({scope:{preview:false,customer:{id:customer}},db:{rpc,storage:{from}}});from.mockReturnValue({download});});
it('never touches Storage for a hidden or foreign document',async()=>{
 rpc.mockResolvedValue({data:null,error:null});expect((await GET(request(),{params:Promise.resolve({id})})).status).toBe(404);expect(from).not.toHaveBeenCalled();expect(rpc).toHaveBeenCalledWith('portal_file',{p_customer:customer,p_document:id});
});
it('checks document metadata before streaming the permitted object',async()=>{
 rpc.mockResolvedValue({data:{id,file_name:'Instrukcja.pdf',storage_path:'owned/manual.pdf'},error:null});download.mockResolvedValue({data:new Blob(['%PDF-test'],{type:'application/pdf'}),error:null});
 const response=await GET(request(),{params:Promise.resolve({id})});expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('private, no-store');expect(response.headers.get('content-disposition')).toContain('attachment');expect(await response.text()).toBe('%PDF-test');expect(download).toHaveBeenCalledWith('owned/manual.pdf');
});
it('does not mask a missing Storage object as a successful download',async()=>{
 rpc.mockResolvedValue({data:{id,file_name:'Missing.pdf',storage_path:'missing.pdf'},error:null});download.mockResolvedValue({data:null,error:{message:'not found'}});expect((await GET(request(),{params:Promise.resolve({id})})).status).toBe(404);
});
it('requires an explicit selection in staff preview before any lookup',async()=>{
 requirePortalContext.mockResolvedValue({scope:{preview:true,customer:null}});expect((await GET(request(),{params:Promise.resolve({id})})).status).toBe(404);expect(rpc).not.toHaveBeenCalled();
});
