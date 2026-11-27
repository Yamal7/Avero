'use client';
/* Pasek kolekcji (M0.4, KRA-31): kapsułki widoków (wbudowane + zapisane), szukanie, kapsułki filtrów, sortowanie,
   przycisk Opcji widoku. Tailwind na tokenach, warstwy przez ui/Popover (portal; na telefonie arkusz).
   Klasy przycisków jawnie zerują reguły legacy dla `button` (padding, ramka, min-height) — warstwa utilities wygrywa. */
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowsDownUp, Check, GearSix, MagnifyingGlass, Plus, SlidersHorizontal, X } from '@phosphor-icons/react/ssr';
import { pillClasses } from '@/components/ui/pill';
import { Popover } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { searchFrameClasses, searchInputClasses } from '@/components/table/page-chrome';
import { queryHref, viewQuery } from '@/lib/collection/query';
import type { FilterDef, FilterMode } from '@/lib/collection/spec';
import { cx } from '@/lib/cx';
import { useCollection } from './provider';
import { ViewOptions, type InlineFilterDots } from './view-options';
import { checkBox, chipBase, itemClasses, plain } from './classes';

/* ---------- widoki ---------- */

/** Kapsułki widoków: wbudowane (linki) i zapisane na koncie (zastosuj / usuń). `builtIn={false}` — tylko zapisane (Zadania mają własne). */
export function CollectionViews({ label = 'Widoki', builtIn = true }: { label?: string; builtIn?: boolean }) {
  const c = useCollection();
  const views = builtIn ? c.spec.views : [];
  if (!views.length && !c.saved.length) return null;
  return (
    <nav aria-label={label} className="flex min-w-0 flex-wrap gap-1">
      {views.map(v => {
        const active = c.query.view === v.key && !c.activeView;
        return <Link key={v.key} href={queryHref(c.spec, viewQuery(c.spec, v.key, c.query.context))} title={v.title} aria-current={active ? 'page' : undefined} className={pillClasses({ active })}>{v.label}</Link>;
      })}
      {c.saved.map(v => {
        const on = c.activeView === v.name;
        return (
          <span key={v.name} className={cx('inline-flex h-7 items-center rounded-pill max-desktop:h-9', on ? 'bg-subtle' : 'bg-transparent')}>
            <button type="button" aria-pressed={on} title={`Zapisany widok: ${v.name}`} onClick={() => c.applyView(v)} className={cx(plain({ weight: on ? 'font-medium' : 'font-normal' }), 'h-full rounded-pill pr-1 pl-3 text-body leading-5', on ? 'text-primary' : 'text-secondary hover:text-primary')}>{v.name}</button>
            <button type="button" aria-label={`Usuń widok ${v.name}`} title="Usuń widok" onClick={() => c.removeView(v.name)} className={cx(plain(), 'mr-1 size-5 justify-center rounded-pill px-0 text-tertiary hover:bg-shell-hover hover:text-primary')}><X size={10} weight="bold" className="shrink-0" aria-hidden /></button>
          </span>
        );
      })}
    </nav>
  );
}

/* ---------- szukanie ---------- */

export function CollectionSearch({ width = 'w-64', autoFocus = false }: { width?: 'w-56' | 'w-64'; autoFocus?: boolean }) {
  const c = useCollection();
  const [value, setValue] = useState(c.query.q);
  useEffect(() => { setValue(c.query.q); }, [c.query.q]);
  function submit(e: FormEvent) { e.preventDefault(); if (value.trim() !== c.query.q) c.setQuery({ q: value.trim().slice(0, 200) }); }
  return (
    <form role="search" onSubmit={submit} className="flex min-w-0 max-desktop:w-full">
      <label className={cx(searchFrameClasses, 'max-desktop:w-full')}>
        <MagnifyingGlass size={14} className="shrink-0" aria-hidden />
        <span className="sr-only">{c.spec.searchLabel}</span>
        <input
          id={c.searchId}
          type="search"
          value={value}
          autoFocus={autoFocus}
          maxLength={200}
          onChange={e => { setValue(e.target.value); if (!e.target.value && c.query.q) c.setQuery({ q: '' }); }}
          onKeyDown={e => { if (e.key === 'Escape' && !value) e.currentTarget.blur(); }}
          placeholder={c.spec.searchLabel}
          title={`${c.spec.searchLabel}  /`}
          aria-keyshortcuts="/"
          className={cx(searchInputClasses, width)}
        />
      </label>
      <button type="submit" className="sr-only">Szukaj</button>
    </form>
  );
}

/* ---------- sortowanie ---------- */

export function SortMenu() {
  const c = useCollection();
  const ref = useRef<HTMLButtonElement>(null), [open, setOpen] = useState(false);
  if (c.spec.sorts.length < 2) return null;
  const current = c.spec.sorts.find(s => s.value === c.query.sort) ?? c.spec.sorts[0]!;
  return (
    <>
      <button ref={ref} type="button" aria-haspopup="menu" aria-expanded={open} title="Zmień sortowanie" onClick={() => setOpen(v => !v)} className={cx(plain({ bg: 'bg-subtle' }), chipBase, 'gap-2 px-2 hover:bg-shell-hover')}>
        <ArrowsDownUp size={14} className="shrink-0 text-tertiary" aria-hidden /><span className="text-secondary">Sortuj:</span><span className="font-medium text-primary">{current.label}</span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchor={ref} label="Sortowanie" role="menu" width="w-56">
        {c.spec.sorts.map(s => (
          <button key={s.value} type="button" role="menuitemradio" aria-checked={s.value === c.query.sort} onClick={() => { setOpen(false); ref.current?.focus(); if (s.value !== c.query.sort) c.setQuery({ sort: s.value }); }} className={cx(itemClasses, s.value === c.query.sort ? 'font-medium' : 'font-normal')}>
            <span className="min-w-0 flex-auto truncate">{s.label}</span>
            {s.value === c.query.sort && <Check size={14} className="shrink-0 text-accent" aria-hidden />}
          </button>
        ))}
      </Popover>
    </>
  );
}

/* ---------- filtry ---------- */

/** Opcja filtra podana przez ekran (np. kategorie firm z licznością i kolorem). */
export type FilterOption = { value: string; label: string; count?: number; dotClass?: string; tintClass?: string };
const modeLabel: Record<FilterMode, string> = { any: 'którakolwiek z', all: 'wszystkie z', none: 'żadna z' };
const modeChoice: [FilterMode, string][] = [['any', 'Którakolwiek'], ['all', 'Wszystkie'], ['none', 'Żadna']];

/** Kapsułki aktywnych filtrów i „+ Filtr” (F). `options` — opcje filtrów bez stałej listy w konfiguracji;
    `manage` — treść warstwy „Zarządzaj” (np. nazwy i kolory kategorii), otwieranej ze stopki filtra w jego miejscu. */
export function FilterBar({ options = {}, manage = {} }: { options?: Record<string, FilterOption[]>; manage?: Record<string, ReactNode> }) {
  const c = useCollection();
  const defs = c.spec.filters.filter(f => !(f.kind === 'toggle' && f.presentation));
  const addRef = useRef<HTMLButtonElement>(null);
  const chipRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  // Stały obiekt kotwicy (Popover nie powinien przejmować fokusu przy każdym renderze); wskazuje kapsułkę filtra albo „+ Filtr”.
  const anchor = useRef<HTMLElement | null>(null);
  if (!defs.length) return null;
  const isActive = (f: FilterDef) => (f.kind === 'toggle' ? (c.query.filters[f.key]?.[0] ?? (f.default ? '1' : '0')) !== (f.default ? '1' : '0') : (c.query.filters[f.key]?.length ?? 0) > 0);
  const active = defs.filter(isActive), inactive = defs.filter(f => !isActive(f));
  const optionsFor = (f: FilterDef): FilterOption[] => (f.kind === 'multi' ? options[f.key] ?? f.options ?? [] : []);
  const open = c.filterOpen;
  const close = () => c.setFilterOpen(null);
  // F otwiera pierwszy filtr; gdy jest kilka nieaktywnych — menu wyboru.
  const managing = open?.endsWith(':manage') ? defs.find(f => `${f.key}:manage` === open) : undefined;
  const openFilter = open && open !== '__menu' ? defs.find(f => f.key === open) ?? managing : undefined;
  if (openFilter) anchor.current = chipRefs.current[openFilter.key] ?? addRef.current;
  return (
    <>
      {active.map(f => {
        const vals = c.query.filters[f.key] ?? [], opts = optionsFor(f);
        const label = (v: string) => opts.find(o => o.value === v)?.label ?? v;
        return (
          <span key={f.key} ref={el => { chipRefs.current[f.key] = el; }} className={cx(chipBase, 'overflow-hidden')}>
            {f.kind === 'toggle'
              ? <span className="inline-flex h-full items-center px-2 text-secondary">{f.label}: {vals[0] === '1' ? 'tak' : 'nie'}</span>
              : (
                <button type="button" aria-haspopup="dialog" aria-expanded={open === f.key} title={`Zmień filtr: ${f.label}`} onClick={() => c.setFilterOpen(open === f.key ? null : f.key)} className={cx(plain(), 'h-full min-w-0 gap-1 px-2 text-small leading-4 hover:bg-shell-hover')}>
                  <span className="text-secondary">{f.label}</span>
                  {f.kind === 'multi' && f.modeKey && <span className="text-tertiary">{modeLabel[c.query.modes[f.key] ?? 'any']}</span>}
                  {f.kind === 'dates'
                    ? <span className="text-primary tabular-nums">{vals[0] || '…'} – {vals[1] || '…'}</span>
                    : <>
                        {vals.slice(0, 2).map(v => { const o = opts.find(x => x.value === v); return <span key={v} className={cx('inline-flex h-5 max-w-32 items-center truncate rounded-xs px-2 text-primary', o?.tintClass ?? 'bg-surface')}>{label(v)}</span>; })}
                        {vals.length > 2 && <span className="text-secondary tabular-nums" title={vals.slice(2).map(label).join(', ')}>+{vals.length - 2}</span>}
                      </>}
                </button>
              )}
            <button type="button" aria-label={`Usuń filtr: ${f.label}`} title="Usuń filtr" onClick={() => c.setQuery({ filters: { [f.key]: f.kind === 'toggle' ? [f.default ? '1' : '0'] : [] } })} className={cx(plain(), 'h-full w-6 justify-center px-0 text-tertiary hover:bg-shell-hover hover:text-primary')}><X size={12} className="shrink-0" aria-hidden /></button>
          </span>
        );
      })}
      {inactive.length > 0 && (
        <Button ref={addRef} variant="ghost" size="sm" aria-haspopup="dialog" aria-expanded={!!open && !active.some(f => f.key === open)} shortcut="F" title="Dodaj filtr" onClick={() => c.setFilterOpen(open ? null : inactive.length === 1 ? inactive[0]!.key : '__menu')} icon={<Plus size={14} className="shrink-0" aria-hidden />}>Filtr</Button>
      )}
      <Popover open={open === '__menu'} onClose={close} anchor={addRef} label="Dodaj filtr" role="menu" width="w-56">
        {inactive.map(f => (
          <button key={f.key} type="button" role="menuitem" onClick={() => { if (f.kind === 'toggle') { close(); c.setQuery({ filters: { [f.key]: [f.default ? '0' : '1'] } }); } else c.setFilterOpen(f.key); }} className={cx(itemClasses, 'font-normal')}>{f.label}</button>
        ))}
      </Popover>
      {openFilter && !managing && openFilter.kind === 'multi' && <MultiFilter key={openFilter.key} def={openFilter} options={optionsFor(openFilter)} anchor={anchor} manage={manage[openFilter.key] !== undefined} onClose={close} />}
      {managing && <Popover open onClose={close} anchor={anchor} label={`Zarządzaj: ${managing.label.toLowerCase()}`} width="w-90" padding="p-2">{manage[managing.key]}</Popover>}
      {openFilter && openFilter.kind === 'dates' && <DatesFilter key={openFilter.key} def={openFilter} anchor={anchor} onClose={close} />}
    </>
  );
}

function MultiFilter({ def, options, anchor, manage, onClose }: { def: Extract<FilterDef, { kind: 'multi' }>; options: FilterOption[]; anchor: { current: HTMLElement | null }; manage: boolean; onClose: () => void }) {
  const c = useCollection();
  const current = c.query.filters[def.key] ?? [], currentMode = c.query.modes[def.key] ?? 'any';
  const [pick, setPick] = useState(current), [mode, setMode] = useState<FilterMode>(currentMode), [term, setTerm] = useState('');
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  const shown = options.filter(o => o.label.toLowerCase().includes(term.trim().toLowerCase()));
  // Zatwierdzenie tylko „Zastosuj” (↵ w polu szukania); Esc i klik poza warstwą zamykają bez zmian — jak filtr dat.
  function apply(e?: FormEvent) {
    e?.preventDefault();
    const changed = pick.length !== current.length || pick.some((v, i) => v !== current[i]) || (pick.length > 0 && mode !== currentMode);
    if (changed) c.setQuery({ filters: { [def.key]: pick }, ...(def.modeKey ? { modes: { [def.key]: mode } } : {}) });
    onClose();
  }
  return (
    <Popover open onClose={onClose} anchor={anchor} label={`Filtr: ${def.label}`} width="w-72" padding="p-0">
      <form onSubmit={apply} className="m-0 flex flex-col">
      <div className="flex flex-col gap-2 px-2 pt-2 pb-1">
        {def.modeKey && (
          <div role="radiogroup" aria-label="Warunek" className="flex gap-1 rounded-md bg-subtle p-1">
            {modeChoice.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={mode === v} onClick={() => setMode(v)} className={cx(plain(mode === v ? { bg: 'bg-surface', weight: 'font-medium' } : {}), 'h-6 flex-1 justify-center rounded-sm px-2 text-small leading-4', mode === v ? 'text-primary' : 'text-secondary hover:text-primary')}>{l}</button>)}
          </div>
        )}
        {options.length > 6 && (
          <label className={cx(searchFrameClasses, 'w-full')}>
            <MagnifyingGlass size={14} className="shrink-0" aria-hidden />
            <span className="sr-only">Szukaj: {def.label.toLowerCase()}</span>
            <input autoFocus value={term} onChange={e => setTerm(e.target.value)} placeholder="Szukaj…" className={cx(searchInputClasses, 'w-full')} />
          </label>
        )}
      </div>
      <div role="listbox" aria-label={def.label} aria-multiselectable="true" className="flex max-h-80 flex-col overflow-y-auto p-1">
        {shown.map(o => {
          const on = pick.some(p => same(p, o.value));
          return (
            <button key={o.value} type="button" role="option" aria-selected={on} onClick={() => setPick(on ? pick.filter(p => !same(p, o.value)) : [...pick, o.value])} className={cx(itemClasses, 'font-normal')}>
              <span aria-hidden="true" className={checkBox(on)}><Check size={10} weight="bold" className="shrink-0" /></span>
              {o.dotClass && <span aria-hidden="true" className={cx('size-2 shrink-0 rounded-pill', o.dotClass)} />}
              <span className="min-w-0 flex-auto truncate">{o.label}</span>
              {o.count !== undefined && <span className="text-small leading-4 text-tertiary tabular-nums">{o.count}</span>}
            </button>
          );
        })}
        {!shown.length && <p className="m-0 p-2 text-small leading-4 text-secondary">{options.length ? 'Brak pasujących wartości.' : 'Brak wartości do wyboru.'}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 px-2 pt-1 pb-2">
        <Button variant="ghost" size="sm" onClick={() => { setPick([]); setMode('any'); }} disabled={!pick.length}>Wyczyść</Button>
        <span className="inline-flex gap-1">
          {manage && <Button variant="ghost" size="sm" title="Zarządzaj: nazwy i kolory" onClick={() => c.setFilterOpen(`${def.key}:manage`)} icon={<GearSix size={14} className="shrink-0" aria-hidden />}>Zarządzaj</Button>}
          <Button type="submit" variant="pri" size="sm" shortcut="↵">Zastosuj</Button>
        </span>
      </div>
      </form>
    </Popover>
  );
}

function DatesFilter({ def, anchor, onClose }: { def: Extract<FilterDef, { kind: 'dates' }>; anchor: { current: HTMLElement | null }; onClose: () => void }) {
  const c = useCollection();
  const cur = c.query.filters[def.key] ?? [];
  const [from, setFrom] = useState(cur[0] ?? ''), [to, setTo] = useState(cur[1] ?? '');
  const invalid = !!from && !!to && from > to;
  const field = 'm-0 h-control min-h-0 w-full rounded-md border-0 bg-raised px-3 py-0 font-sans text-body leading-5 text-primary shadow-none outline-0 focus:field-ring focus:ring-accent';
  function apply(e: FormEvent) { e.preventDefault(); if (invalid) return; c.setQuery({ filters: { [def.key]: from || to ? [from, to] : [] } }); onClose(); }
  return (
    <Popover open onClose={onClose} anchor={anchor} label={`Filtr: ${def.label}`} width="w-72" padding="p-2">
      <form onSubmit={apply} className="m-0 flex flex-col gap-2">
        <label className="m-0 flex flex-col gap-1 text-small leading-4 font-normal text-secondary">Od<input type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} className={field} /></label>
        <label className="m-0 flex flex-col gap-1 text-small leading-4 font-normal text-secondary">Do<input type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} className={field} /></label>
        {invalid && <p role="alert" className="m-0 text-small leading-4 text-danger">Data „od” jest późniejsza niż „do”.</p>}
        <div className="flex items-center justify-between gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo(''); }}>Wyczyść</Button>
          <Button type="submit" variant="pri" size="sm" shortcut="↵" disabled={invalid}>Zastosuj</Button>
        </div>
      </form>
    </Popover>
  );
}

/* ---------- Opcje widoku ---------- */

export function ViewOptionsButton({ layout, inlineFilters = false, dots }: { layout?: ReactNode; inlineFilters?: boolean; dots?: InlineFilterDots }) {
  const c = useCollection();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={ref} variant="icon" size="sm" aria-label="Opcje widoku" title="Opcje widoku" shortcut="V" aria-haspopup="dialog" aria-expanded={c.optionsOpen} onClick={() => c.setOptionsOpen(v => !v)} icon={<SlidersHorizontal size={16} className="shrink-0" aria-hidden />} className="aria-expanded:bg-subtle aria-expanded:text-primary" />
      <Popover open={c.optionsOpen} onClose={() => c.setOptionsOpen(false)} anchor={ref} label="Opcje widoku" width="w-85" align="end" padding="p-2">
        <ViewOptions layout={layout} inlineFilters={inlineFilters} dots={dots} />
      </Popover>
    </>
  );
}

/** Komunikat o błędzie zapisu ustawień listy (kolumny, widoki). */
export function CollectionNotice() {
  const c = useCollection();
  if (!c.error) return null;
  return <p role="alert" className="m-0 px-5 pb-2 text-small leading-4 text-danger max-desktop:px-3">{c.error}</p>;
}
