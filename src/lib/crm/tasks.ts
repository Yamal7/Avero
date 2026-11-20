import type { MyTask } from '@hvac/api-client';
export function myTaskCustomerHref(task:Pick<MyTask,'id'|'customerId'|'customerPage'>){return `/dashboard/customers/${task.customerId}?tab=tasks&filter=all&page=${task.customerPage}#crm-${task.id}`;}
