-- Since customer_jobs_view is not used in the application, remove it entirely

-- 1. Drop the unused view
DROP VIEW IF EXISTS public.customer_jobs_view CASCADE;

-- 2. Drop any related functions if they exist
DROP FUNCTION IF EXISTS public.get_customer_jobs_by_phone(TEXT) CASCADE;

-- 3. Verify it's gone
SELECT 
    'Views in public schema:' as info,
    string_agg(viewname, ', ') as views
FROM pg_views 
WHERE schemaname = 'public'
GROUP BY 1;

-- 4. Check no references remain
SELECT 
    'Objects containing "customer_jobs" in name:' as info,
    string_agg(relname, ', ') as objects
FROM pg_class
WHERE relname LIKE '%customer_jobs%'
GROUP BY 1;