import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon, type IconName } from '@/components/icon';

// Modules that are in the navigation of the new design but are not built yet.
const modules: Record<string, { title: string; icon: IconName; text: string }> = {
  leady: { title: 'Leady', icon: 'userPlus', text: 'Nowe zapytania przed kwalifikacją: źródło, opiekun i następny krok.' },
  szanse: { title: 'Szanse', icon: 'target', text: 'Lejek sprzedaży: etapy, wartość szansy i planowany termin decyzji.' },
  obiekty: { title: 'Obiekty', icon: 'place', text: 'Lista lokalizacji klientów z urządzeniami i osobami odpowiedzialnymi.' },
  umowy: { title: 'Umowy', icon: 'contract', text: 'Umowy serwisowe: zakres, okres obowiązywania i cykle przeglądów.' },
  projekty: { title: 'Projekty', icon: 'stack', text: 'Większe realizacje złożone z wielu zleceń i zadań.' },
  faktury: { title: 'Faktury', icon: 'invoice', text: 'Rozliczenia zleceń, terminy płatności i należności.' },
  magazyn: { title: 'Magazyn', icon: 'archive', text: 'Stany, rezerwacje i dokumenty PZ / RW / WZ / MM, także w samochodach.' },
  zakupy: { title: 'Zakupy', icon: 'cart', text: 'Zapotrzebowanie i zamówienia do dostawców wynikające ze zleceń.' },
  raporty: { title: 'Raporty', icon: 'chart', text: 'Konwersja ofert, rentowność zleceń i terminowość serwisu.' },
};

export default async function SoonPage({ params }: { params: Promise<{ module: string }> }) {
  const entry = modules[(await params).module];
  if (!entry) notFound();
  return (
    <main className="pui-page">
      <div className="pui-page-head">
        <Icon name={entry.icon} size={16} />
        <h1>{entry.title}</h1>
        <span className="pui-spacer" />
        <span className="pui-page-meta">w przygotowaniu</span>
      </div>
      <div className="soon">
        <h2>Ten moduł jeszcze nie działa</h2>
        <p>{entry.text}</p>
        <p>Pozycja jest w nawigacji, żeby układ programu był kompletny. Dane pojawią się tutaj po wdrożeniu modułu.</p>
        <Link className="button secondary" href="/dashboard">Wróć do Mojego dnia</Link>
      </div>
    </main>
  );
}
