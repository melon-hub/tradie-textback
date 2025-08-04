-- Simple fix for SECURITY DEFINER issue
-- Run this directly in Supabase SQL Editor

-- Drop the problematic view
DROP VIEW IF EXISTS public.customer_jobs_view CASCADE;

-- Recreate as a simple view (no SECURITY DEFINER)
CREATE VIEW public.customer_jobs_view AS
SELECT 
  j.*,
  p.name as tradie_name,
  p.phone as tradie_phone,
  p.user_id as tradie_id
FROM public.jobs j
LEFT JOIN public.profiles p ON j.client_id = p.user_id
WHERE p.user_type = 'tradie';

-- Grant permissions
GRANT SELECT ON public.customer_jobs_view TO authenticated;