import { emailViewSchema,emailHistoryQuerySchema,emailPreferenceSaveSchema } from './notification-email';
import { notificationQuerySchema,notificationListSchema,notificationSyncSchema,notificationMarkSchema,notificationMarkResultSchema,notificationPreferenceInputSchema,notificationPreferencesSchema } from './notifications';
import { companyProfileSchema,companyProfileSaveSchema } from './company-profile';
import { installationTemplateDuplicateSchema,offerVariantTemplateContextSchema,offerVariantTemplateSaveSchema,installationTemplateQuerySchema,installationTemplateListSchema,installationTemplateDetailSchema,installationTemplateSaveSchema,installationTemplateSchema } from './installation-templates';
import { taskPlanChangeSchema,taskPlanContextSchema } from './crm-work';
import { teamTasksSchema,teamTasksQuerySchema } from './crm-work';
import { taskAlertsSchema } from './crm-work';
import { myTasksSchema,myTasksQuerySchema } from './crm-work';
import { crmSummarySchema,crmOwnerSaveSchema,crmNoteSaveSchema,crmTaskSaveSchema,crmNoteSchema,crmTaskSchema,crmNotesSchema,crmTasksSchema,crmNotesQuerySchema,crmTasksQuerySchema,crmTaskProgressSchema } from './crm-work';
import { z } from 'zod';
import { customerWorkspaceSchema,customerActivityListSchema,customerActivityQuerySchema,customerRelatedSchema,customerRelatedQuerySchema,customerContactSchema,customerContactsSchema,customerContactsQuerySchema,customerContactSaveSchema } from './customer-workspace';
import { correctionContextSchema,correctionDraftSaveSchema,correctionTaskSaveSchema,correctionRoundSchema,correctionPublishSchema,correctionHistorySchema } from './corrections';
import { handoverAcknowledgeSchema as correctionReceiptInput,publicHandoverSchema as correctionReceiptResponse } from './handovers';
import { handoverContextSchema,handoverSaveSchema,handoverRecordSchema,handoverPublishSchema,publicHandoverSchema,handoverAcknowledgeSchema } from './handovers';
import { workOrderSchema,workOrderListSchema,workOrderCreateSchema,workOrderAddressSchema,workVisitSaveSchema,workOrderChangeSchema,workVisitChangeSchema,workOrderCalendarSchema,publicWorkOrderSchema } from './work-orders';
import { offerPublicationSchema,staffPublicationsSchema,portalOffersSchema,publishOfferSchema,acceptOfferSchema } from './offer-publications';
import { offerDocumentSaveSchema,savedOfferDocumentSchema } from './offer-document';
import { offerQuerySchema,offerListSchema,offerDetailSchema,offerSaveSchema,type OfferSave } from './offers';
import { catalogDetailSchema,catalogListSchema,catalogQuerySchema,catalogSaveSchema,catalogSavedSchema,type CatalogQuery,type CatalogSave } from './catalog';
import { portalMaintenanceHistorySchema,maintenanceDetailSchema,maintenanceCompletionSchema,maintenanceCompletionSavedSchema,type MaintenanceCompletion,maintenanceQuerySchema,maintenanceListSchema,maintenanceSaveSchema,maintenanceSavedSchema,type MaintenanceQuery,type MaintenanceSave } from './maintenance';
import { clientAttachmentUploadSchema,type ClientAttachmentUpload,documentChangeSchema,documentListSchema,documentSavedSchema,documentUploadSchema,type DocumentChange,type DocumentUpload } from './documents';
import { apiErrorSchema,capabilitiesSchema,createTicketInputSchema,createTicketResponseSchema,portalContextResponseSchema,portalOverviewResponseSchema,sessionSchema,ticketListQuerySchema,ticketListResponseSchema,type CreateTicketInput,type TicketListQuery } from './contracts';
export class HvacApiError extends Error {
 constructor(public readonly status:number,public readonly code:string,message:string){super(message);this.name='HvacApiError';}
}
export type HvacClientOptions={apiOrigin:string;getAccessToken:()=>Promise<string|null>;channel:'web'|'desktop'|'mobile';fetcher?:typeof fetch;allowLocalHttp?:boolean};
export function validateApiOrigin(raw:string,allowLocalHttp=false){
 const url=new URL(raw);
 const local=allowLocalHttp&&url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if((url.protocol!=='https:'&&!local)||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('API origin must be HTTPS, without a path or credentials. Explicit loopback HTTP is for local development only.');
 return url.origin;
}
export function createHvacClient(options:HvacClientOptions){
 const origin=validateApiOrigin(options.apiOrigin,options.allowLocalHttp),fetcher=options.fetcher||fetch;
 async function request(path:string,method='GET',body?:unknown,signal?:AbortSignal,authenticated=true){
  const headers:Record<string,string>={Accept:'application/json','X-HVAC-Client':options.channel};
  if(authenticated){const token=await options.getAccessToken();if(!token||/[\r\n]/.test(token))throw new HvacApiError(401,'AUTH_REQUIRED','Zaloguj się ponownie.');headers.Authorization=`Bearer ${token}`;}
  const multipart=typeof FormData!=='undefined'&&body instanceof FormData;
  if(body!==undefined&&!multipart)headers['Content-Type']='application/json';
  const response=await fetcher(origin+'/api/v1'+path,{method,headers,body:multipart?body as FormData:body===undefined?undefined:JSON.stringify(body),credentials:'omit',cache:'no-store',redirect:'error',signal});
  if(!response.ok){let data:unknown;try{data=await response.json();}catch{data=null;}const parsed=apiErrorSchema.safeParse(data);throw new HvacApiError(response.status,parsed.success?parsed.data.error.code:'HTTP_ERROR',parsed.success?parsed.data.error.message:'Nie udało się wykonać żądania.');}
  return response;
 }
 async function json<T>(schema:z.ZodType<T>,path:string,method='GET',body?:unknown,signal?:AbortSignal,authenticated=true):Promise<T>{
  const response=await request(path,method,body,signal,authenticated);
  let value:unknown;try{value=await response.json();}catch{throw new HvacApiError(502,'INVALID_RESPONSE','Serwer zwrócił nieprawidłową odpowiedź.');}
  const parsed=schema.safeParse(value);if(!parsed.success)throw new HvacApiError(502,'INCOMPATIBLE_API','Odpowiedź serwera nie pasuje do tej wersji aplikacji.');return parsed.data;
 }
 const query=(values:Record<string,string|undefined>)=>{const params=new URLSearchParams();Object.entries(values).forEach(([key,value])=>{if(value!==undefined)params.set(key,value);});return params.size?'?'+params.toString():'';};
 return {
  offerVariantTemplateContext:(offerId:string,variantId:string,signal?:AbortSignal)=>json(offerVariantTemplateContextSchema,'/offers/'+z.string().uuid().parse(offerId)+'/variants/'+z.string().uuid().parse(variantId)+'/template','GET',undefined,signal),
  createTemplateFromOfferVariant:(offerId:string,variantId:string,input:z.input<typeof offerVariantTemplateSaveSchema>,signal?:AbortSignal)=>json(installationTemplateSchema,'/offers/'+z.string().uuid().parse(offerId)+'/variants/'+z.string().uuid().parse(variantId)+'/template','POST',offerVariantTemplateSaveSchema.parse(input),signal),
  installationTemplates:async(input:z.input<typeof installationTemplateQuerySchema>={},signal?:AbortSignal)=>{const q=installationTemplateQuerySchema.parse(input);return json(installationTemplateListSchema,'/templates?'+new URLSearchParams({...q,page:String(q.page)}), 'GET',undefined,signal);},
  installationTemplate:(id:string,signal?:AbortSignal)=>json(installationTemplateDetailSchema,'/templates/'+z.string().uuid().parse(id),'GET',undefined,signal),
  duplicateInstallationTemplate:(sourceId:string,input:z.input<typeof installationTemplateDuplicateSchema>,signal?:AbortSignal)=>json(installationTemplateSchema,'/templates/'+z.string().uuid().parse(sourceId)+'/duplicate','POST',installationTemplateDuplicateSchema.parse(input),signal),
  saveInstallationTemplate:(input:z.input<typeof installationTemplateSaveSchema>,signal?:AbortSignal)=>json(installationTemplateSchema,'/templates','PUT',installationTemplateSaveSchema.parse(input),signal),
  offers:(input:Partial<{search:string;state:'active'|'archived'|'all';page:number}>={},signal?:AbortSignal)=>{const p=offerQuerySchema.parse(input);return json(offerListSchema,'/offers'+query({...p,page:String(p.page)}),'GET',undefined,signal);},
  offer:(id:string,signal?:AbortSignal)=>json(offerDetailSchema,'/offers/'+z.string().uuid().parse(id),'GET',undefined,signal),
  saveOffer:(input:OfferSave,signal?:AbortSignal)=>json(offerDetailSchema,'/offers','POST',offerSaveSchema.parse(input),signal),
  catalogItem:(id:string,signal?:AbortSignal)=>json(catalogDetailSchema,'/catalog/'+z.string().uuid().parse(id),'GET',undefined,signal),
  catalogItems:(input:CatalogQuery={},signal?:AbortSignal)=>{const value=catalogQuerySchema.parse(input);return json(catalogListSchema,'/catalog'+query({...value,page:String(value.page)}),'GET',undefined,signal);},
  saveCatalogItem:(input:CatalogSave,signal?:AbortSignal)=>json(catalogSavedSchema,'/catalog','POST',catalogSaveSchema.parse(input),signal),
  capabilities:(signal?:AbortSignal)=>json(capabilitiesSchema,'/capabilities','GET',undefined,signal,false),
  session:(signal?:AbortSignal)=>json(sessionSchema,'/session','GET',undefined,signal),
  portalContext:(customerId?:string,search='',signal?:AbortSignal)=>{if(customerId)z.string().uuid().parse(customerId);z.string().max(200).parse(search);return json(portalContextResponseSchema,'/portal/context'+query({customer:customerId,search}),'GET',undefined,signal);},
  portalOverview:(customerId:string,signal?:AbortSignal)=>{z.string().uuid().parse(customerId);return json(portalOverviewResponseSchema,'/portal/overview'+query({customer:z.string().uuid().parse(customerId)}),'GET',undefined,signal);},
  tickets:(input:TicketListQuery={},signal?:AbortSignal)=>{const values=ticketListQuerySchema.parse(input);return json(ticketListResponseSchema,'/service/tickets'+query({customer:values.customerId,search:values.search,status:values.status,page:String(values.page)}),'GET',undefined,signal);},
  createTicket:(input:CreateTicketInput,signal?:AbortSignal)=>json(createTicketResponseSchema,'/service/tickets','POST',createTicketInputSchema.parse(input),signal),
  maintenancePlans:(input:MaintenanceQuery={},signal?:AbortSignal)=>{const values=maintenanceQuerySchema.parse(input);return json(maintenanceListSchema,'/maintenance-plans'+query({installation:values.installation,search:values.search,view:values.view,page:String(values.page)}),'GET',undefined,signal);},
  portalMaintenanceHistory:(customerId:string,installationId:string,page=1,signal?:AbortSignal)=>{z.string().uuid().parse(customerId);z.string().uuid().parse(installationId);z.number().int().min(1).max(100000).parse(page);return json(portalMaintenanceHistorySchema,'/portal/maintenance-history'+query({customer:customerId,installation:installationId,page:String(page)}),'GET',undefined,signal);},
  maintenancePlan:(id:string,pages:{historyPage?:number;protocolPage?:number}={},signal?:AbortSignal)=>{z.string().uuid().parse(id);const page=z.number().int().min(1).max(100000);return json(maintenanceDetailSchema,'/maintenance-plans/'+id+query({historyPage:String(page.parse(pages.historyPage??1)),protocolPage:String(page.parse(pages.protocolPage??1))}),'GET',undefined,signal);},
  completeMaintenancePlan:(id:string,input:MaintenanceCompletion,signal?:AbortSignal)=>json(maintenanceCompletionSavedSchema,'/maintenance-plans/'+z.string().uuid().parse(id)+'/complete','POST',maintenanceCompletionSchema.parse(input),signal),
  saveMaintenancePlan:(input:MaintenanceSave,signal?:AbortSignal)=>json(maintenanceSavedSchema,'/maintenance-plans','POST',maintenanceSaveSchema.parse(input),signal),
  installationDocuments:(input:{installationId:string;ticketId?:string;customerId?:string;archived?:boolean;page?:number},signal?:AbortSignal)=>{
   z.string().uuid().parse(input.installationId);if(input.ticketId)z.string().uuid().parse(input.ticketId);if(input.customerId)z.string().uuid().parse(input.customerId);
   const page=z.number().int().min(1).max(100000).parse(input.page??1);
   return json(documentListSchema,'/documents'+query({installation:input.installationId,ticket:input.ticketId,customer:input.customerId,archived:String(input.archived??false),page:String(page)}),'GET',undefined,signal);
  },
  uploadDocument:(input:Omit<DocumentUpload,'byteSize'|'mimeType'>,file:Blob,signal?:AbortSignal)=>{
   const parsed=documentUploadSchema.parse({...input,byteSize:file.size,mimeType:file.type}),form=new FormData();
   form.set('file',file,parsed.fileName);form.set('requestId',parsed.requestId);form.set('installationId',parsed.installationId);form.set('documentType',parsed.documentType);if(parsed.ticketId)form.set('ticketId',parsed.ticketId);
   return json(documentSavedSchema,'/documents','POST',form,signal);
  },
  uploadTicketAttachment:(ticketId:string,input:Omit<ClientAttachmentUpload,'byteSize'|'mimeType'>,file:Blob,signal?:AbortSignal)=>{
   z.string().uuid().parse(ticketId);const parsed=clientAttachmentUploadSchema.parse({...input,byteSize:file.size,mimeType:file.type}),form=new FormData();
   form.set('file',file,parsed.fileName);form.set('requestId',parsed.requestId);form.set('customerId',parsed.customerId);
   return json(documentSavedSchema,'/portal/service/'+ticketId+'/attachments','POST',form,signal);
  },
  changeDocument:(id:string,input:DocumentChange,signal?:AbortSignal)=>json(documentSavedSchema,'/documents/'+z.string().uuid().parse(id),'PATCH',documentChangeSchema.parse(input),signal),
  customerWorkspace:(id:string,signal?:AbortSignal)=>json(customerWorkspaceSchema,'/customers/'+z.string().uuid().parse(id),'GET',undefined,signal),
  customerActivity:(id:string,input:z.input<typeof customerActivityQuerySchema>={},signal?:AbortSignal)=>{const q=customerActivityQuerySchema.parse(input);return json(customerActivityListSchema,'/customers/'+z.string().uuid().parse(id)+'/activity'+query({kind:q.kind,page:String(q.page)}),'GET',undefined,signal);},
  customerRecords:(id:string,input:z.input<typeof customerRelatedQuerySchema>,signal?:AbortSignal)=>{const q=customerRelatedQuerySchema.parse(input);return json(customerRelatedSchema,'/customers/'+z.string().uuid().parse(id)+'/records'+query({kind:q.kind,page:String(q.page)}),'GET',undefined,signal);},
  customerContacts:(id:string,input:z.input<typeof customerContactsQuerySchema>={},signal?:AbortSignal)=>{const q=customerContactsQuerySchema.parse(input);return json(customerContactsSchema,'/customers/'+z.string().uuid().parse(id)+'/contacts'+query({archived:q.archived,page:String(q.page)}),'GET',undefined,signal);},
  saveCustomerContact:(customer:string,input:z.infer<typeof customerContactSaveSchema>,signal?:AbortSignal)=>json(customerContactSchema,'/customers/'+z.string().uuid().parse(customer)+'/contacts','PUT',customerContactSaveSchema.parse(input),signal),
  corrections:(id:string,signal?:AbortSignal)=>json(correctionContextSchema,'/work-orders/'+z.string().uuid().parse(id)+'/corrections','GET',undefined,signal),
  saveCorrectionTask:(id:string,round:number,input:z.infer<typeof correctionTaskSaveSchema>,signal?:AbortSignal)=>json(correctionRoundSchema,`/work-orders/${z.string().uuid().parse(id)}/corrections/${z.number().int().min(1).max(100).parse(round)}/tasks`,'PUT',correctionTaskSaveSchema.parse(input),signal),
  saveCorrectionDraft:(id:string,round:number,input:z.infer<typeof correctionDraftSaveSchema>,signal?:AbortSignal)=>json(correctionRoundSchema,`/work-orders/${z.string().uuid().parse(id)}/corrections/${z.number().int().min(1).max(100).parse(round)}`,'PUT',correctionDraftSaveSchema.parse(input),signal),
  notificationEmails:(input:z.input<typeof emailHistoryQuerySchema>={},signal?:AbortSignal)=>{const q=emailHistoryQuerySchema.parse(input);return json(emailViewSchema,'/notifications/email?page='+q.page,'GET',undefined,signal);},
  saveNotificationEmails:(input:z.input<typeof emailPreferenceSaveSchema>,signal?:AbortSignal)=>json(emailViewSchema,'/notifications/email','PUT',emailPreferenceSaveSchema.parse(input),signal),
  notifications:(input:z.input<typeof notificationQuerySchema>={},signal?:AbortSignal)=>{const q=notificationQuerySchema.parse(input);return json(notificationListSchema,'/notifications?'+new URLSearchParams({...q,page:String(q.page)}),'GET',undefined,signal);},
  syncNotifications:(signal?:AbortSignal)=>json(notificationSyncSchema,'/notifications/sync','POST',{},signal),
  markNotification:(id:string,input:z.input<typeof notificationMarkSchema>,signal?:AbortSignal)=>json(notificationMarkResultSchema,'/notifications/'+z.string().uuid().parse(id),'PATCH',notificationMarkSchema.parse(input),signal),
  notificationPreferences:(signal?:AbortSignal)=>json(notificationPreferencesSchema,'/notifications/preferences','GET',undefined,signal),
  saveNotificationPreferences:(input:z.input<typeof notificationPreferenceInputSchema>,signal?:AbortSignal)=>json(notificationPreferencesSchema,'/notifications/preferences','PUT',notificationPreferenceInputSchema.parse(input),signal),
  taskAlerts:(signal?:AbortSignal)=>json(taskAlertsSchema,'/tasks/alerts','GET',undefined,signal),
  taskPlanContext:(customer:string,id:string,signal?:AbortSignal)=>json(taskPlanContextSchema,`/customers/${z.string().uuid().parse(customer)}/tasks/${z.string().uuid().parse(id)}/plan`,'GET',undefined,signal),
  changeTaskPlan:(customer:string,id:string,input:z.infer<typeof taskPlanChangeSchema>,signal?:AbortSignal)=>json(crmTaskSchema,`/customers/${z.string().uuid().parse(customer)}/tasks/${z.string().uuid().parse(id)}/plan`,'PATCH',taskPlanChangeSchema.parse(input),signal),
  teamTasks:(input:z.input<typeof teamTasksQuerySchema>={},signal?:AbortSignal)=>{const q=teamTasksQuerySchema.parse(input);return json(teamTasksSchema,'/tasks/team'+query({date:q.date,state:q.state,assignee:q.assignee,search:q.search,page:String(q.page)}),'GET',undefined,signal);},
  myTasks:(input:z.input<typeof myTasksQuerySchema>={},signal?:AbortSignal)=>{const q=myTasksQuerySchema.parse(input);return json(myTasksSchema,'/tasks'+query({filter:q.filter,search:q.search,page:String(q.page)}),'GET',undefined,signal);},
  customerCrm:(id:string,signal?:AbortSignal)=>json(crmSummarySchema,`/customers/${z.string().uuid().parse(id)}/crm`,'GET',undefined,signal),
  saveCustomerOwner:(id:string,input:z.infer<typeof crmOwnerSaveSchema>,signal?:AbortSignal)=>json(crmSummarySchema,`/customers/${z.string().uuid().parse(id)}/crm`,'PUT',crmOwnerSaveSchema.parse(input),signal),
  customerNotes:(id:string,input:z.input<typeof crmNotesQuerySchema>={},signal?:AbortSignal)=>{const q=crmNotesQuerySchema.parse(input);return json(crmNotesSchema,`/customers/${z.string().uuid().parse(id)}/notes`+query({page:String(q.page),archived:q.archived}),'GET',undefined,signal);},
  saveCustomerNote:(id:string,input:z.infer<typeof crmNoteSaveSchema>,signal?:AbortSignal)=>json(crmNoteSchema,`/customers/${z.string().uuid().parse(id)}/notes`,'PUT',crmNoteSaveSchema.parse(input),signal),
  customerTasks:(id:string,input:z.input<typeof crmTasksQuerySchema>={},signal?:AbortSignal)=>{const q=crmTasksQuerySchema.parse(input);return json(crmTasksSchema,`/customers/${z.string().uuid().parse(id)}/tasks`+query({page:String(q.page),filter:q.filter}),'GET',undefined,signal);},
  saveCustomerTask:(id:string,input:z.infer<typeof crmTaskSaveSchema>,signal?:AbortSignal)=>json(crmTaskSchema,`/customers/${z.string().uuid().parse(id)}/tasks`,'PUT',crmTaskSaveSchema.parse(input),signal),
  progressCustomerTask:(id:string,taskId:string,input:z.infer<typeof crmTaskProgressSchema>,signal?:AbortSignal)=>json(crmTaskSchema,`/customers/${z.string().uuid().parse(id)}/tasks/${z.string().uuid().parse(taskId)}/progress`,'POST',crmTaskProgressSchema.parse(input),signal),
  publishCorrection:(id:string,round:number,input:z.infer<typeof correctionPublishSchema>,signal?:AbortSignal)=>json(correctionRoundSchema,`/work-orders/${z.string().uuid().parse(id)}/corrections/${z.number().int().min(1).max(100).parse(round)}/publish`,'POST',correctionPublishSchema.parse(input),signal),
  portalCorrections:(id:string,customer:string,signal?:AbortSignal)=>json(correctionHistorySchema,`/portal/handovers/${z.string().uuid().parse(id)}/corrections`+query({customer:z.string().uuid().parse(customer)}),'GET',undefined,signal),
  acknowledgeCorrection:(id:string,round:number,input:z.infer<typeof correctionReceiptInput>,signal?:AbortSignal)=>json(correctionReceiptResponse,`/portal/handovers/${z.string().uuid().parse(id)}/corrections/${z.number().int().min(1).max(100).parse(round)}/receipt`,'POST',correctionReceiptInput.parse(input),signal),
  downloadCorrectionPdf:async(id:string,round:number,customer?:string,signal?:AbortSignal)=>{z.string().uuid().parse(id);z.number().int().min(1).max(100).parse(round);if(customer)z.string().uuid().parse(customer);const response=await request(customer?`/portal/handovers/${id}/corrections/${round}/pdf`+query({customer}):`/work-orders/${id}/corrections/${round}/pdf`,'GET',undefined,signal);if(response.headers.get('Content-Type')?.split(';')[0]!=='application/pdf')throw new HvacApiError(502,'INVALID_RESPONSE','Nieprawidłowy dokument PDF.');return {blob:await response.blob(),filename:/filename="([A-Za-z0-9_.-]+)"/.exec(response.headers.get('Content-Disposition')||'')?.[1]||'Protokol.pdf',contentType:'application/pdf'};},
  handover:(id:string,signal?:AbortSignal)=>json(handoverContextSchema,'/work-orders/'+z.string().uuid().parse(id)+'/handover','GET',undefined,signal),
  saveHandover:(id:string,input:z.infer<typeof handoverSaveSchema>,signal?:AbortSignal)=>json(handoverRecordSchema,'/work-orders/'+z.string().uuid().parse(id)+'/handover','PUT',handoverSaveSchema.parse(input),signal),
  publishHandover:(id:string,input:z.infer<typeof handoverPublishSchema>,signal?:AbortSignal)=>json(handoverRecordSchema,'/work-orders/'+z.string().uuid().parse(id)+'/handover/publish','POST',handoverPublishSchema.parse(input),signal),
  portalHandover:(customer:string,id:string,signal?:AbortSignal)=>json(publicHandoverSchema,'/portal/handovers/'+z.string().uuid().parse(id)+query({customer:z.string().uuid().parse(customer)}),'GET',undefined,signal),
  acknowledgeHandover:(id:string,input:z.infer<typeof handoverAcknowledgeSchema>,signal?:AbortSignal)=>json(publicHandoverSchema,'/portal/handovers/'+z.string().uuid().parse(id)+'/receipt','POST',handoverAcknowledgeSchema.parse(input),signal),
  downloadHandoverPdf:async(id:string,customer?:string,signal?:AbortSignal)=>{z.string().uuid().parse(id);if(customer)z.string().uuid().parse(customer);const response=await request(customer?`/portal/handovers/${id}/pdf`+query({customer}):`/work-orders/${id}/handover/pdf`,'GET',undefined,signal);if(response.headers.get('Content-Type')?.split(';')[0]!=='application/pdf')throw new HvacApiError(502,'INVALID_RESPONSE','Nieprawidłowy dokument PDF.');return {blob:await response.blob(),filename:/filename="([A-Za-z0-9_.-]+)"/.exec(response.headers.get('Content-Disposition')||'')?.[1]||'Protokol.pdf',contentType:'application/pdf'};},
  workOrders:(input:{search?:string;state?:string;page?:number}={},signal?:AbortSignal)=>json(workOrderListSchema,'/work-orders'+query({search:input.search,state:input.state,page:input.page===undefined?undefined:String(input.page)}),'GET',undefined,signal),
  workOrder:(id:string,signal?:AbortSignal)=>json(workOrderSchema,'/work-orders/'+z.string().uuid().parse(id),'GET',undefined,signal),
  updateWorkAddress:(id:string,input:z.infer<typeof workOrderAddressSchema>,signal?:AbortSignal)=>json(workOrderSchema,'/work-orders/'+z.string().uuid().parse(id),'PATCH',workOrderAddressSchema.parse(input),signal),
  createWorkOrder:(input:z.infer<typeof workOrderCreateSchema>,signal?:AbortSignal)=>json(workOrderSchema,'/work-orders','POST',workOrderCreateSchema.parse(input),signal),
  scheduleWorkVisit:(id:string,input:z.infer<typeof workVisitSaveSchema>,signal?:AbortSignal)=>json(workOrderSchema,'/work-orders/'+z.string().uuid().parse(id)+'/visits','PUT',workVisitSaveSchema.parse(input),signal),
  changeWorkOrder:(id:string,input:z.infer<typeof workOrderChangeSchema>,signal?:AbortSignal)=>json(workOrderSchema,'/work-orders/'+z.string().uuid().parse(id)+'/state','POST',workOrderChangeSchema.parse(input),signal),
  changeWorkVisit:(id:string,visitId:string,input:z.infer<typeof workVisitChangeSchema>,signal?:AbortSignal)=>json(workOrderSchema,'/work-orders/'+z.string().uuid().parse(id)+'/visits/'+z.string().uuid().parse(visitId)+'/state','POST',workVisitChangeSchema.parse(input),signal),
  workOrderCalendar:(from:string,signal?:AbortSignal)=>json(workOrderCalendarSchema,'/work-orders/calendar'+query({from:z.string().date().parse(from)}),'GET',undefined,signal),
  portalWorkOrder:(customerId:string,publicationId:string,signal?:AbortSignal)=>json(publicWorkOrderSchema.nullable(),'/portal/offers/'+z.string().uuid().parse(publicationId)+'/work-order'+query({customer:z.string().uuid().parse(customerId)}),'GET',undefined,signal),
  offerPublications:(id:string,signal?:AbortSignal)=>json(staffPublicationsSchema,'/offers/'+z.string().uuid().parse(id)+'/publications','GET',undefined,signal),
  publishOffer:(id:string,input:z.infer<typeof publishOfferSchema>,signal?:AbortSignal)=>json(offerPublicationSchema,'/offers/'+z.string().uuid().parse(id)+'/publications','POST',publishOfferSchema.parse(input),signal),
  withdrawOffer:(id:string,signal?:AbortSignal)=>json(offerPublicationSchema,'/offer-publications/'+z.string().uuid().parse(id)+'/withdraw','POST',undefined,signal),
  portalOffers:(customerId:string,page=1,signal?:AbortSignal)=>json(portalOffersSchema,'/portal/offers'+query({customer:z.string().uuid().parse(customerId),page:String(z.number().int().min(1).max(100000).parse(page))}),'GET',undefined,signal),
  portalOffer:(customerId:string,id:string,signal?:AbortSignal)=>json(offerPublicationSchema,'/portal/offers/'+z.string().uuid().parse(id)+query({customer:z.string().uuid().parse(customerId)}),'GET',undefined,signal),
  acceptOffer:(id:string,input:z.infer<typeof acceptOfferSchema>,signal?:AbortSignal)=>json(offerPublicationSchema,'/portal/offers/'+z.string().uuid().parse(id)+'/accept','POST',acceptOfferSchema.parse(input),signal),
  downloadPublishedOfferPdf:async(customerId:string,id:string,signal?:AbortSignal)=>{
   const response=await request('/portal/offers/'+z.string().uuid().parse(id)+'/pdf'+query({customer:z.string().uuid().parse(customerId)}),'GET',undefined,signal);
   if(response.headers.get('Content-Type')?.split(';')[0]!=='application/pdf')throw new HvacApiError(502,'INVALID_RESPONSE','Nieprawidłowy dokument PDF.');
   return {blob:await response.blob(),filename:/filename="([A-Za-z0-9_.-]+)"/.exec(response.headers.get('Content-Disposition')||'')?.[1]||'Oferta.pdf',contentType:'application/pdf'};
  },
  companyProfile:(signal?:AbortSignal)=>json(companyProfileSchema.nullable(),'/company-profile','GET',undefined,signal),
  saveCompanyProfile:(input:z.input<typeof companyProfileSaveSchema>,signal?:AbortSignal)=>json(companyProfileSchema,'/company-profile','PUT',companyProfileSaveSchema.parse(input),signal),
  offerDocument:(id:string,signal?:AbortSignal)=>json(z.object({offerVersion:z.number().int().nonnegative(),document:savedOfferDocumentSchema.nullable()}).strict(),'/offers/'+z.string().uuid().parse(id)+'/document','GET',undefined,signal),
  saveOfferDocument:(id:string,input:z.infer<typeof offerDocumentSaveSchema>,signal?:AbortSignal)=>json(savedOfferDocumentSchema,'/offers/'+z.string().uuid().parse(id)+'/document','PUT',offerDocumentSaveSchema.parse(input),signal),
  downloadOfferPdf:async(id:string,offerVersion:number,documentVersion:number,signal?:AbortSignal)=>{
   z.string().uuid().parse(id);const version=z.number().int().nonnegative();version.parse(offerVersion);version.parse(documentVersion);
   const response=await request(`/offers/${id}/pdf`+query({offerVersion:String(offerVersion),documentVersion:String(documentVersion)}),'GET',undefined,signal);
   if(response.headers.get('Content-Type')?.split(';')[0]!=='application/pdf')throw new HvacApiError(502,'INVALID_RESPONSE','Nieprawidłowy dokument PDF.');
   const filename=/filename="([A-Za-z0-9_.-]+)"/.exec(response.headers.get('Content-Disposition')||'')?.[1]||'Oferta.pdf';
   return {blob:await response.blob(),filename,contentType:'application/pdf'};
  },
  downloadDocument:async(customerId:string,documentId:string,signal?:AbortSignal)=>{
   z.string().uuid().parse(customerId);z.string().uuid().parse(documentId);
   const response=await request(`/portal/documents/${documentId}/download`+query({customer:customerId}),'GET',undefined,signal);
   const disposition=response.headers.get('Content-Disposition')||'';let filename='dokument';
   const encoded=/filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];if(encoded){try{filename=decodeURIComponent(encoded);}catch{filename='dokument';}}
   // A downloaded name is display metadata. Native adapters must still choose a safe destination.
   filename=filename.replace(/[\\/\u0000-\u001f\u007f]/g,'_').slice(0,240)||'dokument';
   return {blob:await response.blob(),filename,contentType:response.headers.get('Content-Type')||'application/octet-stream'};
  },
 };
}
