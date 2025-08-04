-- Development Test Users and Tenants
-- Only run this in development environments

-- Create test users with known passwords (dev only)
DO $$
DECLARE
  admin_id uuid;
  tradie_id uuid;
  client_id uuid;
  tenant1_id uuid := gen_random_uuid();
  tenant2_id uuid := gen_random_uuid();
BEGIN
  -- Only proceed if we're in development (check for existence of dev users)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@dev.local') THEN
    RAISE NOTICE 'Dev users already exist, skipping...';
    RETURN;
  END IF;

  -- Create Admin user
  admin_id := auth.uid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'admin@dev.local',
    crypt('devpass123', gen_salt('bf')),
    now(),
    now(),
    now()
  ) RETURNING id INTO admin_id;

  INSERT INTO public.profiles (user_id, name, phone, user_type, is_admin, created_at, updated_at)
  VALUES (
    admin_id,
    'Dev Admin',
    '+61400000001',
    'tradie',
    true,
    now(),
    now()
  );

  -- Create Tradie user
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'tradie@dev.local',
    crypt('devpass123', gen_salt('bf')),
    now(),
    now(),
    now()
  ) RETURNING id INTO tradie_id;

  INSERT INTO public.profiles (user_id, name, phone, user_type, is_admin, created_at, updated_at)
  VALUES (
    tradie_id,
    'Dev Tradie',
    '+61400000002',
    'tradie',
    false,
    now(),
    now()
  );

  -- Create Client user
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'client@dev.local',
    crypt('devpass123', gen_salt('bf')),
    now(),
    now(),
    now()
  ) RETURNING id INTO client_id;

  INSERT INTO public.profiles (user_id, name, phone, user_type, is_admin, address, created_at, updated_at)
  VALUES (
    client_id,
    'Dev Client',
    '+61400000003',
    'client',
    false,
    '123 Test Street, Sydney NSW 2000',
    now(),
    now()
  );

  -- Create some test jobs for the client
  INSERT INTO public.jobs (client_id, customer_name, phone, address, job_type, location, urgency, status, description, estimated_value)
  VALUES 
    (client_id, 'Dev Client', '+61400000003', '123 Test Street, Sydney NSW 2000', 'Plumbing', 'Sydney NSW', 'medium', 'new', 'Fix leaking tap in kitchen', 250),
    (client_id, 'Dev Client', '+61400000003', '123 Test Street, Sydney NSW 2000', 'Electrical', 'Sydney NSW', 'high', 'quoted', 'Install new power points', 450),
    (client_id, 'Dev Client', '+61400000003', '123 Test Street, Sydney NSW 2000', 'Carpentry', 'Sydney NSW', 'low', 'scheduled', 'Build deck in backyard', 3500);

  RAISE NOTICE 'Dev users created successfully:';
  RAISE NOTICE 'Admin: admin@dev.local / devpass123';
  RAISE NOTICE 'Tradie: tradie@dev.local / devpass123';
  RAISE NOTICE 'Client: client@dev.local / devpass123';
END $$;