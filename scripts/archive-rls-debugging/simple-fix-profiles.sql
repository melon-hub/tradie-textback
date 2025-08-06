-- SIMPLE FIX: Remove the problematic tradie policy causing recursion
-- This is safe and will fix the 42P17 error immediately

BEGIN;

-- Drop ONLY the problematic policy that checks profiles table
DROP POLICY IF EXISTS "profiles_tradie_view_all" ON profiles;
DROP POLICY IF EXISTS "profiles_tradie_view_all_temp" ON profiles;
DROP POLICY IF EXISTS "profiles_tradie_view_all_fixed" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all_temp" ON profiles;

-- Add a simple policy for tradies without recursion
-- This lets authenticated users see all profiles (temporary)
CREATE POLICY "profiles_authenticated_read" 
ON profiles FOR SELECT 
USING ((SELECT auth.uid()) IS NOT NULL);

COMMIT;

-- Test it works
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Check what policies exist now
SELECT policyname, qual::text 
FROM pg_policies 
WHERE tablename = 'profiles';