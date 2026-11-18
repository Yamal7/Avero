'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmTaskProgressSchema, crmTaskSchema, type MyTask, type MyTasks } from '@hvac/api-client';
import { Icon } from './icon';
import { TaskPlanningButton } from './task-planning';
import { myTaskCustomerHref } from '@/lib/crm/tasks';

type TaskRow = MyTask & { assigneeAvailable?: boolean };
const states = { todo: 'Do wykonania', in_progress: 'W trakcie', done: 'Wykonane', cancelled: 'Anulowane' };
const zone = 'Europe/Warsaw';

function displayDay(value: string) { return new Intl.DateTimeFormat('pl-PL', { timeZone: zone, dateStyle: 'medium' }).format(new Date(value + 'T12:00:00Z')); }
function fullDay(value: string) { return new Intl.DateTimeFormat('pl-PL', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value + 'T12:00:00Z')); }
function fullStamp(value: string) { return new Intl.DateTimeFormat('pl-PL', { timeZone: zone, dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)); }
function shortStamp(value: string) { return new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
function addDays(day: string, n: number) { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function relativeDay(value: string, today: string) {
  if (value === today) return 'Dziś';
  if (value === addDays(today, 1)) return 'Jutro';
  if (value === addDays(today, -1)) return 'Wczoraj';
  return new Intl.DateTimeFormat('pl-PL', { timeZone: zone, day: 'numeric', month: 'short' }).format(new Date(value + 'T12:00:00Z'));
}
function initials(label: string) { return label.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'; }
const isOpen = (t: TaskRow) => t.state === 'todo' || t.state === 'in_progress';
const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function MyTasksBoard({ data, team = false }: { data: MyTasks; team?: boolean }) {
  const router = useRouter();
  const panelRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false), [notice, setNotice] = useState(''), [copied, setCopied] = useState(false);
  const items = data.items as TaskRow[];
  const selected = items.find(t => t.id === selectedId) ?? null;

  function select(task: TaskRow | null, focusPanel = false) {
    setSelectedId(task?.id ?? null); setError(''); setConflict(false); setCopied(false);
    if (task) {
      if (focusPanel) requestAnimationFrame(() => panelRef.current?.focus());
      requestAnimationFrame(() => document.getElementById(`task-row-${task.id}`)?.scrollIntoView({ block: 'nearest' }));
    } else if (selectedId) requestAnimationFrame(() => document.getElementById(`task-open-${selectedId}`)?.focus());
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || busy) return;
      if (e.key === 'Escape' && selectedId && !document.querySelector('dialog[open]')) { e.preventDefault(); select(null); return; }
      if (typing(e.target) || document.querySelector('dialog[open]')) return;
      if (e.key === 'j' || e.key === 'k') {
        if (!items.length) return;
        e.preventDefault();
        const i = items.findIndex(t => t.id === selectedId);
        const next = i < 0 ? 0 : Math.min(items.length - 1, Math.max(0, i + (e.key === 'j' ? 1 : -1)));
        select(items[next]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!selected) return;
    const form = new FormData(e.currentTarget), input = crmTaskProgressSchema.safeParse({ version: selected.version, state: form.get('state'), result: form.get('result') });
    if (!input.success) { setError('Sprawdź status i długość wyniku (maksymalnie 2000 znaków, 80 wierszy).'); return; }
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/v1/customers/${selected.customerId}/tasks/${selected.id}/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input.data) }), body = await r.json();
      if (!r.ok) { if (r.status === 409) { setConflict(true); throw new Error('Zadanie zostało zmienione przez kogoś innego. Odśwież listę przed kolejną zmianą.'); } throw new Error(body.error?.message || 'Nie udało się zapisać postępu.'); }
      const task = crmTaskSchema.parse(body);
      if (task.id !== selected.id || task.customerId !== selected.customerId || task.assigneeId !== (team ? selected.assigneeId : data.viewerId)) throw new Error('Nieprawidłowa odpowiedź zapisu. Odśwież listę.');
      setNotice(`${states[task.state]}: ${task.title}`); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }

  async function copyLink() {
    if (!selected) return;
    try { await navigator.clipboard.writeText(new URL(myTaskCustomerHref(selected), window.location.origin).toString()); setCopied(true); } catch { setError('Nie udało się skopiować linku. Otwórz zadanie w karcie klienta i skopiuj adres z paska przeglądarki.'); }
  }

  const list = (
    <div className="my-tasks-list" role="list" aria-label="Zadania">
      {items.map(task => {
        const late = isOpen(task) && task.dueOn < data.today, active = task.id === selectedId;
        return (
          <article id={`task-row-${task.id}`} role="listitem" className={`my-task-row${active ? ' is-selected' : ''}`} key={task.id} onClick={e => { if (!(e.target as HTMLElement).closest('a,button')) select(task); }}>
            <span className={`my-task-symbol ${late ? 'my-task-late' : ''}`}><Icon name={task.state === 'done' ? 'check' : 'calendar'} size={19} /></span>
            <div className="my-task-main">
              <div className="crm-inline">
                <h2><button id={`task-open-${task.id}`} type="button" className="my-task-open" aria-expanded={active} aria-controls="task-panel" onClick={() => select(active ? null : task, true)}>{task.title}</button></h2>
                <span className={`badge crm-task-${task.state}`}>{states[task.state]}</span>
              </div>
              <div className="my-task-meta">
                <Link className="my-task-customer" href={myTaskCustomerHref(task)}>{task.customerName}</Link>
                {team && <span className="team-task-assignee">{task.assigneeLabel}{task.assigneeAvailable === false ? ' · nieaktywny przydział' : ''}</span>}
                <time className={late ? 'my-task-late' : ''} dateTime={task.dueOn} title={fullDay(task.dueOn)}>{displayDay(task.dueOn)}{late ? ' · Po terminie' : task.dueOn === data.today ? ' · Dzisiaj' : ''}</time>
                <span>{task.kind === 'follow_up' ? 'Kontakt z klientem' : 'Zadanie'}</span>
                {task.contactLabel && <span>{task.contactLabel}</span>}
              </div>
            </div>
            {team && isOpen(task) && <div className="my-task-actions"><TaskPlanningButton task={task} onSaved={setNotice} /></div>}
          </article>
        );
      })}
      {items.length === 0 && <div className="crm-empty"><Icon name="calendar" size={30} /><h2>Brak zadań w tym widoku</h2><p className="muted">Wybierz inny termin lub zmień wyszukiwanie. Nowe zadanie dodasz w karcie klienta.</p><Link className="button secondary" href="/dashboard/customers">Przejdź do klientów</Link></div>}
      {items.length > 0 && !selected && <p className="tp-hint">Wybierz zadanie, aby zobaczyć szczegóły. <kbd>J</kbd> <kbd>K</kbd> przechodzą między zadaniami.</p>}
    </div>
  );

  return (
    <>
      {notice && <p role="status" className="my-tasks-notice">{notice}</p>}
      <div className={`tp${selected ? ' has-panel' : ''}`}>
        {list}
        {selected && (
          <aside id="task-panel" ref={panelRef} tabIndex={-1} className="tp-panel" aria-label={`Szczegóły zadania: ${selected.title}`}>
            <div className="tp-head">
              <span className="tp-kind">{selected.kind === 'follow_up' ? 'Kontakt z klientem' : 'Zadanie'}</span>
              <span className="pui-spacer" />
              <button type="button" className="ib" onClick={copyLink} aria-label="Kopiuj link do zadania" title={copied ? 'Skopiowano' : 'Kopiuj link'}><Icon name={copied ? 'check' : 'link'} size={14} /></button>
              <Link className="ib" href={myTaskCustomerHref(selected)} aria-label="Otwórz w karcie klienta" title="Otwórz w karcie klienta"><Icon name="building" size={14} /></Link>
              <button type="button" className="ib" onClick={() => select(null)} aria-label="Zamknij panel" title="Zamknij  Esc"><Icon name="close" size={14} /></button>
            </div>
            <div className="tp-body">
              <h2 className="tp-title">{selected.title}</h2>
              <p className="tp-desc">{selected.description || 'Brak dodatkowego opisu.'}</p>
              <div className="tp-chips" aria-label="Właściwości zadania">
                <span className="tp-chip" title="Status"><span className={`tb-mark is-${selected.state}`} aria-hidden="true" />{states[selected.state]}</span>
                <span className="tp-chip" title="Osoba"><span className="tp-av" aria-hidden="true">{initials(selected.assigneeLabel)}</span>{selected.assigneeLabel}</span>
                <span className={`tp-chip${isOpen(selected) && selected.dueOn < data.today ? ' is-late' : ''}`} title={`Termin: ${fullDay(selected.dueOn)}`}><Icon name="calendar" size={14} /><time dateTime={selected.dueOn}>{relativeDay(selected.dueOn, data.today)}</time></span>
                {selected.contactLabel && <span className="tp-chip" title="Osoba kontaktowa"><Icon name="people" size={14} />{selected.contactLabel}</span>}
              </div>
              <Link className="tp-rel" href={myTaskCustomerHref(selected)}><span className="tp-rel-label">Klient</span><span className="ell">{selected.customerName}</span><Icon name="right" size={12} /></Link>
              {team && selected.assigneeAvailable === false && <p className="tp-note">Przydział nie jest aktywny. Możesz zamknąć zadanie; przed wznowieniem wskaż aktywnego wykonawcę w karcie klienta.</p>}

              <section className="tp-sec" aria-labelledby="tp-progress">
                <h3 id="tp-progress">Postęp</h3>
                {selected.state === 'cancelled'
                  ? <p className="tp-note">Zadanie jest anulowane. Wznowisz je w karcie klienta.</p>
                  : <form key={`${selected.id}-${selected.version}`} onSubmit={save} className="tp-form">
                      <fieldset disabled={busy || conflict}>
                        <label>Status<select name="state" defaultValue={team && selected.assigneeAvailable === false ? 'done' : selected.state}>{!(team && selected.assigneeAvailable === false) && <><option value="todo">Do wykonania</option><option value="in_progress">W trakcie</option></>}<option value="done">Wykonane</option></select></label>
                        <label>Wynik / postęp<textarea name="result" maxLength={2000} rows={4} defaultValue={selected.result || ''} placeholder="Co zostało zrobione, co dalej" /></label>
                      </fieldset>
                      <p className="tp-hint-sm">Wynik widzi biuro i przypisana osoba.</p>
                      {error && <p role="alert" className="error">{error}</p>}
                      <div className="tp-actions">
                        {conflict ? <button type="button" onClick={() => { setConflict(false); setError(''); router.refresh(); }}>Odśwież listę</button> : <button disabled={busy}>{busy ? 'Zapisywanie…' : 'Zapisz postęp'}</button>}
                        {team && isOpen(selected) && <TaskPlanningButton task={selected} onSaved={setNotice} />}
                      </div>
                    </form>}
              </section>

              <section className="tp-sec" aria-labelledby="tp-activity">
                <h3 id="tp-activity">Aktywność</h3>
                <ol className="tp-log">
                  <li><span className="ell">Zadanie utworzone</span><time className="num" dateTime={selected.createdAt} title={fullStamp(selected.createdAt)}>{shortStamp(selected.createdAt)}</time></li>
                  {selected.updatedAt !== selected.createdAt && <li><span className="ell">Ostatnia zmiana</span><time className="num" dateTime={selected.updatedAt} title={fullStamp(selected.updatedAt)}>{shortStamp(selected.updatedAt)}</time></li>}
                  {selected.completedAt && <li><span className="ell">Oznaczone jako wykonane</span><time className="num" dateTime={selected.completedAt} title={fullStamp(selected.completedAt)}>{shortStamp(selected.completedAt)}</time></li>}
                </ol>
              </section>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
