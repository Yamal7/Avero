/* Przycisk (Precision UI, M0.2): wyłącznie klasy Tailwinda na tokenach z docs/design/tokens.css.
   Warianty: pri (akcja główna, akcent — 1–3 na ekranie), sec (wypełnienie bg-subtle, bez ramki), raised (sec na bloku bg-raised), ghost, icon (okrągły, sama ikona).
   Stany: hover, aktywny (wciśnięty), fokus (pierścień --accent), wyłączony, ładowanie (aria-busy, ikona obrotu).
   Ładowanie nie ustawia `disabled` — przycisk zostaje w kolejności fokusu (aria-disabled + blokada kliknięcia). */
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { CircleNotch } from '@phosphor-icons/react/ssr';
import { cx } from '@/lib/cx';

export type ButtonVariant = 'pri' | 'sec' | 'raised' | 'ghost' | 'icon';
export type ButtonSize = 'md' | 'sm';

// Klasy bazowe nadpisują reguły legacy dla `button` (warstwa utilities wygrywa z warstwą legacy), także padding z globals.css.
const base = 'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-0 py-0 font-sans text-body leading-5 font-medium no-underline select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-busy:cursor-progress';
const sizes: Record<ButtonSize, string> = {
  md: 'h-control min-h-0 rounded-md px-3 max-desktop:min-h-11',
  sm: 'h-7 min-h-0 rounded-sm px-2 max-desktop:min-h-11',
};
// Na telefonie cel dotyku 44 px, jak pozostałe warianty.
const iconSizes: Record<ButtonSize, string> = {
  md: 'size-8 min-h-0 rounded-pill p-0 max-desktop:size-11',
  sm: 'size-7 min-h-0 rounded-pill p-0 max-desktop:size-11',
};
// Hover i wciśnięcie tylko dla aktywnego przycisku (nie wyłączonego i nie w trakcie ładowania).
const live = 'enabled:not-aria-disabled:';
const variants: Record<ButtonVariant, string> = {
  pri: `bg-accent text-on-accent ${live}hover:bg-accent/90 ${live}active:bg-accent/80`,
  sec: `bg-subtle text-primary ${live}hover:bg-shell-hover ${live}active:bg-border`,
  // drugorzędny na bloku bg-raised (np. akcje w sekcji Stan magazynu) — wypełnienie powierzchnią zamiast bg-subtle
  raised: `bg-surface text-primary ${live}hover:bg-subtle ${live}active:bg-border`,
  ghost: `bg-transparent text-secondary ${live}hover:bg-subtle ${live}hover:text-primary ${live}active:bg-shell-hover`,
  icon: `bg-transparent text-secondary ${live}hover:bg-subtle ${live}hover:text-primary ${live}active:bg-shell-hover`,
};

export function buttonClasses({ variant = 'sec', size = 'md', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cx(base, variant === 'icon' ? iconSizes[size] : sizes[size], variants[variant], className);
}

const modifiers: Record<string, string> = { '⌘': 'Meta', '⌥': 'Alt', '⇧': 'Shift', '⌃': 'Control' };
/** Skrót z podpowiedzi („⌘K”, „⇧⌘P”, „C”) w formacie ARIA (`Meta+K`). Sekwencje („G I”) nie mają zapisu ARIA → undefined. */
export function ariaShortcut(shortcut?: string) {
  if (!shortcut || /\s/.test(shortcut.trim())) return undefined;
  const chars = [...shortcut.trim()], parts: string[] = [];
  while (chars.length > 1 && modifiers[chars[0]!]) parts.push(modifiers[chars.shift()!]!);
  const key = chars.join('');
  if (!key || modifiers[key]) return undefined;
  return [...parts, key.length === 1 ? key.toUpperCase() : key].join('+');
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

export function Button({ variant = 'sec', size = 'md', icon, shortcut, loading = false, disabled, className, title, type = 'button', onClick, children, ...rest }: Props) {
  const tip = shortcut ? `${title ?? (typeof children === 'string' ? children : rest['aria-label'] ?? '')}  ${shortcut}`.trim() : title;
  const glyph = loading ? <CircleNotch size={size === 'sm' ? 14 : 16} className="shrink-0 motion-safe:animate-spin" aria-hidden /> : icon;
  const click = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) { event.preventDefault(); return; }
    onClick?.(event);
  };
  return (
    <button
      {...rest}
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      title={tip}
      aria-keyshortcuts={ariaShortcut(shortcut)}
      onClick={click}
    >
      {glyph}
      {variant !== 'icon' && children}
    </button>
  );
}
