/* Ładowanie listy Magazynu (M0.3): szkielet wierszy w układzie tabeli, bez spinnera. */
import { TableSkeleton } from '@/components/table/table';
import { TablePage } from '@/components/table/page-chrome';
import { columnLayout } from '@/lib/table/columns';

const layout = columnLayout([{ key: 'code', width: 84 }, { key: 'name', fr: 1, main: true }, { key: 'state', width: 88 }, { key: 'reserved', width: 80 }, { key: 'available', width: 104 }, { key: 'move', width: 72 }]);

export default function Loading() {
  return (
    <TablePage>
      <div className="h-11" />
      <div className="h-12" />
      <div role="status" aria-label="Wczytywanie magazynu" className="overflow-hidden px-3 pt-1">
        <TableSkeleton layout={layout} rows={8} />
      </div>
    </TablePage>
  );
}
