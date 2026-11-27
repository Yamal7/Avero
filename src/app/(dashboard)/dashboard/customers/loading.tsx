/* Ładowanie listy Firm i osób (M0.4): szkielet paska i wierszy w układzie tabeli, bez spinnera. */
import { CollectionSkeleton } from '@/components/collection/skeleton';
import { companiesSpec } from '@/lib/collection/specs';
import { collectionLayout } from '@/lib/collection/views';

const layout = collectionLayout(companiesSpec, null);

export default function Loading() {
  return <CollectionSkeleton layout={layout} label="Wczytywanie listy klientów" lines />;
}
