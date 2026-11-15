'use client';
import { useState } from 'react';
import type { OfferDocument,OfferPublication } from '@hvac/api-client';
import { OfferDocumentForm } from './offer-document-form';
import { OfferPublications } from './offer-publications';
export function OfferDelivery({id,customerId,customerName,title,offerVersion,initial,documentVersion,archived,publications}:{id:string;customerId:string;customerName:string;title:string;offerVersion:number;initial:OfferDocument;documentVersion:number|null;archived:boolean;publications:OfferPublication[]}){
 const [dirty,setDirty]=useState(documentVersion===null);
 return <><OfferDocumentForm id={id} offerVersion={offerVersion} initial={initial} initialVersion={documentVersion} onDirtyChange={setDirty}/><OfferPublications id={id} customerId={customerId} customerName={customerName} title={title} offerVersion={offerVersion} documentVersion={documentVersion} archived={archived} documentDirty={dirty} initial={publications}/></>;
}
