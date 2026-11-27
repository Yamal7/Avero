'use client';
import { useOrganizationId } from '@/components/organization-context';
import { useState,type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPortalTicket,findPortalInstallations } from '@/app/portal/actions';
import { portalHref } from '@/lib/portal/routes';
import type { InstallationOption,ServiceResult } from '@/lib/service/types';
export function PortalTicketForm({customerId,options,selected,requestId}:{customerId:string;options:InstallationOption[];selected:string;requestId:string}) {
  const organizationId = useOrganizationId();
 const [choices,setChoices]=useState(options),[installation,setInstallation]=useState(selected),[query,setQuery]=useState(''),[searching,setSearching]=useState(false),[busy,setBusy]=useState(false),[result,setResult]=useState<ServiceResult>({});const router=useRouter();
 async function search(){setSearching(true);try{const found=await findPortalInstallations(customerId,query, organizationId);setChoices(found);if(!found.some(row=>row.id===installation))setInstallation('');}finally{setSearching(false);}}
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const values=new FormData(event.currentTarget);setBusy(true);setResult({});
 try{const outcome=await createPortalTicket({customerId,installationId:installation,subject:values.get('subject'),description:values.get('description'),priority:'normal',requestId}, organizationId);setResult(outcome);if(outcome.id){router.push(portalHref(`/portal/service/${outcome.id}`,customerId));router.refresh();}}
 catch{setResult({error:'Nie udało się potwierdzić zapisu. Sprawdź listę zgłoszeń przed ponowieniem.'});}finally{setBusy(false);}}
 return <form onSubmit={submit} className="portal-card portal-ticket-form"><fieldset disabled={busy||searching} className="import-fieldset"><div className="picker-search"><label>Znajdź instalację<input value={query} onChange={e=>setQuery(e.target.value)} maxLength={200} placeholder="Adres lub rodzaj instalacji" /></label><button type="button" className="secondary" onClick={search}>{searching?'Szukanie…':'Szukaj'}</button></div><label>Której instalacji dotyczy problem? *<select value={installation} onChange={e=>setInstallation(e.target.value)} required><option value="">Wybierz instalację</option>{choices.map(row=><option key={row.id} value={row.id}>{row.label}</option>)}</select></label>{!choices.length&&<p className="muted">Brak pasujących instalacji. Poproś firmę o sprawdzenie danych lub zmień wyszukiwanie.</p>}<label>Co się dzieje? *<input name="subject" required maxLength={160} placeholder="Np. Urządzenie nie ogrzewa domu" /></label><label>Opisz problem *<textarea name="description" required maxLength={10000} rows={6} placeholder="Podaj objawy, komunikat urządzenia i czas wystąpienia problemu. Możesz też wskazać preferowane godziny kontaktu." /></label></fieldset>{result.error&&<p className="error" role="alert">{result.error}</p>}<p className="muted">Zgłoszenie trafi do firmy obsługującej Twoją instalację. Termin wizyty zostanie ustalony przez serwis.</p><button disabled={busy||searching}>{busy?'Wysyłanie…':'Wyślij zgłoszenie'}</button></form>;
}
