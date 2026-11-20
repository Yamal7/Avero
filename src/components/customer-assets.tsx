import Link from 'next/link';
import type { Customer } from '@/lib/data/crm';
import { RecordForm } from './record-form';
export function CustomerAssets({customer,editable}:{customer:Customer;editable:boolean}){const id=customer.id;return <>
    <h2>Lokalizacje i instalacje</h2>
    {!customer.locations.length && <p className="empty card">Ten klient nie ma jeszcze lokalizacji.</p>}
    {customer.locations.map(location => <section className="card" key={location.id}><p className="eyebrow">Lokalizacja</p><h2>{location.address}</h2><p>{location.postal_code} {location.city}</p>
      {editable && <details><summary>Edytuj adres</summary><RecordForm entity="locations" customerId={id} record={{ id: location.id, address: location.address, city: location.city, postal_code: location.postal_code }} /></details>}
      {!location.installations.length && <p className="muted">Brak instalacji.</p>}
      {location.installations.map(installation => <article className="installation" key={installation.id}><span className="badge">{({ active: 'Aktywna', inactive: 'Nieaktywna', archived: 'Archiwalna' } as Record<string, string>)[installation.status]}</span><h3>{installation.type}</h3><Link href={`/dashboard/service/new?installation=${installation.id}`}>Zgłoś serwis tej instalacji →</Link><p className="muted">Montaż: {installation.installed_on || 'Nie podano'}</p>
        {editable && <details><summary>Edytuj instalację</summary><RecordForm entity="installations" customerId={id} parentId={location.id} record={{ id: installation.id, type: installation.type, installed_on: installation.installed_on, status: installation.status }} /></details>}
        <p><Link href={`/dashboard/installations/${installation.id}/documents`}>Dokumenty instalacji →</Link> · <Link href={`/dashboard/maintenance?installation=${installation.id}&view=all`}>Plany przeglądów →</Link></p><h4>Urządzenia</h4>{!installation.devices.length && <p className="muted">Brak urządzeń.</p>}
        {installation.devices.map(device => <div className="device" key={device.id}><strong>{device.manufacturer} {device.model}</strong><p>Nr seryjny: {device.serial_number || '—'} · Gwarancja do: {device.warranty_until || '—'}</p>{editable && <details><summary>Edytuj urządzenie</summary><RecordForm entity="devices" customerId={id} parentId={installation.id} record={device} /></details>}</div>)}
        {editable && <details><summary>+ Dodaj urządzenie</summary><RecordForm entity="devices" customerId={id} parentId={installation.id} /></details>}
      </article>)}
      {editable && <details><summary>+ Dodaj instalację</summary><RecordForm entity="installations" customerId={id} parentId={location.id} /></details>}
    </section>)}
    {editable && <><details className="card"><summary>+ Dodaj lokalizację</summary><RecordForm entity="locations" customerId={id} /></details></>}

</>;}
