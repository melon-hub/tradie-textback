-- Create a view that includes tradie information with jobs
-- This allows customers to see which tradie each job belongs to

CREATE OR REPLACE VIEW public.customer_jobs_view AS
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

-- Add RLS policy for the view
-- Note: Views inherit RLS from their base tables, but we can add additional policies
-- The existing RLS on jobs table will still apply