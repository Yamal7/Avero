import { beforeEach,it,expect,vi } from 'vitest';
const mocks=vi.hoisted(()=>({session:vi.fn(),rpc:vi.fn()}));vi.mock('@/lib/auth',()=>({requireSession:mocks.session}));
import { getTaskAlerts } from '@/lib/data/task-alerts';
import { viewer,task } from './helpers/crm-work-fixture';
import { taskAlertsFixture } from './helpers/task-alerts-fixture';
beforeEach(()=>{vi.clearAllMocks();mocks.session.mockResolvedValue({user:{id:viewer},db:{rpc:mocks.rpc}});mocks.rpc.mockResolvedValue({data:taskAlertsFixture(),error:null});});
it('validates the dashboard metadata against the authenticated viewer',async()=>{expect(await getTaskAlerts()).toEqual(taskAlertsFixture());expect(mocks.rpc).toHaveBeenCalledWith('my_task_alerts');});
it('does not turn failed reads into zero alerts',async()=>{mocks.rpc.mockResolvedValue({data:null,error:{code:'42501'}});await expect(getTaskAlerts()).rejects.toThrow('Nie udało się pobrać');});
it('refuses a cross-user or malformed dashboard projection',async()=>{for(const data of [{...taskAlertsFixture(),viewerId:task.id},{...taskAlertsFixture(),counts:{today:0,overdue:0}}]){mocks.rpc.mockResolvedValue({data,error:null});await expect(getTaskAlerts()).rejects.toThrow();}});
