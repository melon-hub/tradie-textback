-- EMERGENCY FIX: Simplify the tradie view policy
-- The profiles_tradie_view_all policy might be causing recursion
-- because it queries the profiles table while checking profiles access

BEGIN;

-- Drop the potentially problematic tradie policy
DROP POLICY IF EXISTS "profiles_tradie_view_all" ON profiles;

-- Replace with a simpler version that doesn't recurse
-- Option 1: Just check if user is authenticated (temporary fix)
CREATE POLICY "profiles_tradie_view_all_temp" 
ON profiles 
FOR SELECT 
USING (
    -- Simplified: just check if authenticated
    -- This is less secure but will prove if this policy is the issue
    (SELECT auth.uid()) IS NOT NULL
);

-- After testing, if this fixes it, use this more secure version:
/*
-- Option 2: Check user_type without recursion (better)
CREATE POLICY "profiles_tradie_view_all_fixed" 
ON profiles 
FOR SELECT 
USING (
    -- Allow users to see their own profile
    (SELECT auth.uid()) = user_id
    OR
    -- Allow if current user's user_type is 'tradie'
    -- This checks the CURRENT row being evaluated, not a subquery
    (user_id = (SELECT auth.uid()) AND user_type = 'tradie')
);
*/

-- Verify the change
SELECT 
    policyname,
    qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

COMMIT;

-- Test if this fixes the timeout
SET statement_timeout = '2s';
SELECT * FROM profiles WHERE user_id = auth.uid();
RESET statement_timeout;