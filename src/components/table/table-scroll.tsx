'use client';
/* Obszar przewijania tabeli w poziomie (M0.3, DECISIONS 2026-11-22): zewnętrzny kontener overflow-x:auto,
   treść o min-width = suma minimów kolumn (src/lib/table/columns.ts). Shift + kółko, gładzik i cienki pasek przewijania;
   ←/→ przesuwa o kolumnę, gdy fokus jest w tabeli (poza polami edycji). Kontener ma tabindex, żeby dało się
   przewijać samą klawiaturą (wymóg dostępności dla przewijanych obszarów). */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { TableLayout } from '@/lib/table/columns';
import { arrowScrollTarget } from '@/lib/table/scroll';
import { cx } from '@/lib/cx';

const editable = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function TableScroll({ layout, label, children, className }: { layout: Pick<TableLayout, 'minWidth' | 'pinnedWidth' | 'starts'>; label: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || editable(e.target)) return;
    const el = ref.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    e.preventDefault();
    const left = arrowScrollTarget({ scrollLeft: el.scrollLeft, maxScroll, pinnedWidth: layout.pinnedWidth, starts: layout.starts, direction: e.key === 'ArrowRight' ? 'right' : 'left' });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
  }
  return (
    <div
      ref={ref}
      tabIndex={0}
      role="region"
      aria-label={`${label} — przewijanie w poziomie: ← / →`}
      onKeyDown={onKeyDown}
      className={cx('min-w-0 overflow-x-auto overflow-y-hidden scrollbar-thin focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent', className)}
    >
      <div role="table" aria-label={label} style={{ minWidth: layout.minWidth }} className="flex flex-col">
        {children}
      </div>
    </div>
  );
}
