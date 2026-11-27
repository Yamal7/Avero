import { getTaskAlerts } from '@/lib/data/task-alerts';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireSession } from '@/lib/auth';
import { OrganizationProvider } from '@/components/organization-context';
import { AppShell } from '@/components/app-shell';
import { activeOrganization, organizationsSchema, staffOrganizations } from '@hvac/api-client';
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { db, user, access } = await requireSession();
  if (access.role === 'client') redirect('/portal');
  const [plans,urgent,tasks,orgs]=await Promise.all([db.rpc('maintenance_schedule'),db.from('service_tickets').select('id',{count:'exact',head:true}).neq('status','closed').eq('priority','high'),getTaskAlerts(),db.rpc('my_organizations')]);
  if(plans.error||urgent.error)throw new Error('Nie udało się pobrać alertów.');
  const metadata=user.user_metadata||{},candidate=metadata.full_name||metadata.display_name||metadata.name;
  // M0.1: nazwa firmy w ramie = aktywna organizacja (dla każdej roli); lista firm zasila przełącznik.
  // Przełącznik pokazuje tylko firmy, w których osoba jest pracownikiem — firmy portalu (rola client) obsługuje /portal.
  const parsedOrgs=orgs.error?null:organizationsSchema.safeParse(orgs.data),allOrganizations=parsedOrgs?.success?parsedOrgs.data:[];
  if (!parsedOrgs?.success) throw new Error('Nie udało się odczytać aktywnej firmy.');
  const active = activeOrganization(allOrganizations);
  if (!active) throw new Error('Brakuje aktywnej firmy.');
  const companyName=active.name,organizations=staffOrganizations(allOrganizations);
  const displayName=typeof candidate==='string'&&candidate.trim()?candidate.trim().slice(0,80):(user.email?.split('@')[0]||'Użytkownik');
  return <OrganizationProvider key={active.id} id={active.id}><AppShell companyName={companyName} organizations={organizations} taskAlerts={tasks} role={access.role} email={user.email||''} displayName={displayName} alerts={{overdue:Number(plans.data?.summary?.overdue||0),upcoming:Number(plans.data?.summary?.upcoming||0),urgent:urgent.count||0}}>{children}</AppShell></OrganizationProvider>;
}
