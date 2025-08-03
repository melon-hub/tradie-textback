-- =============================================================================
-- CHUNK 8: INITIAL DATA AND FUNCTIONS
-- =============================================================================
-- Purpose: Insert initial trade types data and create helper functions
-- Created: 2025-08-03
-- =============================================================================

-- =============================================================================
-- INITIAL TRADE TYPES DATA
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
-- DEFAULT SMS TEMPLATES FUNCTION
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
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON TABLE public.trade_types TO authenticated;
GRANT ALL ON TABLE public.service_locations TO authenticated;
GRANT ALL ON TABLE public.tenant_sms_templates TO authenticated;
GRANT ALL ON TABLE public.twilio_settings TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_default_sms_templates TO authenticated;

-- =============================================================================
-- FUNCTION COMMENTS
-- =============================================================================

COMMENT ON FUNCTION create_default_sms_templates IS 'Creates default SMS templates for new tradie users';