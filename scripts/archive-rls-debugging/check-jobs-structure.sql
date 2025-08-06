-- CHECK: What columns does the jobs table actually have?

-- 1. Show all columns in jobs table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check what customer_jobs_view looks like currently
SELECT 
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname = 'customer_jobs_view';

-- 3. Sample a job to see actual data
SELECT * FROM jobs LIMIT 1;