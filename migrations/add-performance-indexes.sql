-- Migration: Add performance indexes for frequently queried fields
-- Description: Adds indexes to optimize database query performance for common access patterns
--
-- Indexes being added:
-- - companies.owner_id: For filtering companies by owner
-- - jobs(company_id, published): Composite index for filtering published jobs by company
-- - applications(job_id, status): Composite index for filtering applications by job and status
-- - Additional composite indexes for common filter combinations

-- Index on companies.owner_id for faster owner-based queries
CREATE INDEX IF NOT EXISTS idx_companies_owner_id 
ON companies(owner_id);

-- Composite index on jobs for company and published status (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_jobs_company_published 
ON jobs(company_id, published);

-- Index on jobs.company_id for general company-based queries
CREATE INDEX IF NOT EXISTS idx_jobs_company_id 
ON jobs(company_id);

-- Index on jobs.published for filtering published jobs across all companies
CREATE INDEX IF NOT EXISTS idx_jobs_published 
ON jobs(published) 
WHERE published = true;

-- Composite index on applications for job and status filtering
CREATE INDEX IF NOT EXISTS idx_applications_job_status 
ON applications(job_id, status);

-- Index on applications.job_id for general job-based queries
CREATE INDEX IF NOT EXISTS idx_applications_job_id 
ON applications(job_id);

-- Index on applications.status for status-based filtering
CREATE INDEX IF NOT EXISTS idx_applications_status 
ON applications(status);

-- Index on applications.created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_applications_created_at 
ON applications(created_at DESC);

-- Index on companies.slug for slug-based lookups (used in careers page)
CREATE INDEX IF NOT EXISTS idx_companies_slug 
ON companies(slug);

-- Index on career_pages.company_id for company-based career page queries
CREATE INDEX IF NOT EXISTS idx_career_pages_company_id 
ON career_pages(company_id);

-- Composite index on jobs for common filter combinations (company, published, created_at)
CREATE INDEX IF NOT EXISTS idx_jobs_company_published_created 
ON jobs(company_id, published, created_at DESC) 
WHERE published = true;

-- Index on page_sections for career page and visibility queries
CREATE INDEX IF NOT EXISTS idx_page_sections_career_page_visible 
ON page_sections(career_page_id, visible, "order");

-- Comments for documentation
COMMENT ON INDEX idx_companies_owner_id IS 'Optimizes queries filtering companies by owner';
COMMENT ON INDEX idx_jobs_company_published IS 'Optimizes queries for published jobs by company';
COMMENT ON INDEX idx_applications_job_status IS 'Optimizes queries filtering applications by job and status';
COMMENT ON INDEX idx_jobs_company_published_created IS 'Optimizes sorted queries for published jobs by company';

