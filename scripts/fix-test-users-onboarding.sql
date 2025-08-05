-- Fix test users onboarding status
-- Run this in Supabase SQL editor

-- Set onboarding_completed for all test users
UPDATE profiles 
SET 
  onboarding_completed = true,
  updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('testadmin@dev.local', 'testtradie@dev.local', 'testclient@dev.local')
);

-- Verify the update
SELECT 
  auth.users.email,
  profiles.user_type,
  profiles.is_admin,
  profiles.onboarding_completed,
  profiles.updated_at
FROM profiles 
JOIN auth.users ON profiles.user_id = auth.users.id
WHERE auth.users.email IN ('testadmin@dev.local', 'testtradie@dev.local', 'testclient@dev.local')
ORDER BY auth.users.email;