import Link from 'next/link';
import { requireStaff } from '@/lib/auth';
import { RecordForm } from '@/components/record-form';
export default async function NewCustomer() {
  await requireStaff();
  return <main><Link href="/dashboard/customers">← Klienci</Link><h1>Nowy klient</h1><section className="card"><RecordForm entity="customers" /></section></main>;
}
