-- DEBUG: Why is client login slower than tradie/admin?
-- Run this while logged in as a CLIENT user

-- 1. Check current user and profile
SELECT 
    auth.uid() as current_user_id,
    p.user_type,
    p.role,
    p.is_admin
FROM profiles p
WHERE p.user_id = auth.uid();

-- 2. Check what RLS policies affect clients differently
-- Look for policies that check user_type = 'client'
SELECT 
    tablename,
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND (
    qual::text LIKE '%client%'
    OR qual::text LIKE '%user_type%'
)
ORDER BY tablename, policyname;

-- 3. Check jobs table access for clients
-- Clients might have different job access patterns
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT COUNT(*) 
FROM jobs 
WHERE client_id = auth.uid();

-- 4. Check if it's the jobs policies causing issues
SELECT 
    policyname,
    qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'jobs' 
AND schemaname = 'public'
AND qual::text LIKE '%client%';

-- 5. Test jobs query with timeout
SET statement_timeout = '2s';
SELECT 
    'Jobs query test' as test,
    COUNT(*) as job_count
FROM jobs;
RESET statement_timeout;

-- 6. Check if client has related data that's slow to load
SELECT 
    'Profile' as data_type, COUNT(*) as count FROM profiles WHERE user_id = auth.uid()
UNION ALL
SELECT 
    'Jobs', COUNT(*) FROM jobs WHERE client_id = auth.uid()
UNION ALL
SELECT 
    'Business Settings', COUNT(*) FROM business_settings WHERE user_id = auth.uid()
UNION ALL
SELECT 
    'Service Locations', COUNT(*) FROM service_locations WHERE user_id = auth.uid();

-- 7. Check for any client-specific views or functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%client%';