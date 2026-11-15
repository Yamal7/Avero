import Link from 'next/link';
import { notFound,redirect } from 'next/navigation';
import { z } from 'zod';
import { offerPublicationSchema } from '@hvac/api-client';
import { requireStaff } from '@/lib/auth';
import { WorkOrderCreate } from '@/components/work-order-create';
import { catalogMoney } from '@/lib/catalog/format';
export default async function NewWorkOrder({searchParams}:{searchParams:Promise<{publication?:string}>}){
 const {publication}=await searchParams;if(!z.string().uuid().safeParse(publication).success)notFound();const {db}=await requireStaff(),result=await db.rpc('work_order_source',{p_publication:publication});if(result.error)throw new Error('Nie udało się pobrać zaakceptowanej oferty.');if(!result.data)notFound();const source=z.object({publication:offerPublicationSchema,orderId:z.string().uuid().nullable()}).parse(result.data);if(source.orderId)redirect(`/dashboard/work-orders/${source.orderId}`);
 const p=source.publication,v=p.snapshot.variants.find(v=>v.id===p.selectedVariantId)!;
 return <main><div className="page-heading"><div><p className="eyebrow">REALIZACJA ZAAKCEPTOWANEJ OFERTY</p><h1>Nowe zlecenie</h1></div><Link className="button secondary" href={`/dashboard/offers/${p.offerId}/preview`}>Wróć do oferty</Link></div><section className="card"><h2>{p.snapshot.title}</h2><p>{p.snapshot.customer.name} · {p.snapshot.number} · wersja {p.revision}</p><p>Zaakceptowany wariant: <strong>{v.name}</strong><br/>Wartość: <strong>{catalogMoney(v.grossCents)} brutto</strong></p><p className="muted">Utworzenie zlecenia nie zmienia oferty. Terminy i ekipę zaplanujesz w następnym widoku.</p></section><WorkOrderCreate publicationId={p.id} address={p.snapshot.customer.address||''} city={p.snapshot.customer.city||''} postalCode={p.snapshot.customer.postalCode||''}/></main>;
}
