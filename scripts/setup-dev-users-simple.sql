-- Setup Dev Test Users (Simple Version)
-- Copy and paste this entire script into Supabase SQL Editor

-- Create users with proper metadata to satisfy the trigger
DO $$
DECLARE
  admin_id uuid;
  tradie_id uuid;
  client_id uuid;
BEGIN
  -- Check if dev users already exist
  IF EXISTS (SELECT 1 FROM auth.users WHERE email IN ('admin@dev.local', 'tradie@dev.local', 'client@dev.local')) THEN
    RAISE NOTICE 'Dev users already exist. Skipping creation...';
    -- Just update passwords for existing users
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('devpass123', gen_salt('bf')),
      email_confirmed_at = now()
    WHERE email IN ('admin@dev.local', 'tradie@dev.local', 'client@dev.local');
    RETURN;
  END IF;

  -- Create Admin user with all required metadata
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
  
  -- Update admin profile to be admin
  UPDATE public.profiles 
  SET is_admin = true 
  WHERE user_id = admin_id;
  
  RAISE NOTICE 'Created admin user';

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
  
  RAISE NOTICE 'Created tradie user';

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
  
  -- Skip creating test jobs - use existing data instead
  RAISE NOTICE 'Created client user (use existing jobs in database)';
END $$;

-- Show created users
SELECT 
  u.email,
  p.name,
  p.user_type,
  p.is_admin,
  p.address,
  'Password: devpass123' as login_info
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email IN ('admin@dev.local', 'tradie@dev.local', 'client@dev.local')
ORDER BY u.email;

-- Show job count
SELECT 
  'Created ' || COUNT(*) || ' test jobs for client@dev.local' as result
FROM public.jobs j
JOIN auth.users u ON j.client_id = u.id
WHERE u.email = 'client@dev.local';