-- FINAL FIX: Completely prevent RLS recursion on profiles table
-- This migration creates the simplest possible policies that cannot cause recursion

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_tradie_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_authenticated_read" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_simple_read" ON profiles;
DROP POLICY IF EXISTS "profiles_simple_update" ON profiles;
DROP POLICY IF EXISTS "profiles_simple_insert" ON profiles;

-- Create the SIMPLEST possible policies that CANNOT recurse
-- All authenticated users can read all profiles (no recursion possible)
CREATE POLICY "profiles_read_authenticated" 
ON profiles 
FOR SELECT 
USING ((SELECT auth.uid()) IS NOT NULL);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" 
ON profiles 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_own" 
ON profiles 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can only delete their own profile
CREATE POLICY "profiles_delete_own" 
ON profiles 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'FINAL FIX APPLIED: Profiles RLS policies are now recursion-proof';
  RAISE NOTICE 'All authenticated users can read profiles - no complex checks that cause loops';
END $$;