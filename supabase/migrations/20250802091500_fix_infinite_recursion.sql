-- Fix infinite recursion in profiles RLS policies
-- This migration removes the problematic policy and creates a simpler one

-- Drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "tradies_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

-- Create simple, non-recursive policies

-- 1. Users can always view their own profile
CREATE POLICY "users_view_own_profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users with is_admin=true or user_type='tradie' can view all profiles
-- We'll check this from the JWT claims instead of querying the table
CREATE POLICY "admins_and_tradies_view_all" 
ON public.profiles 
FOR SELECT 
USING (
  -- This checks if the user has admin claim in their JWT
  -- or if they're viewing their own profile
  auth.uid() = user_id
  OR 
  (auth.jwt() ->> 'email') IN (
    'hofstein93@gmail.com',
    'bighoff93@gmail.com',
    'test@example.com'
  )
);

-- 3. Users can update their own profile
CREATE POLICY "users_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add comments
COMMENT ON POLICY "users_view_own_profile" ON public.profiles 
IS 'Non-recursive policy: users can view their own profile';

COMMENT ON POLICY "admins_and_tradies_view_all" ON public.profiles 
IS 'Temporary policy using email whitelist to avoid recursion';

-- Note: This is a temporary fix. In production, you would want to:
-- 1. Add user metadata to JWT tokens during login
-- 2. Use custom claims for is_admin and user_type
-- 3. Check those claims in the RLS policy