-- QUICK PROFILE TEST - Run this NOW in Supabase SQL Editor
-- This will immediately show if it's an RLS issue or something else

-- 1. Who are you?
SELECT auth.uid() as your_user_id;

-- 2. Does your profile exist?
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 3. How many profiles exist total?
SELECT COUNT(*) as total_profiles FROM profiles;

-- 4. Test with 2-second timeout (will fail if RLS recursion)
SET statement_timeout = '2s';
SELECT * FROM profiles WHERE user_id = auth.uid();
RESET statement_timeout;

-- 5. What policies are active?
SELECT policyname, qual::text 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- If Step 4 times out, there's still RLS recursion
-- If Step 2 returns nothing, you need to create a profile