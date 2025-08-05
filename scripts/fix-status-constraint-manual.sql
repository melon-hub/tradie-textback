-- Manual fix for jobs status constraint
-- Run this in Supabase SQL Editor

BEGIN;

-- First, drop the existing constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add the correct constraint that allows 'contacted'
ALTER TABLE jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled'));

-- Verify the constraint was added
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'jobs'::regclass 
AND contype = 'c';

COMMIT;

-- Test that 'contacted' status now works
-- UPDATE jobs SET status = 'contacted' WHERE id = 'any-test-id' LIMIT 1;