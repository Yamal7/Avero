import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createTicketInputSchema,createTicketResponseSchema,ticketListQuerySchema,ticketListResponseSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
const rowsSchema=z.object({total:z.number().int().nonnegative(),tickets:z.array(z.object({id:z.string().uuid(),ticket_number:z.number().int(),subject:z.string(),status:z.string(),priority:z.string(),created_at:z.string(),customer_name:z.string().optional(),installation_type:z.string().optional(),address:z.string(),city:z.string()}))});
export function GET(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request),params=new URL(request.url).searchParams;
 const input=ticketListQuerySchema.parse({customerId:params.get('customer')??undefined,search:params.get('search')??undefined,status:params.get('status')??undefined,page:params.get('page')??undefined});
 const portal=input.customerId!==undefined;
 if(role==='client'&&!portal)throw new ApiFault(400,'CUSTOMER_REQUIRED','Wybierz konto klienta.');
 if(portal&&(input.search||!['open','all','closed'].includes(input.status)))throw new ApiFault(400,'INVALID_FILTER','Portal obsługuje filtry: open, all, closed, bez wyszukiwania.');
 const result=portal?await db.rpc('portal_tickets',{p_customer:input.customerId,p_status:input.status,p_page:input.page}):await db.rpc('list_service_tickets',{p_search:input.search,p_status:input.status,p_page:input.page});databaseError(result.error);
 const rows=rowsSchema.safeParse(result.data);if(!rows.success)throw new ApiFault(502,'INVALID_RESPONSE','Nie udało się odczytać zgłoszeń.');
 return json(request,ticketListResponseSchema,{apiVersion:'1',items:rows.data.tickets.map(t=>({id:t.id,number:t.ticket_number,subject:t.subject,status:t.status,priority:t.priority,createdAt:t.created_at,customerName:t.customer_name??null,installationType:t.installation_type??null,address:t.address,city:t.city})),totalCount:rows.data.total,page:input.page,pageSize:portal?20:25});
});}
export function POST(request:Request){return endpoint(request,async()=>{
 const {db,role}=await authenticate(request),input=createTicketInputSchema.parse(await readBody(request));
 if(role==='client'&&(!input.customerId||input.priority!=='normal'))throw new ApiFault(400,'INVALID_INPUT','Wybierz klienta i zwykły priorytet zgłoszenia.');
 if(role!=='client'&&input.customerId)throw new ApiFault(403,'PREVIEW_READ_ONLY','Podgląd portalu jest tylko do odczytu.');
 const common={p_installation:input.installationId,p_subject:input.subject,p_description:input.description,p_request:input.requestId};
 const result=role==='client'?await db.rpc('portal_create_ticket',{...common,p_customer:input.customerId}):await db.rpc('create_service_ticket',{...common,p_priority:input.priority});databaseError(result.error);
 const response=json(request,createTicketResponseSchema,{apiVersion:'1',ticketId:result.data},201);
 revalidatePath('/dashboard','layout');revalidatePath('/portal','layout');return response;
});}
export function OPTIONS(request:Request){return preflight(request,['GET','POST']);}
