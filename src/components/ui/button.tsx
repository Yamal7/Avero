/* Przycisk (Precision UI, M0.2): wyłącznie klasy Tailwinda na tokenach z docs/design/tokens.css.
   Warianty: pri (akcja główna, akcent — 1–3 na ekranie), sec (wypełnienie bg-subtle, bez ramki), ghost, icon (okrągły, sama ikona).
   Stany: hover, aktywny (wciśnięty), fokus (pierścień --accent), wyłączony, ładowanie (aria-busy, ikona obrotu). */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { CircleNotch } from '@phosphor-icons/react/ssr';
import { cx } from '@/lib/cx';

export type ButtonVariant = 'pri' | 'sec' | 'ghost' | 'icon';
export type ButtonSize = 'md' | 'sm';

// Klasy bazowe nadpisują reguły legacy dla `button` (warstwa utilities wygrywa z warstwą legacy).
const base = 'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-0 font-sans text-body leading-5 font-medium no-underline select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress';
const sizes: Record<ButtonSize, string> = {
  md: 'h-control min-h-0 rounded-md px-3 max-desktop:min-h-11',
  sm: 'h-7 min-h-0 rounded-sm px-2 max-desktop:min-h-11',
};
const iconSizes: Record<ButtonSize, string> = {
  md: 'size-8 min-h-0 rounded-pill p-0',
  sm: 'size-7 min-h-0 rounded-pill p-0',
};
const variants: Record<ButtonVariant, string> = {
  pri: 'bg-accent text-on-accent enabled:hover:bg-accent/90 enabled:active:bg-accent/80',
  sec: 'bg-subtle text-primary enabled:hover:bg-shell-hover enabled:active:bg-border',
  ghost: 'bg-transparent text-secondary enabled:hover:bg-subtle enabled:hover:text-primary enabled:active:bg-shell-hover',
  icon: 'bg-transparent text-secondary enabled:hover:bg-subtle enabled:hover:text-primary enabled:active:bg-shell-hover',
};

export function buttonClasses({ variant = 'sec', size = 'md', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cx(base, variant === 'icon' ? iconSizes[size] : sizes[size], variants[variant], className);
}

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ikona przed etykietą (dla wariantu icon — jedyna treść; wtedy wymagany aria-label). */
  icon?: ReactNode;
  /** Skrót klawiszowy pokazywany w podpowiedzi, np. "C" albo "⌘K". */
  shortcut?: string;
  loading?: boolean;
  children?: ReactNode;
};

export function Button({ variant = 'sec', size = 'md', icon, shortcut, loading = false, disabled, className, title, type = 'button', children, ...rest }: Props) {
  const tip = shortcut ? `${title ?? (typeof children === 'string' ? children : rest['aria-label'] ?? '')}  ${shortcut}`.trim() : title;
  const glyph = loading ? <CircleNotch size={size === 'sm' ? 14 : 16} className="shrink-0 motion-safe:animate-spin" aria-hidden /> : icon;
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={tip}
      aria-keyshortcuts={shortcut}
      {...rest}
    >
      {glyph}
      {variant !== 'icon' && children}
    </button>
  );
}
