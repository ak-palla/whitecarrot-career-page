-- Migration: Set up RLS policies for csv-uploads storage bucket
-- This bucket stores CSV files uploaded by recruiters for bulk job imports
--
-- IMPORTANT: Create the bucket manually in Supabase Dashboard first:
-- 1. Go to Storage > Create Bucket
-- 2. Name: csv-uploads
-- 3. Public bucket: No (private bucket for authenticated users only)
-- 4. File size limit: 10MB (recommended)
-- 5. Allowed MIME types: text/csv, application/vnd.ms-excel (optional but recommended)
--
-- After creating the bucket via dashboard, run this SQL to set up RLS policies:

-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "csv_uploads_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "csv_uploads_authenticated_select" ON storage.objects;
DROP POLICY IF EXISTS "csv_uploads_authenticated_delete" ON storage.objects;

-- Policy: Allow authenticated users to upload CSV files
CREATE POLICY "csv_uploads_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'csv-uploads');

-- Policy: Allow authenticated users to read their uploaded CSV files
CREATE POLICY "csv_uploads_authenticated_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'csv-uploads');

-- Policy: Allow authenticated users to delete their uploaded CSV files
CREATE POLICY "csv_uploads_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'csv-uploads');

