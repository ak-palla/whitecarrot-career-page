-- Migration: Set up RLS policies for team-photos storage bucket
-- This bucket stores team member profile photos and other page assets
--
-- IMPORTANT: Create the bucket manually in Supabase Dashboard first:
-- 1. Go to Storage > Create Bucket
-- 2. Name: team-photos
-- 3. Public bucket: Yes (to allow public read access)
-- 4. File size limit: 5MB (recommended)
-- 5. Allowed MIME types: image/* (optional but recommended)
--
-- After creating the bucket via dashboard, run this SQL to set up RLS policies:

-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "team_photos_authenticated_uploads" ON storage.objects;
DROP POLICY IF EXISTS "team_photos_authenticated_updates" ON storage.objects;
DROP POLICY IF EXISTS "team_photos_authenticated_deletes" ON storage.objects;
DROP POLICY IF EXISTS "team_photos_public_reads" ON storage.objects;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "team_photos_authenticated_uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-photos');

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "team_photos_authenticated_updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'team-photos');

-- Policy: Allow authenticated users to delete their own uploads
CREATE POLICY "team_photos_authenticated_deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'team-photos');

-- Policy: Allow public read access
CREATE POLICY "team_photos_public_reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'team-photos');

