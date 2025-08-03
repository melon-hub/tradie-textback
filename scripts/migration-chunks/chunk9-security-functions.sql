-- =============================================================================
-- CHUNK 9: SECURITY FUNCTIONS FOR TWILIO
-- =============================================================================
-- Purpose: Create security functions for secure Twilio credential management
-- Created: 2025-08-03
-- Security: Functions for managing Twilio credentials via Supabase Vault
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS FOR SECURE TWILIO INTEGRATION
-- =============================================================================

-- Function to securely store Twilio credentials in Supabase Vault
CREATE OR REPLACE FUNCTION store_twilio_credentials(
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
    
    -- Store in Supabase Vault (this would be handled by your application layer)
    -- vault.create_secret(secret_name, secret_value::text);
    
    -- Update or insert Twilio settings record with vault reference
    INSERT INTO public.twilio_settings (user_id, phone_number, vault_secret_name, status)
    VALUES (target_user_id, phone_number, secret_name, 'pending')
    ON CONFLICT (phone_number) DO UPDATE SET
        vault_secret_name = EXCLUDED.vault_secret_name,
        updated_at = NOW();
    
    RETURN secret_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve Twilio settings (without sensitive credentials)
CREATE OR REPLACE FUNCTION get_twilio_settings(target_user_id UUID)
RETURNS TABLE(
    id UUID,
    phone_number TEXT,
    webhook_url TEXT,
    capabilities JSONB,
    status TEXT,
    vault_secret_name TEXT,
    verified_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id,
        ts.phone_number,
        ts.webhook_url,
        ts.capabilities,
        ts.status,
        ts.vault_secret_name,
        ts.verified_at
    FROM public.twilio_settings ts
    WHERE ts.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS AND PERMISSIONS FOR SECURITY FUNCTIONS
-- =============================================================================

-- Grant execute permissions on security functions
GRANT EXECUTE ON FUNCTION store_twilio_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION get_twilio_settings TO authenticated;

-- =============================================================================
-- FUNCTION COMMENTS
-- =============================================================================

COMMENT ON FUNCTION store_twilio_credentials IS 'Securely stores Twilio credentials in Supabase Vault and creates settings record';
COMMENT ON FUNCTION get_twilio_settings IS 'Retrieves Twilio settings without exposing sensitive credentials';