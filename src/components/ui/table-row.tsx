/* Bazowy wiersz tabeli / listy 36 px (Precision UI, M0.2; rozwijany w M0.3 „Tabele w jednej linii”).
   list  — wiersz z zaokrągleniem i tłem przy najechaniu (Mój dzień, listy w panelach);
   table — wiersz z separatorem --edge (tabele kolekcji).
   Stany: hover, aktywny (wybrany: data-selected, a dla linku też aria-current), fokus (pierścień --accent), wyłączony,
   ładowanie (TableRowSkeleton), pusty (TableEmpty), błąd (TableError).
   Bez ról ARIA tabeli (row / aria-selected) — poza kontekstem grid byłyby błędne; pełna semantyka tabeli przyjdzie w M0.3. */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type Variant = 'list' | 'table';

export function tableRowClasses({ variant = 'list', selected = false, disabled = false, interactive = false, className }: { variant?: Variant; selected?: boolean; disabled?: boolean; interactive?: boolean; className?: string } = {}) {
  return cx(
    'grid h-row min-w-0 grid-flow-col items-center gap-3 px-2 font-sans text-body leading-5 text-primary no-underline whitespace-nowrap transition-colors',
    variant === 'list' ? 'rounded-md' : 'border-b border-edge',
    selected ? 'bg-subtle' : interactive && !disabled ? 'hover:bg-subtle' : '',
    disabled ? 'cursor-not-allowed opacity-50' : interactive && 'cursor-pointer',
    interactive && 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent',
    className,
  );
}

type Props = {
  children: ReactNode;
  variant?: Variant;
  /** Szerokości kolumn (grid-template-columns) — zależą od ekranu, dlatego są daną, nie klasą. */
  columns?: string;
  selected?: boolean;
  disabled?: boolean;
  /** Wiersz-link (Enter otwiera rekord). */
  href?: string;
  className?: string;
  title?: string;
};

export function TableRow({ children, variant = 'list', columns, selected = false, disabled = false, href, className, title }: Props) {
  const style = columns ? { gridTemplateColumns: columns } : undefined;
  if (href && !disabled) {
    return <Link href={href} aria-current={selected ? 'true' : undefined} data-selected={selected || undefined} title={title} className={tableRowClasses({ variant, selected, interactive: true, className })} style={style}>{children}</Link>;
  }
  return <div data-selected={selected || undefined} aria-disabled={disabled || undefined} title={title} className={tableRowClasses({ variant, selected, disabled, className })} style={style}>{children}</div>;
}

/** Wiersz w trakcie ładowania: szare paski w miejscu treści (bez spinnera). */
export function TableRowSkeleton({ variant = 'list', cells = 3, className }: { variant?: Variant; cells?: number; className?: string }) {
  return (
    <div aria-hidden className={tableRowClasses({ variant, className })}>
      {Array.from({ length: cells }, (_, i) => <span key={i} className={cx('block h-3 rounded-xs bg-subtle motion-safe:animate-pulse', i === 0 ? 'w-24' : 'w-16')} />)}
    </div>
  );
}

/** Pusty stan listy: jedno zdanie i jedna akcja (z podpowiedzią skrótu w samej akcji). */
export function TableEmpty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div role="status" className="flex min-h-row items-center gap-3 px-2 text-body leading-5 text-secondary">{children}{action}</div>;
}

/** Błąd wczytania listy: co się stało i co zrobić. */
export function TableError({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div role="alert" className="flex min-h-row items-center gap-3 px-2 text-body leading-5 text-danger">{children}{action}</div>;
}
