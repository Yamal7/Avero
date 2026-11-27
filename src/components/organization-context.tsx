'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { organizationHeader } from '@/lib/organizations/scope';

const OrganizationContext = createContext<string | undefined>(undefined);

export function OrganizationProvider({ id, children }: { id?: string; children: ReactNode }) {
  return <OrganizationContext.Provider value={id}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationId() {
  return useContext(OrganizationContext);
}

export function useOrganizationFetch(): typeof fetch {
  const organizationId = useOrganizationId();
  return useCallback((path, init) => {
    const headers = new Headers(init?.headers ?? (path instanceof Request ? path.headers : undefined));
    if (organizationId) headers.set(organizationHeader, organizationId);
    return fetch(path, { ...init, headers });
  }, [organizationId]);
}
