/**
 * Application type definitions
 * Based on the applications table schema
 */

export type ApplicationStatus = 'new' | 'reviewing' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  job_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  linkedin_url: string;
  resume_url: string;
  status: ApplicationStatus;
  created_at: string;
}

export interface ApplicationWithJob extends Application {
  job: {
    id: string;
    title: string;
  };
}

export interface ApplicationFilters {
  jobId?: string;
  status?: ApplicationStatus;
  searchQuery?: string;
}

export interface CreateApplicationInput {
  job_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  linkedin_url: string;
  resume_url: string;
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus;
}

