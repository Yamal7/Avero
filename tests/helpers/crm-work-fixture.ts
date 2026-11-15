export const customer='c7000000-0000-4000-8000-000000000001',viewer='a7000000-0000-4000-8000-000000000002',taskId='d2000000-0000-4000-8000-000000000001';
export const taskFields={title:'Kontakt po ofercie',description:'Ustal termin',kind:'follow_up' as const,dueOn:'2026-10-29',assigneeId:viewer,contactId:null,state:'todo' as const,result:''};
export const task={...taskFields,id:taskId,customerId:customer,version:0,createdAt:'2026-10-28T10:00:00Z',updatedAt:'2026-10-28T10:00:00Z',contactLabel:null,assigneeLabel:'Biuro',completedAt:null};
export const summary={canManage:true,viewerId:viewer,owner:{version:null,ownerId:null,label:null,available:false},owners:[{id:viewer,label:'Biuro'}],assignees:[{id:viewer,label:'Biuro'}],contacts:[],nextContact:null,openTasks:0,overdueTasks:0,notes:0};
