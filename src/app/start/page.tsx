import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { homeForRole } from '@/lib/portal/routes';
export default async function Start() {const {access}=await requireSession();redirect(homeForRole(access.role));}
