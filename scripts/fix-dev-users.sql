-- Fix Dev Users Setup
-- Run this in Supabase SQL Editor to enable dev login functionality

-- First, ensure password auth is enabled in Supabase Dashboard:
-- Go to: Authentication > Providers > Email > Enable "Email logins"

-- Create or update dev test users
DO $$
DECLARE
  admin_id uuid;
  tradie_id uuid;
  client_id uuid;
BEGIN
  -- Delete existing dev users if they exist (clean slate)
  DELETE FROM auth.users WHERE email IN ('admin@dev.local', 'tradie@dev.local', 'client@dev.local');
  
  -- Create Admin user
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
    'admin@dev.local',
    crypt('devpass123', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'name', 'Dev Admin',
      'phone', '+61400000001',
      'user_type', 'tradie',
      'address', 'Admin Office, Sydney NSW 2000'
    )
  ) RETURNING id INTO admin_id;
  
  -- Update admin profile
  UPDATE public.profiles 
  SET 
    is_admin = true,
    onboarding_completed = true,
    onboarding_step = 6
  WHERE user_id = admin_id;
  
  -- Create Tradie user
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
    'tradie@dev.local',
    crypt('devpass123', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'name', 'Dev Tradie',
      'phone', '+61400000002',
      'user_type', 'tradie',
      'address', '456 Tradie St, Melbourne VIC 3000'
    )
  ) RETURNING id INTO tradie_id;
  
  -- Update tradie profile with some onboarding data
  UPDATE public.profiles 
  SET 
    is_admin = false,
    onboarding_completed = false,
    onboarding_step = 0,
    trade_primary = 'plumber',
    years_experience = 5
  WHERE user_id = tradie_id;
  
  -- Create Client user
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
    'client@dev.local',
    crypt('devpass123', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'name', 'Dev Client',
      'phone', '+61400000003',
      'user_type', 'client',
      'address', '123 Test Street, Sydney NSW 2000'
    )
  ) RETURNING id INTO client_id;
  
  -- Update client profile
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    onboarding_step = 6
  WHERE user_id = client_id;
  
  -- Success message
  RAISE NOTICE 'Dev users created successfully!';
END $$;

-- Verify the users were created
SELECT 
  u.email,
  p.name,
  p.user_type,
  p.is_admin,
  p.onboarding_completed,
  p.onboarding_step,
  'Password: devpass123' as login_info
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email IN ('admin@dev.local', 'tradie@dev.local', 'client@dev.local')
ORDER BY u.email;