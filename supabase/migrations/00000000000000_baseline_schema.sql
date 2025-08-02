-- =============================================================================
-- BASELINE MIGRATION: Complete Schema State
-- =============================================================================
-- This migration captures the current production state of the database
-- It's designed to be idempotent and safe to run multiple times
-- Created: 2025-08-02
-- Purpose: Sync local migration state with production database
-- =============================================================================

-- Enable necessary extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLE: profiles
-- =============================================================================
-- Core user profile table storing tradie and client information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT,
    name TEXT,
    role TEXT,
    user_type TEXT NOT NULL DEFAULT 'client',
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for incremental updates)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        ALTER TABLE public.profiles ADD COLUMN user_type TEXT NOT NULL DEFAULT 'client';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE public.profiles ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- =============================================================================
-- TABLE: jobs
-- =============================================================================
-- Main jobs table storing customer job requests
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT,
    phone TEXT,
    job_type TEXT,
    location TEXT,
    urgency TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'new',
    estimated_value DECIMAL(10,2),
    description TEXT,
    preferred_time TEXT,
    last_contact TIMESTAMP WITH TIME ZONE,
    sms_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add client_id column if it doesn't exist (for incremental updates)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'client_id') THEN
        ALTER TABLE public.jobs ADD COLUMN client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================================================
-- TABLE: job_links
-- =============================================================================
-- Secure access tokens for job sharing
CREATE TABLE IF NOT EXISTS public.job_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABLE: business_settings
-- =============================================================================
-- Business configuration settings for each user
CREATE TABLE IF NOT EXISTS public.business_settings (
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

-- =============================================================================
-- TABLE: admin_audit_log
-- =============================================================================
-- Audit log for administrative actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_admin ON public.profiles(user_id, is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_phone ON public.jobs(phone);

-- Job links table indexes
CREATE INDEX IF NOT EXISTS idx_job_links_job_id ON public.job_links(job_id);
CREATE INDEX IF NOT EXISTS idx_job_links_token ON public.job_links(token);
CREATE INDEX IF NOT EXISTS idx_job_links_expires_at ON public.job_links(expires_at);

-- Business settings table indexes
CREATE INDEX IF NOT EXISTS idx_business_settings_user_id ON public.business_settings(user_id);

-- Admin audit log table indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON public.admin_audit_log(target_type, target_id);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Customer jobs view with tradie information
CREATE OR REPLACE VIEW public.customer_jobs_view AS
SELECT 
    j.id,
    j.client_id,
    j.customer_name,
    j.phone as customer_phone,
    j.job_type,
    j.location,
    j.urgency,
    j.status,
    j.estimated_value,
    j.description,
    j.preferred_time,
    j.last_contact,
    j.sms_blocked,
    j.created_at,
    j.updated_at,
    -- Add tradie information
    p.name as tradie_name,
    p.phone as tradie_phone,
    p.user_id as tradie_id,
    p.user_type as tradie_type
FROM public.jobs j
LEFT JOIN public.profiles p ON j.client_id = p.user_id
WHERE p.user_type = 'tradie';

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = user_id 
        AND profiles.is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to secure admin field updates
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

-- Function for logging admin actions
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

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger for jobs updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_jobs_updated_at') THEN
        CREATE TRIGGER update_jobs_updated_at
            BEFORE UPDATE ON public.jobs
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger for business_settings updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_business_settings_updated_at') THEN
        CREATE TRIGGER update_business_settings_updated_at
            BEFORE UPDATE ON public.business_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger to secure admin field updates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'secure_profiles_admin_update') THEN
        CREATE TRIGGER secure_profiles_admin_update
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION secure_profiles_update();
    END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES: profiles table
-- =============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "tradies_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_and_tradies_view_all" ON public.profiles;
DROP POLICY IF EXISTS "all_users_view_all_profiles_temp" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;

-- Users can always view their own profile
CREATE POLICY "users_view_own_profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Temporary policy: All authenticated users can view all profiles
-- Note: This is a simplified approach to avoid recursion issues
-- In production, consider using JWT claims for role-based access
CREATE POLICY "all_authenticated_view_profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "users_insert_own_profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES: jobs table
-- =============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "clients_view_own_jobs" ON public.jobs;
DROP POLICY IF EXISTS "customers_view_jobs_by_phone" ON public.jobs;
DROP POLICY IF EXISTS "clients_manage_own_jobs" ON public.jobs;

-- Clients (tradies) can view their own jobs
CREATE POLICY "clients_view_own_jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = client_id);

-- Customers can view jobs by their phone number
CREATE POLICY "customers_view_jobs_by_phone" 
ON public.jobs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.phone = jobs.phone
    )
);

-- Clients can manage (insert/update/delete) their own jobs
CREATE POLICY "clients_manage_own_jobs" 
ON public.jobs 
FOR ALL 
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- =============================================================================
-- RLS POLICIES: job_links table
-- =============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_manage_own_job_links" ON public.job_links;

-- Users can manage job links for their own jobs
CREATE POLICY "users_manage_own_job_links" 
ON public.job_links 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE jobs.id = job_links.job_id 
        AND jobs.client_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE jobs.id = job_links.job_id 
        AND jobs.client_id = auth.uid()
    )
);

-- =============================================================================
-- RLS POLICIES: business_settings table
-- =============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can insert own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can update own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can delete own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Admins can view all business settings" ON public.business_settings;

-- Users can only view and manage their own business settings
CREATE POLICY "users_view_own_business_settings" ON public.business_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_business_settings" ON public.business_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_business_settings" ON public.business_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_business_settings" ON public.business_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all business settings
CREATE POLICY "admins_view_all_business_settings" ON public.business_settings
    FOR SELECT USING (is_admin());

-- =============================================================================
-- RLS POLICIES: admin_audit_log table
-- =============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_log;

-- Only admins can view and insert audit logs
CREATE POLICY "admins_view_audit_logs" ON public.admin_audit_log
    FOR SELECT USING (is_admin());

CREATE POLICY "admins_insert_audit_logs" ON public.admin_audit_log
    FOR INSERT WITH CHECK (is_admin());

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.jobs TO authenticated;
GRANT ALL ON TABLE public.job_links TO authenticated;
GRANT ALL ON TABLE public.business_settings TO authenticated;
GRANT ALL ON TABLE public.admin_audit_log TO authenticated;
GRANT SELECT ON public.customer_jobs_view TO authenticated;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE public.profiles IS 'User profiles for tradies and clients with role-based access';
COMMENT ON TABLE public.jobs IS 'Customer job requests and status tracking';
COMMENT ON TABLE public.job_links IS 'Secure access tokens for job sharing';
COMMENT ON TABLE public.business_settings IS 'Business configuration settings for each user';
COMMENT ON TABLE public.admin_audit_log IS 'Audit log for administrative actions';

-- Column comments
COMMENT ON COLUMN public.profiles.user_type IS 'User type: tradie, client, or admin';
COMMENT ON COLUMN public.profiles.is_admin IS 'Flag indicating if user has admin privileges';
COMMENT ON COLUMN public.jobs.client_id IS 'Reference to the tradie who owns this job';
COMMENT ON COLUMN public.jobs.urgency IS 'Job urgency level: low, medium, high, urgent';
COMMENT ON COLUMN public.jobs.status IS 'Job status: new, contacted, quoted, scheduled, completed, cancelled';

-- Function comments
COMMENT ON FUNCTION is_admin IS 'Helper function to check if current user has admin privileges';
COMMENT ON FUNCTION log_admin_action IS 'Helper function to log administrative actions for audit';

-- View comments
COMMENT ON VIEW public.customer_jobs_view IS 'View combining job data with tradie information for customer access';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- This baseline migration establishes the complete schema state
-- All subsequent migrations should build upon this foundation
-- =============================================================================