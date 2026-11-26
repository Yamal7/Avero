'use client';
/* Firma / osoba w komórce tabeli z kartą podglądu 280 px (M0.3, DECISIONS 2026-11-21 i 2026-11-22; wzór: _hc i HC_CSS w design/tools/ui1.py).
   - wyzwalacz to link do karty klienta: najechanie (z opóźnieniem) albo fokus klawiatury pokazuje kartę, ↵ otwiera kartę klienta, Esc zamyka podgląd;
   - karta jest w portalu (createPortal do <body>, position: fixed), więc leży nad wierszami i przypiętymi kolumnami
     i nie ucina jej obszar przewijania tabeli; pozycja z prostokąta wyzwalacza, odbicie przy krawędziach ekranu (src/lib/table/hover-card.ts);
   - przewinięcie strony lub zmiana rozmiaru okna zamyka kartę (nie trzeba jej śledzić).
   Brakujące dane (np. umowa, branża) nie mają wiersza w karcie. */
import Link from 'next/link';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, Phone, Scroll, User } from '@phosphor-icons/react/ssr';
import { Logo } from './logo';
import { hoverCardPosition } from '@/lib/table/hover-card';
import type { LogoKind } from '@/lib/table/initials';
import { cx } from '@/lib/cx';

export type CustomerCard = {
  /** Branża / kategorie albo „Klient indywidualny”. */
  subtitle?: string | null;
  city?: string | null;
  owner?: string | null;
  contract?: string | null;
  phone?: string | null;
  lastContact?: { text: string; title?: string } | null;
};

/* eslint-disable avero/tailwind-tokens -- odstępy karty 1:1 z HC_CSS (gap 10 px, wiersze co 6 px) spoza siatki 4 px; pytanie w docs/STATUS.md (M0.3) */
const offGrid = { card: 'gap-2.5', head: 'gap-2.5', rows: 'gap-1.5', foot: 'gap-1.5' };
/* eslint-enable avero/tailwind-tokens */

export const customerLogoBase = 'inline-flex min-w-0 items-center gap-2 rounded-xs text-primary no-underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent';

const OPEN_DELAY = 350, CLOSE_DELAY = 120, WIDTH = 280;

function CardRow({ icon, children, title }: { icon: ReactNode; children: ReactNode; title?: string }) {
  return <span title={title} className="flex min-w-0 items-center gap-2">{icon}<span className="min-w-0 truncate">{children}</span></span>;
}

export function CustomerLogo({ name, kind = 'company', href, card, showName = false, className }: { name: string; kind?: LogoKind; href: string; card?: CustomerCard; showName?: boolean; className?: string }) {
  const id = useId();
  const trigger = useRef<HTMLAnchorElement>(null), box = useRef<HTMLDivElement>(null), timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false), [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = undefined; };
  const show = useCallback((delay: number) => { clear(); timer.current = setTimeout(() => setOpen(true), delay); }, []);
  const hide = useCallback((delay = CLOSE_DELAY) => { clear(); timer.current = setTimeout(() => { setOpen(false); setPos(null); }, delay); }, []);
  useEffect(() => clear, []);

  // Pozycja po pierwszym renderze (karta jest niewidoczna, dopóki nie znamy jej wysokości).
  useLayoutEffect(() => {
    if (!open || !trigger.current || !box.current) return;
    const a = trigger.current.getBoundingClientRect(), c = box.current.getBoundingClientRect();
    setPos(hoverCardPosition({ anchor: a, card: { width: c.width || WIDTH, height: c.height }, viewport: { width: window.innerWidth, height: window.innerHeight } }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Esc zamyka kartę. Gdy fokus jest na wyzwalaczu (karta otwarta klawiaturą), Esc należy do karty — zatrzymujemy go
    // w fazie przechwytywania, żeby nie zamknął też panelu szczegółów. Przy karcie otwartej myszą tylko ją zamykamy,
    // a Esc trafia dalej do innych obsług (panel, okno).
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (document.activeElement === trigger.current) { e.stopPropagation(); e.preventDefault(); }
      clear(); setOpen(false); setPos(null);
    };
    const away = () => { clear(); setOpen(false); setPos(null); };
    window.addEventListener('keydown', key, true);
    window.addEventListener('scroll', away, true);
    window.addEventListener('resize', away);
    return () => { window.removeEventListener('keydown', key, true); window.removeEventListener('scroll', away, true); window.removeEventListener('resize', away); };
  }, [open]);

  const rows: ReactNode[] = [];
  if (card?.city) rows.push(<CardRow key="city" icon={<MapPin size={14} className="shrink-0 text-ic-red" aria-hidden />}>{card.city}</CardRow>);
  if (card?.owner) rows.push(<CardRow key="owner" icon={<User size={14} className="shrink-0 text-ic-indigo" aria-hidden />}>Opiekun: {card.owner}</CardRow>);
  if (card?.contract) rows.push(<CardRow key="contract" icon={<Scroll size={14} className="shrink-0 text-ic-green" aria-hidden />}>{card.contract}</CardRow>);
  if (card?.phone) rows.push(<CardRow key="phone" icon={<Phone size={14} className="shrink-0 text-ic-teal" aria-hidden />}><span className="tabular-nums">{card.phone}</span></CardRow>);
  if (card?.lastContact) rows.push(<CardRow key="last" title={card.lastContact.title} icon={<Clock size={14} className="shrink-0 text-ic-slate" aria-hidden />}>Ostatni kontakt: {card.lastContact.text}</CardRow>);

  const panel = open && typeof document !== 'undefined' && createPortal(
    <div
      ref={box}
      id={id}
      role="tooltip"
      onMouseEnter={() => clear()}
      onMouseLeave={() => hide()}
      style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0 }}
      className={cx('fixed z-50 flex w-70 flex-col rounded-xl border border-edge bg-surface p-3 text-left font-sans text-body leading-5 font-normal whitespace-normal text-primary shadow-pop', offGrid.card, !pos && 'invisible')}
    >
      <span className={cx('flex items-center', offGrid.head)}>
        <Logo name={name} kind={kind} size={32} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-primary">{name}</span>
          {(card?.subtitle || kind === 'person') && <span className="truncate text-small leading-4 text-secondary">{card?.subtitle || 'Klient indywidualny'}</span>}
        </span>
      </span>
      {rows.length > 0 && <span className={cx('flex flex-col text-small leading-4 text-secondary', offGrid.rows)}>{rows}</span>}
      {/* Link dubluje wyzwalacz (ten sam adres, ↵ na wyzwalaczu) — dla myszy; ukryty przed czytnikami i poza kolejnością fokusu,
          bo treść karty jest opisem wyzwalacza (role="tooltip" + aria-describedby). */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className={cx('flex items-center border-t border-edge pt-2 text-small leading-4 text-tertiary no-underline hover:text-secondary', offGrid.foot)}>
        Otwórz kartę klienta<span className="flex-auto" /><kbd className="font-mono text-micro">↵</kbd>
      </Link>
    </div>,
    document.body,
  );

  return (
    <>
      <Link
        ref={trigger}
        href={href}
        aria-label={showName ? undefined : name}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => show(OPEN_DELAY)}
        onMouseLeave={() => hide()}
        onFocus={e => { if (e.currentTarget.matches(':focus-visible')) show(0); }}
        onBlur={() => hide(0)}
        onClick={e => e.stopPropagation()}
        className={cx(customerLogoBase, className)}
      >
        <Logo name={name} kind={kind} />
        {showName && <span className="min-w-0 truncate font-medium hover:underline">{name}</span>}
      </Link>
      {panel}
    </>
  );
}
