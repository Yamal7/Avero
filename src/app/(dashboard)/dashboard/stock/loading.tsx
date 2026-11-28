/* Ładowanie listy Magazynu (M0.4): szkielet paska i wierszy w układzie tabeli, bez spinnera. */
import { CollectionSkeleton } from '@/components/collection/skeleton';
import { stockSpec } from '@/lib/collection/specs';
import { collectionLayout } from '@/lib/collection/views';

const layout = collectionLayout(stockSpec, null);

export default function Loading() {
  return <CollectionSkeleton layout={layout} label="Wczytywanie magazynu" rows={8} />;
}
