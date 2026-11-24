/* Logo firmy / osoby w tabeli (M0.3, DECISIONS 2026-11-21): kwadrat r6 = firma, koło = osoba prywatna.
   Dopóki w danych nie ma logo — inicjały na kolorze marki (src/lib/table/brand.ts, tylko tokeny --ic-*).
   Kolor tekstu dobrany pod kontrast 4,5:1 w obu motywach (opis w brand.ts). */
import { brandColor, type BrandColor } from '@/lib/table/brand';
import { logoInitials, type LogoKind } from '@/lib/table/initials';
import { cx } from '@/lib/cx';

// Pełne nazwy klas (Tailwind wyszukuje je w kodzie jako napisy).
const tone: Record<BrandColor, string> = {
  teal: 'bg-ic-teal text-primary dark:text-on-accent',
  orange: 'bg-ic-orange text-primary dark:text-on-accent',
  green: 'bg-ic-green text-primary dark:text-on-accent',
  yellow: 'bg-ic-yellow text-primary dark:text-on-accent',
  slate: 'bg-ic-slate text-primary dark:text-on-accent',
  indigo: 'bg-ic-indigo text-on-accent',
};

export function Logo({ name, kind = 'company', size = 20, className }: { name: string; kind?: LogoKind; size?: 20 | 32; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 select-none items-center justify-center font-sans font-semibold leading-none',
        size === 20 ? 'size-5 text-micro' : 'size-8 text-small',
        kind === 'person' ? 'rounded-pill' : size === 20 ? 'rounded-xs' : 'rounded-sm',
        tone[brandColor(name)],
        className,
      )}
    >
      {logoInitials(name, kind)}
    </span>
  );
}

/** Miejsce na logo w trakcie ładowania. */
export function LogoSkeleton({ kind = 'company' }: { kind?: LogoKind }) {
  return <span aria-hidden="true" className={cx('inline-block size-5 shrink-0 bg-subtle motion-safe:animate-pulse', kind === 'person' ? 'rounded-pill' : 'rounded-xs')} />;
}
