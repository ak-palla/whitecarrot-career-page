/**
 * React Query hook for fetching companies
 * Provides caching and automatic refetching
 */

import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '@/app/actions/companies';
import type { Company } from '@/lib/types';

export const companiesQueryKey = ['companies'] as const;

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: companiesQueryKey,
    queryFn: async () => {
      const companies = await getCompanies();
      return companies || [];
    },
    // Companies list changes infrequently, so we can cache longer
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

