-- Check all check constraints in the database
-- This will help us understand what values are allowed

-- Check constraints on all tables
SELECT 
    n.nspname as schema,
    c.relname as table_name,
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype = 'c' -- check constraints
AND n.nspname = 'public'
AND c.relname IN ('job_photos', 'tenant_sms_templates', 'twilio_settings', 'jobs', 'profiles')
ORDER BY c.relname, con.conname;

-- Also check what values are currently in job_photos upload_status
SELECT DISTINCT upload_status 
FROM job_photos
ORDER BY upload_status;

-- Check what values are currently in jobs status
SELECT DISTINCT status 
FROM jobs
ORDER BY status;

-- Check what values are currently in jobs urgency
SELECT DISTINCT urgency 
FROM jobs
ORDER BY urgency;