'use client';
/* Przełącznik firmy w ramie (M0.1, DECISIONS 2026-11-20: „Kranz HVACR ▾” to przełącznik organizacji).
   Widoczny tylko, gdy osoba należy do więcej niż jednej firmy; przy jednej firmie rama pokazuje zwykły przycisk profilu.
   Menu: strzałki lub J/K, Home/End, Enter/Spacja — przełącz, Esc — zamknij. Po przełączeniu dane ładują się od nowa
   (przejście na /dashboard + router.refresh), bo każda lista należy do aktywnej firmy. Wyłącznie Tailwind na tokenach. */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CaretDown, Check, CircleNotch, UserCircle } from '@phosphor-icons/react/ssr';
import { apiErrorSchema, nextOrganizationIndex, organizationsSchema, type Organization } from '@hvac/api-client';
import { roleLabels, type AccessRole } from '@/lib/access/types';
import { shell } from './app-shell-classes';

const focusRing = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';
const item = `flex h-8 min-h-0 w-full items-center gap-2 rounded-md border-0 bg-transparent px-2 py-0 text-left text-body leading-5 font-normal text-primary transition-colors hover:bg-subtle data-[highlight=true]:bg-subtle aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${focusRing}`;
const roleLabel = (role: Organization['role']) => role === 'client' ? 'Portal klienta' : roleLabels[role as AccessRole] ?? role;

export function OrgSwitcher({ organizations, onProfile }: { organizations: Organization[]; onProfile: (trigger: HTMLElement) => void }) {
  const router = useRouter();
  const menuId = useId();
  const trigger = useRef<HTMLButtonElement>(null), menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false), [highlight, setHighlight] = useState(-1);
  const [pending, setPending] = useState<string | null>(null), [error, setError] = useState('');
  const active = organizations.find(o => o.active) ?? organizations[0];
  const name = active?.name ?? 'Avero';
  const count = organizations.length + 1; // firmy + „Twój profil”

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  useEffect(() => { if (open && highlight >= 0) menu.current?.querySelectorAll<HTMLElement>('[data-menu-item]')[highlight]?.focus(); }, [open, highlight]);

  function show(at: 'active' | 'first' | 'last') {
    setError('');
    const current = organizations.findIndex(o => o.active);
    setHighlight(at === 'active' ? Math.max(current, 0) : nextOrganizationIndex(-1, count, at));
    setOpen(true);
  }
  function hide(focusTrigger = true) { setOpen(false); setHighlight(-1); if (focusTrigger) trigger.current?.focus(); }

  async function choose(org: Organization) {
    if (pending) return;
    if (org.active) { hide(); return; }
    setPending(org.id); setError('');
    try {
      const response = await fetch('/api/v1/me/organization', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId: org.id }) });
      const value: unknown = await response.json();
      if (!response.ok) { const parsed = apiErrorSchema.safeParse(value); throw new Error(parsed.success ? parsed.data.error.message : 'Nie udało się przełączyć firmy.'); }
      organizationsSchema.parse(value);
      setOpen(false);
      router.replace('/dashboard');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.name !== 'ZodError' ? e.message : 'Nie udało się potwierdzić przełączenia. Spróbuj ponownie.');
    } finally {
      setPending(null);
    }
  }

  function onTriggerKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) { event.preventDefault(); show('active'); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); show('last'); }
  }
  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, 'next' | 'prev' | 'first' | 'last'> = { ArrowDown: 'next', j: 'next', ArrowUp: 'prev', k: 'prev', Home: 'first', End: 'last' };
    const move = moves[event.key];
    if (move) { event.preventDefault(); setHighlight(h => nextOrganizationIndex(h, count, move)); return; }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); hide(); return; }
    if (event.key === 'Tab') hide(false);
  }

  return <div className="relative flex min-w-0 flex-auto">
    <button ref={trigger} type="button" className={shell.workspace} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
      title={`${name} — przełącz firmę (Enter, strzałki)`} onClick={() => open ? hide() : show('active')} onKeyDown={onTriggerKey}>
      <span className={shell.mark}>{name.trim()[0]?.toUpperCase() || 'A'}</span>
      <span className="min-w-0 truncate font-medium max-desktop:hidden">{name}</span>
      <CaretDown size={14} className="shrink-0 text-tertiary" aria-hidden />
    </button>
    {open && <div ref={menu} id={menuId} role="menu" aria-label="Firmy" aria-busy={pending ? true : undefined} onKeyDown={onMenuKey}
      className="absolute top-full left-0 z-70 mt-1 flex w-68 flex-col rounded-xl border border-edge bg-surface p-1 shadow-pop">
      <p className="m-0 px-2 pt-1 pb-1 text-small leading-4 text-tertiary">Firmy</p>
      {organizations.map((org, i) => {
        const busy = pending === org.id, locked = pending !== null && !busy;
        return <button key={org.id} type="button" role="menuitemradio" aria-checked={org.active} data-menu-item data-highlight={highlight === i}
          tabIndex={highlight === i ? 0 : -1} aria-disabled={locked || undefined} aria-busy={busy || undefined} className={item}
          onMouseEnter={() => setHighlight(i)} onClick={() => { if (!locked) void choose(org); }}>
          <span className={shell.mark} aria-hidden>{org.name.trim()[0]?.toUpperCase() || 'A'}</span>
          <span className="min-w-0 flex-auto truncate">{org.name}</span>
          <span className="shrink-0 text-small text-tertiary">{roleLabel(org.role)}</span>
          <span className="inline-flex size-4 shrink-0 items-center justify-center text-accent" aria-hidden>
            {busy ? <CircleNotch size={14} className="animate-spin text-tertiary" /> : org.active ? <Check size={14} weight="bold" /> : null}
          </span>
        </button>;
      })}
      <span role="separator" className="my-1 h-px bg-edge" />
      <button type="button" role="menuitem" data-menu-item data-highlight={highlight === organizations.length} tabIndex={highlight === organizations.length ? 0 : -1}
        className={item} onMouseEnter={() => setHighlight(organizations.length)} onClick={() => { setOpen(false); setHighlight(-1); if (trigger.current) onProfile(trigger.current); }}>
        <UserCircle size={16} className="shrink-0 text-tertiary" aria-hidden /><span className="min-w-0 flex-auto truncate">Twój profil i motyw</span>
      </button>
      {error && <p role="alert" className="m-0 px-2 pt-1 pb-1 text-small leading-4 text-danger">{error}</p>}
      <p className="m-0 px-2 pt-1 pb-1 text-micro leading-4 text-tertiary">J/K — wybór · Enter — przełącz · Esc — zamknij</p>
    </div>}
  </div>;
}
