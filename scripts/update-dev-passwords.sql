-- Script to update test user passwords in Supabase
-- Run this in your Supabase SQL Editor

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update passwords for all test users
DO $$
BEGIN
    -- Update test admin
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('TestAdmin123!', gen_salt('bf')),
        updated_at = now()
    WHERE email = 'testadmin@dev.local';
    
    -- Update test tradie  
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('TestTradie123!', gen_salt('bf')),
        updated_at = now()
    WHERE email = 'testtradie@dev.local';
    
    -- Update test client
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('TestClient123!', gen_salt('bf')),
        updated_at = now()
    WHERE email = 'testclient@dev.local';
    
    -- Print results
    RAISE NOTICE 'Updated % admin user(s)', (SELECT COUNT(*) FROM auth.users WHERE email = 'testadmin@dev.local' AND encrypted_password IS NOT NULL);
    RAISE NOTICE 'Updated % tradie user(s)', (SELECT COUNT(*) FROM auth.users WHERE email = 'testtradie@dev.local' AND encrypted_password IS NOT NULL);
    RAISE NOTICE 'Updated % client user(s)', (SELECT COUNT(*) FROM auth.users WHERE email = 'testclient@dev.local' AND encrypted_password IS NOT NULL);
END $$;

-- Verify the updates worked
SELECT 
    email,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✓ Password Set'
        ELSE '✗ No Password'
    END as status,
    CASE 
        WHEN email = 'testadmin@dev.local' THEN 'TestAdmin123!'
        WHEN email = 'testtradie@dev.local' THEN 'TestTradie123!'
        WHEN email = 'testclient@dev.local' THEN 'TestClient123!'
    END as expected_password,
    created_at::date as created,
    updated_at::date as last_updated
FROM auth.users 
WHERE email IN ('testadmin@dev.local', 'testtradie@dev.local', 'testclient@dev.local')
ORDER BY email;