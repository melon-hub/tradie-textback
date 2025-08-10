#!/bin/bash
echo "Testing new service role key..."

# Source the environment
source .env.local

# Test the key with a simple API call
curl -s \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  "https://cjxejmljovszxuleibqn.supabase.co/rest/v1/profiles?select=id&limit=1" \
  | head -c 100

echo ""
echo "If you see JSON data above, the new key works!"
echo "If you see an error, the key needs to be updated."