'use client';
/* Person categories in the Osoby table (design: Decyzyjny, Techniczny, Płatnik, Zarządca). Office edits contacts in place. */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { personCategoryLabels } from '@hvac/api-client';

type Cat = keyof typeof personCategoryLabels;
const tint: Record<Cat, string> = { decision: 'rgb(155, 107, 224)', technical: 'rgb(31, 167, 165)', payer: 'rgb(201, 138, 18)', manager: 'rgb(59, 130, 214)', individual: 'rgb(138, 143, 152)' };
export const personTint = (c: Cat) => `color-mix(in srgb, ${tint[c]} 16%, transparent 84%)`;
const chip = (c: Cat) => <span key={c} style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 6px', borderRadius: 6, background: personTint(c), color: 'var(--text-primary)', fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' }}>{personCategoryLabels[c]}</span>;

export function PersonCategories({ contactId, initial, editable }: { contactId: string | null; initial: Cat[]; editable: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false), [cats, setCats] = useState(initial), [err, setErr] = useState('');
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => { setCats(initial); }, [initial]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  async function toggle(c: Cat) {
    const next = cats.includes(c) ? cats.filter(x => x !== c) : [...cats, c]; setCats(next); setErr('');
    const r = await fetch(`/api/v1/contacts/${contactId}/categories`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categories: next }) });
    if (!r.ok) { setCats(cats); setErr('Nie udało się zapisać.'); return; }
    router.refresh();
  }
  const shown = cats.slice(0, 2), more = cats.slice(2);
  const content = <>{shown.map(chip)}{more.length > 0 && <span className="num" title={more.map(c => personCategoryLabels[c]).join(', ')} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>+{more.length}</span>}{!cats.length && <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</>;
  if (!editable || !contactId) return <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, overflow: 'hidden' }}>{content}</span>;
  return (
    <span ref={box} style={{ position: 'relative', display: 'flex', minWidth: 0 }}>
      <button type="button" className="prop" aria-expanded={open} title="Kategorie osoby" onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, height: 28, padding: '0 4px', border: 0, borderRadius: 8, background: 'transparent', overflow: 'hidden', minHeight: 0 }}>{content}</button>
      {open && <div role="listbox" aria-label="Kategorie osoby" aria-multiselectable="true" style={{ position: 'absolute', top: 32, left: 0, zIndex: 20, width: 220, padding: 4, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', border: '1px solid var(--edge)', borderRadius: 14, boxShadow: 'var(--shadow-pop)' }}>
        {(['decision', 'technical', 'payer', 'manager'] as Cat[]).map(c => { const on = cats.includes(c); return (
          <button key={c} type="button" role="option" aria-selected={on} className="prop" onClick={() => void toggle(c)} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', border: 0, borderRadius: 10, background: 'transparent', textAlign: 'left', minHeight: 0 }}>
            <span aria-hidden="true" style={{ width: 14, height: 14, flex: '0 0 auto', borderRadius: 5, border: `1px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`, background: on ? 'var(--accent)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-accent)' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" opacity={on ? 1 : 0}><path d="M20 6 9 17l-5-5" /></svg></span>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: tint[c] }} />{personCategoryLabels[c]}
          </button>); })}
        {err && <p role="alert" style={{ margin: 0, padding: '4px 8px', fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      </div>}
    </span>
  );
}
