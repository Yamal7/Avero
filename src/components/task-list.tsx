'use client';
/* Zadania — list + record panel, ported 1:1 from the design artboard "Zadania · jasny" (inline styles copied from the rendered design). */
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { crmTaskProgressSchema, crmTaskSchema, type MyTask, type MyTasks } from '@hvac/api-client';
import { myTaskCustomerHref } from '@/lib/crm/tasks';
import { DI, StatusIcon } from './design-icons';

type Task = MyTask;
type State = Task['state'];
const zone = 'Europe/Warsaw';
const stateLabel: Record<State, string> = { in_progress: 'W toku', todo: 'Do zrobienia', done: 'Gotowe', cancelled: 'Anulowane' };
const groupOrder: State[] = ['in_progress', 'todo', 'done', 'cancelled'];

/* ── shared inline styles from the design ── */
const ib = (size: number, color = 'var(--text-secondary)'): CSSProperties => ({ width: size, height: size, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', background: 'transparent', color, padding: 0 });
const capd: CSSProperties = { height: 28, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px 0 8px', border: 0, borderRadius: 14, maxWidth: '100%' };
const avatar = (size: number, font: number): CSSProperties => ({ width: size, height: size, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: font, lineHeight: '10px', fontWeight: 600, color: 'var(--text-secondary)', flex: '0 0 auto' });

const addDays = (day: string, n: number) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const short = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short' }).format(new Date(day + 'T12:00:00Z')).replace('.', '');
const longDay = (day: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(day + 'T12:00:00Z'));
const stamp = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, dateStyle: 'long', timeStyle: 'short' }).format(new Date(v));
const stampShort = (v: string) => new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short' }).format(new Date(v)).replace('.', '');
const initials = (label: string) => label.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?';
const open = (t: Task) => t.state === 'todo' || t.state === 'in_progress';
function dueLabel(t: Task, today: string) {
  if (open(t) && t.dueOn < today) return { text: short(t.dueOn), title: 'Po terminie', icon: DI.calLate, color: 'var(--danger)', weight: 500 };
  if (t.dueOn === today) return { text: 'Dziś', title: 'Termin dziś', icon: DI.calToday, color: 'var(--text-primary)', weight: 500 };
  if (t.dueOn === addDays(today, 1)) return { text: 'Jutro', title: 'Termin', icon: DI.cal, color: 'var(--text-secondary)', weight: 400 };
  return { text: short(t.dueOn), title: 'Termin', icon: DI.cal, color: 'var(--text-secondary)', weight: 400 };
}
const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function TaskListView({ data, header, toolbarTabs, toolbarExtra, layoutSwitch, search, board, footer }: { data: MyTasks; header: ReactNode; toolbarTabs: ReactNode; toolbarExtra?: ReactNode; layoutSwitch: ReactNode; search: ReactNode; board?: ReactNode; footer?: ReactNode }) {
  const router = useRouter();
  const items = data.items;
  const [panelOn, setPanelOn] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ done: true, cancelled: true });
  const [showSearch, setShowSearch] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false), [notice, setNotice] = useState(''), [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const selected = panelOn ? items.find(t => t.id === selectedId) ?? null : null;
  const groups = groupOrder.map(state => ({ state, rows: items.filter(t => t.state === state) })).filter(g => g.rows.length || g.state === 'in_progress' || g.state === 'todo');
  const visible = groups.flatMap(g => collapsed[g.state] ? [] : g.rows);

  useEffect(() => { if (window.matchMedia('(max-width: 1100px)').matches) setPanelOn(false); }, []);
  function select(t: Task | null) { setSelectedId(t?.id ?? null); setError(''); setConflict(false); setCopied(false); setNotice(''); if (t) { setPanelOn(true); requestAnimationFrame(() => document.getElementById(`task-${t.id}`)?.scrollIntoView({ block: 'nearest' })); } }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || busy || document.querySelector('dialog[open]')) return;
      if (e.key === 'Escape' && selected) { e.preventDefault(); setPanelOn(false); return; }
      if (typing(e.target)) return;
      if (e.key === ']') { e.preventDefault(); setPanelOn(v => !v); return; }
      if (e.key === 'j' || e.key === 'k') {
        if (!visible.length) return; e.preventDefault();
        const i = visible.findIndex(t => t.id === selectedId);
        select(visible[i < 0 ? 0 : Math.min(visible.length - 1, Math.max(0, i + (e.key === 'j' ? 1 : -1)))]);
      }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!selected) return;
    const form = new FormData(e.currentTarget), input = crmTaskProgressSchema.safeParse({ version: selected.version, state: form.get('state'), result: form.get('result') });
    if (!input.success) { setError('Sprawdź status i długość wyniku (maksymalnie 2000 znaków, 80 wierszy).'); return; }
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/v1/customers/${selected.customerId}/tasks/${selected.id}/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input.data) }), body = await r.json();
      if (!r.ok) { if (r.status === 409) { setConflict(true); throw new Error('Zadanie zmienił ktoś inny. Odśwież listę przed kolejną zmianą.'); } throw new Error(body.error?.message || 'Nie udało się zapisać postępu.'); }
      const task = crmTaskSchema.parse(body);
      if (task.id !== selected.id || task.assigneeId !== data.viewerId) throw new Error('Nieprawidłowa odpowiedź zapisu. Odśwież listę.');
      setNotice(`Zapisano: ${stateLabel[task.state]}`); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }
  async function copyLink() { if (!selected) return; try { await navigator.clipboard.writeText(new URL(myTaskCustomerHref(selected), location.origin).toString()); setCopied(true); } catch { setError('Nie udało się skopiować linku.'); } }

  return (
    <main className="dk" style={{ flex: '1 1 auto', minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
      {header}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: '8px 12px 8px 16px' }}>
        {toolbarTabs}
        <span style={{ flex: '1 1 auto' }} />
        {showSearch && search}
        <button type="button" className={`ib${showSearch ? ' on' : ''}`} aria-label="Filtruj" title="Szukaj zadania lub klienta  F" aria-pressed={showSearch} onClick={() => setShowSearch(v => !v)} style={ib(28)}>{DI.filter}</button>
        {layoutSwitch}
        {!board && <button type="button" className={`ib${panelOn ? ' on' : ''}`} aria-label="Panel szczegółów" title="Panel szczegółów  ]" aria-pressed={panelOn} onClick={() => { setPanelOn(v => !v); if (!selectedId && items[0]) setSelectedId(items[0].id); }} style={ib(28)}>{DI.panel}</button>}
        {toolbarExtra}
      </div>
      {board ?? <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'stretch', minHeight: 0 }}>
        <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 12px 24px' }}>
          {notice && <p role="status" style={{ margin: '0 8px', fontSize: 12, color: 'var(--success)' }}>{notice}</p>}
          {items.length === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: '16px 8px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Brak zadań w tym widoku</span><span>Wybierz inny widok lub zmień wyszukiwanie. Nowe zadanie dodasz w karcie klienta.</span></div>}
          {items.length > 0 && groups.map(g => {
            const isCollapsed = !!collapsed[g.state];
            return (
              <section key={g.state} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="grp" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36, padding: '0 6px 0 4px', borderRadius: 10, marginBottom: 4 }}>
                  <button type="button" aria-expanded={!isCollapsed} onClick={() => setCollapsed(c => ({ ...c, [g.state]: !isCollapsed }))} style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 6px', border: 0, borderRadius: 8, background: 'transparent', textAlign: 'left' }}>
                    <span className="caret" style={{ display: 'inline-flex', color: 'var(--text-tertiary)', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>{DI.caret}</span>
                    <StatusIcon state={g.state} />
                    <h2 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>{stateLabel[g.state]}</h2>
                    <span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{g.rows.length}</span>
                  </button>
                </div>
                {!isCollapsed && <div style={{ overflowX: 'auto', margin: '0 -8px' }}><div style={{ minWidth: 600 }}>
                  {g.rows.map(t => {
                    const due = dueLabel(t, data.today), sel = t.id === selected?.id;
                    return (
                      <a key={t.id} id={`task-${t.id}`} href={myTaskCustomerHref(t)} className={`row${sel ? ' sel' : ''}`} aria-current={sel ? 'true' : undefined}
                        onClick={e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); select(t); }}
                        style={{ display: 'grid', gridTemplateColumns: '14px minmax(0px, 1fr) auto 76px 20px', alignItems: 'center', columnGap: 12, height: 36, padding: '0 8px', borderRadius: 10 }}>
                        <span role="img" aria-label={stateLabel[t.state]} title={stateLabel[t.state]} style={{ display: 'inline-flex', alignItems: 'center' }}><StatusIcon state={t.state} /></span>
                        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                          <span className="ell" style={{ flex: '0 1 auto', fontWeight: 500 }}>{t.title}</span>
                          <span className="ell" style={{ flex: '0 10000 auto', fontSize: 12, color: 'var(--text-tertiary)' }}>{t.customerName}</span>
                        </span>
                        <span style={{ display: 'flex', justifyContent: 'flex-end' }}>{t.kind === 'follow_up' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 20, padding: '0 6px', borderRadius: 6, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', background: 'var(--bg-subtle)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(59, 130, 214)' }} />Kontakt z klientem</span>}</span>
                        <span className="num" title={`${due.title}: ${longDay(t.dueOn)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontSize: 12, color: due.color, fontWeight: due.weight }}>{due.icon}<span>{due.text}</span></span>
                        <span style={{ display: 'flex', justifyContent: 'flex-end' }}><span title={t.assigneeLabel} style={avatar(20, 9)}>{initials(t.assigneeLabel)}</span></span>
                      </a>
                    );
                  })}
                </div></div>}
              </section>
            );
          })}
        </div>
        {selected && (
          <aside ref={panelRef} aria-label={`Szczegóły zadania: ${selected.title}`} className="tl-panel" style={{ flex: '0 0 400px', minWidth: 0, borderLeft: '1px solid var(--edge)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 44, padding: '0 8px 0 20px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>{selected.kind === 'follow_up' ? 'Kontakt z klientem' : 'Zadanie'}</span>
              <span style={{ flex: '1 1 auto' }} />
              <button type="button" className="ib" aria-label="Kopiuj link" title={copied ? 'Skopiowano' : 'Kopiuj link'} onClick={copyLink} style={ib(24)}>{DI.link}</button>
              <Link className="ib" href={myTaskCustomerHref(selected)} aria-label="Otwórz w karcie klienta" title="Otwórz w karcie klienta" style={ib(24)}>{DI.building}</Link>
              <button type="button" className="ib" aria-label="Zamknij panel" title="Zamknij  Esc" onClick={() => setPanelOn(false)} style={ib(24)}>{DI.x}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 20px 16px' }}>
              <h2 style={{ margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 600, letterSpacing: '-0.01em' }}>{selected.title}</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selected.description || 'Brak dodatkowego opisu.'}</p>
            </div>
            <div aria-label="Właściwości zadania" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 20px 16px' }}>
              <span className="capd" title="Status" style={capd}><StatusIcon state={selected.state} />{stateLabel[selected.state]}</span>
              <span className="capd" title="Osoba" style={{ ...capd, padding: '0 10px 0 4px' }}><span aria-hidden="true" style={{ ...avatar(20, 9), background: 'var(--bg-surface)' }}>{initials(selected.assigneeLabel)}</span>{selected.assigneeLabel}</span>
              {(() => { const d = dueLabel(selected, data.today); return <span className="capd" title={`Termin: ${longDay(selected.dueOn)}`} style={{ ...capd, fontWeight: 500, color: d.color }}>{d.icon}{d.text}</span>; })()}
              {selected.contactLabel && <span className="capd" title="Osoba kontaktowa" style={{ ...capd, padding: '0 10px' }}><span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgb(59, 130, 214)' }} />{selected.contactLabel}</span>}
            </div>
            <Link href={myTaskCustomerHref(selected)} className="prop" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, margin: '-8px 12px 12px', padding: '0 8px', borderRadius: 10, minWidth: 0 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Klient</span>
              <span className="ell">{selected.customerName}</span>
            </Link>
            <section aria-label="Aktywność" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 20px 20px' }}>
              <h3 style={{ margin: 0, fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Aktywność</h3>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}><span className="ell" style={{ flex: '1 1 auto' }}>Zadanie utworzone</span><span className="num" title={stamp(selected.createdAt)} style={{ color: 'var(--text-tertiary)' }}>{stampShort(selected.createdAt)}</span></li>
                {selected.updatedAt !== selected.createdAt && <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}><span className="ell" style={{ flex: '1 1 auto' }}>Ostatnia zmiana</span><span className="num" title={stamp(selected.updatedAt)} style={{ color: 'var(--text-tertiary)' }}>{stampShort(selected.updatedAt)}</span></li>}
                {selected.result && <li style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px', borderRadius: 12, background: 'var(--bg-raised)' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, lineHeight: '16px' }}><span style={{ ...avatar(16, 8), fontWeight: 500 }}>{initials(selected.assigneeLabel)}</span><span style={{ flex: '1 1 auto', fontWeight: 500 }}>{selected.assigneeLabel}</span><span style={{ color: 'var(--text-tertiary)' }}>wynik</span></span><span style={{ whiteSpace: 'pre-wrap' }}>{selected.result}</span></li>}
              </ol>
              {selected.state === 'cancelled'
                ? <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Zadanie jest anulowane. Wznowisz je w karcie klienta.</p>
                : <form key={`${selected.id}-${selected.version}`} onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label htmlFor="tl-result" className="vh">Wynik lub postęp</label>
                    <textarea id="tl-result" name="result" rows={3} maxLength={2000} defaultValue={selected.result} placeholder="Wynik lub postęp…" disabled={busy || conflict} style={{ width: '100%', resize: 'none', padding: '8px 12px', border: 0, borderRadius: 10, background: 'var(--bg-raised)', font: 'inherit', color: 'var(--text-primary)', minHeight: 0, boxShadow: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label htmlFor="tl-state" className="vh">Status</label>
                      <select id="tl-state" name="state" defaultValue={selected.state} disabled={busy || conflict} className="capd" style={{ ...capd, padding: '0 8px', appearance: 'auto', font: 'inherit', color: 'var(--text-primary)', minHeight: 0, boxShadow: 'none' }}><option value="todo">Do zrobienia</option><option value="in_progress">W toku</option><option value="done">Gotowe</option></select>
                      <span style={{ flex: '1 1 auto' }} />
                      {conflict
                        ? <button type="button" className="pri" onClick={() => { setConflict(false); setError(''); router.refresh(); }} style={{ height: 28, display: 'inline-flex', alignItems: 'center', padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500 }}>Odśwież listę</button>
                        : <button type="submit" className="pri" disabled={busy} style={{ height: 28, display: 'inline-flex', alignItems: 'center', padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500, opacity: busy ? .6 : 1 }}>{busy ? 'Zapisywanie…' : 'Zapisz'}</button>}
                    </div>
                    {error && <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>{error}</p>}
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>Wynik widzi biuro i przypisana osoba.</p>
                  </form>}
            </section>
          </aside>
        )}
      </div>}
      {footer}
    </main>
  );
}
