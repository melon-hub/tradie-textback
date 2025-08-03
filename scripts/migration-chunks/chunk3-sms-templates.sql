-- =============================================================================
-- CHUNK 3: SMS TEMPLATES TABLE
-- =============================================================================
-- Purpose: Create tenant SMS templates table for customizable messaging
-- Created: 2025-08-03
-- =============================================================================

-- =============================================================================
-- TENANT SMS TEMPLATES TABLE
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
-- TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE public.tenant_sms_templates IS 'Customizable SMS templates for each tradie';
COMMENT ON COLUMN public.tenant_sms_templates.variables IS 'Available template variables like {customer_name}, {business_name}';
COMMENT ON COLUMN public.tenant_sms_templates.template_type IS 'Type of SMS: missed_call, after_hours, job_confirmation, etc.';