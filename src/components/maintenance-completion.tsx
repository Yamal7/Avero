'use client';
import { useOrganizationFetch } from '@/components/organization-context';
import { useRef,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiErrorSchema,maintenanceCompletionSavedSchema,nextMaintenanceDate,type MaintenancePlan,type MaintenanceProtocol } from '@hvac/api-client';
import { displayDateTime } from '@/lib/service/dates';
export function MaintenanceCompletionForm({plan,protocols}:{plan:MaintenancePlan;protocols:MaintenanceProtocol[]}){
  const organizationFetch = useOrganizationFetch();
 const router=useRouter(),requestId=useRef<string|null>(null),[selected,setSelected]=useState(''),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const protocol=protocols.find(item=>item.id===selected);let nextDue:string|null=null;try{if(protocol)nextDue=nextMaintenanceDate(protocol.performed_on,plan.interval_months);}catch{/* A date outside the supported range cannot be confirmed. */}
 if(!protocols.length)return <div><p>Nie ma dostępnych zatwierdzonych protokołów zakończonych wizyt tej instalacji.</p><p className="muted">Najpierw wykonaj wizytę i zatwierdź protokół. Wykorzystane oraz starsze od ostatniego wykonania protokoły nie są ponownie proponowane.</p><Link className="button secondary" href={`/dashboard/service/new?installation=${plan.installation_id}`}>Przejdź do nowego zgłoszenia</Link></div>;
 return <form className="record-form" onSubmit={async event=>{
  event.preventDefault();if(pending||!protocol||!nextDue||!confirmed)return;requestId.current??=crypto.randomUUID();setPending(true);setError('');setSuccess('');
  try{
   const response=await organizationFetch(`/api/v1/maintenance-plans/${plan.id}/complete`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:requestId.current,protocolId:protocol.id,version:plan.version,expectedNextDueOn:nextDue}),credentials:'same-origin',cache:'no-store',redirect:'error'}),data=await response.json().catch(()=>null);
   if(!response.ok){const parsed=apiErrorSchema.safeParse(data);throw new Error(parsed.success?parsed.data.error.message:'Nie udało się potwierdzić wykonania przeglądu.');}
   const parsed=maintenanceCompletionSavedSchema.safeParse(data);if(!parsed.success||parsed.data.planId!==plan.id||parsed.data.completionId!==requestId.current)throw new Error('Nie udało się potwierdzić zapisu. Odśwież historię przed ponowieniem.');
   setSuccess(`Wykonanie zapisano. Następny termin: ${parsed.data.nextDueOn}.`);requestId.current=null;setSelected('');setConfirmed(false);router.refresh();
  }catch(error){setError(error instanceof Error?error.message:'Nie udało się zapisać przeglądu.');}finally{setPending(false);}
 }}><fieldset className="import-fieldset" disabled={pending}><label>Zatwierdzony protokół<select required value={selected} onChange={event=>{setSelected(event.target.value);setConfirmed(false);requestId.current=null;setError('');setSuccess('');}}><option value="">Wybierz protokół zakończonej wizyty</option>{protocols.map(item=><option key={item.id} value={item.id}>PS-{String(item.protocol_number).padStart(6,'0')} · {item.performed_on} · #{item.ticket_number} · {item.subject}</option>)}</select></label>
 {protocol&&<><p><Link target="_blank" rel="noopener noreferrer" href={`/dashboard/service/protocols/${protocol.id}`}>Otwórz protokół PS-{String(protocol.protocol_number).padStart(6,'0')} →</Link></p><dl className="completion-preview"><div><dt>Wykonano według zakończonej wizyty</dt><dd>{displayDateTime(protocol.completed_at)}</dd></div><div><dt>Dotychczasowy termin planu</dt><dd>{plan.next_due_on}</dd></div><div><dt>Cykl planu</dt><dd>{plan.interval_months} miesięcy</dd></div><div><dt>Proponowany następny termin</dt><dd><strong>{nextDue||'Data poza obsługiwanym zakresem'}</strong></dd></div></dl><p className="muted">Nowy termin wynika z daty wykonania i cyklu planu. Może być wcześniejszy lub późniejszy od dotychczasowego terminu. Wizyta nie rezerwuje się automatycznie.</p><label className="checkbox"><input type="checkbox" required checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} /> Protokół potwierdza wykonanie przeglądu „{plan.title}” i zatwierdzam pokazany następny termin.</label></>}
 </fieldset>{error&&<p className="error" role="alert">{error}</p>}{success&&<p className="success" role="status">{success}</p>}<button disabled={pending||!confirmed||!nextDue}>{pending?'Zapisywanie…':'Potwierdź wykonanie i ustaw termin'}</button></form>;
}
