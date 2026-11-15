import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
export default async function TemplatesLayout({children}:{children:ReactNode}){
 const {access}=await requireSession();if(!['admin','office'].includes(access.role))redirect('/dashboard');return children;
}
