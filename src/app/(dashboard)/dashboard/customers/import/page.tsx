import Link from 'next/link';
import { requireStaff } from '@/lib/auth';
import { CustomerImport } from '@/components/customer-import';
export default async function ImportCustomers() {
  await requireStaff();
  return <main><Link href="/dashboard/customers">← Klienci</Link><div className="page-heading"><div><p className="eyebrow">Przenieś swoją bazę</p><h1>Import klientów</h1><p>Wczytaj plik CSV, sprawdź dane i zatwierdź nowych klientów.</p></div><a className="button secondary" href="/examples/klienci-szablon.csv" download>Pobierz szablon CSV</a></div><CustomerImport /></main>;
}
