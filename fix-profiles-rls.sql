-- Fix infinite recursion in profiles RLS policies
-- This is causing the 42P17 error and profile fetch timeouts

BEGIN;

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "profiles_access_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_access_all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;