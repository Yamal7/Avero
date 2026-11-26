/* Ładowanie listy Zadań (M0.3): szkielet wierszy w układzie tabeli, bez spinnera. */
import { TableSkeleton } from '@/components/table/table';
import { TablePage } from '@/components/table/page-chrome';
import { columnLayout } from '@/lib/table/columns';

const layout = columnLayout([{ key: 'priority', width: 14 }, { key: 'number', width: 56 }, { key: 'status', width: 14 }, { key: 'title', fr: 1, main: true }, { key: 'customer', width: 20 }, { key: 'label', width: 112 }, { key: 'due', width: 76 }, { key: 'assignee', width: 20 }]);

export default function Loading() {
  return (
    <TablePage>
      <div className="h-11" />
      <div className="h-12" />
      <div role="status" aria-label="Wczytywanie zadań" className="overflow-hidden px-3 pt-1">
        <TableSkeleton layout={layout} rows={8} />
      </div>
    </TablePage>
  );
}
