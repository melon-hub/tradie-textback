#!/bin/bash

# Job Type Migration Script
# This script checks current job types and migrates them to standardized trade types

echo "🔍 Checking current job types in database..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v ^# | xargs)
else
    echo "❌ .env.local file not found!"
    exit 1
fi

echo "📊 Current job types before migration:"
echo "======================================="

# First, check what job types exist (using curl to Supabase REST API)
curl -s -X POST "$DB_URL" \
  -H "Authorization: Bearer $SUPABASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT job_type, COUNT(*) as count FROM jobs GROUP BY job_type ORDER BY count DESC"}' \
  | jq -r '.[] | "\(.job_type): \(.count) jobs"'

echo ""
read -p "🤔 Do you want to proceed with migrating job types to standardized trade types? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo "🚀 Running job type migration..."

# Check if we can use psql or need to use Supabase REST API
if command -v psql &> /dev/null; then
    echo "Using psql..."
    psql "$DB_URL" -f scripts/migrate-job-types.sql
else
    echo "❌ psql not available. Please run the migration manually:"
    echo "1. Copy the contents of scripts/migrate-job-types.sql"
    echo "2. Run it in your Supabase SQL editor"
    echo "3. Or install PostgreSQL client tools"
fi

echo "✅ Migration process completed!"
echo "📋 Check your database to verify the results."