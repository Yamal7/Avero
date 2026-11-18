'use client';
import { useActionState } from 'react';
import { saveRecord, archiveCustomer } from '@/app/(dashboard)/dashboard/actions';
import type { Entity, FormState } from '@/lib/validation/crm';

type Field = { name: string; label: string; type?: string; required?: boolean; max?: number; options?: [string, string][] };
const fields: Record<Entity, Field[]> = {
  customers: [{ name: 'name', label: 'Nazwa klienta', required: true, max: 200 }, { name: 'type', label: 'Typ klienta', options: [['individual', 'Osoba prywatna'], ['company', 'Firma']] }, { name: 'email', label: 'E-mail', type: 'email', max: 320 }, { name: 'phone', label: 'Telefon', type: 'tel', max: 40 }, { name: 'tax_id', label: 'NIP', max: 40 }, { name: 'payment_terms', label: 'Warunki płatności', max: 80 }],
  locations: [{ name: 'address', label: 'Ulica i numer', required: true, max: 300 }, { name: 'city', label: 'Miejscowość', required: true, max: 100 }, { name: 'postal_code', label: 'Kod pocztowy', max: 20 }],
  installations: [{ name: 'type', label: 'Rodzaj instalacji', required: true, max: 100 }, { name: 'installed_on', label: 'Data montażu', type: 'date' }, { name: 'status', label: 'Status', options: [['active', 'Aktywna'], ['inactive', 'Nieaktywna'], ['archived', 'Archiwalna']] }],
  devices: [{ name: 'manufacturer', label: 'Producent', required: true, max: 100 }, { name: 'model', label: 'Model', max: 200 }, { name: 'serial_number', label: 'Numer seryjny', max: 200 }, { name: 'warranty_until', label: 'Gwarancja do', type: 'date' }],
};

export function RecordForm({ entity, record = {}, customerId, parentId }: { entity: Entity; record?: Record<string, string | null>; customerId?: string; parentId?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveRecord, {});
  return <form action={action} className="record-form">
    <input type="hidden" name="_entity" value={entity} />
    <input type="hidden" name="_id" value={record.id || ''} />
    <input type="hidden" name="_customer" value={customerId || ''} />
    <input type="hidden" name="_parent" value={parentId || ''} />
    <div className="fields">{fields[entity].map(field => <label key={field.name}>{field.label}
      {field.options ? <select name={field.name} defaultValue={record[field.name] || field.options[0][0]}>{field.options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
        : <input name={field.name} type={field.type || 'text'} defaultValue={record[field.name] || ''} required={field.required} maxLength={field.max} />}
    </label>)}</div>
    {state.error && <p role="alert" className="error">{state.error}</p>}
    {state.success && <p role="status" className="success">{state.success}</p>}
    <button disabled={pending}>{pending ? 'Zapisywanie…' : record.id ? 'Zapisz zmiany' : 'Dodaj'}</button>
  </form>;
}

export function ArchiveForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(archiveCustomer, {});
  return <form action={action} className="archive"><input type="hidden" name="_id" value={id} />
    <p>Archiwizacja ukryje klienta na liście. Historia instalacji zostanie zachowana.</p>
    <label className="checkbox"><input type="checkbox" required /> Chcę zarchiwizować tego klienta</label>
    {state.error && <p role="alert">{state.error}</p>}
    <button className="secondary" disabled={pending}>Archiwizuj klienta</button>
  </form>;
}
