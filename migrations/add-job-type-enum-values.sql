-- Migration: Add missing job_type enum values
-- Description: Adds "temporary" and "permanent" to the job_type enum to support CSV imports
--
-- This migration finds the enum type used by the jobs.job_type column and adds the missing values.

DO $$ 
DECLARE
    enum_type_name text;
    enum_type_oid oid;
BEGIN
    -- Find the enum type name for the job_type column
    SELECT t.typname INTO enum_type_name
    FROM pg_type t
    JOIN pg_attribute a ON a.atttypid = t.oid
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'jobs'
      AND a.attname = 'job_type'
      AND t.typtype = 'e'; -- 'e' means enum type
    
    -- If we found an enum type, add the missing values
    IF enum_type_name IS NOT NULL THEN
        SELECT oid INTO enum_type_oid FROM pg_type WHERE typname = enum_type_name;
        
        -- Add 'temporary' if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'temporary' 
            AND enumtypid = enum_type_oid
        ) THEN
            EXECUTE format('ALTER TYPE %I ADD VALUE ''temporary''', enum_type_name);
            RAISE NOTICE 'Added ''temporary'' to enum type %', enum_type_name;
        END IF;

        -- Add 'permanent' if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'permanent' 
            AND enumtypid = enum_type_oid
        ) THEN
            EXECUTE format('ALTER TYPE %I ADD VALUE ''permanent''', enum_type_name);
            RAISE NOTICE 'Added ''permanent'' to enum type %', enum_type_name;
        END IF;
    ELSE
        -- If job_type is not an enum (e.g., it's a text field), this migration is not needed
        RAISE NOTICE 'job_type column is not an enum type, skipping enum value additions. If it''s a text field with a check constraint, you may need to update the constraint instead.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding enum values: %', SQLERRM;
END $$;

