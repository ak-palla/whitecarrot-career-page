/**
 * Hook for managing job filters
 * Provides filter state and logic for job management
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebouncedSearch } from '@/lib/hooks/use-debounced-search';
import { extractJobFilterOptions, filterJobs, hasActiveFilters } from '@/lib/utils/filter-helpers';
import type { Job, JobFilters, JobType } from '@/lib/types';

export interface UseJobFiltersOptions {
  jobs: Job[];
  onFiltersChange?: (filters: JobFilters) => void;
}

export interface UseJobFiltersReturn {
  // Filter state
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedLocation: string;
  selectedJobType: string;
  selectedTeam: string;
  selectedPublishedStatus: string;
  
  // Filter options
  filterOptions: ReturnType<typeof extractJobFilterOptions>;
  
  // Filtered results
  filteredJobs: Job[];
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (value: string) => void;
  setSelectedLocation: (value: string) => void;
  setSelectedJobType: (value: string) => void;
  setSelectedTeam: (value: string) => void;
  setSelectedPublishedStatus: (value: string) => void;
  clearFilters: () => void;
}

/**
 * Hook for managing job filters
 */
export function useJobFilters({ jobs, onFiltersChange }: UseJobFiltersOptions): UseJobFiltersReturn {
  const { searchQuery, debouncedSearchQuery, setSearchQuery, clearSearch } = useDebouncedSearch({
    delay: 200,
  });

  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPublishedStatus, setSelectedPublishedStatus] = useState('all');

  // Extract filter options from jobs
  const filterOptions = useMemo(() => extractJobFilterOptions(jobs), [jobs]);

  // Build filters object
  const filters = useMemo<JobFilters>(() => {
    const jobType = selectedJobType !== 'all' 
      ? (selectedJobType as JobType | null | undefined) ?? undefined
      : undefined;
    
    return {
      searchQuery: debouncedSearchQuery || undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      jobType: jobType as JobType | undefined,
      team: selectedTeam !== 'all' ? selectedTeam : undefined,
      published: selectedPublishedStatus !== 'all' 
        ? selectedPublishedStatus === 'published' 
        : undefined,
    };
  }, [debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam, selectedPublishedStatus]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  // Filter jobs
  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  // Check if any filters are active
  const hasActiveFiltersValue = useMemo(() => hasActiveFilters(filters), [filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    clearSearch();
    setSelectedLocation('all');
    setSelectedJobType('all');
    setSelectedTeam('all');
    setSelectedPublishedStatus('all');
  }, [clearSearch]);

  return {
    searchQuery,
    debouncedSearchQuery,
    selectedLocation,
    selectedJobType,
    selectedTeam,
    selectedPublishedStatus,
    filterOptions,
    filteredJobs,
    hasActiveFilters: hasActiveFiltersValue,
    setSearchQuery,
    setSelectedLocation,
    setSelectedJobType,
    setSelectedTeam,
    setSelectedPublishedStatus,
    clearFilters,
  };
}

