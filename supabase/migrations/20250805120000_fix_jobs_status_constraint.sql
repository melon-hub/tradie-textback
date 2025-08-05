-- Fix jobs status constraint to match application expectations
-- The application expects: 'new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled'

BEGIN;

-- First, check what constraint exists (if any)
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'jobs_status_check'
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT jobs_status_check;
        RAISE NOTICE 'Dropped existing jobs_status_check constraint';
    END IF;
END $$;

-- Add the correct status constraint
ALTER TABLE jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled'));

-- Update any invalid status values to 'new' as fallback
UPDATE jobs 
SET status = 'new' 
WHERE status NOT IN ('new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled');

-- Add comment for documentation
COMMENT ON CONSTRAINT jobs_status_check ON jobs IS 
'Valid job statuses: new (initial), contacted (tradie reached out), quoted (price given), scheduled (appointment set), completed (work done), cancelled (job cancelled)';

COMMIT;

-- Show current status distribution
SELECT 
    status, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM jobs 
GROUP BY status 
ORDER BY count DESC;