-- Migration: Add CSV import fields to jobs table
-- Description: Adds all fields from CSV import to support complete job data
--
-- Fields being added:
-- - work_policy: Remote, Hybrid, On-site
-- - team: Department/team name (mapped from CSV 'department')
-- - employment_type: Full time, Part time, Contract
-- - experience_level: Junior, Mid-level, Senior
-- - salary_range: Salary information
-- - job_slug: URL-friendly identifier

-- Add work_policy column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS work_policy text;

-- Add team column (for department/team filtering)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS team text;

-- Add employment_type column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS employment_type text;

-- Add experience_level column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS experience_level text;

-- Add salary_range column (if not exists)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS salary_range text;

-- Add job_slug column for URL-friendly identifiers
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_slug text;

-- Create index on team for faster filtering
CREATE INDEX IF NOT EXISTS idx_jobs_team ON jobs(team);

-- Create index on work_policy for faster filtering
CREATE INDEX IF NOT EXISTS idx_jobs_work_policy ON jobs(work_policy);

-- Create index on employment_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);

-- Create index on experience_level for faster filtering
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);

