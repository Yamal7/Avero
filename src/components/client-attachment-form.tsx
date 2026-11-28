'use client';
import { useOrganizationFetch } from '@/components/organization-context';
import { useRef,useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiErrorSchema,documentSavedSchema,MAX_DOCUMENT_BYTES,CLIENT_ATTACHMENTS_PER_TICKET,CLIENT_ATTACHMENTS_PER_HOUR,CLIENT_ATTACHMENT_TICKET_BYTES } from '@hvac/api-client';
export function ClientAttachmentForm({customer,ticket}:{customer:string;ticket:string}){
  const organizationFetch = useOrganizationFetch();
 const router=useRouter(),requestId=useRef<string|null>(null),[pending,setPending]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 return <section className="portal-card"><h2>Dodaj zdjęcie lub dokument</h2><p>Plik będzie widoczny dla firmy i użytkowników mających dostęp do tego klienta. Możesz wybrać zdjęcie z telefonu lub dokument PDF.</p><form className="record-form document-upload" onSubmit={async event=>{
  event.preventDefault();if(pending)return;const form=event.currentTarget,data=new FormData(form),file=data.get('file');setError('');setSuccess('');
  if(!(file instanceof File)||!file.size||file.size>MAX_DOCUMENT_BYTES){setError('Wybierz niepusty plik do 10 MB.');return;}
  requestId.current??=crypto.randomUUID();data.set('customerId',customer);data.set('requestId',requestId.current);setPending(true);
  try{
   const response=await organizationFetch(`/api/v1/portal/service/${ticket}/attachments`,{method:'POST',body:data,credentials:'same-origin',cache:'no-store',redirect:'error'}),value=await response.json().catch(()=>null);
   if(!response.ok){const parsed=apiErrorSchema.safeParse(value);throw new Error(parsed.success?parsed.data.error.message:'Nie udało się przesłać pliku.');}
   if(!documentSavedSchema.safeParse(value).success)throw new Error('Nie udało się potwierdzić zapisu. Odśwież listę przed ponowieniem.');
   requestId.current=null;form.reset();setSuccess('Załącznik dodano do zgłoszenia. Firma ma do niego dostęp.');router.refresh();
  }catch(error){setError(error instanceof Error?error.message:'Nie udało się przesłać pliku.');}finally{setPending(false);}
 }}><label>Zdjęcie lub dokument<input type="file" name="file" required accept="image/jpeg,image/png,application/pdf" disabled={pending} onChange={()=>{requestId.current=null;setError('');setSuccess('');}} /></label><p className="muted">PDF, JPG lub PNG, do 10 MB na plik. Do {CLIENT_ATTACHMENTS_PER_TICKET} plików i {CLIENT_ATTACHMENT_TICKET_BYTES/(1024*1024)} MB na zgłoszenie; do {CLIENT_ATTACHMENTS_PER_HOUR} przesłań na godzinę. Limity uwzględniają rozpoczęte przesyłanie.</p>{error&&<p className="error" role="alert">{error}</p>}{success&&<p className="success" role="status">{success}</p>}<button disabled={pending}>{pending?'Przesyłanie…':'Dodaj załącznik'}</button></form></section>;
}
