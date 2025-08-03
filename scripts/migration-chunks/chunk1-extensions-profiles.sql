-- =============================================================================
-- CHUNK 1: Extensions and Profile Enhancements
-- Run this first in Supabase SQL Editor
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add new columns to existing profiles table
DO $$ 
BEGIN 
    -- Trade information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trade_primary') THEN
        ALTER TABLE public.profiles ADD COLUMN trade_primary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trade_secondary') THEN
        ALTER TABLE public.profiles ADD COLUMN trade_secondary TEXT[];
    END IF;
    
    -- Business information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_name') THEN
        ALTER TABLE public.profiles ADD COLUMN business_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'abn') THEN
        ALTER TABLE public.profiles ADD COLUMN abn TEXT;
    END IF;
    
    -- Service area information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'service_postcodes') THEN
        ALTER TABLE public.profiles ADD COLUMN service_postcodes TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'service_radius_km') THEN
        ALTER TABLE public.profiles ADD COLUMN service_radius_km NUMERIC(6,2);
    END IF;
    
    -- License and insurance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_number') THEN
        ALTER TABLE public.profiles ADD COLUMN license_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_expiry') THEN
        ALTER TABLE public.profiles ADD COLUMN license_expiry DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'insurance_provider') THEN
        ALTER TABLE public.profiles ADD COLUMN insurance_provider TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'insurance_expiry') THEN
        ALTER TABLE public.profiles ADD COLUMN insurance_expiry DATE;
    END IF;
    
    -- Experience and specializations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'years_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN years_experience INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specializations') THEN
        ALTER TABLE public.profiles ADD COLUMN specializations JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'languages_spoken') THEN
        ALTER TABLE public.profiles ADD COLUMN languages_spoken JSONB DEFAULT '["English"]'::jsonb;
    END IF;
    
    -- Onboarding status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_step') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
    END IF;
    
    -- Communication preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'callback_window_minutes') THEN
        ALTER TABLE public.profiles ADD COLUMN callback_window_minutes INTEGER DEFAULT 30;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'after_hours_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN after_hours_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
        ALTER TABLE public.profiles ADD COLUMN timezone TEXT DEFAULT 'Australia/Sydney';
    END IF;
END $$;

-- Add CHECK constraints
DO $$
BEGIN
    -- Trade primary constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_trade_primary_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_trade_primary_check 
        CHECK (trade_primary IN ('plumber', 'electrician', 'carpenter', 'hvac', 'handyman', 'landscaper', 'locksmith', 'painter', 'tiler', 'roofer'));
    END IF;
    
    -- Years experience constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_years_experience_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_years_experience_check 
        CHECK (years_experience >= 0 AND years_experience <= 50);
    END IF;
    
    -- Callback window constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_callback_window_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_callback_window_check 
        CHECK (callback_window_minutes > 0 AND callback_window_minutes <= 480);
    END IF;
    
    -- Service radius constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_service_radius_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_service_radius_check 
        CHECK (service_radius_km > 0 AND service_radius_km <= 500);
    END IF;
    
    -- Onboarding step constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_onboarding_step_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_onboarding_step_check 
        CHECK (onboarding_step >= 0 AND onboarding_step <= 10);
    END IF;
END $$;