import type { TaskAlerts } from '@hvac/api-client';
export const taskAlertTotal=(data:TaskAlerts)=>data.counts.today+data.counts.overdue;
export function taskAlertLinks(data:TaskAlerts){return [{label:'Twoje zadania po terminie',href:'/dashboard/tasks?filter=overdue',count:data.counts.overdue},{label:'Twoje zadania na dzisiaj',href:'/dashboard/tasks?filter=today',count:data.counts.today}].filter(item=>item.count>0);}
