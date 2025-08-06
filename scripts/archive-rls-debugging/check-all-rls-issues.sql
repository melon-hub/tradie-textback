-- CHECK ALL TABLES FOR RLS RECURSION ISSUES
-- This finds any remaining auth.uid() without (SELECT ...) wrapper

-- Find all policies that use auth.uid() WITHOUT the (SELECT ...) wrapper
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual::text as using_clause,
    CASE 
        WHEN qual::text LIKE '%auth.uid()%' 
        AND qual::text NOT LIKE '%(SELECT auth.uid()%' 
        THEN '❌ BAD - Will cause recursion!'
        ELSE '✅ OK'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND qual::text LIKE '%auth.uid()%'
ORDER BY 
    CASE 
        WHEN qual::text LIKE '%auth.uid()%' 
        AND qual::text NOT LIKE '%(SELECT auth.uid()%' 
        THEN 0
        ELSE 1
    END,
    tablename, 
    policyname;

-- Also check WITH CHECK clauses
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    with_check::text as with_check_clause,
    CASE 
        WHEN with_check::text LIKE '%auth.uid()%' 
        AND with_check::text NOT LIKE '%(SELECT auth.uid()%' 
        THEN '❌ BAD - Will cause recursion!'
        ELSE '✅ OK'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND with_check::text IS NOT NULL
AND with_check::text LIKE '%auth.uid()%'
ORDER BY 
    CASE 
        WHEN with_check::text LIKE '%auth.uid()%' 
        AND with_check::text NOT LIKE '%(SELECT auth.uid()%' 
        THEN 0
        ELSE 1
    END,
    tablename, 
    policyname;

-- Check if the profile query itself is slow (with 2 second timeout)
SET statement_timeout = '2s';
EXPLAIN (ANALYZE, BUFFERS)
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

-- Check for missing indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Check if jobs table policies are causing issues
SELECT 
    policyname,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'jobs' 
AND schemaname = 'public'
ORDER BY policyname;