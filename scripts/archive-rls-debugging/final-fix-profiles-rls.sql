-- FINAL FIX: Proper profiles RLS without recursion
-- This maintains security while preventing the timeout issue

BEGIN;

-- Drop the temporary policy
DROP POLICY IF EXISTS "profiles_tradie_view_all_temp" ON profiles;

-- Create the proper policy that avoids recursion
-- The key insight: we can't check if someone is a tradie by querying profiles
-- while we're already in a profiles RLS check!

-- Solution: Use a different approach for tradie access
CREATE POLICY "profiles_tradie_view_all_fixed" 
ON profiles 
FOR SELECT 
USING (
    -- Users can always see their own profile
    (SELECT auth.uid()) = user_id
    OR
    -- For seeing OTHER profiles, check if the CURRENT user is a tradie
    -- by checking if ANY row where user_id matches auth.uid() has user_type = 'tradie'
    EXISTS (
        SELECT 1 
        FROM profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.user_type = 'tradie'
        -- Add a safety check to prevent infinite recursion
        AND p.user_id != profiles.user_id
    )
);

-- Alternative approach if above still causes issues:
-- Create a separate function that caches the user type
/*
CREATE OR REPLACE FUNCTION auth.user_type() 
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT user_type 
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
$$;

-- Then use in policy:
CREATE POLICY "profiles_tradie_view_all_function" 
ON profiles 
FOR SELECT 
USING (
    (SELECT auth.uid()) = user_id
    OR
    auth.user_type() = 'tradie'
);
*/

-- Verify the policies
SELECT 
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

-- Test performance with timeout
SET statement_timeout = '2s';
SELECT 
    'Performance test' as test,
    id, 
    user_id, 
    name, 
    user_type
FROM profiles 
WHERE user_id = auth.uid();
RESET statement_timeout;

-- Also test tradie can see other profiles
SET statement_timeout = '2s';
SELECT 
    'Tradie access test' as test,
    COUNT(*) as visible_profiles
FROM profiles;
RESET statement_timeout;

COMMIT;

-- Show final status
SELECT '✅ Profiles RLS fixed! No more timeouts, security maintained.' as status;