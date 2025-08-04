-- Fix Dev Users Setup (Safe Version)
-- This version updates existing users instead of deleting them

DO $$
DECLARE
  admin_id uuid;
  tradie_id uuid;
  client_id uuid;
BEGIN
  -- Check and update/create Admin user
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@dev.local';
  
  IF admin_id IS NULL THEN
    -- Create new admin user
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
  ELSE
    -- Update existing admin user
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('devpass123', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object(
        'name', 'Dev Admin',
        'phone', '+61400000001',
        'user_type', 'tradie',
        'address', 'Admin Office, Sydney NSW 2000'
      )
    WHERE id = admin_id;
  END IF;
  
  -- Update admin profile
  UPDATE public.profiles 
  SET 
    is_admin = true,
    onboarding_completed = true,
    onboarding_step = 6,
    name = 'Dev Admin',
    phone = '+61400000001',
    user_type = 'tradie'
  WHERE user_id = admin_id;
  
  -- Check and update/create Tradie user
  SELECT id INTO tradie_id FROM auth.users WHERE email = 'tradie@dev.local';
  
  IF tradie_id IS NULL THEN
    -- Create new tradie user
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
  ELSE
    -- Update existing tradie user
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('devpass123', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object(
        'name', 'Dev Tradie',
        'phone', '+61400000002',
        'user_type', 'tradie',
        'address', '456 Tradie St, Melbourne VIC 3000'
      )
    WHERE id = tradie_id;
  END IF;
  
  -- Update tradie profile with onboarding data
  UPDATE public.profiles 
  SET 
    is_admin = false,
    onboarding_completed = false,
    onboarding_step = 0,
    trade_primary = 'plumber',
    years_experience = 5,
    name = 'Dev Tradie',
    phone = '+61400000002',
    user_type = 'tradie'
  WHERE user_id = tradie_id;
  
  -- Check and update/create Client user
  SELECT id INTO client_id FROM auth.users WHERE email = 'client@dev.local';
  
  IF client_id IS NULL THEN
    -- Create new client user
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
  ELSE
    -- Update existing client user
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('devpass123', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object(
        'name', 'Dev Client',
        'phone', '+61400000003',
        'user_type', 'client',
        'address', '123 Test Street, Sydney NSW 2000'
      )
    WHERE id = client_id;
  END IF;
  
  -- Update client profile
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    onboarding_step = 6,
    name = 'Dev Client',
    phone = '+61400000003',
    user_type = 'client'
  WHERE user_id = client_id;
  
  RAISE NOTICE 'Dev users created/updated successfully!';
END $$;

-- Verify the users
SELECT 
  u.email,
  p.name,
  p.user_type,
  p.is_admin,
  p.onboarding_completed,
  p.onboarding_step,
  CASE 
    WHEN p.onboarding_completed = false THEN 'Needs onboarding'
    ELSE 'Onboarding complete'
  END as onboarding_status,
  'Password: devpass123' as login_info
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email IN ('admin@dev.local', 'tradie@dev.local', 'client@dev.local')
ORDER BY u.email;