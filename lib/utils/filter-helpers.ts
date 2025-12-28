/**
 * Shared filter utility functions
 * Provides common filtering logic for consistent behavior across components
 */

import type { Job, JobFilters } from '@/lib/types';

/**
 * Extract unique filter values from a list of jobs
 */
export interface JobFilterOptions {
  locations: string[];
  jobTypes: string[];
  teams: string[];
}

/**
 * Extract unique filter values from jobs array
 * 
 * @example
 * ```tsx
 * const filterOptions = extractJobFilterOptions(jobs);
 * // { locations: ['San Francisco', 'New York'], jobTypes: ['full-time'], teams: ['Engineering'] }
 * ```
 */
export function extractJobFilterOptions(jobs: Job[]): JobFilterOptions {
  const locations = new Set<string>();
  const jobTypes = new Set<string>();
  const teams = new Set<string>();

  for (const job of jobs) {
    if (job.location) locations.add(job.location);
    if (job.job_type) jobTypes.add(job.job_type);
    if (job.team) teams.add(job.team);
  }

  return {
    locations: Array.from(locations).sort(),
    jobTypes: Array.from(jobTypes).sort(),
    teams: Array.from(teams).sort(),
  };
}

/**
 * Filter jobs based on provided filters
 * 
 * @example
 * ```tsx
 * const filteredJobs = filterJobs(jobs, {
 *   searchQuery: 'engineer',
 *   location: 'San Francisco',
 *   jobType: 'full-time'
 * });
 * ```
 */
export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const {
    searchQuery,
    location,
    jobType,
    team,
    published,
  } = filters;

  // Early exit if no filters
  const hasNoFilters = !searchQuery && 
    !location && 
    !jobType && 
    !team && 
    published === undefined;

  if (hasNoFilters) {
    return jobs;
  }

  const searchLower = searchQuery?.toLowerCase();
  const filtered: Job[] = [];

  for (const job of jobs) {
    // Text search (most expensive, check first if active)
    if (searchLower) {
      const titleLower = job.title?.toLowerCase() || '';
      const descLower = job.description?.toLowerCase() || '';
      if (!titleLower.includes(searchLower) && !descLower.includes(searchLower)) {
        continue;
      }
    }

    // Location filter
    if (location && job.location !== location) {
      continue;
    }

    // Job type filter
    if (jobType && job.job_type !== jobType) {
      continue;
    }

    // Team filter
    if (team && job.team !== team) {
      continue;
    }

    // Published status filter
    if (published !== undefined && job.published !== published) {
      continue;
    }

    // All filters passed
    filtered.push(job);
  }

  return filtered;
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: JobFilters): boolean {
  return !!(
    filters.searchQuery ||
    filters.location ||
    filters.jobType ||
    filters.team ||
    filters.published !== undefined
  );
}

/**
 * Clear all filters (returns empty filter object)
 */
export function clearFilters(): JobFilters {
  return {};
}

