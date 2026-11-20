import { z } from 'zod';
import { savedOfferDocumentSchema, staffPublicationsSchema } from '@hvac/api-client';
import { getOffer } from '@/lib/offers/data';
import { requireStaff } from '@/lib/auth';
import { OfferEditor } from '@/components/offer-editor';
import { offerStatus } from '@/components/offer-frame';

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOffer(id);
  const { db } = await requireStaff();
  const [history, context] = await Promise.all([db.rpc('staff_offer_publications', { p_offer: id }), db.rpc('offer_document_context', { p_id: id })]);
  if (history.error) throw new Error('Nie udało się odczytać historii udostępnień.');
  if (context.error) throw new Error('Nie udało się odczytać warunków oferty.');
  const publications = staffPublicationsSchema.parse(history.data).items;
  const document = z.object({ document: savedOfferDocumentSchema.nullable() }).passthrough().parse(context.data).document;
  return <OfferEditor initial={offer} status={offerStatus(offer.archived, publications)} termsReady={document !== null} published={publications.length > 0} />;
}
