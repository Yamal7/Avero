import { notFound } from 'next/navigation';
import { z } from 'zod';
import { offerRecordSchema } from '@hvac/api-client';
import { requireStaff } from '@/lib/auth';
export async function getOffer(id:string){if(!z.string().uuid().safeParse(id).success)notFound();const {db}=await requireStaff(),result=await db.rpc('offer_detail',{p_id:id});if(result.error)throw new Error('Nie udało się pobrać oferty.');if(!result.data)notFound();return offerRecordSchema.parse(result.data);}
