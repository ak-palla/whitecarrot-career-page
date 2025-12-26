-- Migration: Create resumes storage bucket
-- Description: Bucket for storing candidate resumes

-- Drop policies if exist
drop policy if exists "resumes_public_insert" on storage.objects;
drop policy if exists "resumes_authenticated_select" on storage.objects;

-- Create bucket (this is usually done via API/Dashboard, but we can try inserting if not exists or assume it exists)
-- We will just set policies assuming bucket 'resumes' exists or will be created.

-- Policy: Allow public to upload resumes
create policy "resumes_public_insert"
on storage.objects for insert
to public
with check (bucket_id = 'resumes');

-- Policy: Allow authenticated users (recruiters) to read resumes
create policy "resumes_authenticated_select"
on storage.objects for select
to authenticated
using (bucket_id = 'resumes');
