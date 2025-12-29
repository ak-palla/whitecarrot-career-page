-- Enable RLS on jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy for Company Owners to View their own jobs
CREATE POLICY "Company owners can view their own jobs"
ON jobs
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT owner_id 
    FROM companies 
    WHERE id = jobs.company_id
  )
);

-- Policy for Company Owners to Insert their own jobs
CREATE POLICY "Company owners can insert their own jobs"
ON jobs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id 
    FROM companies 
    WHERE id = jobs.company_id
  )
);

-- Policy for Company Owners to Update their own jobs
CREATE POLICY "Company owners can update their own jobs"
ON jobs
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT owner_id 
    FROM companies 
    WHERE id = jobs.company_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id 
    FROM companies 
    WHERE id = jobs.company_id
  )
);

-- Policy for Company Owners to Delete their own jobs
CREATE POLICY "Company owners can delete their own jobs"
ON jobs
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT owner_id 
    FROM companies 
    WHERE id = jobs.company_id
  )
);

-- Policy for Public to View Published Jobs
-- Note: 'anon' role is used for unauthenticated users, 'authenticated' for logged in users
-- We want anyone (including owners) to see published jobs via the public API if needed,
-- though owners have the specific policy above. This is mainly for the careers page.
CREATE POLICY "Public can view published jobs"
ON jobs
FOR SELECT
TO public
USING (
  published = true
);
