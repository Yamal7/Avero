import { beforeEach,it,expect,vi } from 'vitest';
const {requireSession,requireStaff,rpc,revalidatePath}=vi.hoisted(()=>({requireSession:vi.fn(),requireStaff:vi.fn(),rpc:vi.fn(),revalidatePath:vi.fn()}));
vi.mock('@/lib/auth',()=>({requireSession,requireStaff}));vi.mock('next/cache',()=>({revalidatePath}));
import { assignTechnician,changeVisit,createTicket,saveProtocol,scheduleVisit,updateTicket } from '@/app/(dashboard)/dashboard/service/actions';
const id='a4000000-0000-4000-8000-000000000001';
const fields={diagnosis:'Diagnosis',work_performed:'Work',materials:'',measurements:'35 C',recommendations:''};
beforeEach(()=>{vi.clearAllMocks();requireSession.mockResolvedValue({db:{rpc}});requireStaff.mockResolvedValue({db:{rpc}});});
it('requires staff permission before assigning technicians',async()=>{
 requireStaff.mockRejectedValue(new Error('denied'));expect((await assignTechnician(id,id)).error).toBeTruthy();expect(rpc).not.toHaveBeenCalled();
});
it('never writes without a verified session',async()=>{
 requireSession.mockRejectedValue(new Error('no session'));expect((await createTicket({installationId:id,subject:'Test',description:'Test',priority:'normal',requestId:id})).error).toBeTruthy();expect(rpc).not.toHaveBeenCalled();
});
it('passes the stable request id to transactional ticket creation',async()=>{
 rpc.mockResolvedValue({data:id,error:null});const result=await createTicket({installationId:id,subject:' Test ',description:' Problem ',priority:'normal',requestId:id});
 expect(result.id).toBe(id);expect(rpc).toHaveBeenCalledWith('create_service_ticket',{p_installation:id,p_subject:'Test',p_description:'Problem',p_priority:'normal',p_request:id});
});
it('reports slot conflicts instead of claiming success',async()=>{
 rpc.mockResolvedValue({error:{code:'23P01'}});const result=await scheduleVisit({ticketId:id,visitId:null,localStart:'2026-11-02T09:00',duration:60,notes:''});
 expect(result.error).toContain('już wizytę');expect(revalidatePath).not.toHaveBeenCalled();
});
it('keeps local Warsaw input for authoritative database conversion',async()=>{
 rpc.mockResolvedValue({data:id,error:null});await scheduleVisit({ticketId:id,visitId:null,localStart:'2026-11-02T09:00',duration:60,notes:'Client note'});
 expect(rpc).toHaveBeenCalledWith('schedule_service_visit',{p_ticket:id,p_local_start:'2026-11-02T09:00',p_minutes:60,p_notes:'Client note',p_visit:null});
});
it('refuses an arbitrary visit completion without a protocol',async()=>{
 expect((await changeVisit(id,'completed')).error).toBeTruthy();expect(rpc).not.toHaveBeenCalled();
});
it('does not publish incomplete protocol fields',async()=>{
 expect((await saveProtocol({visitId:id,version:0,publish:true,fields:{...fields,diagnosis:''}})).error).toBeTruthy();expect(rpc).not.toHaveBeenCalled();
});
it('reports optimistic concurrency failure without cache invalidation',async()=>{
 rpc.mockResolvedValue({error:{code:'40001'}});expect((await saveProtocol({visitId:id,version:1,publish:true,fields})).error).toContain('innej sesji');expect(revalidatePath).not.toHaveBeenCalled();
});
it('passes protocol version and publication flag, not client snapshots',async()=>{
 rpc.mockResolvedValue({data:id,error:null});expect((await saveProtocol({visitId:id,version:2,publish:true,fields})).success).toBeTruthy();
 expect(rpc).toHaveBeenCalledWith('save_service_protocol',{p_visit:id,p_fields:fields,p_version:2,p_publish:true});expect(revalidatePath).toHaveBeenCalledWith('/dashboard','layout');
});
it('does not claim success for a missing ticket',async()=>{
 rpc.mockResolvedValue({error:{code:'P0001'}});expect((await updateTicket(id,'closed','normal')).error).toBeTruthy();expect(revalidatePath).not.toHaveBeenCalled();
});
