-- Create business_settings table if it doesn't exist
-- This migration ensures the business_settings table exists in production

-- Create the table
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

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_business_settings_user_id ON public.business_settings(user_id);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_view_own_business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "users_insert_own_business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "users_update_own_business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "users_delete_own_business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "admins_view_all_business_settings" ON public.business_settings;

-- Create RLS policies
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
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_business_settings_updated_at') THEN
        CREATE TRIGGER update_business_settings_updated_at
            BEFORE UPDATE ON public.business_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON TABLE public.business_settings TO authenticated;

-- Add comment
COMMENT ON TABLE public.business_settings IS 'Business configuration settings for each user';