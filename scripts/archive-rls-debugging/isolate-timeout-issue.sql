-- ISOLATE THE EXACT TIMEOUT ISSUE
-- Run each test to find what's actually timing out

-- ========================================
-- TEST 1: Does your user have a profile?
-- ========================================
SELECT 
    auth.uid() as your_user_id,
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid()) as has_profile;

-- ========================================
-- TEST 2: Raw profile query (bypass RLS completely)
-- ========================================
-- Switch to service role in Supabase dashboard first
SELECT 
    'Raw query without RLS' as test,
    id, 
    user_id, 
    phone, 
    name, 
    role, 
    user_type
FROM profiles
WHERE user_id = auth.uid();

-- ========================================
-- TEST 3: Test with SHORT timeout (1 second)
-- ========================================
SET statement_timeout = '1s';
SELECT 
    'Testing with 1s timeout' as test,
    id, 
    user_id, 
    name
FROM profiles
WHERE user_id = auth.uid();
RESET statement_timeout;

-- ========================================
-- TEST 4: Check if it's the tradie policy causing issues
-- ========================================
-- This policy does a subquery to profiles table
SET statement_timeout = '2s';
SELECT 
    'Testing tradie policy' as test,
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.user_type = 'tradie'
    ) as is_tradie;
RESET statement_timeout;

-- ========================================
-- TEST 5: Test simplified query
-- ========================================
SET statement_timeout = '2s';
SELECT user_id FROM profiles WHERE user_id = auth.uid();
RESET statement_timeout;

-- ========================================
-- TEST 6: Check for circular dependencies
-- ========================================
-- See if any other tables reference profiles in their RLS
SELECT DISTINCT
    tablename,
    policyname,
    qual::text as policy_text
FROM pg_policies
WHERE schemaname = 'public'
AND qual::text LIKE '%profiles%'
ORDER BY tablename;

-- ========================================
-- TEST 7: Connection pool status
-- ========================================
SELECT 
    (SELECT COUNT(*) FROM pg_stat_activity) as current_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections;

-- ========================================
-- RESULTS INTERPRETATION:
-- ========================================
-- If TEST 3 times out: Still an RLS issue
-- If TEST 4 times out: The tradie check policy is the problem  
-- If TEST 6 shows many tables: Circular RLS dependencies
-- If TEST 7 shows high connection use: Connection exhaustion