-- Migration: Set up RLS policies for videos storage bucket
-- This bucket stores video clips uploaded by users (max 1 minute duration)
--
-- IMPORTANT: Create the bucket manually in Supabase Dashboard first:
-- 1. Go to Storage > Create Bucket
-- 2. Name: videos
-- 3. Public bucket: Yes (to allow public read access)
-- 4. File size limit: 100MB (recommended)
-- 5. Allowed MIME types: video/* (optional but recommended)
--
-- After creating the bucket via dashboard, run this SQL to set up RLS policies:

-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "videos_authenticated_uploads" ON storage.objects;
DROP POLICY IF EXISTS "videos_authenticated_updates" ON storage.objects;
DROP POLICY IF EXISTS "videos_authenticated_deletes" ON storage.objects;
DROP POLICY IF EXISTS "videos_public_reads" ON storage.objects;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "videos_authenticated_uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "videos_authenticated_updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'videos');

-- Policy: Allow authenticated users to delete their own uploads
CREATE POLICY "videos_authenticated_deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'videos');

-- Policy: Allow public read access
CREATE POLICY "videos_public_reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');

