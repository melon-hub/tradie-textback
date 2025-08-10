-- FINAL COMPREHENSIVE RLS FIX
-- This fixes all RLS issues causing timeouts and 42P17 errors

BEGIN;

-- 1. Fix profiles table policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on profiles
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Create optimized profiles policies using (SELECT auth.uid())
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

-- 2. Fix jobs table policies (optimize the ones causing issues)
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
        AND jobs.client_id = (SELECT auth.uid())
    )
  );

-- 3. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verify the fix
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'jobs')
ORDER BY tablename, policyname;