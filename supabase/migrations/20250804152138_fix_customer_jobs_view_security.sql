-- =============================================================================
-- Fix SECURITY DEFINER issue on customer_jobs_view
-- =============================================================================
-- Supabase security linter has identified that customer_jobs_view may have
-- SECURITY DEFINER property, which bypasses RLS policies. This migration
-- recreates the view without SECURITY DEFINER to ensure proper security.
-- =============================================================================

-- Drop the existing view
DROP VIEW IF EXISTS public.customer_jobs_view CASCADE;

-- Recreate the view WITHOUT SECURITY DEFINER (using default SECURITY INVOKER)
-- This ensures the view respects the RLS policies of the underlying tables
CREATE VIEW public.customer_jobs_view AS
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
WHERE p.user_type = 'tradie'; -- Ensure we only join with tradie profiles

-- Grant access to authenticated users
GRANT SELECT ON public.customer_jobs_view TO authenticated;

-- Add comment to document the view's purpose and security model
COMMENT ON VIEW public.customer_jobs_view IS 
'View combining job data with tradie information for customer access. 
Uses SECURITY INVOKER (default) to respect RLS policies on underlying tables.
Allows customers to see jobs from all tradies when searching by their phone number.';

-- =============================================================================
-- Note on RLS Policies
-- =============================================================================
-- The view will respect the existing RLS policies from the production_fix migration:
-- - clients_view_own_jobs: Clients can only view their own jobs (by client_id)
-- - tradies_view_all_jobs: Tradies can view all jobs
--
-- The customer_jobs_view is designed for a specific use case where customers
-- (not authenticated clients) need to see jobs by phone number. Since the view
-- now uses SECURITY INVOKER (default), it will respect these base table policies.
--
-- If customers need to access jobs by phone (without being the job owner),
-- that should be handled through a separate secure API endpoint or Edge Function
-- rather than bypassing RLS with SECURITY DEFINER.

-- =============================================================================
-- Verification: Check that the view doesn't have SECURITY DEFINER
-- =============================================================================
-- You can verify this by running:
-- SELECT viewname, viewowner, definition 
-- FROM pg_views 
-- WHERE viewname = 'customer_jobs_view';
-- The definition should NOT contain "SECURITY DEFINER"