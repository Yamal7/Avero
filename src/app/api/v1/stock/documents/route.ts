import { revalidatePath } from 'next/cache';
import { stockDocumentInputSchema,stockDocumentResultSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
/** Posts PZ, RW, MM or WZ. RW also adds the issued items to the ticket's materials. */
export function POST(request:Request){return endpoint(request,async()=>{const {db}=await authenticate(request);const d=stockDocumentInputSchema.parse(await readBody(request)),r=await db.rpc('post_stock_document',{p_id:d.id,p_kind:d.kind,p_from:d.from,p_to:d.to,p_ticket:d.ticketId,p_supplier:d.supplier,p_note:d.note,p_lines:d.lines,p_customer:d.customerId});if(r.error?.code==='23514')throw new ApiFault(409,'INSUFFICIENT_STOCK','Za mało na stanie w wybranym miejscu. Sprawdź ilość albo najpierw przesuń towar (MM).');databaseError(r.error);revalidatePath('/dashboard/stock');if(d.ticketId)revalidatePath(`/dashboard/service/${d.ticketId}`);return json(request,stockDocumentResultSchema,r.data);});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
