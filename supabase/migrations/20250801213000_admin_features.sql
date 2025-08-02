-- Migration: Add admin functionality
-- Created: 2025-08-01
-- Description: Adds admin features including is_admin field, business_settings table, and admin_audit_log table

-- Add is_admin field to profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create business_settings table
CREATE TABLE business_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  abn TEXT,
  logo_url TEXT,
  primary_color TEXT,
  service_areas JSONB,
  operating_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_audit_log table
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_business_settings_user_id ON business_settings(user_id);
CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for business_settings updated_at
CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_settings
-- Users can only view and edit their own business settings
CREATE POLICY "Users can view own business settings" ON business_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business settings" ON business_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business settings" ON business_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business settings" ON business_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all business settings
CREATE POLICY "Admins can view all business settings" ON business_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

-- RLS Policies for admin_audit_log
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON admin_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" ON admin_audit_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

-- RLS Policy for profiles is_admin field
-- Create a policy to prevent non-admins from updating is_admin field
-- This requires updating the existing profiles policies or creating a new one

-- First, let's create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = user_id 
        AND profiles.is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle admin field updates securely
CREATE OR REPLACE FUNCTION secure_profiles_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If is_admin field is being changed
    IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
        -- Only allow if current user is admin or if it's the initial setup (no admins exist yet)
        IF NOT is_admin() AND EXISTS (SELECT 1 FROM profiles WHERE is_admin = TRUE) THEN
            RAISE EXCEPTION 'Only admins can modify admin status';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to secure admin field updates
CREATE TRIGGER secure_profiles_admin_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION secure_profiles_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE business_settings TO authenticated;
GRANT ALL ON TABLE admin_audit_log TO authenticated;

-- Create helper function for logging admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    action_name TEXT,
    target_type_param TEXT DEFAULT NULL,
    target_id_param UUID DEFAULT NULL,
    details_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    -- Only log if user is admin
    IF is_admin() THEN
        INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
        VALUES (auth.uid(), action_name, target_type_param, target_id_param, details_param)
        RETURNING id INTO log_id;
        
        RETURN log_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE business_settings IS 'Stores business configuration settings for each user';
COMMENT ON TABLE admin_audit_log IS 'Tracks administrative actions for audit purposes';
COMMENT ON COLUMN profiles.is_admin IS 'Flag indicating if user has admin privileges';
COMMENT ON FUNCTION is_admin IS 'Helper function to check if current user is admin';
COMMENT ON FUNCTION log_admin_action IS 'Helper function to log administrative actions';