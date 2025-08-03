-- Create business_settings table if it doesn't exist
-- This table stores business configuration for each user

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

-- Create index
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
DROP TRIGGER IF EXISTS update_business_settings_updated_at ON public.business_settings;
CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON public.business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE public.business_settings TO authenticated;

-- Add comment
COMMENT ON TABLE public.business_settings IS 'Business configuration settings for each user';

-- Insert sample business settings for existing tradies
INSERT INTO public.business_settings (user_id, business_name, abn, primary_color, service_areas, operating_hours)
SELECT 
    p.user_id,
    COALESCE(p.name, 'My Business') || ' Services' as business_name,
    '12345678901' as abn,
    '#3b82f6' as primary_color,
    '["Sydney", "Melbourne", "Brisbane"]'::jsonb as service_areas,
    '{
        "monday": {"open": "08:00", "close": "17:00"},
        "tuesday": {"open": "08:00", "close": "17:00"},
        "wednesday": {"open": "08:00", "close": "17:00"},
        "thursday": {"open": "08:00", "close": "17:00"},
        "friday": {"open": "08:00", "close": "17:00"},
        "saturday": {"open": "09:00", "close": "12:00"},
        "sunday": {"closed": true}
    }'::jsonb as operating_hours
FROM public.profiles p
WHERE p.user_type = 'tradie'
ON CONFLICT (user_id) DO NOTHING;

-- Show results
SELECT COUNT(*) as business_settings_count FROM public.business_settings;