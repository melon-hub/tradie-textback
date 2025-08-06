-- COMPREHENSIVE DIAGNOSTIC FOR PROFILE TIMEOUT ISSUE
-- Run each section in Supabase SQL Editor to identify the problem

-- ========================================
-- SECTION 1: Basic Auth Check
-- ========================================
SELECT 
    auth.uid() as current_user_id,
    current_user as postgres_user,
    now() as current_time;

-- ========================================
-- SECTION 2: Direct Profile Query (No RLS)
-- ========================================
-- This bypasses RLS to test raw query performance
-- Run as postgres/service_role to bypass RLS
SELECT 
    id, 
    user_id, 
    phone, 
    name, 
    role, 
    user_type, 
    address, 
    is_admin, 
    onboarding_completed,
    created_at,
    updated_at
FROM profiles
WHERE user_id = auth.uid();

-- ========================================
-- SECTION 3: Check if Profile Exists
-- ========================================
SELECT 
    COUNT(*) as profile_count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NO PROFILE EXISTS FOR THIS USER!'
        WHEN COUNT(*) = 1 THEN 'Profile exists'
        ELSE 'DUPLICATE PROFILES!'
    END as status
FROM profiles
WHERE user_id = auth.uid();

-- ========================================
-- SECTION 4: Check Profile Table Stats
-- ========================================
SELECT 
    COUNT(*) as total_profiles,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) - COUNT(DISTINCT user_id) as duplicate_count
FROM profiles;

-- ========================================
-- SECTION 5: Check Current RLS Policies
-- ========================================
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

-- ========================================
-- SECTION 6: Check for Blocking Locks
-- ========================================
SELECT 
    pg_locks.pid,
    pg_stat_activity.usename,
    pg_stat_activity.query,
    pg_stat_activity.state,
    pg_stat_activity.wait_event_type,
    pg_stat_activity.wait_event,
    age(now(), pg_stat_activity.query_start) as query_age
FROM pg_locks
JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
WHERE pg_locks.relation = 'profiles'::regclass
AND pg_stat_activity.pid != pg_backend_pid();

-- ========================================
-- SECTION 7: Check Indexes on Profiles
-- ========================================
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- ========================================
-- SECTION 8: Test Query Performance with EXPLAIN
-- ========================================
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT 
    id, 
    user_id, 
    phone, 
    name, 
    role, 
    user_type, 
    address, 
    is_admin, 
    onboarding_completed
FROM profiles
WHERE user_id = auth.uid();

-- ========================================
-- SECTION 9: Check for Infinite Loop in RLS
-- ========================================
-- This will timeout if there's still recursion
SET statement_timeout = '2s';
SELECT 
    id, 
    user_id, 
    phone, 
    name, 
    role, 
    user_type, 
    address, 
    is_admin, 
    onboarding_completed
FROM profiles
WHERE user_id = auth.uid();
RESET statement_timeout;

-- ========================================
-- SECTION 10: Check All Tables with auth.uid() in RLS
-- ========================================
SELECT DISTINCT
    schemaname,
    tablename,
    policyname,
    qual::text as using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND (
    qual::text LIKE '%auth.uid()%'
    AND qual::text NOT LIKE '%(SELECT auth.uid())%'
)
ORDER BY tablename, policyname;

-- ========================================
-- SECTION 11: Check for Triggers on Profiles
-- ========================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles'
AND event_object_schema = 'public';

-- ========================================
-- SECTION 12: Check Connection Pooling Issues
-- ========================================
SELECT 
    COUNT(*) as active_connections,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state, wait_event_type, wait_event
ORDER BY COUNT(*) DESC;

-- ========================================
-- RESULTS INTERPRETATION:
-- ========================================
-- 1. If Section 2 is fast but Section 9 times out = RLS issue
-- 2. If Section 3 shows no profile = Need to create profile
-- 3. If Section 5 shows policies without (SELECT auth.uid()) = RLS recursion
-- 4. If Section 6 shows locks = Database contention
-- 5. If Section 7 shows no index on user_id = Performance issue
-- 6. If Section 8 shows high cost = Query optimization needed
-- 7. If Section 10 shows tables with auth.uid() = More RLS fixes needed
-- 8. If Section 12 shows many idle connections = Connection pool exhaustion