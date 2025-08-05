-- Update passwords for test users in development
-- This script updates the auth.users table with hashed passwords for test accounts

-- Note: These are bcrypt hashed versions of the passwords
-- TestAdmin123! -> $2a$10$PkKkPe8BTID5pUQr5wPYaezVLy2JA7WxJ7ZfXCqoL0zD9a4Lq0zPe
-- TestTradie123! -> $2a$10$rX3X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X
-- TestClient123! -> $2a$10$cX3X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X

-- Update test admin password
UPDATE auth.users 
SET encrypted_password = crypt('TestAdmin123!', gen_salt('bf'))
WHERE email = 'testadmin@dev.local';

-- Update test tradie password
UPDATE auth.users 
SET encrypted_password = crypt('TestTradie123!', gen_salt('bf'))
WHERE email = 'testtradie@dev.local';

-- Update test client password
UPDATE auth.users 
SET encrypted_password = crypt('TestClient123!', gen_salt('bf'))
WHERE email = 'testclient@dev.local';

-- Verify the updates
SELECT email, 
       CASE 
         WHEN encrypted_password IS NOT NULL THEN 'Password Set' 
         ELSE 'No Password' 
       END as password_status,
       created_at,
       updated_at
FROM auth.users 
WHERE email IN ('testadmin@dev.local', 'testtradie@dev.local', 'testclient@dev.local');