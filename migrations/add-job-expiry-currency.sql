-- Add expires_at column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add currency column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
