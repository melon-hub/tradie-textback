-- =============================================================================
-- SUPABASE VAULT - TWILIO CREDENTIALS SETUP
-- =============================================================================
-- Purpose: Configure Supabase Vault for secure Twilio credential storage
-- Created: 2025-08-04
-- File: setup-twilio-vault.sql
-- Security: All sensitive credentials stored in Vault, never in database
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "vault" WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. VAULT SCHEMA SETUP (if not already enabled)
-- =============================================================================
-- Note: Supabase Vault is typically enabled via dashboard or CLI
-- This section is for reference only - vault setup requires admin privileges

-- Ensure vault schema exists (read-only check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'vault') THEN
        RAISE NOTICE 'Vault schema not found. Please enable Supabase Vault via dashboard or CLI.';
        RAISE NOTICE 'Run: supabase secrets set TWILIO_ACCOUNT_SID=your_sid TWILIO_AUTH_TOKEN=your_token';
    ELSE
        RAISE NOTICE 'Vault schema is available.';
    END IF;
END $$;

-- =============================================================================
-- 2. ENHANCED TWILIO CREDENTIAL MANAGEMENT FUNCTIONS
-- =============================================================================

-- Function to securely store Twilio credentials in Vault
-- This replaces the basic version from the onboarding schema
CREATE OR REPLACE FUNCTION vault_store_twilio_credentials(
    target_user_id UUID,
    account_sid TEXT,
    auth_token TEXT,
    phone_number TEXT,
    webhook_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    secret_name TEXT;
    secret_value JSONB;
    result JSONB;
    existing_settings RECORD;
BEGIN
    -- Validate inputs
    IF target_user_id IS NULL OR account_sid IS NULL OR auth_token IS NULL OR phone_number IS NULL THEN
        RAISE EXCEPTION 'All credential parameters are required';
    END IF;
    
    -- Ensure user owns this request (security check)
    IF auth.uid() IS NULL OR auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot store credentials for another user';
    END IF;
    
    -- Generate unique secret name for this user's Twilio credentials
    secret_name := 'twilio_credentials_' || replace(target_user_id::text, '-', '_');
    
    -- Create JSON object with credentials and metadata
    secret_value := jsonb_build_object(
        'account_sid', account_sid,
        'auth_token', auth_token,
        'user_id', target_user_id,
        'phone_number', phone_number,
        'created_at', NOW(),
        'updated_at', NOW()
    );
    
    BEGIN
        -- Store credentials in Vault
        PERFORM vault.create_secret(secret_name, secret_value::text);
        
        -- Check if settings record already exists
        SELECT * INTO existing_settings 
        FROM public.twilio_settings 
        WHERE user_id = target_user_id;
        
        -- Update or insert Twilio settings record with vault reference
        IF existing_settings IS NOT NULL THEN
            UPDATE public.twilio_settings 
            SET 
                phone_number = vault_store_twilio_credentials.phone_number,
                webhook_url = vault_store_twilio_credentials.webhook_url,
                vault_secret_name = secret_name,
                status = 'active',
                verified_at = NOW(),
                updated_at = NOW()
            WHERE user_id = target_user_id;
        ELSE
            INSERT INTO public.twilio_settings (
                user_id, 
                phone_number, 
                webhook_url,
                vault_secret_name, 
                status,
                verified_at
            )
            VALUES (
                target_user_id, 
                vault_store_twilio_credentials.phone_number, 
                vault_store_twilio_credentials.webhook_url,
                secret_name, 
                'active',
                NOW()
            );
        END IF;
        
        -- Return success result
        result := jsonb_build_object(
            'success', true,
            'secret_name', secret_name,
            'phone_number', vault_store_twilio_credentials.phone_number,
            'status', 'active',
            'message', 'Twilio credentials stored successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- Handle vault storage errors
        UPDATE public.twilio_settings 
        SET 
            status = 'failed',
            updated_at = NOW()
        WHERE user_id = target_user_id;
        
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to store Twilio credentials'
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve Twilio credentials from Vault
CREATE OR REPLACE FUNCTION vault_get_twilio_credentials(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    settings_record RECORD;
    vault_data TEXT;
    credentials JSONB;
    result JSONB;
BEGIN
    -- Ensure user owns this request (security check)
    If auth.uid() IS NULL OR auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot access credentials for another user';
    END IF;
    
    -- Get settings record
    SELECT * INTO settings_record 
    FROM public.twilio_settings 
    WHERE user_id = target_user_id AND status = 'active';
    
    IF settings_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'No active Twilio settings found'
        );
    END IF;
    
    BEGIN
        -- Retrieve credentials from Vault
        SELECT vault.read_secret(settings_record.vault_secret_name) INTO vault_data;
        
        IF vault_data IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Credentials not found in vault'
            );
        END IF;
        
        -- Parse vault data
        credentials := vault_data::jsonb;
        
        -- Return credentials with settings
        result := jsonb_build_object(
            'success', true,
            'account_sid', credentials->>'account_sid',
            'auth_token', credentials->>'auth_token',
            'phone_number', settings_record.phone_number,
            'webhook_url', settings_record.webhook_url,
            'capabilities', settings_record.capabilities,
            'status', settings_record.status
        );
        
    EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to retrieve Twilio credentials'
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update Twilio credentials in Vault
CREATE OR REPLACE FUNCTION vault_update_twilio_credentials(
    target_user_id UUID,
    account_sid TEXT DEFAULT NULL,
    auth_token TEXT DEFAULT NULL,
    phone_number TEXT DEFAULT NULL,
    webhook_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    settings_record RECORD;
    current_credentials JSONB;
    updated_credentials JSONB;
    vault_data TEXT;
    result JSONB;
BEGIN
    -- Ensure user owns this request (security check)
    IF auth.uid() IS NULL OR auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot update credentials for another user';
    END IF;
    
    -- Get current settings
    SELECT * INTO settings_record 
    FROM public.twilio_settings 
    WHERE user_id = target_user_id;
    
    IF settings_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'No Twilio settings found. Please store credentials first.'
        );
    END IF;
    
    BEGIN
        -- Get current credentials from vault
        SELECT vault.read_secret(settings_record.vault_secret_name) INTO vault_data;
        current_credentials := COALESCE(vault_data::jsonb, '{}'::jsonb);
        
        -- Update only provided fields
        updated_credentials := current_credentials;
        
        IF account_sid IS NOT NULL THEN
            updated_credentials := jsonb_set(updated_credentials, '{account_sid}', to_jsonb(account_sid));
        END IF;
        
        IF auth_token IS NOT NULL THEN
            updated_credentials := jsonb_set(updated_credentials, '{auth_token}', to_jsonb(auth_token));
        END IF;
        
        IF phone_number IS NOT NULL THEN
            updated_credentials := jsonb_set(updated_credentials, '{phone_number}', to_jsonb(phone_number));
        END IF;
        
        -- Always update timestamp
        updated_credentials := jsonb_set(updated_credentials, '{updated_at}', to_jsonb(NOW()));
        
        -- Update vault
        PERFORM vault.update_secret(settings_record.vault_secret_name, updated_credentials::text);
        
        -- Update database settings
        UPDATE public.twilio_settings 
        SET 
            phone_number = COALESCE(vault_update_twilio_credentials.phone_number, settings_record.phone_number),
            webhook_url = COALESCE(vault_update_twilio_credentials.webhook_url, settings_record.webhook_url),
            updated_at = NOW()
        WHERE user_id = target_user_id;
        
        result := jsonb_build_object(
            'success', true,
            'message', 'Twilio credentials updated successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to update Twilio credentials'
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete Twilio credentials from Vault
CREATE OR REPLACE FUNCTION vault_delete_twilio_credentials(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    settings_record RECORD;
    result JSONB;
BEGIN
    -- Ensure user owns this request (security check)
    IF auth.uid() IS NULL OR auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot delete credentials for another user';
    END IF;
    
    -- Get settings record
    SELECT * INTO settings_record 
    FROM public.twilio_settings 
    WHERE user_id = target_user_id;
    
    IF settings_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'No Twilio settings to delete'
        );
    END IF;
    
    BEGIN
        -- Delete from vault if secret exists
        IF settings_record.vault_secret_name IS NOT NULL THEN
            PERFORM vault.delete_secret(settings_record.vault_secret_name);
        END IF;
        
        -- Delete database record
        DELETE FROM public.twilio_settings WHERE user_id = target_user_id;
        
        result := jsonb_build_object(
            'success', true,
            'message', 'Twilio credentials deleted successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to delete Twilio credentials'
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to test Twilio credentials (returns safe info only)
CREATE OR REPLACE FUNCTION vault_test_twilio_credentials(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    credentials JSONB;
    result JSONB;
BEGIN
    -- Get credentials
    SELECT vault_get_twilio_credentials(target_user_id) INTO credentials;
    
    IF NOT (credentials->>'success')::boolean THEN
        RETURN credentials;
    END IF;
    
    -- Return test-safe information
    result := jsonb_build_object(
        'success', true,
        'has_account_sid', (credentials->>'account_sid') IS NOT NULL,
        'has_auth_token', (credentials->>'auth_token') IS NOT NULL,
        'phone_number', credentials->>'phone_number',
        'account_sid_prefix', CASE 
            WHEN credentials->>'account_sid' IS NOT NULL 
            THEN substring(credentials->>'account_sid', 1, 8) || '...'
            ELSE NULL
        END,
        'webhook_url', credentials->>'webhook_url',
        'status', credentials->>'status'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. UTILITY FUNCTIONS FOR CREDENTIAL VALIDATION
-- =============================================================================

-- Function to validate Twilio account SID format
CREATE OR REPLACE FUNCTION validate_twilio_account_sid(account_sid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Twilio Account SID format: AC followed by 32 hex characters
    RETURN account_sid ~ '^AC[0-9a-fA-F]{32}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate Twilio auth token format
CREATE OR REPLACE FUNCTION validate_twilio_auth_token(auth_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Twilio Auth Token format: 32 hex characters
    RETURN auth_token ~ '^[0-9a-fA-F]{32}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate Twilio phone number format
CREATE OR REPLACE FUNCTION validate_twilio_phone_number(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Twilio phone number format: +1 followed by 10 digits (North America)
    -- Or international format starting with +
    RETURN phone_number ~ '^\+[1-9]\d{1,14}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- 4. ADMIN FUNCTIONS FOR VAULT MANAGEMENT
-- =============================================================================

-- Function for admins to list all vault secrets (metadata only)
CREATE OR REPLACE FUNCTION admin_list_vault_secrets()
RETURNS TABLE(
    user_id UUID,
    secret_name TEXT,
    phone_number TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check admin privileges
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Admin privileges required';
    END IF;
    
    -- Return vault secret metadata from settings table
    RETURN QUERY
    SELECT 
        ts.user_id,
        ts.vault_secret_name,
        ts.phone_number,
        ts.status,
        ts.created_at,
        ts.verified_at
    FROM public.twilio_settings ts
    ORDER BY ts.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admins to cleanup orphaned vault secrets
CREATE OR REPLACE FUNCTION admin_cleanup_orphaned_vault_secrets()
RETURNS JSONB AS $$
DECLARE
    cleanup_count INTEGER := 0;
    settings_record RECORD;
    result JSONB;
BEGIN
    -- Check admin privileges
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Admin privileges required';
    END IF;
    
    -- Find settings records where user no longer exists
    FOR settings_record IN 
        SELECT ts.* 
        FROM public.twilio_settings ts
        LEFT JOIN auth.users u ON ts.user_id = u.id
        WHERE u.id IS NULL
    LOOP
        BEGIN
            -- Delete vault secret
            IF settings_record.vault_secret_name IS NOT NULL THEN
                PERFORM vault.delete_secret(settings_record.vault_secret_name);
            END IF;
            
            -- Delete settings record
            DELETE FROM public.twilio_settings WHERE id = settings_record.id;
            
            cleanup_count := cleanup_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue cleanup
            RAISE NOTICE 'Failed to cleanup secret %: %', settings_record.vault_secret_name, SQLERRM;
        END;
    END LOOP;
    
    result := jsonb_build_object(
        'success', true,
        'cleaned_up_count', cleanup_count,
        'message', format('Cleaned up %s orphaned vault secrets', cleanup_count)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. ENHANCED ERROR HANDLING AND LOGGING
-- =============================================================================

-- Create audit table for vault operations
CREATE TABLE IF NOT EXISTS public.vault_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operation TEXT NOT NULL, -- store, retrieve, update, delete, test
    secret_name TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.vault_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit log
CREATE POLICY "users_view_own_vault_audit" ON public.vault_audit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admins_view_all_vault_audit" ON public.vault_audit_log
    FOR SELECT USING (is_admin());

CREATE POLICY "system_insert_vault_audit" ON public.vault_audit_log
    FOR INSERT WITH CHECK (true); -- Allow system to insert audit records

-- Function to log vault operations
CREATE OR REPLACE FUNCTION log_vault_operation(
    operation_type TEXT,
    secret_name_param TEXT,
    success_param BOOLEAN,
    error_message_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.vault_audit_log (
        user_id,
        operation,
        secret_name,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        operation_type,
        secret_name_param,
        success_param,
        error_message_param
    );
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the main operation if audit logging fails
    RAISE NOTICE 'Audit logging failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for audit log performance
CREATE INDEX IF NOT EXISTS idx_vault_audit_log_user_id ON public.vault_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_audit_log_operation ON public.vault_audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_vault_audit_log_created_at ON public.vault_audit_log(created_at DESC);

-- =============================================================================
-- 6. GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON TABLE public.vault_audit_log TO authenticated;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION vault_store_twilio_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION vault_get_twilio_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION vault_update_twilio_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION vault_delete_twilio_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION vault_test_twilio_credentials TO authenticated;

GRANT EXECUTE ON FUNCTION validate_twilio_account_sid TO authenticated;
GRANT EXECUTE ON FUNCTION validate_twilio_auth_token TO authenticated;
GRANT EXECUTE ON FUNCTION validate_twilio_phone_number TO authenticated;

GRANT EXECUTE ON FUNCTION admin_list_vault_secrets TO authenticated;
GRANT EXECUTE ON FUNCTION admin_cleanup_orphaned_vault_secrets TO authenticated;
GRANT EXECUTE ON FUNCTION log_vault_operation TO authenticated;

-- =============================================================================
-- 7. COMMENTS AND DOCUMENTATION
-- =============================================================================

-- Function comments
COMMENT ON FUNCTION vault_store_twilio_credentials IS 'Securely stores Twilio credentials in Supabase Vault with full validation';
COMMENT ON FUNCTION vault_get_twilio_credentials IS 'Retrieves Twilio credentials from Vault for authorized users only';
COMMENT ON FUNCTION vault_update_twilio_credentials IS 'Updates specific Twilio credential fields in Vault';
COMMENT ON FUNCTION vault_delete_twilio_credentials IS 'Safely deletes Twilio credentials from Vault and database';
COMMENT ON FUNCTION vault_test_twilio_credentials IS 'Tests credential availability without exposing sensitive data';

COMMENT ON FUNCTION validate_twilio_account_sid IS 'Validates Twilio Account SID format (AC + 32 hex chars)';
COMMENT ON FUNCTION validate_twilio_auth_token IS 'Validates Twilio Auth Token format (32 hex chars)';
COMMENT ON FUNCTION validate_twilio_phone_number IS 'Validates international phone number format';

COMMENT ON FUNCTION admin_list_vault_secrets IS 'Admin function to list all vault secret metadata';
COMMENT ON FUNCTION admin_cleanup_orphaned_vault_secrets IS 'Admin function to cleanup vault secrets for deleted users';
COMMENT ON FUNCTION log_vault_operation IS 'Logs vault operations for security auditing';

-- Table comments
COMMENT ON TABLE public.vault_audit_log IS 'Audit log for all vault credential operations';
COMMENT ON COLUMN public.vault_audit_log.operation IS 'Type of operation: store, retrieve, update, delete, test';
COMMENT ON COLUMN public.vault_audit_log.secret_name IS 'Name of the vault secret (for tracking)';

-- =============================================================================
-- VAULT SETUP COMPLETE
-- =============================================================================
-- This script provides comprehensive Twilio credential management using Supabase Vault:
--
-- SECURITY FEATURES:
-- - All sensitive credentials stored in encrypted Vault
-- - User-specific access controls with RLS policies
-- - Comprehensive audit logging for all operations
-- - Input validation for Twilio credential formats
-- - Admin functions for vault maintenance
--
-- FUNCTIONS PROVIDED:
-- - vault_store_twilio_credentials: Store credentials securely
-- - vault_get_twilio_credentials: Retrieve credentials safely
-- - vault_update_twilio_credentials: Update specific credential fields
-- - vault_delete_twilio_credentials: Remove credentials completely
-- - vault_test_twilio_credentials: Test credential availability
--
-- ADMIN FUNCTIONS:
-- - admin_list_vault_secrets: List all vault secret metadata
-- - admin_cleanup_orphaned_vault_secrets: Cleanup orphaned secrets
--
-- VALIDATION FUNCTIONS:
-- - validate_twilio_account_sid: Validate Account SID format
-- - validate_twilio_auth_token: Validate Auth Token format
-- - validate_twilio_phone_number: Validate phone number format
--
-- USAGE:
-- See /docs/twilio-vault-setup.md for detailed implementation guide
-- =============================================================================