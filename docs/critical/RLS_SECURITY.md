# Critical: RLS Security and Recursion Prevention

<!-- Created: 2025-08-06 - Documented critical RLS recursion issues and prevention measures -->

## 🚨 CRITICAL: RLS Recursion Can Break Your Entire App

Row Level Security (RLS) recursion is the #1 cause of database timeouts in this project. This document contains critical information to prevent and fix these issues.

## The Problem

PostgreSQL error code `42P17` (infinite recursion) occurs when RLS policies reference themselves, causing:
- 20+ second timeouts on profile fetches
- Complete app failure for all users
- Dashboard not loading
- Authentication breaking

## Prevention Rules

### Rule 1: NEVER use `auth.uid()` directly in profiles table
```sql
-- ❌ WRONG - Causes infinite recursion
CREATE POLICY "profiles_policy" ON profiles
  USING (auth.uid() = user_id);

-- ✅ CORRECT - Prevents recursion
CREATE POLICY "profiles_policy" ON profiles
  USING ((SELECT auth.uid()) = user_id);
```

### Rule 2: NEVER query the same table within its own policy
```sql
-- ❌ WRONG - Profiles checking profiles = recursion
CREATE POLICY "profiles_tradie_view" ON profiles
USING (EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid()
));

-- ✅ CORRECT - Simple check, no recursion
CREATE POLICY "profiles_authenticated_read" ON profiles
USING ((SELECT auth.uid()) IS NOT NULL);
```

### Rule 3: Avoid JWT claims in profiles policies
These break with dev tools and can cause issues:
```sql
-- ❌ AVOID
USING (auth.jwt() ->> 'user_type' = 'tradie')

-- ✅ PREFER
USING ((SELECT auth.uid()) IS NOT NULL)
```

## Available Fix Scripts

### 1. Health Check Script
```bash
# Check for dangerous patterns
scripts/validate-rls-health.sql
```

### 2. Safe Re-enable Script
```bash
# Re-enables RLS with safe policies
scripts/enable-rls-safe.sql
```

### 3. Emergency Nuclear Fix
```bash
# If everything is broken
scripts/fix-profiles-rls-immediately.sql
```

### 4. Pre-commit Check
```bash
# Check migrations for dangerous patterns
./scripts/check-rls-dangerous-patterns.sh
```

## Emergency Recovery Process

If you get 42P17 errors or 20-second timeouts:

1. **Disable RLS temporarily** (in Supabase SQL Editor):
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

2. **Run the safe re-enable script**:
```sql
-- Copy contents of scripts/enable-rls-safe.sql
```

3. **Test with both user types**:
- Login as testclient@dev.local
- Login as testtradie@dev.local

4. **Check for recursion**:
```bash
npm run check:rls
```

## Daily Checks

- Run `validate-rls-health.sql` before starting work
- Test dev tools login after any RLS changes
- Keep policies SIMPLE - complexity = recursion risk

## Lessons Learned

1. **The profiles table is special** - It's accessed on almost every request
2. **Dev tools can break JWT-based policies** - Keep policies simple
3. **Migrations can reintroduce problems** - Delete problematic migration files
4. **Always use `(SELECT auth.uid())`** - The parentheses matter!

## Related Files

- `CLAUDE.md` - Contains RLS prevention rules
- `supabase/migrations/20250806150000_final_fix_profiles_rls_no_recursion.sql` - Safe policies
- `scripts/check-rls-dangerous-patterns.sh` - Automated checking