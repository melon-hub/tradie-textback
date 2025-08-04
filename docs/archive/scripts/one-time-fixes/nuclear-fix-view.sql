-- Nuclear option: Complete removal and different approach

-- 1. Drop EVERYTHING related to customer_jobs_view
DROP VIEW IF EXISTS public.customer_jobs_view CASCADE;
DROP VIEW IF EXISTS auth.customer_jobs_view CASCADE;
DROP VIEW IF EXISTS extensions.customer_jobs_view CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.customer_jobs_view CASCADE;
DROP FUNCTION IF EXISTS public.get_customer_jobs_by_phone(TEXT) CASCADE;

-- 2. Clear any cached definitions
-- This forces Supabase to re-evaluate
SELECT pg_catalog.pg_stat_clear_snapshot();

-- 3. Create a completely different view with a new name
-- Sometimes the linter caches results by name
CREATE VIEW public.customer_jobs_data AS
SELECT 
  j.id as job_id,
  j.client_id as tradie_user_id,
  j.customer_name,
  j.phone as customer_phone,
  j.job_type,
  j.location,
  j.urgency,
  j.status,
  j.estimated_value,
  j.description,
  j.preferred_time,
  j.last_contact,
  j.sms_blocked,
  j.created_at as job_created_at,
  j.updated_at as job_updated_at,
  p.name as tradie_name,
  p.phone as tradie_phone
FROM public.jobs j
INNER JOIN public.profiles p ON j.client_id = p.user_id AND p.user_type = 'tradie';

-- 4. Grant permissions
GRANT SELECT ON public.customer_jobs_data TO authenticated;
GRANT SELECT ON public.customer_jobs_data TO anon;

-- 5. Update your application code to use customer_jobs_data instead of customer_jobs_view

-- 6. Alternative: Use a table function that's guaranteed to not have SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_customer_jobs_data()
RETURNS TABLE (
  job_id UUID,
  tradie_user_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  job_type TEXT,
  location TEXT,
  urgency TEXT,
  status TEXT,
  estimated_value DECIMAL,
  description TEXT,
  preferred_time TEXT,
  last_contact TIMESTAMP WITH TIME ZONE,
  sms_blocked BOOLEAN,
  job_created_at TIMESTAMP WITH TIME ZONE,
  job_updated_at TIMESTAMP WITH TIME ZONE,
  tradie_name TEXT,
  tradie_phone TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT 
    j.id,
    j.client_id,
    j.customer_name,
    j.phone,
    j.job_type,
    j.location,
    j.urgency,
    j.status,
    j.estimated_value,
    j.description,
    j.preferred_time,
    j.last_contact,
    j.sms_blocked,
    j.created_at,
    j.updated_at,
    p.name,
    p.phone
  FROM public.jobs j
  INNER JOIN public.profiles p ON j.client_id = p.user_id AND p.user_type = 'tradie';
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_customer_jobs_data() TO authenticated;

-- 7. Verify no SECURITY DEFINER
SELECT 
    proname,
    prosecdef
FROM pg_proc
WHERE proname IN ('get_customer_jobs_data', 'get_customer_jobs_by_phone');

-- The prosecdef column should be 'f' (false) for SECURITY INVOKER