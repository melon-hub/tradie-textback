-- =============================================================================
-- Fix Function Search Path Security Warnings
-- =============================================================================
-- Drop and recreate functions with explicit search_path to fix security warnings
-- =============================================================================

-- 1. Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix create_default_sms_templates function
DROP FUNCTION IF EXISTS public.create_default_sms_templates(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.create_default_sms_templates(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.tenant_sms_templates (user_id, template_type, content, variables) VALUES
        (target_user_id, 'missed_call', 'Hi {customer_name}, thanks for calling {business_name}! We missed your call but will get back to you within {callback_window} minutes. For urgent matters, please call again.', ARRAY['customer_name', 'business_name', 'callback_window']),
        (target_user_id, 'after_hours', 'Thanks for contacting {business_name}! We''re currently closed but will respond first thing in the morning. For emergencies, please call {emergency_number}.', ARRAY['business_name', 'emergency_number']),
        (target_user_id, 'job_confirmation', 'Hi {customer_name}, we''ve received your request for {job_type} at {location}. We''ll be in touch shortly to discuss details and scheduling.', ARRAY['customer_name', 'job_type', 'location']),
        (target_user_id, 'appointment_reminder', 'Reminder: {business_name} will be arriving at {location} on {appointment_date} at {appointment_time} for your {job_type} job.', ARRAY['business_name', 'location', 'appointment_date', 'appointment_time', 'job_type']),
        (target_user_id, 'follow_up', 'Hi {customer_name}, thanks for choosing {business_name}! How did we do? We''d love your feedback and would appreciate a review if you were happy with our service.', ARRAY['customer_name', 'business_name']),
        (target_user_id, 'quote_ready', 'Hi {customer_name}, your quote for {job_type} is ready! Total: ${quote_amount}. Valid for 30 days. Reply YES to accept or call us to discuss.', ARRAY['customer_name', 'job_type', 'quote_amount']),
        (target_user_id, 'invoice_sent', 'Hi {customer_name}, your invoice for ${invoice_amount} has been sent. Payment due in {payment_terms} days. Thank you for choosing {business_name}!', ARRAY['customer_name', 'invoice_amount', 'payment_terms', 'business_name'])
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Fix store_twilio_credentials function
DROP FUNCTION IF EXISTS public.store_twilio_credentials(UUID, TEXT, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.store_twilio_credentials(
    target_user_id UUID,
    account_sid TEXT,
    auth_token TEXT,
    phone_number TEXT
)
RETURNS TEXT AS $$
DECLARE
    secret_name TEXT;
    secret_value JSONB;
BEGIN
    -- Generate unique secret name for this user's Twilio credentials
    secret_name := 'twilio_credentials_' || replace(target_user_id::text, '-', '_');
    
    -- Create JSON object with credentials
    secret_value := jsonb_build_object(
        'account_sid', account_sid,
        'auth_token', auth_token,
        'user_id', target_user_id,
        'phone_number', phone_number
    );
    
    -- Store in vault (this is a placeholder - actual vault integration needed)
    -- For now, update the twilio_settings table
    UPDATE public.twilio_settings
    SET 
        account_sid = store_twilio_credentials.account_sid,
        auth_token = store_twilio_credentials.auth_token,
        phone_number = store_twilio_credentials.phone_number,
        vault_secret_name = secret_name
    WHERE user_id = target_user_id;
    
    RETURN secret_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Fix get_twilio_settings function - First check what it returns
-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_twilio_settings(UUID) CASCADE;

-- Recreate based on the original definition from the migration
CREATE OR REPLACE FUNCTION public.get_twilio_settings(target_user_id UUID)
RETURNS TABLE (
    phone_number TEXT,
    webhook_url TEXT,
    forward_to_phone TEXT,
    forward_to_email TEXT,
    is_active BOOLEAN,
    vault_secret_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.phone_number,
        ts.webhook_url,
        ts.forward_to_phone,
        ts.forward_to_email,
        ts.is_active,
        ts.vault_secret_name
    FROM public.twilio_settings ts
    WHERE ts.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Fix get_customer_jobs_by_phone function (if it exists)
DROP FUNCTION IF EXISTS public.get_customer_jobs_by_phone(TEXT) CASCADE;

-- Recreate with search_path
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
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if the user is a customer with this phone number
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND phone = customer_phone_param
    AND user_type = 'client'
  ) THEN
    -- If not a customer with this phone, check if they're a tradie
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
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
-- Recreate any triggers that depend on update_updated_at_column
-- =============================================================================
-- Find all triggers using this function and recreate them
DO $$
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN 
        SELECT DISTINCT 
            trigger_name,
            event_object_table,
            action_timing,
            string_agg(event_manipulation, ' OR ') as events
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        AND action_statement LIKE '%update_updated_at_column%'
        GROUP BY trigger_name, event_object_table, action_timing
    LOOP
        -- Drop and recreate each trigger
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I', 
            trig.trigger_name, 'public', trig.event_object_table);
        
        EXECUTE format('CREATE TRIGGER %I %s %s ON %I.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            trig.trigger_name, trig.action_timing, trig.events, 'public', trig.event_object_table);
    END LOOP;
END $$;

-- =============================================================================
-- Verify all functions now have search_path set
-- =============================================================================
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    p.prosecdef as security_definer,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%search_path%' THEN 'HAS search_path'
        ELSE 'NO search_path'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'update_updated_at_column',
    'create_default_sms_templates', 
    'store_twilio_credentials',
    'get_twilio_settings',
    'get_customer_jobs_by_phone'
)
ORDER BY p.proname;