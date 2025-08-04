-- Fix the SECURITY DEFINER issue by explicitly setting security_invoker=on

-- Drop the existing view first
DROP VIEW IF EXISTS public.customer_jobs_view CASCADE;

-- Recreate the view with security_invoker=on
CREATE OR REPLACE VIEW public.customer_jobs_view 
WITH (security_invoker=on)
AS 
SELECT 
  j.id,
  j.client_id,
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
  j.created_at,
  j.updated_at,
  -- Add tradie information
  p.name as tradie_name,
  p.phone as tradie_phone,
  p.user_id as tradie_id,
  p.user_type as tradie_type
FROM public.jobs j
LEFT JOIN public.profiles p ON j.client_id = p.user_id
WHERE p.user_type = 'tradie';

-- Grant permissions
GRANT SELECT ON public.customer_jobs_view TO authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.customer_jobs_view IS 
'View combining job data with tradie information for customer access. 
Uses security_invoker=on to respect RLS policies on underlying tables.';

-- Verify RLS is enabled on underlying tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify the fix by checking the view definition
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE viewname = 'customer_jobs_view'
AND schemaname = 'public';