'use client';
/* Warstwa pływająca (M0.4, KRA-31): menu, filtr, Opcje widoku. Bez nowych zależności — portal do <body> jak karta podglądu z M0.3,
   więc nie ucina jej obszar przewijania tabeli ani przypięte kolumny.
   - komputer: pod wyzwalaczem (4 px), wyrównana do lewej albo prawej krawędzi, z odbiciem przy krawędziach okna;
   - telefon (≤ 760 px): arkusz przy dolnej krawędzi na pełną szerokość (bez poziomego przewijania strony);
   - Esc zamyka i oddaje fokus wyzwalaczowi (zatrzymany w fazie przechwytywania — nie czyści też zaznaczenia listy),
     kliknięcie poza warstwą i wyjście fokusem poza nią zamyka; ↑ / ↓ przechodzą po pozycjach menu i listy opcji.
   Geometria (left / top) pochodzi z pomiaru, dlatego jest w atrybucie style — jak w src/components/table/. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { hoverCardPosition } from '@/lib/table/hover-card';
import { cx } from '@/lib/cx';

const PHONE = '(max-width: 760px)';

/** Telefon (≤ 760 px) — ten sam próg co wariant `max-desktop:`. */
export function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(PHONE), on = () => setPhone(m.matches);
    on(); m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return phone;
}

const ITEMS = '[role="menuitem"]:not([disabled]),[role="menuitemradio"]:not([disabled]),[role="menuitemcheckbox"]:not([disabled]),[role="option"]:not([aria-disabled="true"])';
const FOCUSABLE = 'input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';

/* Stos otwartych warstw: Esc i klik poza zamykają tylko górną (np. menu otwarte z innej warstwy). */
const stack: symbol[] = [];
const isTop = (id: symbol) => stack[stack.length - 1] === id;

export const popoverBase = 'z-60 flex flex-col overflow-y-auto border border-edge bg-surface font-sans text-body leading-5 font-normal whitespace-normal text-primary shadow-pop';

type Props = {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLElement | null>;
  /** Nazwa warstwy dla czytników. */
  label: string;
  role?: 'dialog' | 'menu' | 'listbox';
  /** Klasa szerokości na komputerze, np. w-72 (na telefonie zawsze pełna szerokość). */
  width?: string;
  align?: 'start' | 'end';
  /** Odstępy wewnątrz (domyślnie p-1). */
  padding?: string;
  children: ReactNode;
};

export function Popover({ open, onClose, anchor, label, role = 'dialog', width = 'w-72', align = 'start', padding = 'p-1', children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const phone = useIsPhone();
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });

  const place = useCallback(() => {
    if (!anchor.current || !box.current) return;
    const a = anchor.current.getBoundingClientRect(), c = box.current.getBoundingClientRect();
    const offsetX = align === 'end' ? a.width - c.width : 0;
    const p = hoverCardPosition({ anchor: a, card: { width: c.width, height: c.height }, viewport: { width: window.innerWidth, height: window.innerHeight }, gap: 4, offsetX });
    setPos({ left: p.left, top: p.top });
  }, [anchor, align]);

  useLayoutEffect(() => { if (open && !phone) place(); if (!open) setPos(null); }, [open, phone, place]);

  useEffect(() => {
    if (!open) return;
    const id = Symbol('popover');
    stack.push(id);
    // Fokus do środka: pierwsze pole albo pozycja menu (zaznaczona, jeśli jest).
    const el = box.current;
    // Pole z autoFocus (np. szukanie w filtrze) dostało już fokus przy montowaniu — nie przenosimy go.
    const target = el?.contains(document.activeElement) ? null : el?.querySelector<HTMLElement>('[aria-checked="true"][role^="menuitem"],[autofocus]') ?? el?.querySelector<HTMLElement>(role === 'dialog' ? FOCUSABLE : ITEMS) ?? el;
    target?.focus({ preventScroll: true });
    const back = () => { const a = anchor.current; if (a && (!document.activeElement || document.activeElement === document.body || box.current?.contains(document.activeElement))) a.focus({ preventScroll: true }); };
    const key = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape' && isTop(id)) { e.stopPropagation(); e.preventDefault(); back(); close.current(); } };
    const down = (e: MouseEvent) => { const t = e.target as Node; if (!isTop(id) || box.current?.contains(t) || anchor.current?.contains(t)) return; close.current(); };
    const resize = () => place();
    const scroll = (e: Event) => { if (box.current?.contains(e.target as Node)) return; place(); };
    window.addEventListener('keydown', key, true);
    document.addEventListener('mousedown', down);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', scroll, true);
    return () => { const i = stack.indexOf(id); if (i >= 0) stack.splice(i, 1); window.removeEventListener('keydown', key, true); document.removeEventListener('mousedown', down); window.removeEventListener('resize', resize); window.removeEventListener('scroll', scroll, true); };
  }, [open, anchor, role, place]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    const items = [...(box.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])];
    if (!items.length) return;
    const t = e.target as HTMLElement;
    if (t.tagName === 'SELECT' || (t.tagName === 'INPUT' && (e.key === 'Home' || e.key === 'End'))) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : i < 0 ? (e.key === 'ArrowDown' ? 0 : items.length - 1) : Math.min(items.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
    items[next]?.focus();
  }

  function onBlur(e: FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && !box.current?.contains(next) && !anchor.current?.contains(next)) onClose();
  }

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={box}
      role={role}
      aria-label={label}
      data-popover=""
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      style={phone || !pos ? undefined : { left: pos.left, top: pos.top }}
      className={cx(
        popoverBase,
        padding,
        'fixed outline-0',
        phone ? 'inset-x-2 bottom-2 max-h-120 rounded-xl' : cx('top-0 left-0 max-h-120 rounded-xl', width, !pos && 'invisible'),
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
