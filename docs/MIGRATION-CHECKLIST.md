# Migration Sync Troubleshooting Checklist

## Common Migration Issues We've Fixed

### ✅ Issues We Now Detect & Fix

1. **Malformed Migrations** (e.g., `20250801` without timestamp)
   - Detection: `npm run validate` checks for these
   - Fix: SQL provided to delete malformed entries
   - Prevention: Always use full timestamps

2. **Duplicate Migration Entries**
   - Detection: Validation script checks for duplicates
   - Fix: SQL to remove duplicates (keeps oldest)
   - Prevention: Don't manually insert into migrations table

3. **Local-Remote Mismatch**
   - Detection: `sdb-push` shows mismatch errors
   - Fix: `./scripts/fix-migration-sync.sh repair`
   - Prevention: Always `supabase db pull` at session start

4. **Missing Placeholder Files**
   - Detection: "Remote migration versions not found"
   - Fix: Script creates placeholder files automatically
   - Prevention: Keep placeholders in git

5. **Unapplied Local Migrations**
   - Detection: "Found local migration files to be inserted"
   - Fix: Mark as applied with repair command
   - Prevention: Always push migrations when created

## Quick Diagnostic Commands

```bash
# Full system validation (includes migration check)
npm run validate

# Just check migration sync
./scripts/fix-migration-sync.sh check

# Auto-repair most issues
./scripts/fix-migration-sync.sh repair

# Detailed validation with fixes
npm run validate:fix
```

## Manual Fixes for Edge Cases

### 1. Nuclear Option - Complete Reset
```sql
-- WARNING: Only if you're sure all migrations are actually applied
TRUNCATE supabase_migrations.schema_migrations;
-- Then manually re-insert each migration
INSERT INTO supabase_migrations.schema_migrations (version) 
VALUES ('20250731080152'), ('20250801000000'), ...;
```

### 2. Check for Hidden Issues
```sql
-- Find all migrations
SELECT version, COUNT(*) 
FROM supabase_migrations.schema_migrations 
GROUP BY version 
ORDER BY version;

-- Find malformed entries
SELECT version 
FROM supabase_migrations.schema_migrations 
WHERE version ~ '^[0-9]{8}$';

-- Find duplicates
SELECT version, COUNT(*) 
FROM supabase_migrations.schema_migrations 
GROUP BY version 
HAVING COUNT(*) > 1;
```

### 3. Force Sync State
```bash
# Pull everything from remote
supabase db pull --schema public,auth,supabase_migrations

# Reset local migrations to match remote exactly
rm supabase/migrations/*.sql
supabase db pull
```

## Prevention Checklist

### Daily Workflow
- [ ] Start session: `supabase db pull`
- [ ] Before changes: `npm run validate`
- [ ] After changes: `./bin/sdb-push`
- [ ] Before commit: `npm run validate`

### Creating Migrations
- [ ] Use: `supabase migration new descriptive_name`
- [ ] Never create files like `20250801.sql` (missing timestamp)
- [ ] Always test locally first
- [ ] Push immediately after creating

### When Issues Occur
- [ ] Run: `npm run validate` first
- [ ] Try: `npm run validate:fix`
- [ ] Use: `./scripts/fix-migration-sync.sh repair`
- [ ] Check Supabase Dashboard SQL Editor if needed

## What We've Added to Validation

1. **Migration Sync Status (Section 5.1)**
   - Detects malformed migrations
   - Finds duplicate entries
   - Identifies local-only migrations
   - Identifies remote-only migrations
   - Tests sdb-push functionality

2. **Auto-Fix Capabilities**
   - Creates placeholder files for remote migrations
   - Marks local migrations as applied
   - Provides SQL to fix malformed/duplicate entries
   - Interactive prompts for manual fixes

3. **Enhanced Repair Script**
   - Handles malformed migrations
   - Detects and fixes duplicates
   - Creates placeholders automatically
   - Tests sync after repair

## Emergency Contacts

If all else fails:
1. Check: https://supabase.com/dashboard/project/cjxejmljovszxuleibqn/sql
2. Run diagnostics: `npm run validate:verbose`
3. Manual SQL fixes in Dashboard
4. Document the issue for future reference

## Remember

- **The database is truth** - migrations table just tracks history
- **Malformed entries break everything** - always use full timestamps
- **Duplicates cause confusion** - let Supabase handle insertions
- **Validation catches most issues** - run it frequently
- **The repair script is your friend** - it fixes 90% of problems