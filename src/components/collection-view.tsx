'use client';
/* Collection view engine (design: „Widok kolekcji” + „Opcje widoku”): grouping, sorting, showing finished and empty groups,
   columns, filters and saved views. Options and saved views are kept on the account (user preferences), per collection. */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type ViewState = { group: string; sort: string; showDone: boolean; showEmpty: boolean; columns: string[]; filters: Record<string, string[]> };
export type SavedView = { name: string; state: ViewState };
const put = (key: string, value: unknown) => fetch('/api/v1/me/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) }).catch(() => undefined);
function valid(v: unknown): v is ViewState { const o = v as ViewState; return !!o && typeof o.group === 'string' && typeof o.sort === 'string' && typeof o.showDone === 'boolean' && typeof o.showEmpty === 'boolean' && Array.isArray(o.columns) && !!o.filters && typeof o.filters === 'object'; }

export function useCollectionView(collection: string, defaults: ViewState) {
  const [state, setState] = useState<ViewState>(defaults), [saved, setSaved] = useState<SavedView[]>([]), [active, setActive] = useState<string | null>(null);
  const def = useRef(defaults);
  useEffect(() => {
    let live = true;
    fetch('/api/v1/me/preferences', { cache: 'no-store' }).then(r => (r.ok ? r.json() : {})).then((p: Record<string, unknown>) => {
      if (!live) return;
      const cur = p[`view.${collection}`], list = p[`views.${collection}`];
      if (valid(cur)) setState({ ...def.current, ...cur, filters: { ...cur.filters } });
      if (Array.isArray(list)) setSaved(list.filter((x): x is SavedView => !!x && typeof x.name === 'string' && valid(x.state)).slice(0, 12));
    }).catch(() => undefined);
    return () => { live = false; };
  }, [collection]);
  const update = useCallback((patch: Partial<ViewState>) => { setActive(null); setState(s => { const next = { ...s, ...patch }; void put(`view.${collection}`, next); return next; }); }, [collection]);
  const reset = useCallback(() => { setActive(null); setState(def.current); void put(`view.${collection}`, def.current); }, [collection]);
  const saveAs = useCallback((name: string) => { const n = name.trim().slice(0, 40); if (!n) return; setSaved(list => { const next = [...list.filter(v => v.name !== n), { name: n, state }].slice(-12); void put(`views.${collection}`, next); return next; }); setActive(n); }, [collection, state]);
  const remove = useCallback((name: string) => { setSaved(list => { const next = list.filter(v => v.name !== name); void put(`views.${collection}`, next); return next; }); setActive(a => (a === name ? null : a)); }, [collection]);
  const apply = useCallback((name: string) => { const v = saved.find(x => x.name === name); if (!v) return; setState(v.state); setActive(name); void put(`view.${collection}`, v.state); }, [collection, saved]);
  return { state, update, reset, saved, saveAs, remove, apply, active, isDefault: JSON.stringify(state) === JSON.stringify(def.current) };
}

type Choice = { value: string; label: string };
const sv = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, style: { flex: '0 0 auto', color: 'var(--text-tertiary)' } };
const icons = {
  group: <svg {...sv}><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /></svg>,
  sort: <svg {...sv}><path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16" /></svg>,
  done: <svg {...sv}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg>,
  eye: <svg {...sv}><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" /><circle cx="12" cy="12" r="3" /></svg>,
};
const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 0 0 8px' };
const selectStyle: CSSProperties = { height: 28, minHeight: 0, padding: '0 6px 0 8px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', font: 'inherit', fontSize: 13, color: 'var(--text-primary)', boxShadow: 'none' };
const chipStyle = (on: boolean): CSSProperties => ({ height: 24, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 8px', border: 0, borderRadius: 12, background: on ? 'var(--bg-subtle)' : 'var(--bg-raised)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: on ? 500 : 400, minHeight: 0 });
const check = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
function Switch({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} style={{ width: 28, height: 16, padding: 2, border: 0, borderRadius: 6, background: on ? 'var(--accent)' : 'var(--border-strong)', display: 'inline-flex', justifyContent: on ? 'flex-end' : 'flex-start', minHeight: 0 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--bg-surface)' }} /></button>;
}

/** „Opcje widoku” popover. `layout` is optional (Lista / Tablica switch rendered by the caller). */
export function ViewOptions({ view, groups, sorts, columns, filters, layout, onClose }: { view: ReturnType<typeof useCollectionView>; groups: Choice[]; sorts: Choice[]; columns: Choice[]; filters: { key: string; label: string; options: (Choice & { dot?: ReactNode })[] }[]; layout?: ReactNode; onClose: () => void }) {
  const { state, update } = view;
  const box = useRef<HTMLDivElement>(null), [naming, setNaming] = useState(false), [name, setName] = useState('');
  useEffect(() => {
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('[data-view-options-trigger]')) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [onClose]);
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  return (
    <div ref={box} role="dialog" aria-label="Opcje widoku" style={{ position: 'absolute', top: 36, right: 0, zIndex: 30, width: 340, maxHeight: 'calc(100dvh - 140px)', overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--bg-surface)', border: '1px solid var(--edge)', borderRadius: 14, boxShadow: 'var(--shadow-pop)' }}>
      {layout}
      <div style={row}><span style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{icons.group}Grupuj według</span><select aria-label="Grupuj według" value={state.group} onChange={e => update({ group: e.target.value })} style={selectStyle}>{groups.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
      <div style={row}><span style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>{icons.sort}Sortuj</span><select aria-label="Sortuj" value={state.sort} onChange={e => update({ sort: e.target.value })} style={selectStyle}>{sorts.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
      <div style={{ ...row, paddingRight: 6 }}><span id="vo-done" style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>{icons.done}Pokaż zakończone</span><Switch on={state.showDone} label="Pokaż zakończone" onChange={v => update({ showDone: v })} /></div>
      <div style={{ ...row, paddingRight: 6 }}><span style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>{icons.eye}Puste grupy</span><Switch on={state.showEmpty} label="Puste grupy" onChange={v => update({ showEmpty: v })} /></div>
      <div style={{ padding: '8px 8px 4px', fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-tertiary)' }}>Kolumny</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 4px 4px' }}>{columns.map(c => { const on = state.columns.includes(c.value); return <button key={c.value} type="button" aria-pressed={on} onClick={() => update({ columns: toggle(state.columns, c.value) })} style={chipStyle(on)}>{on && check}{c.label}</button>; })}</div>
      {filters.map(f => (
        <div key={f.key}>
          <div style={{ padding: '8px 8px 4px', fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-tertiary)' }}>Filtr: {f.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 4px 4px' }}>{f.options.map(o => { const cur = state.filters[f.key] ?? [], on = cur.includes(o.value); return <button key={o.value} type="button" aria-pressed={on} onClick={() => update({ filters: { ...state.filters, [f.key]: toggle(cur, o.value) } })} style={chipStyle(on)}>{on ? check : o.dot}{o.label}</button>; })}</div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 4px 0', borderTop: '1px solid var(--edge)', marginTop: 4 }}>
        <button type="button" className="ghost" disabled={view.isDefault} onClick={view.reset} style={{ height: 28, padding: '0 8px', border: 0, borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, opacity: view.isDefault ? 0.5 : 1, minHeight: 0 }}>Przywróć domyślne</button>
        <span style={{ flex: '1 1 auto' }} />
        {naming
          ? <form onSubmit={e => { e.preventDefault(); view.saveAs(name); setNaming(false); setName(''); }} style={{ display: 'inline-flex', gap: 4 }}><label htmlFor="vo-name" className="vh">Nazwa widoku</label><input id="vo-name" autoFocus value={name} maxLength={40} onChange={e => setName(e.target.value)} placeholder="Nazwa widoku" style={{ width: 140, height: 28, minHeight: 0, padding: '0 8px', border: 0, borderRadius: 8, background: 'var(--bg-raised)', font: 'inherit', fontSize: 12, boxShadow: 'none' }} /><button type="submit" className="pri" disabled={!name.trim()} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 12, fontWeight: 500, minHeight: 0 }}>Zapisz</button></form>
          : <button type="button" className="sec" onClick={() => setNaming(true)} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 12, fontWeight: 500, minHeight: 0 }}>Zapisz jako widok</button>}
      </div>
    </div>
  );
}

/** Saved views as pills next to the built-in ones; × removes a saved view. */
export function SavedViewPills({ view }: { view: ReturnType<typeof useCollectionView> }) {
  if (!view.saved.length) return null;
  return <>{view.saved.map(v => { const on = view.active === v.name; return (
    <span key={v.name} style={{ display: 'inline-flex', alignItems: 'center', height: 28, borderRadius: 14, background: on ? 'var(--bg-subtle)' : 'transparent' }}>
      <button type="button" role="tab" aria-selected={on} className="tab" onClick={() => view.apply(v.name)} style={{ height: 28, padding: '0 4px 0 12px', border: 0, borderRadius: 14, background: 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: on ? 500 : 400, minHeight: 0 }}>{v.name}</button>
      <button type="button" aria-label={`Usuń widok ${v.name}`} title="Usuń widok" onClick={() => view.remove(v.name)} style={{ width: 20, height: 20, marginRight: 4, padding: 0, border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
    </span>); })}</>;
}
