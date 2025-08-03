-- =============================================================================
-- CHUNK 6: UPDATE TRIGGERS
-- =============================================================================
-- Purpose: Create triggers for updated_at columns on all new tables
-- Created: 2025-08-03
-- =============================================================================

-- =============================================================================
-- UPDATED_AT TRIGGERS
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