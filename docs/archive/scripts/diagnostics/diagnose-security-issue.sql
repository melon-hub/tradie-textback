-- Diagnostic queries to find the root cause

-- 1. Check if the view actually exists
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE viewname = 'customer_jobs_view';

-- 2. Check system catalog for the view
SELECT 
    c.relname,
    c.relkind,
    c.relowner,
    u.usename as owner_name
FROM pg_class c
JOIN pg_user u ON c.relowner = u.usesysid
WHERE c.relname = 'customer_jobs_view';

-- 3. Check if there are any rules on the view
SELECT 
    r.rulename,
    r.ev_type,
    r.is_instead
FROM pg_rewrite r
JOIN pg_class c ON r.ev_class = c.oid
WHERE c.relname = 'customer_jobs_view';

-- 4. Check dependencies
SELECT 
    classid::regclass,
    objid,
    objsubid,
    refclassid::regclass,
    refobjid,
    deptype
FROM pg_depend
WHERE refobjid = (
    SELECT oid FROM pg_class WHERE relname = 'customer_jobs_view'
);

-- 5. Check if there's a materialized view with the same name
SELECT 
    schemaname,
    matviewname,
    matviewowner
FROM pg_matviews
WHERE matviewname = 'customer_jobs_view';

-- 6. List ALL objects named customer_jobs_view in any schema
SELECT 
    n.nspname as schema_name,
    c.relname as object_name,
    c.relkind as object_type,
    CASE c.relkind
        WHEN 'r' THEN 'table'
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized view'
        WHEN 'f' THEN 'foreign table'
        ELSE c.relkind::text
    END as type_description
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'customer_jobs_view'
ORDER BY n.nspname;

-- 7. Check if the linter is looking at something else
-- List all views that might match a pattern
SELECT 
    schemaname,
    viewname
FROM pg_views
WHERE viewname LIKE '%customer%jobs%'
   OR viewname LIKE '%jobs%view%';

-- 8. Check if there are any security labels
SELECT 
    objtype,
    objname,
    label
FROM pg_seclabels
WHERE objname = 'customer_jobs_view';