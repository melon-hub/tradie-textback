-- FIX: Ensure test client has a phone number that matches jobs

-- 1. Check test client's current phone
SELECT 
    user_id,
    email,
    phone,
    name,
    user_type
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'testclient@dev.local';

-- 2. Update test client's phone to match some test jobs
-- First, find a phone number that has jobs
SELECT 
    phone,
    COUNT(*) as job_count
FROM jobs
GROUP BY phone
ORDER BY job_count DESC
LIMIT 5;

-- 3. Update test client profile with a phone that has jobs
-- Replace '+61423456789' with an actual phone from step 2
UPDATE profiles
SET phone = '+61423456789'  -- Replace with a phone that has jobs
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'testclient@dev.local'
);

-- 4. Verify the update
SELECT 
    'Updated profile' as status,
    user_id,
    phone,
    name,
    user_type
FROM profiles
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'testclient@dev.local'
);

-- 5. Now check what jobs this client can see
SELECT 
    'Jobs for this client' as check,
    id,
    customer_name,
    phone,
    job_type,
    status
FROM jobs
WHERE phone = (
    SELECT phone FROM profiles 
    WHERE user_id = (
        SELECT id FROM auth.users WHERE email = 'testclient@dev.local'
    )
)
LIMIT 10;