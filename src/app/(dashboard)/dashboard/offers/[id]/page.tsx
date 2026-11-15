import { getOffer } from '@/lib/offers/data';
import { OfferEditor } from '@/components/offer-editor';
export default async function OfferPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <OfferEditor initial={await getOffer(id)}/>;}
