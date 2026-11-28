'use client';
import { apiErrorSchema,offerDetailSchema,offerSaveSchema,type OfferSave } from '@hvac/api-client';
export async function persistOffer(input:OfferSave, organizationFetch: typeof fetch = fetch){
 const parsed=offerSaveSchema.safeParse(input);if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||'Sprawdź dane oferty.');
 const response=await organizationFetch('/api/v1/offers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed.data),credentials:'same-origin',cache:'no-store',redirect:'error'}),body=await response.json().catch(()=>null);
 if(!response.ok){const error=apiErrorSchema.safeParse(body);throw new Error(error.success?error.data.error.message:'Nie udało się zapisać oferty.');}
 const data=offerDetailSchema.safeParse(body);if(!data.success)throw new Error('Nie udało się potwierdzić zapisu. Sprawdź listę ofert przed ponowieniem.');return data.data.offer;
}
