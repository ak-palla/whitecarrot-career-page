/**
 * Job Board Integration Utilities
 * 
 * This module provides utilities for integrating with job boards like LinkedIn and Indeed.
 * Note: Full implementation requires API keys and proper authentication.
 */

export interface JobBoardJob {
  title: string;
  description: string;
  location?: string;
  employmentType?: string;
  salaryRange?: string;
  currency?: string;
  companyName: string;
  companyUrl: string;
  applicationUrl: string;
  postedDate: string;
  expiresDate?: string;
}

/**
 * Generate LinkedIn Job Posting URL
 * LinkedIn requires manual posting or API access (requires LinkedIn Partner Program)
 */
export function generateLinkedInPostingUrl(job: JobBoardJob): string {
  const params = new URLSearchParams({
    title: job.title,
    description: job.description,
    location: job.location || '',
    employmentType: job.employmentType || 'FULL_TIME',
  });

  // LinkedIn job posting URL (requires LinkedIn account)
  return `https://www.linkedin.com/jobs/post/?${params.toString()}`;
}

/**
 * Generate Indeed Job Posting URL
 * Indeed requires manual posting or API access (Indeed Publisher API)
 */
export function generateIndeedPostingUrl(job: JobBoardJob): string {
  const params = new URLSearchParams({
    jobtitle: job.title,
    company: job.companyName,
    location: job.location || '',
  });

  // Indeed job posting URL (requires Indeed account)
  return `https://www.indeed.com/jobs?${params.toString()}`;
}

/**
 * Format job data for LinkedIn Job Posting API
 * Requires LinkedIn Partner Program access and API credentials
 */
export function formatForLinkedInAPI(job: JobBoardJob) {
  return {
    title: job.title,
    description: job.description,
    location: {
      country: 'US', // Default, should be configurable
      locality: job.location || '',
    },
    employmentType: job.employmentType || 'FULL_TIME',
    company: {
      name: job.companyName,
      website: job.companyUrl,
    },
    applicationUrl: job.applicationUrl,
    postedDate: job.postedDate,
    expiresDate: job.expiresDate,
  };
}

/**
 * Format job data for Indeed Publisher API
 * Requires Indeed Publisher API credentials
 */
export function formatForIndeedAPI(job: JobBoardJob) {
  return {
    jobtitle: job.title,
    company: job.companyName,
    city: job.location?.split(',')[0] || '',
    state: job.location?.split(',')[1]?.trim() || '',
    country: 'US',
    description: job.description,
    url: job.applicationUrl,
    salary: job.salaryRange ? `${job.currency || 'USD'} ${job.salaryRange}` : undefined,
    jobType: job.employmentType || 'FULL_TIME',
    datePosted: job.postedDate,
    validThrough: job.expiresDate,
  };
}

/**
 * Generate job board sharing links
 * Returns an object with links for manual posting
 */
export function generateJobBoardLinks(job: JobBoardJob) {
  return {
    linkedin: generateLinkedInPostingUrl(job),
    indeed: generateIndeedPostingUrl(job),
    glassdoor: `https://www.glassdoor.com/job-listing/?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.companyName)}`,
    ziprecruiter: `https://www.ziprecruiter.com/jobs/search?search=${encodeURIComponent(job.title)}&location=${encodeURIComponent(job.location || '')}`,
  };
}

/**
 * Convert internal job format to JobBoardJob format
 */
export function convertToJobBoardFormat(
  job: any,
  companyName: string,
  companySlug: string,
  baseUrl: string
): JobBoardJob {
  const applicationUrl = job.job_slug
    ? `${baseUrl}/${companySlug}/careers/jobs/${job.job_slug}`
    : `${baseUrl}/${companySlug}/careers?job=${job.id}`;

  return {
    title: job.title,
    description: job.description || `${job.title} at ${companyName}`,
    location: job.location,
    employmentType: job.employment_type,
    salaryRange: job.salary_range,
    currency: job.currency || 'USD',
    companyName,
    companyUrl: `${baseUrl}/${companySlug}/careers`,
    applicationUrl,
    postedDate: job.created_at || new Date().toISOString(),
    expiresDate: job.expires_at,
  };
}

