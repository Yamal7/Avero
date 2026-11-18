import Link from 'next/link';
import type { OfferPublication } from '@hvac/api-client';
import { Icon } from './icon';

export type OfferStep = 'pozycje' | 'warunki' | 'wysylka';
export type OfferStatus = { label: string; tone: 'draft' | 'progress' | 'success' | 'muted' };

/** Status shown in the offer header, derived from the newest customer publication. */
export function offerStatus(archived: boolean, publications: OfferPublication[]): OfferStatus {
  if (archived) return { label: 'Archiwalna', tone: 'muted' };
  const latest = [...publications].sort((a, b) => b.revision - a.revision)[0];
  if (!latest) return { label: 'Szkic', tone: 'draft' };
  if (latest.state === 'accepted') return { label: 'Zaakceptowana', tone: 'success' };
  if (latest.state === 'withdrawn') return { label: 'Wycofana', tone: 'muted' };
  if (latest.state === 'published') return latest.expired ? { label: 'Wygasła', tone: 'muted' } : { label: 'Udostępniona klientowi', tone: 'progress' };
  return { label: 'Szkic', tone: 'draft' };
}

export const offerStepHref = (id: string, step: OfferStep) => step === 'pozycje' ? `/dashboard/offers/${id}` : `/dashboard/offers/${id}/preview?step=${step}`;

/** Breadcrumb bar shared by every step of the offer wizard (design: Oferta · kreator). */
export function OfferCrumbs({ number, meta, children }: { number: string; meta?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="pui-page-head cv-head">
      <Icon name="offer" size={16} />
      <Link className="pui-page-sub rec-crumb" href="/dashboard/offers">Oferty</Link>
      <span className="pui-crumb-sep" aria-hidden="true"><Icon name="right" size={12} /></span>
      <h1 className="num">{number}</h1>
      {meta}
      <span className="pui-spacer" />
      {children && <div className="cv-actions">{children}</div>}
    </div>
  );
}

type Snapshot = { name: string; address: string | null; city: string | null; email: string | null; phone: string | null };

export function OfferTitle({ title, customerId, customer, workType, status, extra }: { title: React.ReactNode; customerId: string; customer: Snapshot; workType: string; status: OfferStatus; extra?: React.ReactNode }) {
  const place = [customer.address, customer.city].filter(Boolean).join(', ');
  return (
    <div className="of-title">
      <div className="of-title-main">
        {title}
        <div className="of-title-meta">
          <Link href={`/dashboard/customers/${customerId}`} title="Otwórz kartę klienta"><Icon name="building" size={14} />{customer.name}</Link>
          {place && <span><Icon name="place" size={14} />{place}</span>}
          <span><Icon name="tool" size={14} />{workType}</span>
        </div>
      </div>
      <div className="of-chips" aria-label="Właściwości oferty">
        <span className={`of-chip is-${status.tone}`} title="Status oferty"><span className="of-dot" aria-hidden="true" />{status.label}</span>
        {extra}
      </div>
    </div>
  );
}

export function OfferSteps({ id, customerId, customerName, current, positions, termsReady, published }: { id: string; customerId: string; customerName: string; current: OfferStep; positions: string; termsReady: boolean; published: boolean }) {
  const order: OfferStep[] = ['pozycje', 'warunki', 'wysylka'];
  const at = order.indexOf(current);
  const steps: { step: OfferStep; n: number; label: string; hint: string; done: boolean }[] = [
    { step: 'pozycje', n: 2, label: 'Warianty i pozycje', hint: positions, done: at > 0 },
    { step: 'warunki', n: 3, label: 'Warunki', hint: 'Ważność, płatność, termin prac', done: termsReady && at !== 1 },
    { step: 'wysylka', n: 4, label: 'Wysyłka', hint: 'PDF i udostępnienie w portalu klienta', done: published && at !== 2 },
  ];
  return (
    <nav className="of-steps" aria-label="Kroki kreatora oferty">
      <ol>
        <li><Link href={`/dashboard/customers/${customerId}`} className="is-done" title={customerName}><span className="of-step-mark" aria-hidden="true"><Icon name="check" size={12} /></span>Klient</Link></li>
        {steps.map(s => (
          <li key={s.step}>
            <span className="of-step-line" aria-hidden="true" />
            <Link href={offerStepHref(id, s.step)} aria-current={s.step === current ? 'step' : undefined} className={s.done ? 'is-done' : undefined} title={s.hint}>
              <span className="of-step-mark" aria-hidden="true">{s.done ? <Icon name="check" size={12} /> : s.n}</span>{s.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
