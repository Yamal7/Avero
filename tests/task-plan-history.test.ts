import { it,expect,vi } from 'vitest';
import { customerActivitySchema,customerActivityListSchema,createHvacClient } from '@hvac/api-client';
import { activityFixture,workspaceId } from './helpers/customer-workspace-fixture';
const change={actorLabel:'Biuro',dueOn:{from:'2026-10-31',to:'2026-11-05'},assignee:{fromLabel:'Anna',toLabel:'Jan'}};
const event=()=>({...activityFixture(),kind:'crm_task',planChange:change});
it('supports historical activity payloads and structured task plan changes',()=>{expect(customerActivitySchema.parse(activityFixture())).toEqual(activityFixture());expect(customerActivitySchema.parse(event())).toEqual(event());});
it.each([
 {planChange:{...change,old_data:{}}},
 {planChange:{...change,actorLabel:''}},
 {planChange:{...change,dueOn:{from:'2026-02-30',to:'2026-11-05'}}},
 {planChange:{...change,dueOn:{from:'2026-11-05',to:'2026-11-05'}}},
 {planChange:{actorLabel:'Biuro',dueOn:null,assignee:null}},
 {planChange:{...change,assignee:{fromLabel:'Anna',toLabel:'Jan',userId:workspaceId}}},
 {kind:'offer'},
 {planChange:null},
])('rejects invalid or excessive history projection %j',patch=>{expect(customerActivitySchema.safeParse({...event(),...patch}).success).toBe(false);});
it('allows date-only and assignee-only changes, including identical display labels',()=>{for(const planChange of [{...change,assignee:null},{...change,dueOn:null,assignee:{fromLabel:'Niedostępny użytkownik',toLabel:'Niedostępny użytkownik'}}])expect(customerActivitySchema.safeParse({...event(),planChange}).success).toBe(true);});
it('never accepts raw snapshots in the timeline contract',()=>{expect(customerActivityListSchema.safeParse({total:1,items:[{...event(),old_data:{description:'private'}}]}).success).toBe(false);});
it('shares structured changes through the existing paginated mobile history client',async()=>{const data={total:21,items:[event()]},fetcher=vi.fn<typeof fetch>().mockResolvedValue(Response.json(data)),client=createHvacClient({apiOrigin:'https://api.example',channel:'mobile',getAccessToken:async()=>'token',fetcher});expect(await client.customerActivity(workspaceId,{kind:'crm_task',page:2})).toEqual(data);expect(fetcher.mock.calls[0][0]).toContain('/activity?kind=crm_task&page=2');});
