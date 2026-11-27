/* Stopka kolekcji (M0.4): liczby (podaje ekran) i strony. Bez stanu — działa w komponencie serwerowym. */
import type { ReactNode } from 'react';
import { PageLink, TableFooter } from '@/components/table/page-chrome';
import { patchQuery, queryHref } from '@/lib/collection/query';
import type { CollectionSpec, Query } from '@/lib/collection/spec';

export function CollectionFooter({ spec, query, total, children }: { spec: CollectionSpec; query: Query; total: number; children?: ReactNode }) {
  const pages = Math.max(1, Math.ceil(total / spec.pageSize)), page = Math.min(query.page, Math.max(pages, query.page));
  const to = (p: number) => queryHref(spec, patchQuery(spec, query, { page: p }));
  return (
    <TableFooter>
      <span className="inline-flex flex-wrap gap-x-4 gap-y-1">{children}</span>
      {(pages > 1 || page > 1) && (
        <nav aria-label="Strony listy" className="inline-flex gap-3">
          {page > 1 && <PageLink href={to(page - 1)}>Poprzednia</PageLink>}
          <span>Strona {page} z {pages}</span>
          {page < pages && <PageLink href={to(page + 1)}>Następna</PageLink>}
        </nav>
      )}
    </TableFooter>
  );
}
