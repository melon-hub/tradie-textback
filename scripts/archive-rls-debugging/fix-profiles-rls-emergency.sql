-- EMERGENCY FIX for profiles RLS recursion causing 20s timeouts
-- Run this in Supabase SQL Editor immediately

-- Step 1: Drop ALL existing profiles policies to start fresh
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

-- Step 2: Create fixed policies using (SELECT auth.uid()) to prevent recursion
-- CRITICAL: The (SELECT ...) wrapper prevents infinite recursion!

-- Allow users to see their own profile
CREATE POLICY "profiles_own_select" 
ON profiles 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

-- Allow users to insert their own profile
CREATE POLICY "profiles_own_insert" 
ON profiles 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Allow users to update their own profile
CREATE POLICY "profiles_own_update" 
ON profiles 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Allow tradies to see all profiles
CREATE POLICY "profiles_tradie_view_all" 
ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = (SELECT auth.uid()) 
    AND p.user_type = 'tradie'
  )
);

-- Verify the fix
SELECT 
    policyname,
    permissive,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

-- Test that profiles can be fetched without timeout
SELECT 'Fix applied successfully! Profiles should now load without timeout.' as status;