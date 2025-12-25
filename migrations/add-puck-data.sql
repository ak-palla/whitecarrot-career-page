-- Migration: Add puck_data columns to career_pages table
-- This enables Puck.js visual page builder integration

-- Add puck_data column for published content
ALTER TABLE career_pages
ADD COLUMN IF NOT EXISTS puck_data JSONB DEFAULT NULL;

-- Add draft_puck_data column for work-in-progress content
ALTER TABLE career_pages
ADD COLUMN IF NOT EXISTS draft_puck_data JSONB DEFAULT NULL;

-- Add GIN index for efficient JSONB queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_career_pages_puck_data
ON career_pages USING GIN (puck_data);

CREATE INDEX IF NOT EXISTS idx_career_pages_draft_puck_data
ON career_pages USING GIN (draft_puck_data);

-- Comments for documentation
COMMENT ON COLUMN career_pages.puck_data IS 'Published Puck.js page content (used in /careers)';
COMMENT ON COLUMN career_pages.draft_puck_data IS 'Draft Puck.js page content (used in /preview and /edit)';
