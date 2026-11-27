'use client';
/* Zarządzanie kategoriami firm (filtr kategorii › „Zarządzaj”, ikona zębatki): nazwa i kolor każdej kategorii.
   M0.4: przeniesione z customer-filters.tsx (style wpisane) na Tailwind; treść warstwy, którą otwiera pasek filtrów
   silnika kolekcji (FilterBar › manage) w miejscu filtra. Kolory jako kropki na tokenach --ic-*. */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from '@phosphor-icons/react/ssr';
import { customerCategoryColors, type CustomerCategoryList } from '@hvac/api-client';
import { Button } from '@/components/ui/button';
import { plain } from '@/components/collection/classes';
import { useCollection } from '@/components/collection/provider';
import { categoryColorKey, categoryColorNames, categoryDotClass, categoryTintClass, colorMap, type CategoryColorKey } from '@/lib/crm/category-colors';
import { cx } from '@/lib/cx';

export function CategoryManager({ categories }: { categories: CustomerCategoryList }) {
  const router = useRouter(), { setFilterOpen } = useCollection();
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [names, setNames] = useState<Record<string, string>>({});
  const colors = colorMap(categories);
  async function save(name: string, color: CategoryColorKey, rename?: string) {
    setBusy(name); setErr('');
    try {
      const r = await fetch('/api/v1/customer-categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color, ...(rename && rename.trim() !== name ? { rename: rename.trim() } : {}) }) });
      if (!r.ok) throw new Error((await r.json()).error?.message || 'Nie udało się zapisać kategorii.');
      router.refresh();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Nie udało się zapisać kategorii.'); } finally { setBusy(''); }
  }
  return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center px-1 pb-2">
            <span className="flex-auto font-semibold text-primary">Kategorie</span>
            <Button variant="icon" size="sm" aria-label="Zamknij" shortcut="Esc" onClick={() => setFilterOpen(null)} icon={<X size={14} className="shrink-0" aria-hidden />} />
          </div>
          {categories.map(k => {
            const current = colors[k.name.toLowerCase()] as CategoryColorKey | undefined, name = names[k.name] ?? k.name;
            return (
              <div key={k.name} className="flex flex-wrap items-center gap-2 p-1">
                <label className="m-0 flex min-w-0 flex-auto flex-row font-normal">
                  <span className="sr-only">Nazwa kategorii {k.name}</span>
                  <input value={name} maxLength={40} disabled={!!busy} onChange={e => setNames(s => ({ ...s, [k.name]: e.target.value }))} onBlur={() => { if (name.trim() && name.trim() !== k.name) void save(k.name, current ?? 'blue', name); }}
                    className={cx('m-0 h-7 w-full min-w-0 min-h-0 rounded-sm border-0 px-2 py-0 font-sans text-small leading-4 text-primary shadow-none outline-0 focus:field-ring focus:ring-accent disabled:opacity-50', categoryTintClass[categoryColorKey(k.name, colors)])} />
                </label>
                <span role="radiogroup" aria-label={`Kolor kategorii ${k.name}`} className="inline-flex gap-1">
                  {customerCategoryColors.map(c => (
                    <button key={c} type="button" role="radio" aria-checked={current === c} aria-label={categoryColorNames[c]} title={categoryColorNames[c]} disabled={!!busy} onClick={() => void save(k.name, c)}
                      className={cx(plain({ bg: categoryDotClass[c] }), 'size-4 rounded-pill px-0', current === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'ring-0')} />
                  ))}
                </span>
              </div>
            );
          })}
          {!categories.length && <p className="m-0 p-2 text-small leading-4 text-secondary">Kategorie dodasz na karcie firmy. Tu nadasz im kolory i zmienisz nazwy.</p>}
          {err && <p role="alert" className="m-0 px-1 text-small leading-4 text-danger">{err}</p>}
          <p className="m-0 p-1 text-small leading-4 text-tertiary">Zmiana nazwy dotyczy wszystkich firm z tą kategorią.</p>
        </div>
  );
}
