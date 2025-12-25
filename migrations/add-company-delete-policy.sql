-- Migration: Add DELETE policy for companies table
-- This allows company owners to delete their own companies

-- Create policy for DELETE operations on companies table
-- Users can only delete companies they own (where owner_id matches their auth.uid())
CREATE POLICY "Users can delete their own companies"
ON companies
FOR DELETE
USING (auth.uid() = owner_id);

