#!/bin/bash

# Cleanup script for tradie-textback project
# Created: 2025-08-04
# This script organizes and cleans up obsolete files

echo "🧹 Starting project cleanup..."

# Create archive directories if they don't exist
mkdir -p docs/archive/scripts/obsolete
mkdir -p docs/archive/scripts/diagnostics
mkdir -p docs/archive/scripts/one-time-fixes

# 1. Archive diagnostic/one-time scripts
echo "📦 Archiving diagnostic and one-time scripts..."
mv scripts/check-view-security.sql docs/archive/scripts/diagnostics/ 2>/dev/null
mv scripts/diagnose-security-issue.sql docs/archive/scripts/diagnostics/ 2>/dev/null
mv scripts/nuclear-fix-view.sql docs/archive/scripts/one-time-fixes/ 2>/dev/null
mv scripts/remove-unused-view.sql docs/archive/scripts/one-time-fixes/ 2>/dev/null
mv scripts/fix-view-security-simple.sql docs/archive/scripts/obsolete/ 2>/dev/null

# 2. Remove duplicate/obsolete versions
echo "🗑️  Removing obsolete file versions..."
rm -f scripts/create-business-settings-table.sql  # Keep the -fixed version
rm -f scripts/fix-dev-users.sql  # Keep the -safe version
rm -f scripts/fix-all-function-search-paths.sql  # Keep the -with-drop version
rm -f scripts/create-test-client.js  # Keep the .mjs version

# 3. Archive completed onboarding scripts
echo "📦 Archiving completed onboarding scripts..."
mv scripts/apply-onboarding-migration.md docs/archive/scripts/ 2>/dev/null
mv scripts/create-onboarding-test-data.sql docs/archive/scripts/ 2>/dev/null
mv scripts/test-onboarding-flow.js docs/archive/scripts/ 2>/dev/null

# 4. Clean up temporary files
echo "🗑️  Cleaning temporary files..."
rm -rf supabase/.temp/*

# 5. Create a summary of what's left
echo ""
echo "✅ Cleanup complete! Here's what remains in scripts/:"
echo ""
echo "Essential scripts:"
ls -la scripts/*.sql scripts/*.sh scripts/*.js scripts/*.mjs 2>/dev/null | grep -v "^d"
echo ""
echo "Migration chunks:"
ls -la scripts/migration-chunks/

echo ""
echo "📋 Summary:"
echo "- Archived diagnostic scripts to docs/archive/scripts/diagnostics/"
echo "- Archived one-time fixes to docs/archive/scripts/one-time-fixes/"
echo "- Archived obsolete versions to docs/archive/scripts/obsolete/"
echo "- Removed duplicate files"
echo "- Cleaned temporary files"
echo ""
echo "💡 Recommendation: Review the archived files and delete if not needed for history"