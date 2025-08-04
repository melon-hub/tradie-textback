-- =============================================================================
-- ONBOARDING TEST DATA CREATION SCRIPT
-- =============================================================================
-- Purpose: Create comprehensive test data for the onboarding system
-- Created: 2025-08-04
-- Usage: Run this script in Supabase SQL Editor to create test data
-- Safety: Can be run multiple times - handles conflicts gracefully
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CONFIGURATION VARIABLES
-- =============================================================================
DO $$
DECLARE
    -- Test user IDs (will be generated)
    tradie1_id UUID;
    tradie2_id UUID;
    tradie3_id UUID;
    tradie4_id UUID;
    tradie5_id UUID;
    tradie6_id UUID;
    tradie7_id UUID;
    tradie8_id UUID;
    tradie9_id UUID;
    tradie10_id UUID;
    
    -- Common password for all test users
    test_password TEXT := 'testpass123';
BEGIN
    RAISE NOTICE 'Starting onboarding test data creation...';
    
    -- =============================================================================
    -- 1. CREATE TEST TRADIE USERS AT DIFFERENT ONBOARDING STAGES
    -- =============================================================================
    
    -- TRADIE 1: NOT STARTED ONBOARDING
    -- Mike's Plumbing - Sydney Plumber, hasn't started onboarding
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'mike.plumber@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Mike Thompson',
                'phone', '+61412345001',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie1_id;
        
        RAISE NOTICE 'Created Mike Thompson (Plumber - Not Started)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie1_id FROM auth.users WHERE email = 'mike.plumber@test.local';
            RAISE NOTICE 'Mike Thompson already exists, using existing user';
    END;
    
    -- TRADIE 2: PARTIAL ONBOARDING - Step 2 (Basic Info Complete)
    -- Sarah's Electrical - Melbourne Electrician, completed basic info
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'sarah.sparky@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Sarah Wilson',
                'phone', '+61423456002',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie2_id;
        
        RAISE NOTICE 'Created Sarah Wilson (Electrician - Step 2)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie2_id FROM auth.users WHERE email = 'sarah.sparky@test.local';
            RAISE NOTICE 'Sarah Wilson already exists, using existing user';
    END;
    
    -- TRADIE 3: PARTIAL ONBOARDING - Step 4 (Business Details Complete)
    -- Dave's Carpentry - Brisbane Carpenter, completed business details
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'dave.carpenter@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Dave Roberts',
                'phone', '+61434567003',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie3_id;
        
        RAISE NOTICE 'Created Dave Roberts (Carpenter - Step 4)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie3_id FROM auth.users WHERE email = 'dave.carpenter@test.local';
            RAISE NOTICE 'Dave Roberts already exists, using existing user';
    END;
    
    -- TRADIE 4: PARTIAL ONBOARDING - Step 6 (Service Areas Complete)
    -- Lisa's HVAC - Perth HVAC Tech, completed service areas
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'lisa.hvac@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Lisa Chen',
                'phone', '+61445678004',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie4_id;
        
        RAISE NOTICE 'Created Lisa Chen (HVAC - Step 6)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie4_id FROM auth.users WHERE email = 'lisa.hvac@test.local';
            RAISE NOTICE 'Lisa Chen already exists, using existing user';
    END;
    
    -- TRADIE 5: PARTIAL ONBOARDING - Step 8 (SMS Templates Complete)
    -- Tom's Handyman - Adelaide Handyman, completed SMS templates
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'tom.handyman@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Tom Martinez',
                'phone', '+61456789005',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie5_id;
        
        RAISE NOTICE 'Created Tom Martinez (Handyman - Step 8)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie5_id FROM auth.users WHERE email = 'tom.handyman@test.local';
            RAISE NOTICE 'Tom Martinez already exists, using existing user';
    END;
    
    -- TRADIE 6: FULLY ONBOARDED
    -- Emma's Landscaping - Darwin Landscaper, fully onboarded
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'emma.landscape@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Emma Johnson',
                'phone', '+61467890006',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie6_id;
        
        RAISE NOTICE 'Created Emma Johnson (Landscaper - Fully Onboarded)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie6_id FROM auth.users WHERE email = 'emma.landscape@test.local';
            RAISE NOTICE 'Emma Johnson already exists, using existing user';
    END;
    
    -- TRADIE 7: FULLY ONBOARDED
    -- Jack's Locksmith - Canberra Locksmith, fully onboarded with premium features
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'jack.locksmith@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Jack Smith',
                'phone', '+61478901007',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie7_id;
        
        RAISE NOTICE 'Created Jack Smith (Locksmith - Fully Onboarded)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie7_id FROM auth.users WHERE email = 'jack.locksmith@test.local';
            RAISE NOTICE 'Jack Smith already exists, using existing user';
    END;
    
    -- TRADIE 8: FULLY ONBOARDED
    -- Maria's Painting - Sydney Painter, multi-trade specialist
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'maria.painter@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Maria Rodriguez',
                'phone', '+61489012008',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie8_id;
        
        RAISE NOTICE 'Created Maria Rodriguez (Painter - Multi-trade)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie8_id FROM auth.users WHERE email = 'maria.painter@test.local';
            RAISE NOTICE 'Maria Rodriguez already exists, using existing user';
    END;
    
    -- TRADIE 9: FULLY ONBOARDED
    -- Ben's Tiling - Melbourne Tiler, premium pricing
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'ben.tiler@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Ben Taylor',
                'phone', '+61490123009',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie9_id;
        
        RAISE NOTICE 'Created Ben Taylor (Tiler - Premium Pricing)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie9_id FROM auth.users WHERE email = 'ben.tiler@test.local';
            RAISE NOTICE 'Ben Taylor already exists, using existing user';
    END;
    
    -- TRADIE 10: FULLY ONBOARDED
    -- Alex's Roofing - Brisbane Roofer, emergency services
    BEGIN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            gen_random_uuid(),
            'alex.roofer@test.local',
            crypt(test_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object(
                'name', 'Alex Brown',
                'phone', '+61401234010',
                'user_type', 'tradie'
            )
        ) RETURNING id INTO tradie10_id;
        
        RAISE NOTICE 'Created Alex Brown (Roofer - Emergency Services)';
    EXCEPTION
        WHEN unique_violation THEN
            SELECT id INTO tradie10_id FROM auth.users WHERE email = 'alex.roofer@test.local';
            RAISE NOTICE 'Alex Brown already exists, using existing user';
    END;
    
    -- =============================================================================
    -- 2. UPDATE PROFILES WITH ONBOARDING DATA
    -- =============================================================================
    
    -- TRADIE 1: Not started onboarding (Step 0)
    UPDATE public.profiles SET
        name = 'Mike Thompson',
        phone = '+61412345001',
        user_type = 'tradie',
        address = '123 Pipe Street, Sydney NSW 2000',
        onboarding_completed = false,
        onboarding_step = 0
    WHERE user_id = tradie1_id;
    
    -- TRADIE 2: Basic info complete (Step 2)
    UPDATE public.profiles SET
        name = 'Sarah Wilson',
        phone = '+61423456002',
        user_type = 'tradie',
        address = '456 Spark Ave, Melbourne VIC 3000',
        trade_primary = 'electrician',
        years_experience = 8,
        onboarding_completed = false,
        onboarding_step = 2
    WHERE user_id = tradie2_id;
    
    -- TRADIE 3: Business details complete (Step 4)
    UPDATE public.profiles SET
        name = 'Dave Roberts',
        phone = '+61434567003',
        user_type = 'tradie',
        address = '789 Wood Lane, Brisbane QLD 4000',
        trade_primary = 'carpenter',
        trade_secondary = ARRAY['handyman'],
        years_experience = 12,
        business_name = 'Dave''s Quality Carpentry',
        abn = '12345678901',
        license_number = 'QBCC123456',
        license_expiry = '2025-12-31'::date,
        insurance_provider = 'Trade Insurance Co',
        insurance_expiry = '2025-06-30'::date,
        specializations = '["custom_furniture", "deck_building", "kitchen_renovations"]'::jsonb,
        onboarding_completed = false,
        onboarding_step = 4
    WHERE user_id = tradie3_id;
    
    -- TRADIE 4: Service areas complete (Step 6)
    UPDATE public.profiles SET
        name = 'Lisa Chen',
        phone = '+61445678004',
        user_type = 'tradie',
        address = '321 Cool Street, Perth WA 6000',
        trade_primary = 'hvac',
        years_experience = 6,
        business_name = 'Perth Climate Solutions',
        abn = '23456789012',
        license_number = 'AC12345',
        license_expiry = '2026-03-31'::date,
        insurance_provider = 'HVAC Insurance Plus',
        insurance_expiry = '2025-09-30'::date,
        service_postcodes = ARRAY['6000', '6001', '6002', '6003', '6004', '6005', '6050', '6051', '6052'],
        service_radius_km = 25.0,
        specializations = '["ducted_systems", "split_systems", "commercial_hvac"]'::jsonb,
        callback_window_minutes = 45,
        timezone = 'Australia/Perth',
        onboarding_completed = false,
        onboarding_step = 6
    WHERE user_id = tradie4_id;
    
    -- TRADIE 5: SMS templates complete (Step 8)
    UPDATE public.profiles SET
        name = 'Tom Martinez',
        phone = '+61456789005',
        user_type = 'tradie',
        address = '654 Fix Street, Adelaide SA 5000',
        trade_primary = 'handyman',
        trade_secondary = ARRAY['painter', 'carpenter'],
        years_experience = 15,
        business_name = 'Tom''s Fix-It Service',
        abn = '34567890123',
        service_postcodes = ARRAY['5000', '5001', '5002', '5003', '5004', '5005', '5006', '5007', '5008'],
        service_radius_km = 20.0,
        specializations = '["home_repairs", "maintenance", "small_renovations", "furniture_assembly"]'::jsonb,
        languages_spoken = '["English", "Spanish"]'::jsonb,
        callback_window_minutes = 30,
        after_hours_enabled = true,
        timezone = 'Australia/Adelaide',
        onboarding_completed = false,
        onboarding_step = 8
    WHERE user_id = tradie5_id;
    
    -- TRADIE 6: Fully onboarded
    UPDATE public.profiles SET
        name = 'Emma Johnson',
        phone = '+61467890006',
        user_type = 'tradie',
        address = '987 Green Way, Darwin NT 0800',
        trade_primary = 'landscaper',
        years_experience = 10,
        business_name = 'Top End Gardens',
        abn = '45678901234',
        license_number = 'NT-LAND-789',
        license_expiry = '2025-11-30'::date,
        insurance_provider = 'Garden Insurance Co',
        insurance_expiry = '2025-05-31'::date,
        service_postcodes = ARRAY['0800', '0801', '0810', '0811', '0812', '0820', '0828', '0829'],
        service_radius_km = 30.0,
        specializations = '["tropical_gardens", "irrigation_systems", "native_plants", "garden_maintenance"]'::jsonb,
        callback_window_minutes = 60,
        after_hours_enabled = false,
        timezone = 'Australia/Darwin',
        onboarding_completed = true,
        onboarding_step = 10
    WHERE user_id = tradie6_id;
    
    -- TRADIE 7: Fully onboarded with emergency services
    UPDATE public.profiles SET
        name = 'Jack Smith',
        phone = '+61478901007',
        user_type = 'tradie',
        address = '147 Secure Ave, Canberra ACT 2600',
        trade_primary = 'locksmith',
        years_experience = 20,
        business_name = 'Capital Security Services',
        abn = '56789012345',
        license_number = 'ACT-SEC-456',
        license_expiry = '2026-01-31'::date,
        insurance_provider = 'Security Pro Insurance',
        insurance_expiry = '2025-12-31'::date,
        service_postcodes = ARRAY['2600', '2601', '2602', '2603', '2604', '2605', '2606', '2607', '2608', '2609'],
        service_radius_km = 35.0,
        specializations = '["emergency_lockouts", "security_systems", "commercial_locks", "safe_services"]'::jsonb,
        callback_window_minutes = 15,
        after_hours_enabled = true,
        timezone = 'Australia/Sydney',
        onboarding_completed = true,
        onboarding_step = 10
    WHERE user_id = tradie7_id;
    
    -- TRADIE 8: Multi-trade specialist
    UPDATE public.profiles SET
        name = 'Maria Rodriguez',
        phone = '+61489012008',
        user_type = 'tradie',
        address = '258 Color Street, Sydney NSW 2000',
        trade_primary = 'painter',
        trade_secondary = ARRAY['tiler', 'handyman'],
        years_experience = 14,
        business_name = 'Rodriguez Renovations',
        abn = '67890123456',
        license_number = 'NSW-PAINT-789',
        license_expiry = '2025-08-31'::date,
        insurance_provider = 'Trade Cover Australia',
        insurance_expiry = '2026-02-28'::date,
        service_postcodes = ARRAY['2000', '2001', '2002', '2003', '2004', '2006', '2007', '2008', '2009', '2010', '2015', '2016', '2017', '2020', '2021'],
        service_radius_km = 40.0,
        specializations = '["interior_painting", "exterior_painting", "bathroom_tiling", "kitchen_backsplashes", "color_consultation"]'::jsonb,
        languages_spoken = '["English", "Spanish", "Portuguese"]'::jsonb,
        callback_window_minutes = 45,
        after_hours_enabled = false,
        timezone = 'Australia/Sydney',
        onboarding_completed = true,
        onboarding_step = 10
    WHERE user_id = tradie8_id;
    
    -- TRADIE 9: Premium pricing tiler
    UPDATE public.profiles SET
        name = 'Ben Taylor',
        phone = '+61490123009',
        user_type = 'tradie',
        address = '369 Tile Terrace, Melbourne VIC 3000',
        trade_primary = 'tiler',
        years_experience = 18,
        business_name = 'Premium Tile Solutions',
        abn = '78901234567',
        license_number = 'VIC-TILE-123',
        license_expiry = '2026-06-30'::date,
        insurance_provider = 'Master Tradies Insurance',
        insurance_expiry = '2025-10-31'::date,
        service_postcodes = ARRAY['3000', '3001', '3002', '3003', '3004', '3005', '3006', '3008', '3141', '3142', '3143', '3144', '3145'],
        service_radius_km = 25.0,
        specializations = '["luxury_bathrooms", "natural_stone", "mosaic_work", "waterproofing", "heritage_restoration"]'::jsonb,
        callback_window_minutes = 60,
        after_hours_enabled = false,
        timezone = 'Australia/Melbourne',
        onboarding_completed = true,
        onboarding_step = 10
    WHERE user_id = tradie9_id;
    
    -- TRADIE 10: Emergency roofing services
    UPDATE public.profiles SET
        name = 'Alex Brown',
        phone = '+61401234010',
        user_type = 'tradie',
        address = '741 High Street, Brisbane QLD 4000',
        trade_primary = 'roofer',
        years_experience = 22,
        business_name = 'Brisbane Emergency Roofing',
        abn = '89012345678',
        license_number = 'QBCC-ROOF-456',
        license_expiry = '2025-09-30'::date,
        insurance_provider = 'Roof Safe Insurance',
        insurance_expiry = '2026-01-31'::date,
        service_postcodes = ARRAY['4000', '4001', '4002', '4003', '4004', '4005', '4006', '4007', '4008', '4009', '4010', '4011', '4012', '4064', '4065'],
        service_radius_km = 50.0,
        specializations = '["emergency_repairs", "storm_damage", "tile_roofing", "metal_roofing", "guttering", "insurance_work"]'::jsonb,
        callback_window_minutes = 20,
        after_hours_enabled = true,
        timezone = 'Australia/Brisbane',
        onboarding_completed = true,
        onboarding_step = 10
    WHERE user_id = tradie10_id;
    
    -- =============================================================================
    -- 3. CREATE SERVICE LOCATIONS
    -- =============================================================================
    
    -- Service locations for Lisa (HVAC - Perth)
    INSERT INTO public.service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
    VALUES 
        (tradie4_id, '6000', 'Perth', 'WA', 0, 0.00, true),
        (tradie4_id, '6001', 'East Perth', 'WA', 10, 0.00, true),
        (tradie4_id, '6002', 'West Perth', 'WA', 15, 0.00, true),
        (tradie4_id, '6003', 'Northbridge', 'WA', 12, 0.00, true),
        (tradie4_id, '6050', 'Mount Lawley', 'WA', 20, 25.00, true),
        (tradie4_id, '6051', 'Maylands', 'WA', 25, 35.00, true)
    ON CONFLICT DO NOTHING;
    
    -- Service locations for Tom (Handyman - Adelaide)
    INSERT INTO public.service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
    VALUES 
        (tradie5_id, '5000', 'Adelaide', 'SA', 0, 0.00, true),
        (tradie5_id, '5001', 'North Adelaide', 'SA', 8, 0.00, true),
        (tradie5_id, '5002', 'Kent Town', 'SA', 12, 0.00, true),
        (tradie5_id, '5003', 'Bowden', 'SA', 15, 15.00, true),
        (tradie5_id, '5006', 'Brompton', 'SA', 20, 25.00, true)
    ON CONFLICT DO NOTHING;
    
    -- Service locations for Emma (Landscaper - Darwin)
    INSERT INTO public.service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
    VALUES 
        (tradie6_id, '0800', 'Darwin', 'NT', 0, 0.00, true),
        (tradie6_id, '0801', 'The Gardens', 'NT', 5, 0.00, true),
        (tradie6_id, '0810', 'Parap', 'NT', 10, 0.00, true),
        (tradie6_id, '0811', 'Stuart Park', 'NT', 12, 0.00, true),
        (tradie6_id, '0820', 'Winnellie', 'NT', 18, 30.00, true)
    ON CONFLICT DO NOTHING;
    
    -- Service locations for Jack (Locksmith - Canberra)
    INSERT INTO public.service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
    VALUES 
        (tradie7_id, '2600', 'Canberra City', 'ACT', 0, 0.00, true),
        (tradie7_id, '2601', 'Acton', 'ACT', 8, 0.00, true),
        (tradie7_id, '2602', 'Deakin', 'ACT', 15, 20.00, true),
        (tradie7_id, '2603', 'Forrest', 'ACT', 12, 15.00, true),
        (tradie7_id, '2604', 'Griffith', 'ACT', 10, 10.00, true)
    ON CONFLICT DO NOTHING;
    
    -- Service locations for Maria (Painter - Sydney)
    INSERT INTO public.service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
    VALUES 
        (tradie8_id, '2000', 'Sydney', 'NSW', 0, 0.00, true),
        (tradie8_id, '2001', 'Dawes Point', 'NSW', 5, 0.00, true),
        (tradie8_id, '2002', 'Sydney', 'NSW', 8, 0.00, true),
        (tradie8_id, '2015', 'Alexandria', 'NSW', 20, 25.00, true),
        (tradie8_id, '2016', 'Redfern', 'NSW', 15, 20.00, true),
        (tradie8_id, '2017', 'Waterloo', 'NSW', 18, 22.00, true)
    ON CONFLICT DO NOTHING;
    
    -- Service locations for Ben (Tiler - Melbourne)
    INSERT INTO public.service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
    VALUES 
        (tradie9_id, '3000', 'Melbourne', 'VIC', 0, 0.00, true),
        (tradie9_id, '3141', 'South Yarra', 'VIC', 15, 50.00, true),
        (tradie9_id, '3142', 'Toorak', 'VIC', 18, 75.00, true),
        (tradie9_id, '3143', 'Armadale', 'VIC', 20, 60.00, true),
        (tradie9_id, '3144', 'Malvern', 'VIC', 22, 65.00, true)
    ON CONFLICT DO NOTHING;
    
    -- Service locations for Alex (Roofer - Brisbane)
    INSERT INTO public.service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
    VALUES 
        (tradie10_id, '4000', 'Brisbane', 'QLD', 0, 0.00, true),
        (tradie10_id, '4001', 'Teneriffe', 'QLD', 10, 0.00, true),
        (tradie10_id, '4064', 'Paddington', 'QLD', 15, 20.00, true),
        (tradie10_id, '4065', 'Bardon', 'QLD', 25, 40.00, true),
        (tradie10_id, '4008', 'Kelvin Grove', 'QLD', 18, 25.00, true)
    ON CONFLICT DO NOTHING;
    
    -- =============================================================================
    -- 4. CREATE CUSTOM SMS TEMPLATES
    -- =============================================================================
    
    -- Custom templates for Tom (Handyman)
    INSERT INTO public.tenant_sms_templates (user_id, template_type, content, variables, is_active)
    VALUES 
        (tradie5_id, 'missed_call', 'G''day {customer_name}! Tom from Tom''s Fix-It Service here. Missed your call but I''ll ring you back within {callback_window} minutes. Cheers!', ARRAY['customer_name', 'callback_window'], true),
        (tradie5_id, 'after_hours', 'Thanks for calling Tom''s Fix-It Service! We''re closed now but I''ll get back to you first thing tomorrow morning. For urgent repairs, please call again.', ARRAY[], true),
        (tradie5_id, 'job_confirmation', 'Hi {customer_name}, I''ve got your {job_type} job at {location} on my books. I''ll send you a quote within 24 hours. Thanks for choosing Tom''s Fix-It!', ARRAY['customer_name', 'job_type', 'location'], true)
    ON CONFLICT DO NOTHING;
    
    -- Custom templates for Emma (Landscaper)
    INSERT INTO public.tenant_sms_templates (user_id, template_type, content, variables, is_active)
    VALUES 
        (tradie6_id, 'missed_call', 'Hi {customer_name}, Emma from Top End Gardens here! Sorry I missed your call. I''ll get back to you within {callback_window} minutes to discuss your garden project.', ARRAY['customer_name', 'callback_window'], true),
        (tradie6_id, 'job_confirmation', 'Thanks {customer_name}! I''ve received your enquiry about {job_type} at {location}. I''ll visit this week for a free consultation and quote.', ARRAY['customer_name', 'job_type', 'location'], true),
        (tradie6_id, 'follow_up', 'Hi {customer_name}, hope you''re loving your new garden! Top End Gardens would appreciate a Google review if you''re happy with our work. Thanks!', ARRAY['customer_name'], true)
    ON CONFLICT DO NOTHING;
    
    -- Custom templates for Jack (Locksmith - Emergency focus)
    INSERT INTO public.tenant_sms_templates (user_id, template_type, content, variables, is_active)
    VALUES 
        (tradie7_id, 'missed_call', 'URGENT: Jack from Capital Security here. Missed your call - I''ll contact you within {callback_window} minutes. For lockouts, please call again immediately!', ARRAY['callback_window'], true),
        (tradie7_id, 'after_hours', 'Capital Security 24/7 Emergency Service: We''re available now! For lockouts or security emergencies, please call again. Non-urgent matters will be handled tomorrow.', ARRAY[], true),
        (tradie7_id, 'job_confirmation', 'Hi {customer_name}, Jack from Capital Security. I''ve got your {job_type} job logged. For emergencies, I can be there within 30 minutes!', ARRAY['customer_name', 'job_type'], true)
    ON CONFLICT DO NOTHING;
    
    -- Custom templates for Maria (Painter - Multi-lingual)
    INSERT INTO public.tenant_sms_templates (user_id, template_type, content, variables, is_active)
    VALUES 
        (tradie8_id, 'missed_call', 'Hola {customer_name}! Maria from Rodriguez Renovations. I missed your call but will contact you within {callback_window} minutes. ¡Gracias!', ARRAY['customer_name', 'callback_window'], true),
        (tradie8_id, 'quote_ready', '¡Hola {customer_name}! Your painting quote is ready: ${quote_amount}. Includes premium paints and 5-year warranty. Valid for 30 days. ¡Gracias!', ARRAY['customer_name', 'quote_amount'], true),
        (tradie8_id, 'follow_up', 'Hi {customer_name}, thanks for choosing Rodriguez Renovations! Please leave us a review if you love your new paint job. ¡Muchas gracias!', ARRAY['customer_name'], true)
    ON CONFLICT DO NOTHING;
    
    -- Custom templates for Ben (Premium Tiler)
    INSERT INTO public.tenant_sms_templates (user_id, template_type, content, variables, is_active)
    VALUES 
        (tradie9_id, 'missed_call', 'Good day {customer_name}, Ben from Premium Tile Solutions. I missed your call regarding your luxury tiling project. I''ll contact you within {callback_window} minutes.', ARRAY['customer_name', 'callback_window'], true),
        (tradie9_id, 'quote_ready', 'Hello {customer_name}, your premium tiling quote is ready: ${quote_amount}. Includes Italian tiles and lifetime craftsmanship warranty. Valid 45 days.', ARRAY['customer_name', 'quote_amount'], true),
        (tradie9_id, 'appointment_reminder', 'Reminder: Premium Tile Solutions consultation tomorrow at {appointment_time} for your {job_type} project. Please have tile preferences ready to discuss.', ARRAY['appointment_time', 'job_type'], true)
    ON CONFLICT DO NOTHING;
    
    -- Custom templates for Alex (Emergency Roofer)
    INSERT INTO public.tenant_sms_templates (user_id, template_type, content, variables, is_active)
    VALUES 
        (tradie10_id, 'missed_call', 'Alex from Brisbane Emergency Roofing - missed your call! Storm damage? I''ll call back in {callback_window} minutes. For leaks, call again NOW!', ARRAY['callback_window'], true),
        (tradie10_id, 'after_hours', 'Brisbane Emergency Roofing - 24/7 Storm Response! Roof leaking? Tiles blown off? Call again immediately. We''re standing by for emergencies!', ARRAY[], true),
        (tradie10_id, 'job_confirmation', 'Hi {customer_name}, Alex here. Got your roof emergency at {location}. I can be there within 1 hour for assessment and temporary repairs!', ARRAY['customer_name', 'location'], true)
    ON CONFLICT DO NOTHING;
    
    -- =============================================================================
    -- 5. CREATE BUSINESS SETTINGS
    -- =============================================================================
    
    -- Business settings for fully onboarded tradies
    INSERT INTO public.business_settings (user_id, business_name, abn, primary_color, service_areas, operating_hours)
    VALUES 
        -- Emma's Landscaping
        (tradie6_id, 'Top End Gardens', '45678901234', '#2D5A3D', 
         '{"primary": ["0800", "0801", "0810"], "extended": ["0811", "0820", "0828"]}'::jsonb,
         '{"monday": {"start": "07:00", "end": "16:00"}, "tuesday": {"start": "07:00", "end": "16:00"}, "wednesday": {"start": "07:00", "end": "16:00"}, "thursday": {"start": "07:00", "end": "16:00"}, "friday": {"start": "07:00", "end": "16:00"}, "saturday": {"start": "08:00", "end": "14:00"}, "sunday": {"closed": true}}'::jsonb),
        
        -- Jack's Locksmith (24/7)
        (tradie7_id, 'Capital Security Services', '56789012345', '#C41E3A',
         '{"primary": ["2600", "2601", "2602"], "emergency": ["2603", "2604", "2605", "2606"]}'::jsonb,
         '{"monday": {"start": "00:00", "end": "23:59"}, "tuesday": {"start": "00:00", "end": "23:59"}, "wednesday": {"start": "00:00", "end": "23:59"}, "thursday": {"start": "00:00", "end": "23:59"}, "friday": {"start": "00:00", "end": "23:59"}, "saturday": {"start": "00:00", "end": "23:59"}, "sunday": {"start": "00:00", "end": "23:59"}}'::jsonb),
        
        -- Maria's Painting
        (tradie8_id, 'Rodriguez Renovations', '67890123456', '#FF6B35',
         '{"sydney_metro": ["2000", "2001", "2002", "2015", "2016"], "extended": ["2017", "2020", "2021"]}'::jsonb,
         '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "17:00"}, "saturday": {"start": "09:00", "end": "15:00"}, "sunday": {"closed": true}}'::jsonb),
        
        -- Ben's Premium Tiling
        (tradie9_id, 'Premium Tile Solutions', '78901234567', '#4A4A4A',
         '{"premium_areas": ["3141", "3142", "3143"], "standard": ["3000", "3001", "3144", "3145"]}'::jsonb,
         '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "16:00"}, "saturday": {"start": "10:00", "end": "14:00"}, "sunday": {"closed": true}}'::jsonb),
        
        -- Alex's Emergency Roofing
        (tradie10_id, 'Brisbane Emergency Roofing', '89012345678', '#DC143C',
         '{"emergency_zone": ["4000", "4001", "4002"], "standard": ["4003", "4004", "4064", "4065"]}'::jsonb,
         '{"monday": {"start": "06:00", "end": "18:00", "emergency": true}, "tuesday": {"start": "06:00", "end": "18:00", "emergency": true}, "wednesday": {"start": "06:00", "end": "18:00", "emergency": true}, "thursday": {"start": "06:00", "end": "18:00", "emergency": true}, "friday": {"start": "06:00", "end": "18:00", "emergency": true}, "saturday": {"start": "08:00", "end": "16:00", "emergency": true}, "sunday": {"start": "10:00", "end": "16:00", "emergency": true}}'::jsonb)
    ON CONFLICT (user_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        abn = EXCLUDED.abn,
        primary_color = EXCLUDED.primary_color,
        service_areas = EXCLUDED.service_areas,
        operating_hours = EXCLUDED.operating_hours,
        updated_at = NOW();
    
    -- =============================================================================
    -- 6. CREATE SAMPLE JOBS FOR TESTING
    -- =============================================================================
    
    -- Jobs for fully onboarded tradies to test the system
    INSERT INTO public.jobs (client_id, customer_name, phone, job_type, location, urgency, status, estimated_value, description, preferred_time)
    VALUES 
        -- Emma's landscaping jobs
        (tradie6_id, 'John Smith', '+61411111001', 'Garden design and installation', 'Darwin NT 0800', 'medium', 'new', 2500.00, 'Complete front yard makeover with native plants and irrigation', 'Mornings preferred'),
        (tradie6_id, 'Sarah Johnson', '+61411111002', 'Lawn maintenance', 'Parap NT 0810', 'low', 'contacted', 150.00, 'Monthly lawn mowing and edge trimming service', 'Flexible timing'),
        
        -- Jack's locksmith jobs (emergency focus)
        (tradie7_id, 'Emergency Lockout', '+61411111003', 'Residential lockout', 'Canberra ACT 2600', 'urgent', 'new', 180.00, 'Locked out of apartment, keys inside', 'ASAP'),
        (tradie7_id, 'Mike Brown', '+61411111004', 'Lock replacement', 'Deakin ACT 2602', 'high', 'quoted', 320.00, 'Replace front door deadbolt and handle set', 'This week'),
        
        -- Maria's painting jobs
        (tradie8_id, 'Lisa Garcia', '+61411111005', 'Interior painting', 'Sydney NSW 2000', 'medium', 'scheduled', 1800.00, '3 bedroom apartment interior repaint', 'Next week'),
        (tradie8_id, 'David Chen', '+61411111006', 'Exterior house painting', 'Redfern NSW 2016', 'low', 'completed', 4200.00, 'Full house exterior with preparation and primer', 'Completed last month'),
        
        -- Ben's premium tiling jobs
        (tradie9_id, 'Amanda Wilson', '+61411111007', 'Bathroom renovation', 'South Yarra VIC 3141', 'medium', 'new', 8500.00, 'Master bathroom full retile with Italian marble', 'Within 2 months'),
        (tradie9_id, 'Robert Taylor', '+61411111008', 'Kitchen backsplash', 'Toorak VIC 3142', 'low', 'quoted', 2200.00, 'Custom mosaic backsplash installation', 'Flexible'),
        
        -- Alex's roofing jobs (emergency focus)
        (tradie10_id, 'Storm Damage', '+61411111009', 'Emergency roof repair', 'Brisbane QLD 4000', 'urgent', 'scheduled', 1200.00, 'Tiles blown off in storm, temporary cover needed', 'Today'),
        (tradie10_id, 'Jennifer Lee', '+61411111010', 'Gutter replacement', 'Paddington QLD 4064', 'medium', 'new', 1800.00, 'Replace old guttering system with colorbond', 'Within 1 month')
    ON CONFLICT DO NOTHING;
    
    -- =============================================================================
    -- 7. CREATE DEFAULT SMS TEMPLATES FOR PARTIALLY COMPLETED USERS
    -- =============================================================================
    
    -- Create default templates for Tom (step 8) who has completed SMS setup
    PERFORM create_default_sms_templates(tradie5_id);
    
    -- =============================================================================
    -- SUMMARY AND LOGIN INFORMATION
    -- =============================================================================
    
    RAISE NOTICE '=== ONBOARDING TEST DATA CREATION COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Created 10 test tradie accounts at different onboarding stages:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Mike Thompson (mike.plumber@test.local) - Plumber - NOT STARTED (Step 0)';
    RAISE NOTICE '2. Sarah Wilson (sarah.sparky@test.local) - Electrician - BASIC INFO (Step 2)';
    RAISE NOTICE '3. Dave Roberts (dave.carpenter@test.local) - Carpenter - BUSINESS DETAILS (Step 4)';
    RAISE NOTICE '4. Lisa Chen (lisa.hvac@test.local) - HVAC - SERVICE AREAS (Step 6)';
    RAISE NOTICE '5. Tom Martinez (tom.handyman@test.local) - Handyman - SMS TEMPLATES (Step 8)';
    RAISE NOTICE '6. Emma Johnson (emma.landscape@test.local) - Landscaper - FULLY ONBOARDED';
    RAISE NOTICE '7. Jack Smith (jack.locksmith@test.local) - Locksmith - FULLY ONBOARDED (24/7)';
    RAISE NOTICE '8. Maria Rodriguez (maria.painter@test.local) - Painter - FULLY ONBOARDED (Multi-trade)';
    RAISE NOTICE '9. Ben Taylor (ben.tiler@test.local) - Tiler - FULLY ONBOARDED (Premium)';
    RAISE NOTICE '10. Alex Brown (alex.roofer@test.local) - Roofer - FULLY ONBOARDED (Emergency)';
    RAISE NOTICE '';
    RAISE NOTICE 'All accounts use password: testpass123';
    RAISE NOTICE '';
    RAISE NOTICE 'Test data includes:';
    RAISE NOTICE '- Variety of Australian trades and locations';
    RAISE NOTICE '- Realistic business details and service areas';
    RAISE NOTICE '- Custom SMS templates for different business models';
    RAISE NOTICE '- Sample jobs for testing the system';
    RAISE NOTICE '- Different pricing ranges and specializations';
    RAISE NOTICE '';
    RAISE NOTICE 'This data is perfect for:';
    RAISE NOTICE '- Testing Dev Drawer presets';
    RAISE NOTICE '- Demonstrating the onboarding flow';
    RAISE NOTICE '- Testing different user scenarios';
    RAISE NOTICE '- Development and QA testing';
    
END $$;

-- =============================================================================
-- DISPLAY CREATED TEST DATA
-- =============================================================================

-- Show all created test users with their onboarding status
SELECT 
    u.email,
    p.name,
    p.trade_primary,
    p.business_name,
    p.onboarding_step,
    CASE 
        WHEN p.onboarding_completed THEN 'FULLY ONBOARDED'
        WHEN p.onboarding_step >= 8 THEN 'SMS TEMPLATES COMPLETE'
        WHEN p.onboarding_step >= 6 THEN 'SERVICE AREAS COMPLETE'
        WHEN p.onboarding_step >= 4 THEN 'BUSINESS DETAILS COMPLETE'
        WHEN p.onboarding_step >= 2 THEN 'BASIC INFO COMPLETE'
        ELSE 'NOT STARTED'
    END as onboarding_status,
    p.service_postcodes[1:3] as sample_postcodes,
    'Password: testpass123' as login_info
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email LIKE '%@test.local'
ORDER BY p.onboarding_step, u.email;

-- Show service location count by user
SELECT 
    p.name,
    p.business_name,
    COUNT(sl.id) as service_locations_count,
    array_agg(sl.postcode ORDER BY sl.postcode) as postcodes
FROM public.profiles p
LEFT JOIN public.service_locations sl ON sl.user_id = p.user_id
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = p.user_id AND email LIKE '%@test.local')
GROUP BY p.name, p.business_name
ORDER BY service_locations_count DESC;

-- Show SMS template count by user
SELECT 
    p.name,
    p.business_name,
    COUNT(sms.id) as custom_sms_templates,
    array_agg(DISTINCT sms.template_type ORDER BY sms.template_type) as template_types
FROM public.profiles p
LEFT JOIN public.tenant_sms_templates sms ON sms.user_id = p.user_id
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = p.user_id AND email LIKE '%@test.local')
GROUP BY p.name, p.business_name
ORDER BY custom_sms_templates DESC;

-- Show sample jobs created
SELECT 
    p.name as tradie_name,
    j.customer_name,
    j.job_type,
    j.location,
    j.urgency,
    j.status,
    j.estimated_value
FROM public.jobs j
JOIN public.profiles p ON j.client_id = p.user_id
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = p.user_id AND email LIKE '%@test.local')
ORDER BY p.name, j.created_at;

-- =============================================================================
-- SCRIPT COMPLETE
-- =============================================================================
-- 
-- This script creates comprehensive test data for the onboarding system:
-- 
-- USERS CREATED:
-- - 10 test tradie accounts at different onboarding stages
-- - Realistic Australian trade types and locations
-- - Variety of business models (emergency, premium, multi-trade)
-- 
-- DATA INCLUDES:
-- - Enhanced profile information with trade details
-- - Service locations with postcodes and pricing
-- - Custom SMS templates for different business needs
-- - Business settings with operating hours
-- - Sample jobs for testing the system
-- 
-- ONBOARDING STAGES:
-- Step 0: Not started (Mike - Plumber)
-- Step 2: Basic info complete (Sarah - Electrician)
-- Step 4: Business details complete (Dave - Carpenter)
-- Step 6: Service areas complete (Lisa - HVAC)
-- Step 8: SMS templates complete (Tom - Handyman)
-- Step 10: Fully onboarded (Emma, Jack, Maria, Ben, Alex)
-- 
-- USAGE:
-- - All accounts use password: testpass123
-- - Perfect for testing Dev Drawer presets
-- - Demonstrates different onboarding scenarios
-- - Safe to run multiple times (handles conflicts)
-- 
-- =============================================================================