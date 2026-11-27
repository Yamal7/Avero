'use client';
/* Tabela kolekcji (M0.4, KRA-31) na tabeli w jednej linii z M0.3: grupy (pasek, zwijanie zapamiętane na koncie),
   kolumna zaznaczenia, kursor J / K (fokus na wierszu, przewinięcie do niego), pasek zaznaczonych wierszy,
   stany: ładowanie (przyciemnienie przy zmianie zapytania), pusty i błąd (komunikat podaje ekran).
   Komórki rysuje ekran (często komponent serwerowy) — tabela dokłada wiersz, zaznaczenie i grupy. */
import { useEffect, useMemo, type MouseEvent, type ReactNode } from 'react';
import { Check, Minus } from '@phosphor-icons/react/ssr';
import { Cell, GroupBar, HeaderRow, Row, RowGroup } from '@/components/table/table';
import { TableScroll } from '@/components/table/table-scroll';
import { Button } from '@/components/ui/button';
import type { TableLayout } from '@/lib/table/columns';
import { cx } from '@/lib/cx';
import { checkBox, plain } from './classes';
import { useCollection } from './provider';

export type CollectionRow = {
  id: string;
  /** Nazwa wiersza dla czytników (pole zaznaczenia). */
  label: string;
  /** Klucz grupy (z RPC). */
  group?: string;
  /** Komórki <Cell> w kolejności kolumn układu (bez kolumny zaznaczenia). */
  cells: ReactNode;
  disabled?: boolean;
};
export type CollectionGroup = { key: string; label: string; count: number; icon?: ReactNode };

type Props = {
  layout: Pick<TableLayout, 'keys' | 'template' | 'pinnedLeft' | 'mainIndex' | 'minWidth' | 'pinnedWidth' | 'starts'>;
  label: string;
  rows: CollectionRow[];
  /** Grupy w kolejności z RPC; bez nich — lista płaska. */
  groups?: CollectionGroup[];
  /** Komórki nagłówka (bez kolumny zaznaczenia); bez nich — tabela bez wiersza nagłówka (Zadania). */
  header?: ReactNode;
  /** Linie między wierszami (Firmy, Osoby). */
  lines?: boolean;
  /** Wiersz „aktywny” (otwarty w panelu). */
  activeId?: string | null;
  /** Kliknięcie wiersza poza linkami i przyciskami (np. otwórz w panelu). */
  onActivate?: (id: string) => void;
  /** Komunikat w miejscu wierszy, gdy ich nie ma (TableMessage: pusty stan albo błąd). */
  message?: ReactNode;
  /** Akcje paska zaznaczonych wierszy (gniazdo — kolejne moduły; czytają zaznaczenie z useCollection()). */
  actions?: ReactNode;
  className?: string;
  /** Odstęp pod grupą (Magazyn, Zadania: mb-4). */
  groupGap?: boolean;
  /** Pokaż paski grup bez wierszy („Puste grupy” w Opcjach widoku). */
  showEmptyGroups?: boolean;
};

/* Pole zaznaczenia: przycisk 16 px (cel kliknięcia) z kwadratem 14 px w środku (r6, ramka niesie znaczenie — pole wyboru). */
const checkButton = cx(plain(), 'size-4 justify-center rounded-xs px-0');

export function CollectionTable({ layout, label, rows, groups, header, lines = false, activeId = null, onActivate, message, actions, className, groupGap = false, showEmptyGroups = false }: Props) {
  const c = useCollection();
  const { selection, dispatch, collapsed, spec, registerRows } = c;
  const selectable = !!spec.selectable && layout.keys[0] === 'select';
  const n = layout.keys.length;

  // Kolejność widocznych wierszy (bez zwiniętych grup) do J / K i zakresu Shift+X.
  const ordered = useMemo(() => {
    if (!groups) return rows;
    return groups.flatMap(g => (collapsed.includes(g.key) ? [] : rows.filter(r => (r.group ?? '') === g.key)));
  }, [rows, groups, collapsed]);
  const ids = useMemo(() => ordered.map(r => r.id), [ordered]);
  const allIds = useMemo(() => rows.map(r => r.id), [rows]);
  useEffect(() => { registerRows({ ids, open: onActivate }); }, [registerRows, ids, onActivate]);
  useEffect(() => { dispatch({ type: 'sync', ids: allIds }); }, [allIds, dispatch]);

  const selected = selection.selected;
  const allOn = ids.length > 0 && ids.every(id => selected.includes(id));
  const someOn = !allOn && ids.some(id => selected.includes(id));

  function rowClick(e: MouseEvent<HTMLDivElement>, id: string) {
    const t = e.target as HTMLElement;
    if (t.closest('a[href],button,input,select,textarea,label,[role="checkbox"]')) return;
    if (selectable && (e.metaKey || e.ctrlKey)) { dispatch({ type: 'toggle', id }); return; }
    if (selectable && e.shiftKey) { dispatch({ type: 'range', ids, id }); return; }
    dispatch({ type: 'focus', id });
    onActivate?.(id);
  }

  const renderRow = (r: CollectionRow) => {
    const on = selected.includes(r.id);
    return (
      <Row
        key={r.id}
        layout={layout}
        lines={lines}
        interactive={!!onActivate || selectable}
        selected={on || r.id === activeId}
        disabled={r.disabled}
        tabIndex={-1}
        data-row-id={r.id}
        data-checked={on || undefined}
        onFocus={e => { if (e.target === e.currentTarget) dispatch({ type: 'focus', id: r.id }); }}
        onClick={e => rowClick(e, r.id)}
        className="outline-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        {selectable && (
          <Cell layout={layout} col="select">
            <button type="button" role="checkbox" aria-checked={on} aria-label={`Zaznacz: ${r.label}`} title="Zaznacz  X" tabIndex={-1}
              onClick={e => { e.stopPropagation(); dispatch(e.shiftKey ? { type: 'range', ids, id: r.id } : { type: 'toggle', id: r.id }); }}
              className={checkButton}><span aria-hidden="true" className={checkBox(on)}><Check size={10} weight="bold" className="shrink-0" /></span></button>
          </Cell>
        )}
        {r.cells}
      </Row>
    );
  };

  return (
    <div data-collection={spec.id} aria-busy={c.pending || undefined} className={cx('flex min-w-0 flex-col transition-opacity duration-base', c.pending ? 'opacity-60' : 'opacity-100', className)}>
      {selectable && selected.length > 0 && (
        <div role="region" aria-label="Zaznaczone wiersze" className="flex min-h-row flex-wrap items-center gap-2 px-2 pb-1 text-small leading-4">
          <span className="font-medium text-primary tabular-nums" aria-live="polite">Zaznaczone: {selected.length}</span>
          <Button variant="ghost" size="sm" shortcut="Esc" title="Wyczyść zaznaczenie" onClick={() => dispatch({ type: 'clear' })}>Wyczyść</Button>
          {actions}
        </div>
      )}
      <TableScroll layout={layout} label={label}>
        {header !== undefined && (
          <HeaderRow layout={layout} line={lines}>
            {selectable && (
              <Cell layout={layout} col="select" header>
                <button type="button" role="checkbox" aria-checked={allOn ? true : someOn ? 'mixed' : false} aria-label="Zaznacz wszystkie widoczne" title="Zaznacz wszystkie widoczne" disabled={!ids.length}
                  onClick={() => { if (allOn || someOn) dispatch({ type: 'clear' }); else ids.forEach(id => dispatch({ type: 'toggle', id })); }}
                  className={checkButton}><span aria-hidden="true" className={checkBox(allOn || someOn)}>{someOn ? <Minus size={10} weight="bold" className="shrink-0" /> : <Check size={10} weight="bold" className="shrink-0" />}</span></button>
              </Cell>
            )}
            {header}
          </HeaderRow>
        )}
        {!rows.length && message}
        {rows.length > 0 && !groups && rows.map(renderRow)}
        {rows.length > 0 && groups?.map(g => {
          const inGroup = rows.filter(r => (r.group ?? '') === g.key), shut = collapsed.includes(g.key);
          if (!inGroup.length && !showEmptyGroups) return null;
          return (
            <RowGroup key={g.key} label={g.label}>
              <GroupBar columns={n} label={g.label} count={g.count} icon={g.icon} collapsed={shut} onToggle={() => c.toggleGroup(g.key)} />
              {!shut && <div className={cx('flex flex-col', groupGap && 'mb-4')}>{inGroup.map(renderRow)}</div>}
            </RowGroup>
          );
        })}
      </TableScroll>
    </div>
  );
}
