'use client';
import { useOrganizationFetch } from '@/components/organization-context';
import { useRef,useState } from 'react';
import { RecordActions } from '@/components/record-actions';
import { useRouter } from 'next/navigation';
import { apiErrorSchema,documentSavedSchema,MAX_DOCUMENT_BYTES,type DocumentChange,type DocumentRow } from '@hvac/api-client';
import { documentLabels,formatFileSize } from '@/lib/documents/types';
import { displayDateTime } from '@/lib/service/dates';
async function save(organizationFetch: typeof fetch, path:string,method:string,body:FormData|DocumentChange){
 const response=await organizationFetch(path,{method,body:body instanceof FormData?body:JSON.stringify(body),headers:body instanceof FormData?undefined:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',redirect:'error'});
 const value=await response.json().catch(()=>null);
 if(!response.ok){const parsed=apiErrorSchema.safeParse(value);throw new Error(parsed.success?parsed.data.error.message:'Nie udało się wykonać operacji.');}
 if(!documentSavedSchema.safeParse(value).success)throw new Error('Nie udało się potwierdzić zapisu. Odśwież listę przed ponowieniem.');
}
export function DocumentUploadForm({installation,ticket}:{installation:string;ticket?:string}){
  const organizationFetch = useOrganizationFetch();
 const router=useRouter(),requestId=useRef<string|null>(null),[pending,setPending]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 return <form className="record-form document-upload" onSubmit={async event=>{
  event.preventDefault();if(pending)return;const form=event.currentTarget,data=new FormData(form),file=data.get('file');setError('');setMessage('');
  if(!(file instanceof File)||!file.size||file.size>MAX_DOCUMENT_BYTES){setError('Wybierz niepusty plik do 10 MB.');return;}
  requestId.current??=crypto.randomUUID();data.set('requestId',requestId.current);data.set('installationId',installation);if(ticket)data.set('ticketId',ticket);
  setPending(true);try{await save(organizationFetch, '/api/v1/documents','POST',data);requestId.current=null;form.reset();setMessage('Plik dodano jako wewnętrzny. Możesz udostępnić go klientowi na liście poniżej.');router.refresh();}catch(error){setError(error instanceof Error?error.message:'Nie udało się przesłać pliku.');}finally{setPending(false);}
 }}><p>PDF, JPG lub PNG, maksymalnie 10 MB. Nowy plik jest dostępny wyłącznie dla uprawnionych pracowników firmy.</p><div className="fields"><label>Plik<input type="file" name="file" required accept="application/pdf,image/jpeg,image/png" disabled={pending} onChange={()=>{requestId.current=null;setError('');setMessage('');}} /></label><label>Rodzaj<select name="documentType" disabled={pending} onChange={()=>{requestId.current=null;}}>{Object.entries(documentLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>{error&&<p className="error" role="alert">{error}</p>}{message&&<p className="success" role="status">{message}</p>}<button disabled={pending}>{pending?'Przesyłanie…':'Dodaj plik wewnętrzny'}</button></form>;
}
export function DocumentControls({document}:{document:DocumentRow}){
  const organizationFetch = useOrganizationFetch();
 const router=useRouter(),[pending,setPending]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 async function change(visible:boolean,archived:boolean){if(pending)return;setPending(true);setError('');setSuccess('');try{await save(organizationFetch, `/api/v1/documents/${document.id}`,'PATCH',{version:document.version,visible,archived});setSuccess(archived?'Plik zarchiwizowano.':visible?'Plik jest udostępniony klientowi.':'Plik jest dostępny tylko dla firmy.');router.refresh();}catch(error){setError(error instanceof Error?error.message:'Nie udało się zmienić pliku.');}finally{setPending(false);}}
 return <div className="document-controls"><div className="button-group">{document.archived_at?<button className="secondary" disabled={pending} onClick={()=>change(false,false)}>Przywróć jako wewnętrzny</button>:<><button className="secondary" disabled={pending} onClick={()=>change(!document.visible_to_customer,false)}>{document.visible_to_customer?'Cofnij udostępnienie':'Udostępnij klientowi'}</button><button className="secondary" disabled={pending} onClick={()=>change(false,true)}>Archiwizuj</button></>}</div>{error&&<p className="error" role="alert">{error}</p>}{success&&<p className="success" role="status">{success}</p>}</div>;
}
export function ManagedDocument({document,editable}:{document:DocumentRow;editable:boolean}){
 return <article className="managed-document"><div><h3>{document.file_name}</h3><p className="muted">{documentLabels[document.document_type]||'Dokument'} · {formatFileSize(document.byte_size)} · {displayDateTime(document.created_at)}</p><div className="button-group"><span className="badge">{document.archived_at?'Archiwalny':document.visible_to_customer?'Udostępniony klientowi':'Wewnętrzny'}</span>{document.ticket_id&&<span className="badge">Załącznik zgłoszenia</span>}{document.uploaded_by_client&&<span className="badge">Od klienta</span>}</div></div>{!document.archived_at&&<a className="button secondary" href={`/api/v1/documents/${document.id}/download`}>Pobierz</a>}{editable&&<DocumentControls document={document} />}</article>;
}

export function ManagedDocumentTable({documents,editable}:{documents:DocumentRow[];editable:boolean}){
 return <div className="list-table table-scroll"><table aria-label="Dokumenty instalacji"><thead><tr><th>Plik</th><th>Rodzaj</th><th>Dostęp</th><th>Rozmiar</th><th>Dodano</th><th><span className="sr-only">Działania</span></th></tr></thead><tbody>{documents.map(document=><tr key={document.id}><td><strong className="list-record-title">{document.file_name}</strong>{document.ticket_id&&<span className="list-record-subtitle">Załącznik zgłoszenia</span>}</td><td>{documentLabels[document.document_type]||'Dokument'}</td><td><span className="badge">{document.archived_at?'Archiwalny':document.visible_to_customer?'Udostępniony klientowi':'Wewnętrzny'}</span></td><td>{formatFileSize(document.byte_size)}</td><td>{displayDateTime(document.created_at)}</td><td className="list-actions"><RecordActions label={document.file_name}>{!document.archived_at&&<a href={`/api/v1/documents/${document.id}/download`}>Pobierz plik →</a>}{editable&&<DocumentControls document={document}/>}</RecordActions></td></tr>)}</tbody></table></div>;
}
