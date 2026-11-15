import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireSession } from '@/lib/auth';
export default async function OffersLayout({children}:{children:ReactNode}){const {access}=await requireSession();if(!['admin','office'].includes(access.role))redirect('/dashboard');return children;}
