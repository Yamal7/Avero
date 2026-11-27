/* Szkielet listy kolekcji (M0.4) do loading.tsx: nagłówek, dwa paski (widoki, szukanie i filtry) i wiersze tabeli. Bez spinnera. */
import { TableSkeleton } from '@/components/table/table';
import { TablePage } from '@/components/table/page-chrome';
import { PillSkeleton } from '@/components/ui/pill';
import type { TableLayout } from '@/lib/table/columns';
import { cx } from '@/lib/cx';

const bar = (w: string) => <span aria-hidden="true" className={cx('block h-3 rounded-xs bg-subtle motion-safe:animate-pulse', w)} />;

export function CollectionSkeleton({ layout, label, rows = 10, lines = false, filters = true }: { layout: Pick<TableLayout, 'keys' | 'template' | 'pinnedLeft' | 'mainIndex'>; label: string; rows?: number; lines?: boolean; filters?: boolean }) {
  return (
    <TablePage>
      <div className="flex h-11 items-center gap-2 pr-3 pl-5 max-desktop:pl-3">{bar('w-16')}{bar('w-24')}</div>
      <div className="flex flex-wrap items-center gap-1 py-2 pr-3 pl-4 max-desktop:pl-3"><PillSkeleton /><PillSkeleton /><PillSkeleton /></div>
      {filters && <div className="flex flex-wrap items-center gap-2 pr-3 pb-2 pl-4 max-desktop:pl-3"><span aria-hidden="true" className="block h-7 w-64 rounded-sm bg-subtle motion-safe:animate-pulse max-desktop:w-full" /><PillSkeleton /></div>}
      <div role="status" aria-label={label} className={cx('overflow-hidden', lines ? 'border-t border-edge' : 'px-3 pt-1')}>
        <TableSkeleton layout={layout} rows={rows} lines={lines} />
      </div>
    </TablePage>
  );
}
