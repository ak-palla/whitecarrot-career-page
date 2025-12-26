-- Migration: Create resumes bucket
-- Description: Inserts the resumes bucket into storage.buckets if it doesn't exist

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Ensure RLS policies are applied (referencing previous migration logic)
-- We re-apply just in case, or rely on the previous migration if it ran but failed validation due to missing bucket?
-- Actually, policies are on storage.objects, so they don't strictly require the bucket row to exist at creation time, 
-- but the upload fails if the bucket row doesn't exist.

-- Re-run policy creation just to be safe and ensure they are active
drop policy if exists "resumes_public_insert" on storage.objects;
drop policy if exists "resumes_authenticated_select" on storage.objects;

create policy "resumes_public_insert"
on storage.objects for insert
to public
with check (bucket_id = 'resumes');

create policy "resumes_authenticated_select"
on storage.objects for select
to authenticated
using (bucket_id = 'resumes');
