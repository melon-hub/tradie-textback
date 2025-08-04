# Better Migration Process for Supabase

<!-- Updated: 2025-08-04 - Added migration naming conventions and security best practices -->

## 1. Before Creating Any Migration

### Check Current State
```bash
# Always check what's already in the database
supabase db pull --password "$PGPASSWORD"

# List current migrations
supabase migration list --password "$PGPASSWORD"

# Check for any unapplied migrations
ls supabase/migrations/
```

### Test Complex Changes First
For RLS policies or complex changes:
1. Test in Supabase Dashboard SQL Editor first
2. Verify it works without errors
3. Only then create a migration file

## 2. Creating Migrations

### Use Timestamp Format
```bash
# Use full timestamp to avoid conflicts
YYYYMMDDHHMMSS_descriptive_name.sql
# Example: 20250802093045_fix_profiles_rls.sql

# IMPORTANT: Always use complete timestamps (14 digits)
# BAD:  20250801_production_fix.sql
# GOOD: 20250801000000_production_fix.sql
```

### Make Migrations Idempotent
Always use IF EXISTS/IF NOT EXISTS:
```sql
-- Good
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE INDEX IF NOT EXISTS idx_name ON table(column);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN;

-- Bad
DROP POLICY "policy_name" ON table_name;
CREATE INDEX idx_name ON table(column);
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN;
```

## 3. Testing RLS Policies

### Never Test RLS in Migrations First
1. Write the policy in SQL Editor
2. Test with different user roles:
   ```sql
   -- Test as different users
   SET ROLE authenticated;
   SET request.jwt.claim.sub = 'user-uuid-here';
   SELECT * FROM profiles;
   ```
3. Only add to migration after confirming no recursion

### Avoid Recursion in RLS
```sql
-- BAD: Queries same table in policy
CREATE POLICY "check_admin" ON profiles
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- GOOD: Use JWT claims or different table
CREATE POLICY "check_admin" ON profiles
USING (
  auth.jwt() ->> 'is_admin' = 'true'
  OR
  auth.uid() IN (SELECT user_id FROM admin_users)
);
```

## 4. Applying Migrations

### Use a Staging Approach
```bash
# 1. Pull current state
supabase db pull --password "$PGPASSWORD"

# 2. Reset local database
supabase db reset

# 3. Test migration locally
supabase db push --local

# 4. Only push to remote after local success
supabase db push --password "$PGPASSWORD"
```

### Handle Failures
If a migration fails:
```bash
# 1. Don't panic
# 2. Fix in SQL Editor first
# 3. Mark the failed migration as applied
supabase migration repair --status applied YYYYMMDD --password "$PGPASSWORD"

# 4. Create a new migration with the fix
```

## 5. Best Practices

### Keep a Migration Log
```sql
-- At the top of each migration
-- Migration: 20250802093045_fix_profiles_rls.sql
-- Purpose: Fix infinite recursion in profiles RLS
-- Testing: Tested in SQL Editor on 2025-08-02
-- Author: @username
```

### Small, Focused Migrations
- One concern per migration
- Easier to debug
- Easier to rollback

### Always Have a Rollback Plan
```sql
-- In comments at the bottom
-- Rollback:
-- DROP POLICY IF EXISTS "new_policy" ON table;
-- CREATE POLICY "old_policy" ON table USING (old_condition);
```

## 6. Security Best Practices

### Always Set Search Path for Functions
```sql
-- Prevent SQL injection by setting explicit search path
CREATE OR REPLACE FUNCTION my_function()
RETURNS ... 
LANGUAGE plpgsql
SECURITY DEFINER -- or SECURITY INVOKER
SET search_path = public, pg_temp -- ALWAYS include this
AS $$
...
$$;
```

### Use SECURITY INVOKER for Views
```sql
-- Use WITH clause for PostgreSQL 15+
CREATE OR REPLACE VIEW my_view 
WITH (security_invoker=on)
AS SELECT ...;

-- For older versions, views default to SECURITY INVOKER
-- Avoid SECURITY DEFINER unless absolutely necessary
```

## 7. Current State Sync Process

When things are out of sync (like now):
```bash
# 1. Document what's actually in production
supabase gen types typescript --project-id=your-project-id > actual-db-state.ts

# 2. Create a "sync" migration that represents current state
# This should CREATE IF NOT EXISTS everything that's already there

# 3. Mark all old migrations as applied
supabase migration repair --status applied all --password "$PGPASSWORD"

# 4. Start fresh from known state
```

## 7. Testing Checklist

Before pushing any migration:
- [ ] Tested in SQL Editor?
- [ ] No errors for all user types?
- [ ] Migrations are idempotent?
- [ ] Have rollback commands?
- [ ] Pulled latest DB state?
- [ ] Named with full timestamp?

## Emergency Procedures

### If RLS Causes Recursion
```sql
-- Immediately in SQL Editor:
DROP POLICY IF EXISTS "problematic_policy" ON table_name;
CREATE POLICY "temp_allow_all" ON table_name FOR SELECT USING (true);
-- Then fix properly with JWT claims
```

### If Migration Won't Apply
```bash
# Check what's blocking
supabase migration list --password "$PGPASSWORD"

# Repair if needed
supabase migration repair --status applied MIGRATION_NAME --password "$PGPASSWORD"

# Or mark as reverted to retry
supabase migration repair --status reverted MIGRATION_NAME --password "$PGPASSWORD"
```

## For This Project Specifically

### Current Issues to Fix:
1. RLS policies need to use JWT claims, not table queries
2. Migration history is out of sync
3. Some changes were applied manually

### Recommended Next Steps:
1. Document all manual SQL changes
2. Create a "baseline" migration representing current state
3. Use JWT claims for admin/tradie checks
4. Test all RLS policies in SQL Editor first