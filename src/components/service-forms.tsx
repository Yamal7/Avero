'use client';
import { useOrganizationId } from '@/components/organization-context';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { assignTechnician, changeVisit, createTicket, findInstallations, saveProtocol, scheduleVisit, updateTicket } from '@/app/(dashboard)/dashboard/service/actions';
import { localDateTime } from '@/lib/service/dates';
import { priorityLabels, ticketLabels, type InstallationOption, type Priority, type Protocol, type ProtocolFields, type ServiceResult, type Technician, type TicketStatus, type Visit } from '@/lib/service/types';
function Feedback({ result }: { result: ServiceResult }) { return <>{result.error && <p className="error" role="alert">{result.error}</p>}{result.success && <p className="success" role="status">{result.success}</p>}</>; }
function useServiceOperation() {
  const [busy, setBusy] = useState(false), [result, setResult] = useState<ServiceResult>({});
  const router = useRouter();
  async function run(operation: () => Promise<ServiceResult>): Promise<ServiceResult> {
    setBusy(true); setResult({});
    try { const value = await operation(); setResult(value); if (value.success) router.refresh(); return value; }
    catch { const value = { error: 'Nie udało się potwierdzić operacji. Sprawdź aktualny stan przed ponowieniem.' }; setResult(value); return value; }
    finally { setBusy(false); }
  }
  return { busy, result, run };
}
export function NewServiceTicket({ options, selected, manager, requestId }: { options: InstallationOption[]; selected: string; manager: boolean; requestId: string }) {
  const organizationId = useOrganizationId();
  const [choices,setChoices]=useState(options), [installation,setInstallation]=useState(selected), [query,setQuery]=useState(''), [searching,setSearching]=useState(false);
  const { busy,result,run }=useServiceOperation(); const router=useRouter();
  async function search() { setSearching(true); try { const found=await findInstallations(query, organizationId); setChoices(found); if (!found.some(row=>row.id===installation)) setInstallation(''); } finally { setSearching(false); } }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const values=new FormData(event.currentTarget);
    const outcome=await run(()=>createTicket({ installationId:installation, subject:values.get('subject'), description:values.get('description'), priority:manager ? values.get('priority') : 'normal', requestId }, organizationId));
    if (outcome.id) router.push(`/dashboard/service/${outcome.id}`);
  }
  return <form onSubmit={submit}><fieldset className="import-fieldset" disabled={busy || searching}><div className="picker-search"><label>Szukaj instalacji<input value={query} onChange={e=>setQuery(e.target.value)} maxLength={200} placeholder="Klient, adres lub rodzaj instalacji" /></label><button type="button" className="secondary" onClick={search}>{searching?'Szukanie…':'Wyszukaj'}</button></div><label>Instalacja *<select value={installation} onChange={e=>setInstallation(e.target.value)} required><option value="">Wybierz instalację</option>{choices.map(row=><option key={row.id} value={row.id}>{row.label}</option>)}</select></label><p className="muted">Lista zawiera do 50 wyników. Jeśli nie ma instalacji, dodaj ją na karcie klienta lub poproś biuro o sprawdzenie przypisania.</p><div className="fields"><label>Temat *<input name="subject" maxLength={160} required placeholder="Np. Pompa ciepła nie ogrzewa budynku" /></label>{manager && <label>Priorytet<select name="priority" defaultValue="normal">{Object.entries(priorityLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>}</div><label>Opis problemu *<textarea name="description" required maxLength={10000} rows={6} placeholder="Opisz objawy, komunikaty urządzenia oraz kiedy wystąpił problem." /></label></fieldset><Feedback result={result} /><button disabled={busy || searching}>{busy?'Dodawanie…':'Dodaj zgłoszenie'}</button></form>;
}
export function TicketStatusForm({ id,status,priority,manager }: { id:string; status:TicketStatus; priority:Priority; manager:boolean }) {
  const organizationId = useOrganizationId();
  const operation=useServiceOperation();
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values=new FormData(event.currentTarget); operation.run(()=>updateTicket(id,String(values.get('status')),manager?String(values.get('priority')):priority, organizationId)); }
  return <form onSubmit={submit}><div className="fields"><label>Status<select name="status" defaultValue={status} disabled={operation.busy}>{Object.entries(ticketLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>{manager && <label>Priorytet<select name="priority" defaultValue={priority} disabled={operation.busy}>{Object.entries(priorityLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>}</div><Feedback result={operation.result} /><button className="secondary" disabled={operation.busy}>Zapisz status</button></form>;
}
export function AssignServiceTechnician({ id,assigned,technicians }: { id:string; assigned:string|null; technicians:Technician[] }) {
  const organizationId = useOrganizationId();
  const operation=useServiceOperation();
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value=String(new FormData(event.currentTarget).get('technician')||''); operation.run(()=>assignTechnician(id,value||null, organizationId)); }
  return <form onSubmit={submit}><label>Technik prowadzący<select name="technician" defaultValue={assigned||''} disabled={operation.busy}><option value="">Bez przydziału</option>{assigned && !technicians.some(t=>t.id===assigned) && <option value={assigned}>Obecny technik — dostęp nieaktywny</option>}{technicians.map(tech=><option key={tech.id} value={tech.id}>{tech.email}</option>)}</select></label><p className="muted">Wyświetlani są aktywni technicy z przypisaniem do tego klienta. Administrator zarządza przypisaniami w zakładce Użytkownicy.</p><Feedback result={operation.result} /><button className="secondary" disabled={operation.busy}>Zapisz przydział</button></form>;
}
export function ScheduleVisit({ ticketId,visit }: { ticketId:string; visit?:Visit }) {
  const organizationId = useOrganizationId();
  const operation=useServiceOperation();
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values=new FormData(event.currentTarget); operation.run(()=>scheduleVisit({ ticketId,visitId:visit?.id||null,localStart:values.get('start'),duration:Number(values.get('duration')),notes:String(values.get('notes')||'') }, organizationId)); }
  return <form onSubmit={submit}><div className="fields"><label>Termin — czas Warszawy *<input name="start" type="datetime-local" required defaultValue={visit?.scheduled_at?localDateTime(visit.scheduled_at):''} disabled={operation.busy} /></label><label>Czas trwania (minuty) *<input name="duration" type="number" min={15} max={480} required defaultValue={visit?.duration_minutes||60} disabled={operation.busy} /></label></div><label>Informacja dla klienta<textarea name="notes" rows={2} maxLength={4000} defaultValue={visit?.notes||''} disabled={operation.busy} placeholder="Np. Prosimy o dostęp do kotłowni." /></label><p className="muted">Termin wymaga przypisanego technika. Nakładające się wizyty są blokowane.</p><Feedback result={operation.result} /><button disabled={operation.busy}>{operation.busy?'Zapisywanie…':visit?'Zapisz nowy termin':'Zaplanuj wizytę'}</button></form>;
}
export function VisitActions({ visit,manager }: { visit:Visit; manager:boolean }) {
  const organizationId = useOrganizationId();
  const operation=useServiceOperation();
  return <div className="visit-actions"><Feedback result={operation.result} /><div className="button-group">{visit.status==='planned' && <button className="secondary" disabled={operation.busy} onClick={()=>operation.run(()=>changeVisit(visit.id,'en_route', organizationId))}>W drodze</button>}{['planned','en_route'].includes(visit.status) && <button disabled={operation.busy} onClick={()=>operation.run(()=>changeVisit(visit.id,'in_progress', organizationId))}>Rozpocznij wizytę</button>}</div>{manager && ['planned','en_route','in_progress'].includes(visit.status) && <details><summary>Odwołaj wizytę</summary><form onSubmit={e=>{e.preventDefault();operation.run(()=>changeVisit(visit.id,'cancelled', organizationId));}}><label className="checkbox access-confirm"><input type="checkbox" required disabled={operation.busy} />Potwierdzam odwołanie tej wizyty.</label><button className="secondary" disabled={operation.busy}>Odwołaj wizytę</button></form></details>}</div>;
}
export function ServiceProtocolForm({ visitId,protocol }: { visitId:string; protocol:Protocol|null }) {
  const organizationId = useOrganizationId();
  const operation=useServiceOperation(); const [confirmed,setConfirmed]=useState(false), [error,setError]=useState('');
  const fields: { name:keyof ProtocolFields; label:string; placeholder:string }[]=[{name:'diagnosis',label:'Diagnoza',placeholder:'Objawy, przyczyna i stan instalacji.'},{name:'work_performed',label:'Wykonane prace',placeholder:'Czynności wykonane podczas wizyty.'},{name:'materials',label:'Części i materiały',placeholder:'Nazwy, ilości i wymienione elementy.'},{name:'measurements',label:'Pomiary',placeholder:'Wartości i jednostki, np. temperatura zasilania 35°C.'},{name:'recommendations',label:'Zalecenia dla klienta',placeholder:'Zalecenia eksploatacyjne i dalsze czynności.'}];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();setError('');const native=event.nativeEvent as SubmitEvent;const publish=(native.submitter as HTMLButtonElement|null)?.value==='publish';
    if (publish && !confirmed) {setError('Potwierdź zatwierdzenie i udostępnienie protokołu klientowi.');return;}
    const values=new FormData(event.currentTarget);const data=Object.fromEntries(fields.map(field=>[field.name,String(values.get(field.name)||'')]));
    operation.run(()=>saveProtocol({visitId,version:protocol?.version||0,publish,fields:data}, organizationId));
  }
  return <form onSubmit={submit} className="protocol-form"><p className="muted">Wersja robocza jest widoczna wyłącznie dla biura i prowadzącego technika. Do zatwierdzenia wymagane są diagnoza i wykonane prace.</p>{fields.map(field=><label key={field.name}>{field.label}<textarea name={field.name} rows={3} maxLength={10000} defaultValue={protocol?.[field.name]||''} placeholder={field.placeholder} disabled={operation.busy} /></label>)}<Feedback result={operation.result} />{error && <p role="alert" className="error">{error}</p>}<label className="checkbox access-confirm"><input type="checkbox" checked={confirmed} disabled={operation.busy} onChange={e=>setConfirmed(e.target.checked)} />Potwierdzam wykonane prace. Zatwierdzony protokół zostanie udostępniony klientowi i nie będzie można go edytować.</label><div className="button-group"><button name="operation" value="draft" className="secondary" disabled={operation.busy}>Zapisz roboczo</button><button name="operation" value="publish" disabled={operation.busy}>Zatwierdź protokół i zakończ wizytę</button></div></form>;
}
export function ProtocolPrintButton({backHref='/dashboard/service'}:{backHref?:string}) { return <div className="button-group no-print"><button onClick={()=>window.print()}>Drukuj / zapisz jako PDF</button><Link className="button secondary" href={backHref}>Wróć do listy</Link></div>; }
