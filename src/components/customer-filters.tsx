'use client';
/* Firmy i osoby — sort and filter bar from the design (Firmy · filtr kategorii): sort button, category filter chip with a
   popover (Którakolwiek / Wszystkie / Żadna, search, colour dots, counts) and „Zarządzaj” for category colours. */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { customerCategoryColors, type CustomerCategoryList } from '@hvac/api-client';
import { categoryColor, categoryColorNames, categoryPalette, categoryTint, colorMap, type CategoryColorKey } from '@/lib/crm/category-colors';

type Mode = 'any' | 'all' | 'none';
const sv = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, style: { flex: '0 0 auto' } };
const modeLabel: Record<Mode, string> = { any: 'którakolwiek z', all: 'wszystkie z', none: 'żadna z' };
const pop: CSSProperties = { position: 'absolute', top: 32, left: 0, zIndex: 20, width: 288, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', border: '1px solid var(--edge)', borderRadius: 14, boxShadow: 'var(--shadow-pop)' };
const ghost: CSSProperties = { height: 28, padding: '0 8px', border: 0, borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 0 };

export function CustomerFilters({ base, categories, selected, mode, sort, manage }: { base: Record<string, string>; categories: CustomerCategoryList; selected: string[]; mode: Mode; sort: 'name' | 'last_contact'; manage: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState<null | 'filter' | 'sort' | 'manage'>(null), [query, setQuery] = useState('');
  const [pick, setPick] = useState(selected), [m, setM] = useState<Mode>(mode);
  const box = useRef<HTMLDivElement>(null);
  const colors = colorMap(categories);
  useEffect(() => { setPick(selected); setM(mode); }, [selected, mode]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) close(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  });
  useEffect(() => {
    const k = (e: KeyboardEvent) => { const t = e.target as HTMLElement; if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable) { e.preventDefault(); setOpen('filter'); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  function go(next: { cats?: string[]; mode?: Mode; sort?: string }) {
    const p = new URLSearchParams(base);
    const cats = next.cats ?? pick, md = next.mode ?? m, st = next.sort ?? sort;
    p.delete('page'); p.delete('cat'); p.delete('mode'); p.delete('sort');
    cats.forEach(c => p.append('cat', c));
    if (cats.length && md !== 'any') p.set('mode', md);
    if (st !== 'name') p.set('sort', st);
    router.push(`/dashboard/customers?${p}`);
  }
  function close() { if (open === 'filter' && (pick.join('\u0000') !== selected.join('\u0000') || m !== mode)) go({}); setOpen(null); }
  const shown = categories.filter(c => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div ref={box} style={{ display: 'contents' }}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <button type="button" className="sec" title="Zmień sortowanie" aria-expanded={open === 'sort'} onClick={() => setOpen(open === 'sort' ? null : 'sort')} style={{ height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 8px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 12, minHeight: 0 }}>
          <svg {...sv} style={{ flex: '0 0 auto', color: 'var(--text-tertiary)' }}><path d="M3 6h13M3 12h9M3 18h5M17 10v10M14 17l3 3 3-3" /></svg><span style={{ color: 'var(--text-secondary)' }}>Sortuj:</span><span style={{ fontWeight: 500 }}>{sort === 'last_contact' ? 'Ostatni kontakt' : 'Nazwa'}</span>
        </button>
        {open === 'sort' && <div role="menu" aria-label="Sortowanie" style={{ ...pop, width: 200, padding: 4 }}>
          {([['name', 'Nazwa'], ['last_contact', 'Ostatni kontakt']] as const).map(([v, l]) => <button key={v} type="button" role="menuitemradio" aria-checked={sort === v} className="prop" onClick={() => { setOpen(null); go({ sort: v }); }} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', border: 0, borderRadius: 10, background: 'transparent', textAlign: 'left', fontWeight: sort === v ? 500 : 400, minHeight: 0 }}>{l}</button>)}
        </div>}
      </span>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        {selected.length > 0
          ? <span style={{ display: 'inline-flex', alignItems: 'center', height: 28, border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 12, overflow: 'hidden' }}>
              <button type="button" className="prop" aria-expanded={open === 'filter'} onClick={() => setOpen(open === 'filter' ? null : 'filter')} style={{ height: 26, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 8px', border: 0, background: 'transparent', minHeight: 0 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kategoria</span><span style={{ color: 'var(--text-tertiary)' }}>{modeLabel[mode]}</span>
                {selected.slice(0, 2).map(c => <span key={c} style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 6px', borderRadius: 6, background: categoryTint(c, colors), color: 'var(--text-primary)' }}>{c}</span>)}
                {selected.length > 2 && <span className="num" title={selected.slice(2).join(', ')} style={{ color: 'var(--text-secondary)' }}>+{selected.length - 2}</span>}
              </button>
              <button type="button" className="ib" aria-label="Usuń filtr kategorii" title="Usuń filtr" onClick={() => { setPick([]); go({ cats: [] }); }} style={{ width: 24, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: 0, background: 'transparent', color: 'var(--text-tertiary)', padding: 0, minHeight: 0 }}><svg {...sv} width={12} height={12} strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            </span>
          : <button type="button" className="ghost" title="Dodaj filtr  F" aria-expanded={open === 'filter'} onClick={() => setOpen(open === 'filter' ? null : 'filter')} style={ghost}><svg {...sv}><path d="M5 12h14M12 5v14" /></svg>Filtr</button>}
        {open === 'filter' && (
          <div role="dialog" aria-label="Filtr: kategoria" style={pop}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 8px 4px' }}>
              <div role="radiogroup" aria-label="Warunek" style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 10, background: 'var(--bg-subtle)' }}>
                {([['any', 'Którakolwiek'], ['all', 'Wszystkie'], ['none', 'Żadna']] as const).map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={m === v} onClick={() => setM(v)} style={{ flex: '1 1 0', height: 24, border: 0, borderRadius: 8, background: m === v ? 'var(--bg-surface)' : 'transparent', color: m === v ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: m === v ? 500 : 400, minHeight: 0 }}>{l}</button>)}
              </div>
              <label htmlFor="kat-szukaj" className="vh">Szukaj kategorii</label>
              <span style={{ position: 'relative', display: 'flex' }}><span style={{ position: 'absolute', left: 8, top: 8, display: 'inline-flex', color: 'var(--text-tertiary)' }}><svg {...sv} width={16} height={16}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></span><input id="kat-szukaj" autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj…" style={{ width: '100%', height: 32, minHeight: 0, padding: '0 8px 0 30px', border: 0, borderRadius: 10, background: 'var(--bg-raised)', font: 'inherit', color: 'var(--text-primary)', boxShadow: 'none' }} /></span>
            </div>
            <div role="listbox" aria-label="Kategorie" aria-multiselectable="true" style={{ display: 'flex', flexDirection: 'column', padding: 4, maxHeight: 320, overflowY: 'auto' }}>
              {shown.map(k => { const on = pick.some(p => p.toLowerCase() === k.name.toLowerCase()); return (
                <button key={k.name} type="button" role="option" aria-selected={on} className="prop" onClick={() => setPick(on ? pick.filter(p => p.toLowerCase() !== k.name.toLowerCase()) : [...pick, k.name])} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', border: 0, borderRadius: 10, background: 'transparent', textAlign: 'left', minHeight: 0 }}>
                  <span aria-hidden="true" style={{ width: 14, height: 14, flex: '0 0 auto', borderRadius: 5, border: `1px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`, background: on ? 'var(--accent)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-accent)' }}><svg {...sv} width={10} height={10} strokeWidth={3} opacity={on ? 1 : 0}><path d="M20 6 9 17l-5-5" /></svg></span>
                  <span aria-hidden="true" style={{ width: 8, height: 8, flex: '0 0 auto', borderRadius: '50%', background: categoryColor(k.name, colors) }} />
                  <span className="ell" style={{ flex: '1 1 auto' }}>{k.name}</span><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{k.count}</span>
                </button>); })}
              {!shown.length && <p style={{ margin: 0, padding: '8px', fontSize: 12, color: 'var(--text-secondary)' }}>{categories.length ? 'Brak pasujących kategorii.' : 'Żaden klient nie ma jeszcze kategorii. Dodasz je na karcie firmy.'}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px' }}>
              <button type="button" className="ghost" onClick={() => { setPick([]); setM('any'); }} style={ghost}>Wyczyść</button>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                {manage && <button type="button" className="ghost" title="Zarządzaj kategoriami: nazwy i kolory" onClick={() => setOpen('manage')} style={ghost}><svg {...sv}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>Zarządzaj</button>}
                <button type="button" className="pri" onClick={close} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 12, fontWeight: 500, minHeight: 0 }}>Zastosuj</button>
              </span>
            </div>
          </div>
        )}
        {open === 'manage' && <ManageCategories categories={categories} colors={colors} onClose={() => setOpen(null)} onSaved={() => router.refresh()} />}
      </span>
    </div>
  );
}

function ManageCategories({ categories, colors, onClose, onSaved }: { categories: CustomerCategoryList; colors: Record<string, string>; onClose: () => void; onSaved: () => void }) {
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [names, setNames] = useState<Record<string, string>>({});
  async function save(name: string, color: CategoryColorKey, rename?: string) {
    setBusy(name); setErr('');
    try {
      const r = await fetch('/api/v1/customer-categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color, ...(rename && rename.trim() !== name ? { rename: rename.trim() } : {}) }) });
      if (!r.ok) throw new Error((await r.json()).error?.message || 'Nie udało się zapisać kategorii.');
      onSaved();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Nie udało się zapisać kategorii.'); } finally { setBusy(''); }
  }
  return (
    <div role="dialog" aria-label="Zarządzaj kategoriami" style={{ ...pop, width: 360, padding: 8, gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 4px 8px' }}><h2 style={{ flex: '1 1 auto', margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 600 }}>Kategorie</h2><button type="button" className="ib" aria-label="Zamknij" onClick={onClose} style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--text-secondary)', padding: 0, minHeight: 0 }}><svg {...sv}><path d="M18 6 6 18M6 6l12 12" /></svg></button></div>
      {categories.map(k => { const current = (colors[k.name.toLowerCase()] as CategoryColorKey | undefined); const name = names[k.name] ?? k.name; return (
        <div key={k.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px' }}>
          <input aria-label={`Nazwa kategorii ${k.name}`} value={name} maxLength={40} disabled={!!busy} onChange={e => setNames(s => ({ ...s, [k.name]: e.target.value }))} onBlur={() => { if (name.trim() && name.trim() !== k.name) void save(k.name, current ?? 'blue', name); }} style={{ flex: '1 1 auto', minWidth: 0, height: 28, minHeight: 0, padding: '0 8px', border: 0, borderRadius: 8, background: categoryTint(k.name, colors), font: 'inherit', fontSize: 12, color: 'var(--text-primary)', boxShadow: 'none' }} />
          <span role="radiogroup" aria-label={`Kolor kategorii ${k.name}`} style={{ display: 'inline-flex', gap: 2 }}>
            {customerCategoryColors.map(c => <button key={c} type="button" role="radio" aria-checked={current === c} aria-label={categoryColorNames[c]} title={categoryColorNames[c]} disabled={!!busy} onClick={() => void save(k.name, c)} style={{ width: 18, height: 18, padding: 0, border: 0, borderRadius: '50%', background: categoryPalette[c], boxShadow: current === c ? '0 0 0 2px var(--bg-surface), 0 0 0 3.5px var(--text-primary)' : 'none', minHeight: 0 }} />)}
          </span>
        </div>); })}
      {!categories.length && <p style={{ margin: 0, padding: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Kategorie dodasz na karcie firmy. Tu nadasz im kolory i zmienisz nazwy.</p>}
      {err && <p role="alert" style={{ margin: 0, padding: '0 4px', fontSize: 12, color: 'var(--danger)' }}>{err}</p>}
      <p style={{ margin: 0, padding: '4px', fontSize: 12, color: 'var(--text-tertiary)' }}>Zmiana nazwy dotyczy wszystkich firm z tą kategorią.</p>
    </div>
  );
}
