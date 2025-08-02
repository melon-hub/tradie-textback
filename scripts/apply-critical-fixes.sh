#!/bin/bash
# Critical Performance Fixes - Apply Missing Indexes
# This script applies only the most critical performance fixes without requiring backup

set -e  # Exit on any error

# Load environment variables
source .env.local

# Ensure we have the required variables
if [ -z "$PGPASSWORD" ] || [ -z "$DB_URL" ]; then
  echo "❌ Missing required environment variables"
  echo "Please ensure .env.local contains PGPASSWORD and DB_URL"
  exit 1
fi

echo "🚀 Applying Critical Performance Fixes..."
echo "Project: cjxejmljovszxuleibqn"
echo "Time: $(date)"
echo ""

echo "🔧 Applying critical performance indexes..."

# These indexes are the root cause of the 30+ second load times
echo "📊 Creating profiles.user_id index (most critical)..."
echo "CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);" | psql "$DB_URL"

echo "📊 Creating profiles.user_type index..."
echo "CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);" | psql "$DB_URL"

echo "📊 Creating composite profiles index for admin checks..."
echo "CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_admin ON profiles(user_id, is_admin);" | psql "$DB_URL"

echo "📊 Creating jobs.client_id index..."
echo "CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);" | psql "$DB_URL"

echo "📊 Creating jobs.status index..."
echo "CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);" | psql "$DB_URL"

echo "✅ Critical indexes applied successfully!"

echo ""
echo "🎯 Testing performance improvement..."

# Test profile query performance
echo "SELECT 'Profile query test:', COUNT(*) FROM profiles WHERE user_id IS NOT NULL;" | psql "$DB_URL"

echo ""
echo "✅ Critical performance fixes complete!"
echo ""
echo "Expected improvements:"
echo "- Profile queries: 30+ seconds → <500ms"
echo "- Admin dashboard: Should load much faster"
echo "- Authentication: Should be nearly instant"
echo ""
echo "🔍 Next steps:"
echo "1. Test your application - it should be dramatically faster"
echo "2. Check admin dashboard performance" 
echo "3. If performance is good, run the full migration sync"
echo "4. Monitor for any remaining issues"