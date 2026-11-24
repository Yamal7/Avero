/* Tabela w jednej linii (M0.3, KRA-63): wiersz 36 px (h-row), komórki w siatce z src/lib/table/columns.ts,
   kolumny do głównej włącznie przypięte (sticky, narastające left, nieprzezroczyste tło, linia --edge przy głównej).
   Semantyka ARIA tabeli konsekwentnie: role="table" (TableScroll) → row → columnheader / cell; grupy to rowgroup
   z wierszem-paskiem (jedna komórka z aria-colspan).
   Stany wiersza: hover (bg-subtle, także w przypiętych komórkach), aktywny / zaznaczony (data-selected), fokus
   (pierścień --accent na elemencie w komórce), wyłączony (aria-disabled), ładowanie (TableSkeleton), pusty i błąd (TableMessage).
   Geometria (grid-template-columns, left przypiętej komórki) pochodzi z danych układu, dlatego jest w atrybucie style —
   wyłącznie w tym pliku; ekrany nie mają style={{}}. */
import type { HTMLAttributes, ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react/ssr';
import { cellPin, columnIndex, type TableLayout } from '@/lib/table/columns';
import { cx } from '@/lib/cx';

type Layout = Pick<TableLayout, 'keys' | 'template' | 'pinnedLeft' | 'mainIndex'>;

const pinnedBase = 'sticky z-10';

const pinProps = (layout: Layout, col: string) => cellPin(layout, columnIndex(layout, col));

type RowProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
  layout: Layout;
  selected?: boolean;
  disabled?: boolean;
  /** Linie między wierszami (Firmy, Osoby — DECISIONS: „tu wyjątkowo linie”). */
  lines?: boolean;
  /** Kliknięcie wiersza coś robi (zaznaczenie) — kursor. Zaznaczenie dla czytników niesie aria-current na linku w komórce
      (aria-selected wolno tylko w role="grid"). */
  interactive?: boolean;
  children: ReactNode;
};

export function Row({ layout, selected = false, disabled = false, lines = false, interactive = false, className, children, ...rest }: RowProps) {
  return (
    <div
      role="row"
      aria-disabled={disabled || undefined}
      data-selected={selected || undefined}
      style={{ gridTemplateColumns: layout.template }}
      className={cx(
        'group/row grid h-row min-w-0 items-center font-sans text-body leading-5 whitespace-nowrap text-primary transition-colors duration-fast',
        lines ? 'border-b border-edge' : 'rounded-md',
        selected ? 'bg-subtle' : !disabled && 'hover:bg-subtle',
        interactive && !disabled && 'cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type CellProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
  layout: Layout;
  /** Klucz kolumny z układu. */
  col: string;
  align?: 'left' | 'right' | 'center';
  /** Komórka nagłówka (tło bez najechania). */
  header?: boolean;
  /** Ucinanie treści (domyślnie). false — dla komórek z własnym menu rozwijanym (np. kategorie osoby). */
  clip?: boolean;
  children?: ReactNode;
};

const justify = { left: 'justify-start text-left', right: 'justify-end text-right', center: 'justify-center text-center' };

export function Cell({ layout, col, align = 'left', header = false, clip = true, className, children, ...rest }: CellProps) {
  const pin = pinProps(layout, col);
  return (
    <div
      role={header ? 'columnheader' : 'cell'}
      style={pin ? { left: pin.left } : undefined}
      className={cx(
        'flex h-full min-w-0 items-center gap-2 pr-3 first:rounded-l-md first:pl-2',
        clip && 'overflow-hidden',
        justify[align],
        pin && pinnedBase,
        pin && (header ? 'bg-surface' : 'bg-surface group-hover/row:bg-subtle group-data-selected/row:bg-subtle transition-colors duration-fast'),
        pin?.edge && 'border-r border-edge',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Wiersz nagłówka: 36 px, tekst 12 px szary, ikony kolumn w kolorach --ic-* (podaje ekran). */
export function HeaderRow({ layout, children, className }: { layout: Layout; children: ReactNode; className?: string }) {
  return (
    <div role="row" style={{ gridTemplateColumns: layout.template }} className={cx('grid h-row min-w-0 items-center border-b border-edge bg-surface font-sans text-small leading-4 whitespace-nowrap text-secondary', className)}>
      {children}
    </div>
  );
}

/** Komórka nagłówka: ikona (np. <MapPin className="text-ic-red" />) + etykieta; sama ikona wymaga `label` (podpowiedź i czytnik). */
export function HeaderCell({ layout, col, icon, label, align = 'left', title, children }: { layout: Layout; col: string; icon?: ReactNode; label?: string; align?: 'left' | 'right' | 'center'; title?: string; children?: ReactNode }) {
  return (
    <Cell layout={layout} col={col} header align={align} title={title ?? label} aria-label={children ? undefined : label} className="gap-1">
      {icon}
      {children && <span className="min-w-0 truncate">{children}</span>}
    </Cell>
  );
}

/** Grupa wierszy z paskiem (etykieta trzyma się lewej krawędzi widocznej części przy przewijaniu w poziomie). */
export function RowGroup({ label, children }: { label: string; children: ReactNode }) {
  return <div role="rowgroup" aria-label={label} className="flex flex-col">{children}</div>;
}

export function GroupBar({ columns, label, count, icon, collapsed = false, onToggle }: { columns: number; label: string; count: number; icon?: ReactNode; collapsed?: boolean; onToggle?: () => void }) {
  const inner = (
    <>
      <span className={cx('inline-flex text-tertiary transition-transform duration-fast', collapsed && '-rotate-90')}><CaretDown size={14} className="shrink-0" aria-hidden /></span>
      {icon}
      <h2 className="m-0 font-sans text-body leading-5 font-medium text-primary">{label}</h2>
      <span className="text-small leading-4 text-tertiary tabular-nums">{count}</span>
    </>
  );
  return (
    <div role="row" className="mb-1 flex h-row items-center">
      <div role="cell" aria-colspan={columns} className="sticky left-0 z-10 flex items-center px-1">
        {onToggle
          ? <button type="button" aria-expanded={!collapsed} onClick={onToggle} className="m-0 flex h-7 min-h-0 items-center gap-2 rounded-sm border-0 bg-transparent px-2 py-0 text-left font-sans text-body leading-5 font-normal text-primary transition-colors hover:bg-shell-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">{inner}</button>
          : <span className="flex h-7 items-center gap-2 px-2">{inner}</span>}
      </div>
    </div>
  );
}

/** Pusty stan albo błąd w miejscu wierszy: jedno zdanie i jedna akcja. */
export function TableMessage({ columns, kind = 'empty', children, action }: { columns: number; kind?: 'empty' | 'error'; children: ReactNode; action?: ReactNode }) {
  return (
    <div role="row" className="flex min-h-row items-center">
      <div role="cell" aria-colspan={columns} className={cx('sticky left-0 flex flex-wrap items-center gap-3 px-2 py-4 text-body leading-5', kind === 'error' ? 'text-danger' : 'text-secondary')}>
        <span role={kind === 'error' ? 'alert' : 'status'}>{children}</span>
        {action}
      </div>
    </div>
  );
}

/** Wiersze w trakcie ładowania: szare paski w kolumnach (bez spinnera). */
export function TableSkeleton({ layout, rows = 6, lines = false }: { layout: Layout; rows?: number; lines?: boolean }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} role="row" aria-hidden="true" style={{ gridTemplateColumns: layout.template }} className={cx('grid h-row items-center', lines && 'border-b border-edge')}>
          {layout.keys.map((k, i) => {
            const pin = cellPin(layout, i);
            return (
              <div key={k} role="cell" style={pin ? { left: pin.left } : undefined} className={cx('flex h-full items-center pr-3 first:pl-2', pin && 'sticky z-10 bg-surface', pin?.edge && 'border-r border-edge')}>
                <span className={cx('block h-3 rounded-xs bg-subtle motion-safe:animate-pulse', i === layout.mainIndex ? 'w-32' : 'w-full max-w-16')} />
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
