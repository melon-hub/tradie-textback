#!/bin/bash
# Sync Migration Status - Mark already applied migrations
# This safely marks migrations as applied without re-running them

set -e  # Exit on any error

# Load environment variables
source .env.local

# Ensure we have the required variables
if [ -z "$PGPASSWORD" ]; then
  echo "❌ Missing PGPASSWORD in .env.local"
  exit 1
fi

echo "🚀 Syncing Migration Status..."
echo "Project: cjxejmljovszxuleibqn"
echo "Time: $(date)"
echo ""

echo "📋 Current migration status:"
supabase migration list --password "$PGPASSWORD"

echo ""
echo "📝 Marking already-applied migrations as applied..."

# Mark migrations that are already applied in the database
echo "Baseline schema (tables exist)..."
supabase migration repair --status applied 00000000000000 --password "$PGPASSWORD"

echo "Client ID column (exists)..."
supabase migration repair --status applied 20250731080152 --password "$PGPASSWORD"

echo "User type column (exists)..."  
supabase migration repair --status applied 20250801122500 --password "$PGPASSWORD"

echo "Address column (exists)..."
supabase migration repair --status applied 20250801125500 --password "$PGPASSWORD"

echo ""
echo "🚀 Applying remaining migrations..."
supabase db push --password "$PGPASSWORD"

echo ""
echo "📋 Final migration status:"
supabase migration list --password "$PGPASSWORD"

echo ""
echo "✅ Migration sync complete!"
echo ""
echo "🔍 Next steps:"
echo "1. Apply the performance indexes in Supabase SQL Editor"
echo "2. Run: cat scripts/critical-performance-indexes.sql"
echo "3. Copy the SQL and run it in your Supabase project's SQL Editor"
echo "4. Test your application performance"