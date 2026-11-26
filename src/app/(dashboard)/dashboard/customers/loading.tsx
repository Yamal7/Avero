/* Ładowanie listy Firm i osób (M0.3): szkielet wierszy w układzie tabeli, bez spinnera. */
import { TableSkeleton } from '@/components/table/table';
import { TablePage } from '@/components/table/page-chrome';
import { columnLayout } from '@/lib/table/columns';

const layout = columnLayout([{ key: 'name', fr: 2, main: true }, { key: 'categories', fr: 1.5 }, { key: 'city', fr: 1 }, { key: 'devices', width: 80 }, { key: 'contract', width: 104 }, { key: 'contact', width: 104 }, { key: 'owner', width: 20 }, { key: 'revenue', width: 112 }]);

export default function Loading() {
  return (
    <TablePage>
      <div className="h-11" />
      <div className="h-12" />
      <div role="status" aria-label="Wczytywanie listy klientów" className="overflow-hidden border-t border-edge">
        <TableSkeleton layout={layout} rows={10} lines />
      </div>
    </TablePage>
  );
}
