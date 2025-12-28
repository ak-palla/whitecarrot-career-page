/**
 * React Query hook for fetching a career page by company slug
 * Provides caching and automatic refetching
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { CareerPage, Company } from '@/lib/types';

export function careerPageQueryKey(companySlug: string) {
  return ['career-page', companySlug] as const;
}

export interface CareerPageWithCompany {
  company: Company;
  careerPage: CareerPage | null;
}

export function useCareerPage(companySlug: string) {
  return useQuery<CareerPageWithCompany>({
    queryKey: careerPageQueryKey(companySlug),
    queryFn: async () => {
      const supabase = createClient();
      
      // Fetch company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', companySlug)
        .single();

      if (companyError || !company) {
        throw new Error('Company not found');
      }

      // Fetch career page
      const { data: careerPage, error: pageError } = await supabase
        .from('career_pages')
        .select('*')
        .eq('company_id', company.id)
        .single();

      // If no career page exists, return null (not an error)
      if (pageError && pageError.code !== 'PGRST116') {
        throw new Error('Failed to fetch career page');
      }

      return {
        company,
        careerPage: careerPage || null,
      };
    },
    // Career pages change more frequently, so shorter cache
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!companySlug, // Only run if companySlug is provided
  });
}

