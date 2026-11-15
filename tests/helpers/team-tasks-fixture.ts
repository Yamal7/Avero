import { task,viewer } from './crm-work-fixture';
export const otherAssignee='a7000000-0000-4000-8000-000000000003';
export const teamFixture=()=>({viewerId:viewer,canManage:true as const,today:'2026-11-01',total:1,counts:{today:1,overdue:0,upcoming:0,open:1,closed:0},items:[{...task,dueOn:'2026-11-01',assigneeId:otherAssignee,assigneeLabel:'Technik',customerName:'Firma Alfa',customerPage:2,assigneeAvailable:true}],assignees:[{id:otherAssignee,label:'Technik',available:true}]});
