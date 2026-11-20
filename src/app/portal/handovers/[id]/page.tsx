import { displayDateTime } from '@/lib/service/dates';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { publicHandoverSchema,correctionHistorySchema } from '@hvac/api-client';
import { requirePortalContext } from '@/lib/portal/context';
import { PortalContextPicker,PortalNoScope } from '@/components/portal-ui';
import { HandoverView } from '@/components/handover-view';
import { HandoverReceipt } from '@/components/handover-receipt';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{customer?:string}>}){
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();
 const {db,scope,choices}=await requirePortalContext((await searchParams).customer),picker=<PortalContextPicker scope={scope} choices={choices}/>;
 if(!scope.customer)return <>{picker}<PortalNoScope preview={scope.preview}/></>;
 const customer=scope.customer.id,r=await db.rpc('portal_handover',{p_customer:customer,p_id:id});
 if(r.error?.code==='42501'||!r.data)notFound();if(r.error)throw new Error('Nie udało się pobrać protokołu.');
 const report=publicHandoverSchema.parse(r.data),historyResult=await db.rpc('portal_corrections',{p_id:id,p_customer:customer});
 if(historyResult.error)throw new Error('Nie udało się pobrać historii odbiorów.');
 const history=correctionHistorySchema.parse(historyResult.data),canReceive=!scope.preview&&!scope.customer.archived_at;
 return <>{picker}<Link href={`/portal/documents?customer=${customer}`}>← Moje dokumenty</Link>
 {history.length>0&&<section><h1>Odbiór po poprawkach</h1><p className="muted">Najnowszy dokument jest na początku. Wcześniejsze protokoły i Twoje decyzje pozostają w historii.</p>{[...history].reverse().map((round,index)=><details key={round.round} className="portal-card" open={index===0}><summary>Runda {round.round} · {round.snapshot.number} · {round.receipt?round.receipt.state==='accepted'?'Odbiór potwierdzony':'Odbiór z uwagami':'Oczekuje na odbiór'}</summary><HandoverView snapshot={round.snapshot}/><a className="button secondary" href={`/api/v1/portal/handovers/${id}/corrections/${round.round}/pdf?customer=${customer}`}>Pobierz PDF tej rundy</a>{round.receipt?<><h3>{round.receipt.state==='accepted'?'Odbiór potwierdzony':'Odbiór z uwagami'}</h3><p>{displayDateTime(round.receipt.receivedAt)}</p><p className="offer-preview-note">{round.receipt.comment}</p></>:<><p>Oczekuje na ponowny odbiór</p>{canReceive&&<HandoverReceipt id={id} customer={customer} round={round.round}/>}</>}</details>)}</section>}
 <details className="portal-card" open={!history.length}><summary>Pierwszy protokół · {report.snapshot.number} · {report.receipt?report.receipt.state==='accepted'?'Odbiór potwierdzony':'Odbiór z uwagami':'Oczekuje na odbiór'}</summary><HandoverView snapshot={report.snapshot}/><section><a className="button secondary" href={`/api/v1/portal/handovers/${id}/pdf?customer=${customer}`}>Pobierz pierwszy protokół PDF</a><p className="muted">PDF zawiera treść zatwierdzoną przez firmę. Odbiór klienta jest zapisywany osobno.</p>{report.receipt&&<><h2>{report.receipt.state==='accepted'?'Odbiór potwierdzony':'Odbiór z uwagami'}</h2><p>{displayDateTime(report.receipt.receivedAt)}</p><p className="offer-preview-note">{report.receipt.comment}</p></>}</section>{!report.receipt&&canReceive&&<HandoverReceipt id={id} customer={customer}/>}</details></>;
}
