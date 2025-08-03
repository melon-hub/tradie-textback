-- =============================================================================
-- CHUNK 4: SECURE TWILIO SETTINGS TABLE
-- =============================================================================
-- Purpose: Create secure Twilio settings table without auth_token field
-- Created: 2025-08-03
-- Security: Twilio credentials stored in Supabase Vault, not in database
-- =============================================================================

-- =============================================================================
-- SECURE TWILIO SETTINGS TABLE
-- =============================================================================
-- SECURITY: Removed auth_token field - credentials stored in Supabase Vault
-- Only non-sensitive configuration data is stored in the database

-- Drop and recreate twilio_settings table to ensure clean state
DROP TABLE IF EXISTS public.twilio_settings CASCADE;

CREATE TABLE public.twilio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    webhook_url TEXT,
    capabilities JSONB DEFAULT '{}'::jsonb,
    status TEXT CHECK (status IN ('pending', 'active', 'failed')) DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Reference to stored credentials in Supabase Vault
    vault_secret_name TEXT -- Name of the secret in Supabase Vault containing account_sid and auth_token
);

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE public.twilio_settings IS 'Twilio phone number configuration (credentials stored securely in Vault)';
COMMENT ON COLUMN public.twilio_settings.capabilities IS 'JSON object containing Twilio phone number capabilities';
COMMENT ON COLUMN public.twilio_settings.status IS 'Status of Twilio integration: pending, active, or failed';
COMMENT ON COLUMN public.twilio_settings.vault_secret_name IS 'Reference to Supabase Vault secret containing account_sid and auth_token';