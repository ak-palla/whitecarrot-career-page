/**
 * Job formatting and validation utilities
 * Provides common job-related helper functions
 */

import type { Job, JobType } from '@/lib/types/job';

/**
 * Format job type for display
 * Converts 'full-time' to 'Full Time', etc.
 * 
 * @example
 * ```tsx
 * formatJobType('full-time') // 'Full Time'
 * formatJobType('part-time') // 'Part Time'
 * ```
 */
export function formatJobType(jobType: string | null | undefined): string {
  if (!jobType) return '';
  
  return jobType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format job location for display
 * 
 * @example
 * ```tsx
 * formatJobLocation('San Francisco, CA') // 'San Francisco, CA'
 * formatJobLocation(null) // 'Remote'
 * ```
 */
export function formatJobLocation(location: string | null | undefined): string {
  if (!location) return 'Remote';
  return location;
}

/**
 * Get job status badge variant based on published state
 */
export function getJobStatusVariant(published: boolean): 'default' | 'secondary' | 'outline' {
  return published ? 'default' : 'secondary';
}

/**
 * Get job status label
 */
export function getJobStatusLabel(published: boolean): string {
  return published ? 'Published' : 'Draft';
}

/**
 * Validate job data
 * Returns array of error messages (empty if valid)
 */
export function validateJob(job: Partial<Job>): string[] {
  const errors: string[] = [];

  if (!job.title || job.title.trim().length === 0) {
    errors.push('Job title is required');
  }

  if (!job.description || job.description.trim().length === 0) {
    errors.push('Job description is required');
  }

  if (job.title && job.title.length > 200) {
    errors.push('Job title must be less than 200 characters');
  }

  if (job.description && job.description.length > 10000) {
    errors.push('Job description must be less than 10,000 characters');
  }

  return errors;
}

/**
 * Generate job slug from title
 * Creates URL-friendly slug from job title
 * 
 * @example
 * ```tsx
 * generateJobSlug('Senior Software Engineer') // 'senior-software-engineer'
 * ```
 */
export function generateJobSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Check if job is published
 */
export function isJobPublished(job: Job): boolean {
  return job.published === true;
}

/**
 * Get job display title with status indicator
 */
export function getJobDisplayTitle(job: Job): string {
  const status = isJobPublished(job) ? 'Published' : 'Draft';
  return `${job.title} (${status})`;
}

