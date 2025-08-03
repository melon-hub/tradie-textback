-- =============================================================================
-- CHUNK 7: ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
-- Purpose: Enable RLS and create security policies for all new tables
-- Created: 2025-08-03
-- =============================================================================

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.trade_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twilio_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
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