-- =============================================================================
-- CHUNK 5: PERFORMANCE INDEXES
-- =============================================================================
-- Purpose: Create all performance indexes for the onboarding system tables
-- Created: 2025-08-03
-- =============================================================================

-- =============================================================================
-- PROFILES TABLE INDEXES (additional to existing ones)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_trade_primary ON public.profiles(trade_primary);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_business_name ON public.profiles(business_name);

-- =============================================================================
-- TRADE TYPES TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_trade_types_category ON public.trade_types(category);
CREATE INDEX IF NOT EXISTS idx_trade_types_typical_urgency ON public.trade_types(typical_urgency);

-- =============================================================================
-- SERVICE LOCATIONS TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_service_locations_user_id ON public.service_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_postcode ON public.service_locations(postcode);
CREATE INDEX IF NOT EXISTS idx_service_locations_is_active ON public.service_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_service_locations_user_postcode ON public.service_locations(user_id, postcode);

-- =============================================================================
-- SMS TEMPLATES TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_user_id ON public.tenant_sms_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_type ON public.tenant_sms_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_is_active ON public.tenant_sms_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_sms_templates_user_type ON public.tenant_sms_templates(user_id, template_type);

-- =============================================================================
-- TWILIO SETTINGS TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_twilio_settings_user_id ON public.twilio_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_twilio_settings_phone_number ON public.twilio_settings(phone_number);
CREATE INDEX IF NOT EXISTS idx_twilio_settings_status ON public.twilio_settings(status);
CREATE INDEX IF NOT EXISTS idx_twilio_settings_vault_secret ON public.twilio_settings(vault_secret_name);