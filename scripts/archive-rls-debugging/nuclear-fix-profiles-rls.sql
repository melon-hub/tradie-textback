-- NUCLEAR OPTION: Complete RLS reset and rebuild
-- Error 42P17 = infinite recursion in RLS policy
-- This COMPLETELY removes and rebuilds ALL profiles policies

BEGIN;

-- STEP 1: Drop ALL profiles policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- STEP 2: Create ONLY the most basic policies with NO recursion
-- No EXISTS clauses, no subqueries to profiles table

-- Users can see their own profile
CREATE POLICY "profiles_select_own" 
ON profiles FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" 
ON profiles FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- TEMPORARY: All authenticated users can see all profiles
-- This avoids ANY recursion for now
CREATE POLICY "profiles_select_all_temp" 
ON profiles FOR SELECT 
USING ((SELECT auth.uid()) IS NOT NULL);

COMMIT;

-- Verify the new policies
SELECT 
    policyname,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

-- Test it works
SET statement_timeout = '1s';
SELECT 
    'Quick test' as test,
    id, 
    user_id, 
    name, 
    user_type
FROM profiles 
WHERE user_id = auth.uid();
RESET statement_timeout;

SELECT '✅ NUCLEAR FIX APPLIED - All users can see all profiles temporarily' as status;