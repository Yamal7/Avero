import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { companyProfileSchema, documentFromCompanyProfile, offerRecordSchema, offerWorkTypes, savedOfferDocumentSchema, staffPublicationsSchema, customerOfferPreview, catalogUnits, millsToQuantity } from '@hvac/api-client';
import { requireStaff } from '@/lib/auth';
import { Icon } from '@/components/icon';
import { OfferDocumentForm } from '@/components/offer-document-form';
import { OfferPublications } from '@/components/offer-publications';
import { OfferCrumbs, OfferSteps, OfferTitle, offerStatus, offerStepHref } from '@/components/offer-frame';
import { catalogMoney, catalogPercent } from '@/lib/catalog/format';

const dayLabel = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short' }).format(new Date(day + 'T12:00:00Z'));
const fullDay = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(day + 'T12:00:00Z'));

export default async function OfferPreview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ step?: string }> }) {
  const [{ id }, { step: stepParam }] = await Promise.all([params, searchParams]);
  if (!z.string().uuid().safeParse(id).success) notFound();
  const { db } = await requireStaff(), result = await db.rpc('offer_document_context', { p_id: id });
  if (result.error) throw new Error('Nie udało się odczytać podglądu.');
  if (!result.data) notFound();
  const context = z.object({ offer: offerRecordSchema, document: savedOfferDocumentSchema.nullable() }).parse(result.data);
  let defaults = null;
  if (!context.document) { const profile = await db.rpc('company_profile'); if (profile.error) throw new Error('Nie udało się odczytać profilu firmy.'); defaults = companyProfileSchema.nullable().parse(profile.data); }
  const record = context.offer, preview = customerOfferPreview(record);
  const history = await db.rpc('staff_offer_publications', { p_offer: id });
  if (history.error) throw new Error('Nie udało się odczytać historii udostępnień.');
  const publications = staffPublicationsSchema.parse(history.data).items;
  const step = stepParam === 'wysylka' || stepParam === 'warunki' ? stepParam : context.document ? 'wysylka' : 'warunki';
  const status = offerStatus(record.archived, publications), doc = context.document;
  const lineCount = record.variants.reduce((a, v) => a + v.lines.length, 0);

  return (
    <main className="list-page of-page">
      <OfferCrumbs number={preview.number} />
      <div className="of-head-row">
        <OfferTitle title={<h2 className="of-title-text">{record.title}</h2>} customerId={record.customerId} customer={record.customerSnapshot} workType={offerWorkTypes[record.workType]} status={status}
          extra={doc && <span className="of-chip" title={`Ważna do: ${fullDay(doc.data.validUntil)}`}><Icon name="calendar" size={14} />Ważna do {dayLabel(doc.data.validUntil)}</span>} />
        <div className="of-head-actions">
          {step === 'warunki'
            ? <><Link className="button secondary" href={offerStepHref(id, 'pozycje')}>Wróć do pozycji</Link>{doc ? <Link className="button" href={offerStepHref(id, 'wysylka')}>Dalej: wysyłka<Icon name="right" size={14} /></Link> : <span className="of-hint">Zapisz warunki, aby przejść dalej</span>}</>
            : <Link className="button secondary" href={offerStepHref(id, 'warunki')}>Wróć do warunków</Link>}
        </div>
      </div>
      <OfferSteps id={id} customerId={record.customerId} customerName={record.customerSnapshot.name} current={step} positions={`${record.variants.length} ${record.variants.length === 1 ? 'wariant' : 'warianty'} · ${lineCount} pozycji`} termsReady={doc !== null} published={publications.length > 0} />
      <div className="of-grid of-grid-wide">
        <div className="of-main">
          {step === 'warunki'
            ? <OfferDocumentForm key={`${id}:${doc?.version ?? 'new'}`} id={id} offerVersion={record.version} initial={doc?.data ?? documentFromCompanyProfile(defaults)} initialVersion={doc?.version ?? null} expanded />
            : <>
                {!doc && <p className="error" role="alert">Najpierw uzupełnij i zapisz warunki oferty. <Link href={offerStepHref(id, 'warunki')}>Przejdź do warunków</Link></p>}
                <OfferPublications id={id} customerId={record.customerId} customerName={record.customerSnapshot.name} title={record.title} offerVersion={record.version} documentVersion={doc?.version ?? null} archived={record.archived} documentDirty={doc === null} initial={publications} />
              </>}
        </div>
        <article className="of-side of-client" aria-label="Oferta tak, jak zobaczy ją klient">
          <div className="of-sec-head"><h3>Widok klienta</h3><span className="of-hint">Bez kosztów i notatek wewnętrznych</span></div>
          <header className="of-client-head"><p className="num">Oferta {preview.number}</p><h2>{preview.title}</h2><p>{preview.customer.name}<br />{preview.customer.address}{preview.customer.address && ', '}{preview.customer.postalCode} {preview.customer.city}</p></header>
          {preview.variants.map((v, i) => (
            <section key={v.id} className="of-client-variant">
              <div className="of-sec-head"><span className="of-letter">{String.fromCharCode(65 + i)}</span><h3>{v.name}</h3>{v.id === preview.mainVariantId && <span className="of-tag">Polecany</span>}</div>
              {v.note && <p className="of-client-note">{v.note}</p>}
              {v.lines.length ? <table className="of-client-table"><thead><tr><th>Pozycja</th><th className="of-n">Ilość</th><th className="of-n">VAT</th><th className="of-n">Brutto</th></tr></thead><tbody>{v.lines.map((l, k) => <tr key={k}><td>{l.name}{l.description && <span>{l.description}</span>}</td><td className="of-n num">{millsToQuantity(l.quantityMills)} {catalogUnits[l.unit]}</td><td className="of-n num">{catalogPercent(l.vatBasisPoints / 100)}</td><td className="of-n num">{catalogMoney(l.grossCents)}</td></tr>)}</tbody></table> : <p className="of-hint">Ten wariant nie ma jeszcze pozycji.</p>}
              <dl className="of-sum"><div><dt>Netto</dt><dd className="num">{catalogMoney(v.netCents)}</dd></div><div><dt>VAT</dt><dd className="num">{catalogMoney(v.vatCents)}</dd></div><div className="of-sum-total"><dt>Brutto</dt><dd className="num">{catalogMoney(v.grossCents)}</dd></div></dl>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
