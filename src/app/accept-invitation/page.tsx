import { AcceptInvitation } from '@/components/accept-invitation';
export default async function InvitationPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <main className="auth card"><p className="eyebrow">HVAC CRM</p><h1>Zaproszenie do programu</h1><AcceptInvitation id={id || ''} /></main>;
}
