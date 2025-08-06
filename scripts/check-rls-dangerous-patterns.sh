#!/bin/bash

# RLS Dangerous Pattern Checker
# This script checks for dangerous RLS patterns in migration files

echo "🔍 Checking for dangerous RLS patterns in migrations..."

DANGEROUS_PATTERNS_FOUND=0

# Check for direct auth.uid() usage (without SELECT wrapper)
echo "Checking for direct auth.uid() usage..."
if grep -r "auth\.uid()" supabase/migrations/ | grep -v "SELECT auth.uid()" | grep -v "^#" | grep -v "^--"; then
    echo "❌ DANGER: Found direct auth.uid() usage - this causes recursion!"
    DANGEROUS_PATTERNS_FOUND=1
fi

# Check for EXISTS queries on profiles within profiles policies
echo "Checking for recursive profiles queries..."
if grep -r "ON profiles" supabase/migrations/ -A 5 | grep "EXISTS.*FROM profiles"; then
    echo "❌ DANGER: Found profiles querying itself in RLS policy - recursion!"
    DANGEROUS_PATTERNS_FOUND=1
fi

# Check for JWT claims in profiles policies (breaks dev tools)
echo "Checking for JWT claims in profiles policies..."
if grep -r "ON profiles" supabase/migrations/ -A 5 | grep "auth\.jwt()"; then
    echo "⚠️  WARNING: Found JWT claims in profiles policy - may break dev tools"
    DANGEROUS_PATTERNS_FOUND=1
fi

# Check for complex subqueries in profiles
echo "Checking for complex subqueries..."
if grep -r "ON profiles" supabase/migrations/ -A 10 | grep -E "SELECT.*FROM.*WHERE.*AND.*AND"; then
    echo "⚠️  WARNING: Complex subquery detected - consider simplifying"
fi

if [ $DANGEROUS_PATTERNS_FOUND -eq 0 ]; then
    echo "✅ No dangerous RLS patterns found in migrations"
    exit 0
else
    echo ""
    echo "🚨 DANGEROUS PATTERNS DETECTED!"
    echo "Fix these issues before pushing to production or you'll get 42P17 errors"
    echo "See CLAUDE.md for the correct patterns to use"
    exit 1
fi