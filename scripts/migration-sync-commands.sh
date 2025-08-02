#!/bin/bash
# Supabase Migration Sync Commands
# Generated: 2025-08-02T08:02:02.947Z
# Project: tradie-textback

set -e  # Exit on any error

# Load environment variables
source .env.local

# Ensure we have the required variables
if [ -z "$PGPASSWORD" ] || [ -z "$DB_URL" ]; then
  echo "❌ Missing required environment variables"
  echo "Please ensure .env.local contains PGPASSWORD and DB_URL"
  exit 1
fi

echo "🚀 Starting Supabase Migration Sync..."
echo "Project: cjxejmljovszxuleibqn"
echo "Time: $(date)"
echo ""

# 1. CREATE BACKUP (REQUIRED)
supabase db dump -f backup-$(date +%Y%m%d-%H%M%S).sql --password "$PGPASSWORD"

# 2. CHECK CURRENT MIGRATION STATUS
supabase migration list --password "$PGPASSWORD"

# 3. APPLY CRITICAL PERFORMANCE FIXES FIRST (SAFE - CREATE INDEX IF NOT EXISTS)
echo "🔧 Applying critical performance indexes..."
# Fix: idx_profiles_user_id
echo "CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);" | psql "$DB_URL"
# Fix: idx_profiles_user_type
echo "CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);" | psql "$DB_URL"
# Fix: idx_profiles_user_id_is_admin
echo "CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_admin ON profiles(user_id, is_admin);" | psql "$DB_URL"
# Fix: idx_jobs_client_id
echo "CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);" | psql "$DB_URL"
# Fix: idx_jobs_status
echo "CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);" | psql "$DB_URL"
echo "✅ Critical indexes applied"
# 4. MARK ALREADY-APPLIED MIGRATIONS (SAFE)
echo "📝 Marking existing migrations as applied..."
supabase migration repair --status applied 00000000000000 --password "$PGPASSWORD"
supabase migration repair --status applied 20250731080152 --password "$PGPASSWORD"
supabase migration repair --status applied 20250801122500 --password "$PGPASSWORD"
supabase migration repair --status applied 20250801125500 --password "$PGPASSWORD"
echo "✅ Migration status updated"

# 5. APPLY ANY REMAINING MIGRATIONS
echo "🚀 Applying remaining migrations..."
supabase db push --password "$PGPASSWORD"
echo "✅ Migrations applied"

# 6. VERIFY EVERYTHING IS WORKING
echo "🔍 Verifying setup..."
node scripts/verify-supabase-setup.js
supabase migration list --password "$PGPASSWORD"

echo "✅ Migration sync complete!"
echo "Next steps:"
echo "1. Test your application thoroughly"
echo "2. Monitor performance improvements (profile queries should be <500ms now)"
echo "3. Check admin dashboard functionality"
echo "4. Run performance test: time curl your-app/admin to verify speed"