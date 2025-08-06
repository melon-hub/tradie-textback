-- SAFE RLS ENABLE: Only enables RLS on tables that exist
-- This checks for table existence before applying policies

-- Step 1: Enable RLS only on existing tables
DO $$
BEGIN
    -- Enable RLS on profiles if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on profiles table';
    END IF;
    
    -- Enable RLS on jobs if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on jobs table';
    END IF;
    
    -- Enable RLS on job_photos if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_photos') THEN
        ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on job_photos table';
    END IF;
    
    -- Enable RLS on tenant_settings if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_settings') THEN
        ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on tenant_settings table';
    END IF;
    
    -- Enable RLS on tenant_sms_templates if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_sms_templates') THEN
        ALTER TABLE public.tenant_sms_templates ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on tenant_sms_templates table';
    END IF;
END $$;

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

-- Step 4: Other tables - only if they exist
DO $$
BEGIN
    -- job_photos policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_photos') THEN
        DROP POLICY IF EXISTS "job_photos_authenticated" ON public.job_photos;
        CREATE POLICY "job_photos_authenticated" 
        ON public.job_photos FOR ALL 
        USING ((SELECT auth.uid()) IS NOT NULL);
        RAISE NOTICE 'Created policies for job_photos table';
    END IF;
    
    -- tenant_settings policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_settings') THEN
        DROP POLICY IF EXISTS "tenant_settings_authenticated" ON public.tenant_settings;
        CREATE POLICY "tenant_settings_authenticated" 
        ON public.tenant_settings FOR ALL 
        USING ((SELECT auth.uid()) IS NOT NULL);
        RAISE NOTICE 'Created policies for tenant_settings table';
    END IF;
    
    -- tenant_sms_templates policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_sms_templates') THEN
        DROP POLICY IF EXISTS "tenant_sms_templates_authenticated" ON public.tenant_sms_templates;
        CREATE POLICY "tenant_sms_templates_authenticated" 
        ON public.tenant_sms_templates FOR ALL 
        USING ((SELECT auth.uid()) IS NOT NULL);
        RAISE NOTICE 'Created policies for tenant_sms_templates table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS enabled successfully on existing tables';
  RAISE NOTICE 'Policies are simple and non-recursive';
  RAISE NOTICE 'Should work with dev tools and production auth';
END $$;