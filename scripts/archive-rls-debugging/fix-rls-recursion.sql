-- Fix RLS Recursion Issues
-- This script fixes common RLS recursion patterns that cause 42P17 errors
-- and profile fetch timeouts

BEGIN;

-- Step 1: Drop all existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 2: Create optimized profiles policies using (SELECT auth.uid())
-- This pattern prevents infinite recursion

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Allow service role full access (for admin operations)
CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 3: Fix jobs table policies if they have recursion issues
DROP POLICY IF EXISTS "clients_view_jobs_by_phone" ON public.jobs;
DROP POLICY IF EXISTS "tradies_view_all_jobs" ON public.jobs;
DROP POLICY IF EXISTS "clients_view_own_jobs" ON public.jobs;

-- Recreate with optimized queries
CREATE POLICY "clients_view_jobs_by_phone" ON public.jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.user_type = 'client'
        AND profiles.phone = jobs.phone
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.user_type = 'tradie'
    )
  );

-- Allow clients to update their own jobs
CREATE POLICY "clients_update_own_jobs" ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.user_type = 'client'
        AND profiles.phone = jobs.phone
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.user_type = 'client'
        AND profiles.phone = jobs.phone
    )
  );

-- Allow tradies to update any job
CREATE POLICY "tradies_update_all_jobs" ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.user_type = 'tradie'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.user_type = 'tradie'
    )
  );

-- Service role can do everything
CREATE POLICY "jobs_service_role" ON public.jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verify the fix
SELECT 
    '=== RLS FIX APPLIED ===' as status
UNION ALL
SELECT 
    'Table: ' || tablename || ', Policies: ' || COUNT(*)::text
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'jobs')
GROUP BY tablename
UNION ALL
SELECT 
    E'\n✅ RLS recursion fix has been applied successfully' as status
UNION ALL
SELECT 
    'All policies now use (SELECT auth.uid()) pattern to prevent recursion' as status;