'use client';
/* Category chips of a customer (design: Karta firmy). Office adds and removes; everyone else sees the chips. */
import { useOrganizationFetch } from '@/components/organization-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerCategorySchema } from '@hvac/api-client';

import { categoryTint } from '@/lib/crm/category-colors';

export function CustomerCategories({ customer, initial, editable, colors }: { customer: string; initial: string[]; editable: boolean; colors?: Record<string, string> }) {
  const organizationFetch = useOrganizationFetch();
  const router = useRouter();
  const [items, setItems] = useState(initial), [adding, setAdding] = useState(false), [draft, setDraft] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function save(next: string[]) {
    setBusy(true); setError('');
    try {
      const r = await organizationFetch(`/api/v1/customers/${customer}/categories`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categories: next }) }), body = await r.json();
      if (!r.ok) throw new Error(body.error?.message || 'Nie udało się zapisać kategorii.');
      setItems(body as string[]); setDraft(''); setAdding(false); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się zapisać kategorii.'); } finally { setBusy(false); }
  }
  function add(e: React.FormEvent) {
    e.preventDefault();
    const v = customerCategorySchema.safeParse(draft);
    if (!v.success) { setError('Kategoria ma od 1 do 40 znaków.'); return; }
    if (items.length >= 8) { setError('Klient może mieć najwyżej 8 kategorii.'); return; }
    void save([...items, v.data]);
  }
  if (!items.length && !editable) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
      {items.map(cat => (
        <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 20, padding: editable ? '0 2px 0 6px' : '0 6px', borderRadius: 6, background: categoryTint(cat, colors), color: 'var(--text-primary)', fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' }}>
          {cat}
          {editable && <button type="button" aria-label={`Usuń kategorię ${cat}`} title="Usuń" disabled={busy} onClick={() => void save(items.filter(x => x !== cat))} style={{ width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 0, borderRadius: 4, background: 'transparent', color: 'var(--text-tertiary)', minHeight: 0 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button>}
        </span>
      ))}
      {editable && !adding && items.length < 8 && (
        <button type="button" className="ghost" title="Dodaj kategorię" onClick={() => setAdding(true)} style={{ height: 20, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 6px', border: '1px dashed var(--border)', borderRadius: 6, color: 'var(--text-tertiary)', fontSize: 12, minHeight: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14" /></svg>Kategoria
        </button>
      )}
      {editable && adding && (
        <form onSubmit={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <label htmlFor="new-category" className="vh">Nowa kategoria</label>
          <input id="new-category" autoFocus value={draft} maxLength={40} disabled={busy} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') { setAdding(false); setDraft(''); } }} placeholder="np. Chłodnictwo" style={{ width: 140, height: 20, minHeight: 0, padding: '0 6px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', boxShadow: 'none', font: 'inherit', fontSize: 12, color: 'var(--text-primary)' }} />
        </form>
      )}
      {error && <span role="alert" style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}
