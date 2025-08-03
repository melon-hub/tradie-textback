-- =============================================================================
-- ONBOARDING SYSTEM MIGRATION
-- =============================================================================
-- Purpose: Comprehensive onboarding system with enhanced profiles, trade types,
--          service locations, SMS templates, and Twilio integration
-- Created: 2025-08-03
-- File: 20250803100000_onboarding_schema.sql
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENHANCED PROFILES TABLE
-- =============================================================================

-- Add new columns to existing profiles table
DO $$ 
BEGIN 
    -- Trade information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trade_primary') THEN
        ALTER TABLE public.profiles ADD COLUMN trade_primary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trade_secondary') THEN
        ALTER TABLE public.profiles ADD COLUMN trade_secondary TEXT[];
    END IF;
    
    -- Business information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_name') THEN
        ALTER TABLE public.profiles ADD COLUMN business_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'abn') THEN
        ALTER TABLE public.profiles ADD COLUMN abn TEXT;
    END IF;
    
    -- Service area information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'service_postcodes') THEN
        ALTER TABLE public.profiles ADD COLUMN service_postcodes TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'service_radius_km') THEN
        ALTER TABLE public.profiles ADD COLUMN service_radius_km NUMERIC(6,2);
    END IF;
    
    -- License and insurance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_number') THEN
        ALTER TABLE public.profiles ADD COLUMN license_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_expiry') THEN
        ALTER TABLE public.profiles ADD COLUMN license_expiry DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'insurance_provider') THEN
        ALTER TABLE public.profiles ADD COLUMN insurance_provider TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'insurance_expiry') THEN
        ALTER TABLE public.profiles ADD COLUMN insurance_expiry DATE;
    END IF;
    
    -- Experience and specializations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'years_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN years_experience INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specializations') THEN
        ALTER TABLE public.profiles ADD COLUMN specializations JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'languages_spoken') THEN
        ALTER TABLE public.profiles ADD COLUMN languages_spoken JSONB DEFAULT '["English"]'::jsonb;
    END IF;
    
    -- Onboarding status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_step') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
    END IF;
    
    -- Communication preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'callback_window_minutes') THEN
        ALTER TABLE public.profiles ADD COLUMN callback_window_minutes INTEGER DEFAULT 30;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'after_hours_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN after_hours_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
        ALTER TABLE public.profiles ADD COLUMN timezone TEXT DEFAULT 'Australia/Sydney';
    END IF;
END $$;

-- Add CHECK constraints
DO $$
BEGIN
    -- Trade primary constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_trade_primary_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_trade_primary_check 
        CHECK (trade_primary IN ('plumber', 'electrician', 'carpenter', 'hvac', 'handyman', 'landscaper', 'locksmith', 'painter', 'tiler', 'roofer'));
    END IF;
    
    -- Years experience constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_years_experience_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_years_experience_check 
        CHECK (years_experience >= 0 AND years_experience <= 50);
    END IF;
    
    -- Callback window constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_callback_window_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_callback_window_check 
        CHECK (callback_window_minutes > 0 AND callback_window_minutes <= 480);
    END IF;
    
    -- Service radius constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_service_radius_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_service_radius_check 
        CHECK (service_radius_km > 0 AND service_radius_km <= 500);
    END IF;
    
    -- Onboarding step constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_onboarding_step_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_onboarding_step_check 
        CHECK (onboarding_step >= 0 AND onboarding_step <= 10);
    END IF;
END $$;

-- =============================================================================
-- 2. TRADE TYPES TABLE
-- =============================================================================

-- Drop and recreate trade_types table to ensure clean state
DROP TABLE IF EXISTS public.trade_types CASCADE;

CREATE TABLE public.trade_types (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    category TEXT,
    typical_urgency TEXT CHECK (typical_urgency IN ('low', 'medium', 'high')),
    icon_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. SERVICE LOCATIONS TABLE
-- =============================================================================

-- Drop and recreate service_locations table to ensure clean state
DROP TABLE IF EXISTS public.service_locations CASCADE;

CREATE TABLE public.service_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    postcode TEXT NOT NULL,
    suburb TEXT,
    state TEXT,
    travel_time INTEGER, -- minutes
    surcharge NUMERIC(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE public.service_locations ADD CONSTRAINT service_locations_travel_time_check 
CHECK (travel_time >= 0 AND travel_time <= 300);

ALTER TABLE public.service_locations ADD CONSTRAINT service_locations_surcharge_check 
CHECK (surcharge >= 0);

-- =============================================================================
-- 4. TENANT SMS TEMPLATES TABLE
-- =============================================================================

-- Drop and recreate tenant_sms_templates table to ensure clean state
DROP TABLE IF EXISTS public.tenant_sms_templates CASCADE;

CREATE TABLE public.tenant_sms_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_type TEXT NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE public.tenant_sms_templates ADD CONSTRAINT tenant_sms_templates_type_check 
CHECK (template_type IN ('missed_call', 'after_hours', 'job_confirmation', 'appointment_reminder', 'follow_up', 'quote_ready', 'invoice_sent'));

ALTER TABLE public.tenant_sms_templates ADD CONSTRAINT tenant_sms_templates_content_length_check 
CHECK (LENGTH(content) <= 1600); -- SMS limit with some buffer

-- =============================================================================
-- 5. TWILIO SETTINGS TABLE
-- =============================================================================

-- Drop and recreate twilio_settings table to ensure clean state
DROP TABLE IF EXISTS public.twilio_settings CASCADE;

CREATE TABLE public.twilio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    account_sid TEXT,
    auth_token TEXT, -- Will be encrypted in application layer
    webhook_url TEXT,
    capabilities JSONB DEFAULT '{}'::jsonb,
    status TEXT CHECK (status IN ('pending', 'active', 'failed')) DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles table indexes (additional to existing ones)
CREATE INDEX IF NOT EXISTS idx_profiles_trade_primary ON public.profiles(trade_primary);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_business_name ON public.profiles(business_name);

-- Trade types table indexes
CREATE INDEX IF NOT EXISTS idx_trade_types_category ON public.trade_types(category);
CREATE INDEX IF NOT EXISTS idx_trade_types_typical_urgency ON public.trade_types(typical_urgency);

-- Service locations table indexes
CREATE INDEX IF NOT EXISTS idx_service_locations_user_id ON public.service_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_postcode ON public.service_locations(postcode);
CREATE INDEX IF NOT EXISTS idx_service_locations_is_active ON public.service_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_service_locations_user_postcode ON public.service_locations(user_id, postcode);

-- SMS templates table indexes
CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_user_id ON public.tenant_sms_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_type ON public.tenant_sms_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_is_active ON public.tenant_sms_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_user_type ON public.tenant_sms_templates(user_id, template_type);

-- Twilio settings table indexes
CREATE INDEX IF NOT EXISTS idx_twilio_settings_user_id ON public.twilio_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_twilio_settings_phone_number ON public.twilio_settings(phone_number);
CREATE INDEX IF NOT EXISTS idx_twilio_settings_status ON public.twilio_settings(status);

-- =============================================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Service locations trigger
DROP TRIGGER IF EXISTS update_service_locations_updated_at ON public.service_locations;
CREATE TRIGGER update_service_locations_updated_at
    BEFORE UPDATE ON public.service_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trade types trigger
DROP TRIGGER IF EXISTS update_trade_types_updated_at ON public.trade_types;
CREATE TRIGGER update_trade_types_updated_at
    BEFORE UPDATE ON public.trade_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- SMS templates trigger
DROP TRIGGER IF EXISTS update_tenant_sms_templates_updated_at ON public.tenant_sms_templates;
CREATE TRIGGER update_tenant_sms_templates_updated_at
    BEFORE UPDATE ON public.tenant_sms_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Twilio settings trigger
DROP TRIGGER IF EXISTS update_twilio_settings_updated_at ON public.twilio_settings;
CREATE TRIGGER update_twilio_settings_updated_at
    BEFORE UPDATE ON public.twilio_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.trade_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twilio_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 9. RLS POLICIES
-- =============================================================================

-- Trade types policies (read-only for all authenticated users)
CREATE POLICY "authenticated_view_trade_types" ON public.trade_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Service locations policies
CREATE POLICY "users_view_own_service_locations" ON public.service_locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_service_locations" ON public.service_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_service_locations" ON public.service_locations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_service_locations" ON public.service_locations
    FOR DELETE USING (auth.uid() = user_id);

-- SMS templates policies
CREATE POLICY "users_view_own_sms_templates" ON public.tenant_sms_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_sms_templates" ON public.tenant_sms_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_sms_templates" ON public.tenant_sms_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_sms_templates" ON public.tenant_sms_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Twilio settings policies
CREATE POLICY "users_view_own_twilio_settings" ON public.twilio_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_twilio_settings" ON public.twilio_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_twilio_settings" ON public.twilio_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_twilio_settings" ON public.twilio_settings
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 10. INITIAL TRADE TYPES DATA
-- =============================================================================

INSERT INTO public.trade_types (code, label, category, typical_urgency, icon_name) VALUES
    ('plumber', 'Plumber', 'construction', 'high', 'wrench'),
    ('electrician', 'Electrician', 'construction', 'high', 'zap'),
    ('carpenter', 'Carpenter', 'construction', 'medium', 'hammer'),
    ('hvac', 'HVAC Technician', 'maintenance', 'medium', 'thermometer'),
    ('handyman', 'Handyman', 'maintenance', 'low', 'tool'),
    ('landscaper', 'Landscaper', 'outdoor', 'low', 'tree'),
    ('locksmith', 'Locksmith', 'security', 'high', 'lock'),
    ('painter', 'Painter', 'finishing', 'low', 'brush'),
    ('tiler', 'Tiler', 'finishing', 'medium', 'square'),
    ('roofer', 'Roofer', 'construction', 'medium', 'home')
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    category = EXCLUDED.category,
    typical_urgency = EXCLUDED.typical_urgency,
    icon_name = EXCLUDED.icon_name,
    updated_at = NOW();

-- =============================================================================
-- 11. DEFAULT SMS TEMPLATES
-- =============================================================================

-- Function to create default SMS templates for new users
CREATE OR REPLACE FUNCTION create_default_sms_templates(target_user_id UUID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 12. GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON TABLE public.trade_types TO authenticated;
GRANT ALL ON TABLE public.service_locations TO authenticated;
GRANT ALL ON TABLE public.tenant_sms_templates TO authenticated;
GRANT ALL ON TABLE public.twilio_settings TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- 13. COMMENTS AND DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE public.trade_types IS 'Master list of available trade types with metadata';
COMMENT ON TABLE public.service_locations IS 'Specific postcodes where tradies provide services';
COMMENT ON TABLE public.tenant_sms_templates IS 'Customizable SMS templates for each tradie';
COMMENT ON TABLE public.twilio_settings IS 'Twilio phone number and API configuration per user';

-- Column comments
COMMENT ON COLUMN public.profiles.trade_primary IS 'Primary trade specialization';
COMMENT ON COLUMN public.profiles.trade_secondary IS 'Additional trade skills';
COMMENT ON COLUMN public.profiles.service_postcodes IS 'Specific postcodes for service delivery';
COMMENT ON COLUMN public.profiles.service_radius_km IS 'Service radius in kilometers from base location';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether user has completed onboarding process';
COMMENT ON COLUMN public.profiles.onboarding_step IS 'Current step in onboarding process (0-10)';
COMMENT ON COLUMN public.profiles.callback_window_minutes IS 'Time window for returning missed calls';
COMMENT ON COLUMN public.profiles.after_hours_enabled IS 'Whether to accept after-hours communications';

COMMENT ON COLUMN public.service_locations.travel_time IS 'Estimated travel time to this location in minutes';
COMMENT ON COLUMN public.service_locations.surcharge IS 'Additional charge for servicing this location';

COMMENT ON COLUMN public.tenant_sms_templates.variables IS 'Available template variables like {customer_name}, {business_name}';
COMMENT ON COLUMN public.tenant_sms_templates.template_type IS 'Type of SMS: missed_call, after_hours, job_confirmation, etc.';

COMMENT ON COLUMN public.twilio_settings.capabilities IS 'JSON object containing Twilio phone number capabilities';
COMMENT ON COLUMN public.twilio_settings.status IS 'Status of Twilio integration: pending, active, or failed';

-- Function comments
COMMENT ON FUNCTION create_default_sms_templates IS 'Creates default SMS templates for new tradie users';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- This migration adds comprehensive onboarding system functionality:
-- - Enhanced profiles with trade, business, and service area information
-- - Trade types master data with categories and urgency levels
-- - Service locations for postcode-specific service delivery
-- - Customizable SMS templates for automated communications
-- - Twilio integration settings for phone number management
-- - Row Level Security policies for data protection
-- - Performance indexes for optimal query execution
-- =============================================================================