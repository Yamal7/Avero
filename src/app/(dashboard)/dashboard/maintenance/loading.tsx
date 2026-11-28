/* Ładowanie listy Przeglądów (M0.4): szkielet paska i wierszy w układzie tabeli, bez spinnera. */
import { CollectionSkeleton } from '@/components/collection/skeleton';
import { maintenanceSpec } from '@/lib/collection/specs';
import { collectionLayout } from '@/lib/collection/views';

const layout = collectionLayout(maintenanceSpec, null);

export default function Loading() {
  return <CollectionSkeleton layout={layout} label="Wczytywanie przeglądów" rows={8} />;
}
