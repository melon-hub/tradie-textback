-- Test the exact query that's timing out
-- Run this in Supabase SQL Editor to see what's happening

-- First, let's see what user you're testing with
SELECT auth.uid() as current_user_id;

-- Now run the exact query from useAuth.ts
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

-- Check if there are any profiles at all
SELECT COUNT(*) as total_profiles FROM profiles;

-- Check the current RLS policies
SELECT 
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;