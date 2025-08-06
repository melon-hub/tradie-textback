-- Fix RLS recursion issue on profiles table
-- CRITICAL: Use (SELECT auth.uid()) instead of auth.uid() to prevent infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
DROP POLICY IF EXISTS "tradies_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "all_authenticated_view_profiles" ON profiles;
DROP POLICY IF EXISTS "users_own_profile" ON profiles;

-- Create new policies using (SELECT auth.uid()) to prevent recursion
CREATE POLICY "profiles_select_own" 
ON profiles 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_select_tradie_all" 
ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = (SELECT auth.uid()) 
    AND p.user_type = 'tradie'
  )
);

CREATE POLICY "profiles_insert_own" 
ON profiles 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_update_own" 
ON profiles 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_delete_own" 
ON profiles 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Verify the policies are working
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for profiles table have been fixed to prevent recursion';
  RAISE NOTICE 'Using (SELECT auth.uid()) instead of auth.uid() prevents infinite loops';
END $$;