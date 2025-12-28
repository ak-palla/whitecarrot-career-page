/**
 * Job type definitions
 * Based on the jobs table schema
 */

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type WorkPolicy = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full time' | 'Part time' | 'Contract';
export type ExperienceLevel = 'Junior' | 'Mid-level' | 'Senior';

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location?: string | null;
  job_type?: JobType | null;
  published: boolean;
  created_at: string;
  updated_at?: string;
  // CSV import fields
  team?: string | null;
  work_policy?: WorkPolicy | null;
  employment_type?: EmploymentType | null;
  experience_level?: ExperienceLevel | null;
  salary_range?: string | null;
  job_slug?: string | null;
  expires_at?: string | null;
  currency?: string | null;
}

export interface CreateJobInput {
  title: string;
  description: string;
  location?: string;
  job_type?: JobType;
  published?: boolean;
  team?: string;
  work_policy?: WorkPolicy;
  employment_type?: EmploymentType;
  experience_level?: ExperienceLevel;
  salary_range?: string;
  job_slug?: string;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  location?: string | null;
  job_type?: JobType | null;
  published?: boolean;
  team?: string | null;
  work_policy?: WorkPolicy | null;
  employment_type?: EmploymentType | null;
  experience_level?: ExperienceLevel | null;
  salary_range?: string | null;
  job_slug?: string | null;
}

export interface JobFilters {
  searchQuery?: string;
  location?: string;
  jobType?: JobType;
  team?: string;
  published?: boolean;
}

