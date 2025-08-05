#!/bin/bash

# Script to update test user passwords in Supabase
# This uses the supabase CLI to run the SQL

echo "🔐 Updating test user passwords in Supabase..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

# Source the environment variables
source .env.local

# Run the SQL script using psql with the DB_URL
echo "📝 Connecting to database and updating passwords..."

psql "$DB_URL" << 'EOF'
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update all test user passwords
UPDATE auth.users 
SET encrypted_password = crypt('TestAdmin123!', gen_salt('bf'))
WHERE email = 'testadmin@dev.local';

UPDATE auth.users 
SET encrypted_password = crypt('TestTradie123!', gen_salt('bf'))
WHERE email = 'testtradie@dev.local';

UPDATE auth.users 
SET encrypted_password = crypt('TestClient123!', gen_salt('bf'))
WHERE email = 'testclient@dev.local';

-- Show results
SELECT 
    email,
    CASE WHEN encrypted_password IS NOT NULL THEN '✓' ELSE '✗' END as pwd_set
FROM auth.users 
WHERE email LIKE '%@dev.local'
ORDER BY email;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Passwords updated successfully!"
    echo ""
    echo "📋 Test credentials:"
    echo "   Admin:  testadmin@dev.local / TestAdmin123!"
    echo "   Tradie: testtradie@dev.local / TestTradie123!"  
    echo "   Client: testclient@dev.local / TestClient123!"
else
    echo "❌ Failed to update passwords"
    exit 1
fi