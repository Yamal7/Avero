'use client';
/* Opcje widoku (makieta: „Widok kolekcji” + „Opcje widoku”): grupowanie, sortowanie, przełączniki, kolumny kapsułkami
   z ptaszkiem, opcjonalnie filtry kapsułkami (Zadania), „Przywróć domyślne” i „Zapisz jako widok”.
   Przeniesione z collection-view.tsx (style wpisane) na Tailwind; stan z silnika kolekcji (provider). */
import { useState, type ReactNode } from 'react';
import { ArrowsDownUp, Check, CheckCircle, Eye, Stack } from '@phosphor-icons/react/ssr';
import { Button } from '@/components/ui/button';
import { visibleColumns } from '@/lib/collection/views';
import { cx } from '@/lib/cx';
import { useCollection } from './provider';
import { plain } from './classes';

/** Kropki opcji filtrów w Opcjach widoku (np. kolor etykiety zadania): filtr → wartość → element. */
export type InlineFilterDots = Record<string, Record<string, ReactNode>>;

const rowClasses = 'flex h-8 items-center gap-2 pl-2 max-desktop:h-11';
const rowLabel = 'flex min-w-0 flex-auto items-center gap-2 whitespace-nowrap text-secondary';
const selectClasses = 'm-0 h-7 w-auto min-h-0 max-w-44 rounded-sm border-0 bg-subtle py-0 pr-1 pl-2 font-sans text-body leading-5 text-primary shadow-none outline-0 focus-visible:outline-2 focus-visible:outline-accent max-desktop:h-9';
const sectionTitle = 'm-0 px-2 pt-2 pb-1 text-small leading-4 font-medium text-tertiary';
const chip = (on: boolean) => cx(plain(on ? { bg: 'bg-subtle', weight: 'font-medium' } : { bg: 'bg-raised' }), 'h-6 gap-1 rounded-pill px-2 text-small leading-4 max-desktop:h-8', on ? 'text-primary' : 'text-secondary hover:text-primary');
const icon = { group: <Stack size={16} className="shrink-0 text-tertiary" aria-hidden />, sort: <ArrowsDownUp size={16} className="shrink-0 text-tertiary" aria-hidden />, done: <CheckCircle size={16} className="shrink-0 text-tertiary" aria-hidden />, eye: <Eye size={16} className="shrink-0 text-tertiary" aria-hidden /> };
// 10 px: w wadze Regular kreska byłaby za cienka (ok. 0,6 px), dlatego Bold
const tick = <Check size={10} weight="bold" className="shrink-0" aria-hidden />;

function Switch({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx(plain(), 'mr-1 h-4 w-7 rounded-xs px-0')}>
      <span aria-hidden="true" className={cx('flex h-4 w-7 items-center rounded-xs border-2 border-transparent transition-colors', on ? 'justify-end bg-accent' : 'justify-start bg-border-strong')}><span className="size-3 rounded-pill bg-surface" /></span>
    </button>
  );
}

export function ViewOptions({ layout, inlineFilters = false, dots = {} }: { layout?: ReactNode; inlineFilters?: boolean; dots?: InlineFilterDots }) {
  const c = useCollection();
  const { spec, query } = c;
  const [naming, setNaming] = useState(false), [name, setName] = useState(''), [saving, setSaving] = useState(false);
  const hideable = spec.columns.filter(col => col.hideable);
  const shown = visibleColumns(spec, c.columns).map(col => col.key);
  const toggles = spec.filters.filter((f): f is Extract<typeof f, { kind: 'toggle' }> => f.kind === 'toggle');
  const multis = inlineFilters ? spec.filters.filter((f): f is Extract<typeof f, { kind: 'multi' }> => f.kind === 'multi' && !!f.options) : [];
  const flip = (list: string[], v: string) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    const ok = await c.saveView(name);
    setSaving(false);
    if (ok) { setNaming(false); setName(''); }
  }
  return (
    <div className="flex flex-col gap-1">
      {layout}
      {spec.groups.length > 1 && (
        <div className={rowClasses}>
          <span className={rowLabel}>{icon.group}Grupuj według</span>
          <select aria-label="Grupuj według" value={query.group} onChange={e => c.setQuery({ group: e.target.value })} className={selectClasses}>{spec.groups.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
        </div>
      )}
      {spec.sorts.length > 1 && (
        <div className={rowClasses}>
          <span className={rowLabel}>{icon.sort}Sortuj</span>
          <select aria-label="Sortuj" value={query.sort} onChange={e => c.setQuery({ sort: e.target.value })} className={selectClasses}>{spec.sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
        </div>
      )}
      {toggles.map(t => {
        const on = (query.filters[t.key]?.[0] ?? (t.default ? '1' : '0')) === '1';
        return (
          <div key={t.key} className={rowClasses}>
            <span className={rowLabel}>{t.presentation ? icon.eye : icon.done}{t.label}</span>
            <Switch on={on} label={t.label} onChange={v => c.setQuery({ filters: { [t.key]: [v ? '1' : '0'] } })} />
          </div>
        );
      })}
      {hideable.length > 0 && <>
        <p className={sectionTitle}>Kolumny</p>
        <div className="flex flex-wrap gap-1 px-1 pb-1">
          {hideable.map(col => { const on = shown.includes(col.key); return <button key={col.key} type="button" aria-pressed={on} onClick={() => c.setColumns(flip(c.columns, col.key))} className={chip(on)}>{on && tick}{col.label}</button>; })}
        </div>
      </>}
      {multis.map(f => (
        <div key={f.key}>
          <p className={sectionTitle}>Filtr: {f.label}</p>
          <div className="flex flex-wrap gap-1 px-1 pb-1">
            {f.options!.map(o => { const cur = query.filters[f.key] ?? [], on = cur.includes(o.value); return <button key={o.value} type="button" aria-pressed={on} onClick={() => c.setQuery({ filters: { [f.key]: flip(cur, o.value) } })} className={chip(on)}>{on ? tick : dots[f.key]?.[o.value]}{o.label}</button>; })}
          </div>
        </div>
      ))}
      {c.error && <p role="alert" className="m-0 px-2 text-small leading-4 text-danger">{c.error}</p>}
      <div className="mt-1 flex flex-wrap items-center gap-1 border-t border-edge pt-2">
        <Button variant="ghost" size="sm" disabled={c.isDefault} onClick={c.reset}>Przywróć domyślne</Button>
        <span className="flex-auto" />
        {naming
          ? (
            <form onSubmit={e => { e.preventDefault(); void save(); }} className="flex min-w-0 items-center gap-1 max-desktop:w-full">
              <label className="m-0 flex min-w-0 flex-auto flex-row font-normal">
                <span className="sr-only">Nazwa widoku</span>
                <input autoFocus value={name} maxLength={40} onChange={e => setName(e.target.value)} placeholder="Nazwa widoku" className="m-0 h-7 w-36 min-w-0 min-h-0 flex-auto rounded-sm border-0 bg-raised px-2 py-0 font-sans text-small leading-4 text-primary shadow-none outline-0 placeholder:text-tertiary focus:field-ring focus:ring-accent max-desktop:h-9" />
              </label>
              <Button type="submit" variant="pri" size="sm" loading={saving} disabled={!name.trim()}>Zapisz</Button>
            </form>
          )
          : <Button size="sm" onClick={() => setNaming(true)}>Zapisz jako widok</Button>}
      </div>
    </div>
  );
}
