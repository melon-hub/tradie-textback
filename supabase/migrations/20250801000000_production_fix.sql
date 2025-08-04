-- Production-ready fix for Supabase implementation
-- This migration applies all necessary fixes for multi-tenant architecture

-- 1. First, check if client_id already exists and skip if it does
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'jobs' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN client_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 2. Drop all existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradie can manage all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Clients can view their own jobs only" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Clients view own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradies view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Clients update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradies update all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradies delete jobs" ON public.jobs;

-- 3. Create comprehensive RLS policies for jobs table

-- Policy 1: Clients can only create jobs for themselves
DROP POLICY IF EXISTS "clients_create_own_jobs" ON public.jobs;
CREATE POLICY "clients_create_own_jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'client'
  )
);

-- Policy 2: Tradies can create jobs for any client
DROP POLICY IF EXISTS "tradies_create_any_jobs" ON public.jobs;
CREATE POLICY "tradies_create_any_jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'tradie'
  )
);

-- Policy 3: Clients can only view their own jobs
DROP POLICY IF EXISTS "clients_view_own_jobs" ON public.jobs;
CREATE POLICY "clients_view_own_jobs" 
ON public.jobs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'client'
  )
);

-- Policy 4: Tradies can view all jobs
DROP POLICY IF EXISTS "tradies_view_all_jobs" ON public.jobs;
CREATE POLICY "tradies_view_all_jobs" 
ON public.jobs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'tradie'
  )
);

-- Policy 5: Clients can update their own jobs
DROP POLICY IF EXISTS "clients_update_own_jobs" ON public.jobs;
CREATE POLICY "clients_update_own_jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'client'
  )
)
WITH CHECK (
  auth.uid() = client_id -- Ensure client_id cannot be changed
);

-- Policy 6: Tradies can update all jobs
DROP POLICY IF EXISTS "tradies_update_all_jobs" ON public.jobs;
CREATE POLICY "tradies_update_all_jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'tradie'
  )
);

-- Policy 7: Only tradies can delete jobs
DROP POLICY IF EXISTS "tradies_delete_all_jobs" ON public.jobs;
CREATE POLICY "tradies_delete_all_jobs" 
ON public.jobs 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'tradie'
  )
);

-- 4. Fix profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Tradies can view all profiles" ON public.profiles;

-- Allow users to view their own profile
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
CREATE POLICY "users_view_own_profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow tradies to view all profiles
DROP POLICY IF EXISTS "tradies_view_all_profiles" ON public.profiles;
CREATE POLICY "tradies_view_all_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'tradie'
  )
);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Fix the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone, name, user_type, address)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
    address = COALESCE(EXCLUDED.address, public.profiles.address),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Update existing jobs without client_id
DO $$
DECLARE
  default_client_id UUID;
BEGIN
  -- Try to find an existing client user
  SELECT id INTO default_client_id
  FROM auth.users
  WHERE raw_user_meta_data->>'user_type' = 'client'
  LIMIT 1;
  
  -- Update jobs that don't have a client_id
  IF default_client_id IS NOT NULL THEN
    UPDATE public.jobs
    SET client_id = default_client_id
    WHERE client_id IS NULL;
  END IF;
END $$;

-- 7. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- 8. Add helpful comments
COMMENT ON COLUMN public.jobs.client_id IS 'References the auth.users table to identify which client owns this job';
COMMENT ON POLICY "clients_view_own_jobs" ON public.jobs IS 'Ensures clients can only see jobs they created';
COMMENT ON POLICY "tradies_view_all_jobs" ON public.jobs IS 'Allows tradies to see all jobs from all clients';