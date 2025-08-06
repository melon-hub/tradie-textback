# Migration Sync Issues - Complete Guide

## Why This Happens

The migration sync issue occurs because:
1. **Multiple environments** - Different developers/AI agents create migrations independently
2. **Remote-first changes** - Sometimes changes are made directly in Supabase Dashboard
3. **Git conflicts** - Migration files don't always sync properly through git
4. **Timestamp collisions** - Two migrations created at similar times

## Prevention (Do This Every Session)

```bash
# 1. Start of session - ALWAYS DO THIS FIRST
supabase db pull          # Download any remote migrations
./bin/sdb-types           # Generate fresh types

# 2. Before creating new migrations
supabase migration list   # Check what's already there
```

## Quick Fixes

### Fix #1: Remote Has Unknown Migration (Most Common)
**Error:** `Remote migration versions not found in local migrations directory`

```bash
# Option A: Create placeholder for the missing migration
echo "-- Placeholder" > supabase/migrations/20250801_placeholder.sql

# Option B: Pull all remote migrations
supabase db pull --schema public
```

### Fix #2: Local Migrations Not Applied
**Error:** `Found local migration files to be inserted before the last migration`

```bash
# Mark specific migration as applied
source .env.local
supabase migration repair --status applied 20250803100000 --password "$PGPASSWORD"

# Or force push all
supabase db push --include-all --password "$PGPASSWORD"
```

### Fix #3: Apply Changes Directly (Quick & Dirty)
When you just need it to work:

1. Apply SQL directly in Supabase Dashboard
2. Mark migration as applied:
```sql
INSERT INTO supabase_migrations.schema_migrations (version, inserted_at)
VALUES ('20250805180000', NOW());
```
3. Generate types: `./bin/sdb-types`

## Automated Solution

Use the new fix script:
```bash
# Check current status
./scripts/fix-migration-sync.sh check

# Pull remote migrations
./scripts/fix-migration-sync.sh pull

# Auto-repair common issues
./scripts/fix-migration-sync.sh repair
```

## Best Practices

1. **Name migrations properly**: `YYYYMMDDHHMMSS_descriptive_name.sql`
2. **One migration per feature**: Don't bundle unrelated changes
3. **Test locally first**: Use `supabase db reset` to test migrations
4. **Document changes**: Add comments in migration files
5. **Coordinate with team**: Check Slack/Discord before major schema changes

## Emergency Recovery

If everything is broken:
```bash
# 1. Backup current state
supabase db dump -f backup.sql

# 2. Get remote schema
supabase db pull --schema public,auth

# 3. Reset local migrations
rm supabase/migrations/20*.sql
supabase db pull

# 4. Reapply your changes
# Create new migration with your changes
```

## Common Patterns

### Pattern 1: Daily Development
```bash
# Morning
supabase db pull
./bin/sdb-types
npm run dev

# Before pushing changes
supabase migration list
./bin/sdb-push
```

### Pattern 2: After Git Pull
```bash
git pull
supabase db pull
./bin/sdb-types
```

### Pattern 3: Creating New Migration
```bash
# Check first
supabase migration list

# Create migration
supabase migration new my_feature

# Edit the file
vim supabase/migrations/*_my_feature.sql

# Push
./bin/sdb-push
```

## Troubleshooting Checklist

- [ ] Is .env.local present with correct PGPASSWORD?
- [ ] Are you in the right directory?
- [ ] Is the remote database accessible?
- [ ] Do migration filenames match the pattern?
- [ ] Are there duplicate timestamp prefixes?
- [ ] Is the supabase CLI up to date?

## Quick Reference

```bash
# Commands you'll use most
supabase db pull                    # Get remote migrations
supabase migration list              # Check sync status
supabase migration repair --status applied YYYYMMDD  # Mark as applied
./bin/sdb-push                       # Push migrations
./bin/sdb-types                      # Generate types
./scripts/fix-migration-sync.sh repair  # Auto-fix issues
```

## Remember

- **The database is the source of truth**, not your migration files
- **When in doubt, check the actual database** in Supabase Dashboard
- **It's safe to apply migrations directly** in SQL Editor when needed
- **Types can always be regenerated** with `./bin/sdb-types`