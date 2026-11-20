import { revalidatePath } from 'next/cache';
import { correctionDraftSaveSchema,correctionRoundSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
import { correctionParams } from '@/lib/handovers/correction-params';
export function PUT(request:Request,{params}:{params:Promise<{id:string;round:string}>}){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office','technician'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Brak dostępu.');const input=correctionDraftSaveSchema.parse(await readBody(request,131072)),r=await db.rpc('save_correction_draft',{...correctionParams(await params),p_version:input.version,p_fields:input.fields,p_note:input.internalNote});databaseError(r.error);const response=json(request,correctionRoundSchema,r.data);revalidatePath('/dashboard/work-orders','layout');return response;});}
export function OPTIONS(request:Request){return preflight(request,['PUT']);}
