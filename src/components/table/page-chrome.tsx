/* Rama ekranu z tabelą (M0.3): nagłówek ze ścieżką, pasek widoków i akcji, przełącznik segmentowy, stopka tabeli.
   Wspólna dla Firm, Osób, Zadań i Magazynu; Tailwind na tokenach, bez style={{}}. */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CaretRight } from '@phosphor-icons/react/ssr';
import { pillClasses } from '@/components/ui/pill';
import { cx } from '@/lib/cx';

/** Korzeń ekranu. Klasa `dk` zostaje jako zaczepienie: wyłącza reguły !important dla h1/h2 i przyciski z globals.css (precision.css). */
export function TablePage({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx('dk flex min-h-full flex-auto flex-col bg-surface font-sans text-body leading-5 text-primary', className)}>{children}</main>;
}

export function PageHead({ icon, category, title, children }: { icon?: ReactNode; category: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex h-11 items-center gap-2 pr-3 pl-5 max-desktop:pl-3">
      {icon && <span className="inline-flex text-secondary">{icon}</span>}
      <span className="whitespace-nowrap text-secondary">{category}</span>
      <span className="inline-flex text-tertiary"><CaretRight size={12} className="shrink-0" aria-hidden /></span>
      <h1 className="m-0 whitespace-nowrap font-sans text-body leading-5 font-medium text-primary">{title}</h1>
      {children}
    </div>
  );
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('flex flex-wrap items-center gap-1 py-2 pr-3 pl-4 max-desktop:pl-3', className)}>{children}</div>;
}

export const Spacer = () => <span className="flex-auto" />;

/** Zapisane widoki jako kapsułki-linki (aktywny: aria-current="page"). */
export function ViewTabs({ label, items }: { label: string; items: { label: string; href: string; active: boolean; title?: string }[] }) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1">
      {items.map(i => <Link key={i.href} href={i.href} title={i.title} aria-current={i.active ? 'page' : undefined} className={pillClasses({ active: i.active })}>{i.label}</Link>)}
    </nav>
  );
}

/** Przełącznik segmentowy (Firmy / Osoby, Lista / Tablica): wybrany segment na tle powierzchni. */
export function Segmented({ label, items, className }: { label: string; items: { key: string; href: string; active: boolean; children: ReactNode; title?: string; ariaLabel?: string }[]; className?: string }) {
  return (
    <nav aria-label={label} className={cx('inline-flex items-center gap-1 rounded-md bg-subtle p-1', className)}>
      {items.map(i => (
        <Link
          key={i.key}
          href={i.href}
          title={i.title}
          aria-label={i.ariaLabel}
          aria-current={i.active ? 'page' : undefined}
          className={cx(
            'inline-flex h-6 items-center gap-1 rounded-sm px-2 text-small leading-4 no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
            i.active ? 'bg-surface font-medium text-primary' : 'font-normal text-secondary hover:text-primary',
          )}
        >
          {i.children}
        </Link>
      ))}
    </nav>
  );
}

/** Stopka tabeli: liczby i strony. */
export function TableFooter({ children }: { children: ReactNode }) {
  return <div className="flex min-h-row flex-wrap items-center justify-between gap-4 border-t border-edge px-5 text-small leading-4 text-secondary tabular-nums max-desktop:px-3">{children}</div>;
}

export function PageLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="rounded-xs text-secondary no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent">{children}</Link>;
}

/** Pole szukania w pasku listy (28 px, ikona w polu, etykieta dla czytników). */
export const searchFrameClasses = 'inline-flex h-7 items-center gap-2 rounded-sm bg-subtle px-2 text-small leading-4 text-secondary transition-shadow focus-within:field-ring focus-within:ring-accent max-desktop:h-11';
export const searchInputClasses = 'm-0 h-full min-h-0 min-w-0 rounded-none border-0 bg-transparent p-0 font-sans text-small leading-4 text-primary shadow-none outline-0 placeholder:text-tertiary focus:shadow-none max-desktop:flex-auto';
