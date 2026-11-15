import { z } from 'zod';
import { ApiFault,authenticate } from './http';
export async function notificationStaff(request:Request){const auth=await authenticate(request);if(!['admin','office','technician'].includes(auth.role))throw new ApiFault(403,'ACCESS_DENIED','Powiadomienia są dostępne dla pracowników.');return auth;}
export function emptyNotificationQuery(request:Request){z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));}
