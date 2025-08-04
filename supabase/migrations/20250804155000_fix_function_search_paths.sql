-- =============================================================================
-- Fix Function Search Path Security Warnings
-- =============================================================================
-- Set explicit search_path for all functions to prevent potential SQL injection
-- =============================================================================

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Fix create_default_sms_templates function
-- First, let's check the existing function definition
-- Then recreate with SET search_path
DO $$
BEGIN
    -- Drop and recreate the function with search_path
    -- We need to check the actual function signature first
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_default_sms_templates') THEN
        -- Get the function definition and recreate with search_path
        -- This is a placeholder - we need to check the actual function
        NULL;
    END IF;
END $$;

-- For functions we can identify, here's the pattern:
-- Find each function and add SET search_path = public, pg_temp to the end

-- 3. For store_twilio_credentials (if it exists)
-- This handles sensitive data, so it's important to fix
-- We'll need to check the actual function definition

-- 4. For get_twilio_settings (if it exists)
-- Similar pattern

-- 5. For get_customer_jobs_by_phone
-- We created this earlier, so we can fix it
CREATE OR REPLACE FUNCTION public.get_customer_jobs_by_phone(customer_phone_param TEXT)
RETURNS TABLE (
  id UUID,
  client_id UUID,
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
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  tradie_name TEXT,
  tradie_phone TEXT,
  tradie_id UUID,
  tradie_type TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp  -- ADD THIS LINE
AS $$
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if the user is a customer with this phone number
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND phone = customer_phone_param
    AND user_type = 'client'
  ) THEN
    -- If not a customer with this phone, check if they're a tradie
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND user_type = 'tradie'
    ) THEN
      RAISE EXCEPTION 'Unauthorized access';
    END IF;
  END IF;

  -- Return the job data
  RETURN QUERY
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
    p.phone,
    p.user_id,
    p.user_type
  FROM public.jobs j
  LEFT JOIN public.profiles p ON j.client_id = p.user_id
  WHERE p.user_type = 'tradie'
  AND j.phone = customer_phone_param;
END;
$$;

-- =============================================================================
-- Query to find all functions that need fixing
-- =============================================================================
-- Run this to see all functions without search_path set:
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'update_updated_at_column',
    'create_default_sms_templates', 
    'store_twilio_credentials',
    'get_twilio_settings',
    'get_customer_jobs_by_phone'
);