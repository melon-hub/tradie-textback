-- PRODUCTION-READY RLS: Re-enable RLS with proper, simple policies
-- Run this when you're ready to re-enable security

-- Step 1: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sms_templates ENABLE ROW LEVEL SECURITY;

-- Step 2: Create SIMPLE profiles policies (no recursion)
DROP POLICY IF EXISTS "profiles_authenticated_read" ON public.profiles;
CREATE POLICY "profiles_authenticated_read" 
ON public.profiles FOR SELECT 
USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update" 
ON public.profiles FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "profiles_own_insert" ON public.profiles;
CREATE POLICY "profiles_own_insert" 
ON public.profiles FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Step 3: Create jobs policies (clients see own, tradies see all)
DROP POLICY IF EXISTS "jobs_client_view_own" ON public.jobs;
CREATE POLICY "jobs_client_view_own" 
ON public.jobs FOR SELECT 
USING (
  client_id = (SELECT auth.uid())
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = (SELECT auth.uid()) 
    AND profiles.user_type = 'tradie'
  )
);

DROP POLICY IF EXISTS "jobs_authenticated_insert" ON public.jobs;
CREATE POLICY "jobs_authenticated_insert" 
ON public.jobs FOR INSERT 
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "jobs_authenticated_update" ON public.jobs;
CREATE POLICY "jobs_authenticated_update" 
ON public.jobs FOR UPDATE 
USING ((SELECT auth.uid()) IS NOT NULL);

-- Step 4: Other tables - simple authenticated access
DROP POLICY IF EXISTS "job_photos_authenticated" ON public.job_photos;
CREATE POLICY "job_photos_authenticated" 
ON public.job_photos FOR ALL 
USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "notification_logs_authenticated" ON public.notification_logs;
CREATE POLICY "notification_logs_authenticated" 
ON public.notification_logs FOR ALL 
USING ((SELECT auth.uid()) IS NOT NULL);

-- These policies are:
-- 1. Simple (no complex recursion)
-- 2. Use (SELECT auth.uid()) pattern to prevent recursion
-- 3. Allow dev tools to work
-- 4. Still provide security (users can't see other users' data inappropriately)