'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { newTicketSchema,type InstallationOption,type ServiceResult } from '@/lib/service/types';
const uuid=z.string().uuid();
export async function findPortalInstallations(customerId:string,query:string, organizationId?: string):Promise<InstallationOption[]> {
 try {const {db}=await requireSession(organizationId);if(!uuid.safeParse(customerId).success||typeof query!=='string'||query.length>200)return [];
 const {data,error}=await db.rpc('portal_installation_options',{p_customer:customerId,p_search:query});return error?[]:data as InstallationOption[];
 }catch{return [];}
}
export async function createPortalTicket(input:unknown, organizationId?: string):Promise<ServiceResult> {
 try {const {db,access}=await requireSession(organizationId);if(access.role!=='client')return {error:'Podgląd portalu jest tylko do odczytu.'};
 const parsed=newTicketSchema.extend({customerId:uuid}).safeParse(input);
 if(!parsed.success||parsed.data.priority!=='normal')return {error:'Wybierz instalację i uzupełnij temat oraz opis problemu.'};
 const v=parsed.data;const {data,error}=await db.rpc('portal_create_ticket',{p_customer:v.customerId,p_installation:v.installationId,p_subject:v.subject,p_description:v.description,p_request:v.requestId});
 if(error)return {error:'Nie udało się dodać zgłoszenia. Sprawdź dostęp do aktywnej instalacji i aktualną listę zgłoszeń przed ponowieniem. Limit: 20 zgłoszeń na godzinę.'};
 revalidatePath('/portal','layout');revalidatePath('/dashboard','layout');return {success:'Zgłoszenie zostało przyjęte.',id:data as string};
 }catch{return {error:'Nie udało się potwierdzić zapisu. Sprawdź połączenie i aktualny stan zgłoszeń.'};}
}
