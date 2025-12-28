/**
 * React Query hook for fetching jobs
 * Provides caching and automatic refetching
 */

import { useQuery } from '@tanstack/react-query';
import { getJobs } from '@/app/actions/jobs';
import type { Job } from '@/lib/types';

export function jobsQueryKey(companyId: string) {
  return ['jobs', companyId] as const;
}

export function useJobs(companyId: string, options?: { enabled?: boolean }) {
  return useQuery<Job[]>({
    queryKey: jobsQueryKey(companyId),
    queryFn: async () => {
      const jobs = await getJobs(companyId);
      return jobs || [];
    },
    // Jobs change frequently, so shorter cache
    staleTime: 1000 * 60 * 1, // 1 minute
    enabled: options?.enabled !== false && !!companyId,
  });
}

/**
 * Hook for fetching published jobs (for public career pages)
 */
export function usePublishedJobs(companyId: string) {
  return useQuery<Job[]>({
    queryKey: ['jobs', companyId, 'published'],
    queryFn: async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch published jobs');
      }

      return data || [];
    },
    // Published jobs on public pages can be cached longer
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!companyId,
  });
}

