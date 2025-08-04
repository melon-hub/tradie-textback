-- Check the current definition of customer_jobs_view
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE viewname = 'customer_jobs_view'
AND schemaname = 'public';

-- Check if any functions are using SECURITY DEFINER
SELECT 
    p.proname AS function_name,
    p.prosecdef AS security_definer,
    n.nspname AS schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true;

-- Check all views for SECURITY DEFINER in their definition
SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER'
        ELSE 'NO SECURITY DEFINER'
    END as security_status
FROM pg_views
WHERE schemaname = 'public';