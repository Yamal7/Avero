/* Kapsułka (Precision UI, M0.2): właściwość („R404A 5,4 kg”) albo filtr / przełącznik widoku.
   Pełne zaokrąglenie (--radius-pill) tylko tutaj. Stany interaktywnej: hover, aktywna (wybrana), fokus, wyłączona. */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

const base = 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-pill font-sans text-small leading-4 no-underline';

/** Klasy kapsułki-filtra (także dla linków Next.js w zakładkach list). */
export function pillClasses({ active = false, size = 'md', className }: { active?: boolean; size?: 'md' | 'sm'; className?: string } = {}) {
  return cx(
    base,
    size === 'md' ? 'h-7 px-3 text-body leading-5' : 'h-6 px-2',
    'border-0 py-0 min-h-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent max-desktop:h-9',
    active ? 'bg-subtle font-medium text-primary' : 'bg-transparent font-normal text-secondary hover:bg-transparent hover:text-primary',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-secondary',
    className,
  );
}

/** Kapsułka właściwości: ikona + 1–2 słowa lub liczba; pełne szczegóły w podpowiedzi (title). */
export function Pill({ icon, children, title, className }: { icon?: ReactNode; children: ReactNode; title?: string; className?: string }) {
  return <span title={title} className={cx(base, 'h-6 bg-subtle px-2 text-secondary', className)}>{icon}{children}</span>;
}

/** Kapsułka-przełącznik (filtr, widok). `active` = wybrana; stan przekazany przez aria-pressed. */
export function PillButton({ active = false, size = 'md', icon, children, className, type = 'button', ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { active?: boolean; size?: 'md' | 'sm'; icon?: ReactNode; children: ReactNode }) {
  return <button type={type} aria-pressed={active} className={pillClasses({ active, size, className })} {...rest}>{icon}{children}</button>;
}

export function PillSkeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx('inline-block h-6 w-16 rounded-pill bg-subtle motion-safe:animate-pulse', className)} />;
}
