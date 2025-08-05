-- Simple script to update test passwords
-- Run this in Supabase SQL editor or through supabase db push

-- First, let's check if users exist
SELECT email, created_at FROM auth.users WHERE email LIKE '%@dev.local';

-- Update passwords (using Supabase's built-in encryption)
UPDATE auth.users 
SET 
  encrypted_password = crypt('TestAdmin123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'testadmin@dev.local';

UPDATE auth.users 
SET 
  encrypted_password = crypt('TestTradie123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'testtradie@dev.local';

UPDATE auth.users 
SET 
  encrypted_password = crypt('TestClient123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'testclient@dev.local';

-- Verify updates
SELECT 
  email,
  encrypted_password IS NOT NULL as has_password,
  updated_at
FROM auth.users 
WHERE email LIKE '%@dev.local'
ORDER BY email;