# Project Maintenance Guide

<!-- Created: 2025-08-04 - Guide for maintaining clean project structure -->

## Overview

This guide provides best practices for maintaining a clean and organized project structure, based on the cleanup performed on 2025-08-04.

## File Organization

### Scripts Folder Structure

```
scripts/
├── active/              # Currently used scripts
│   ├── *.sql           # Database scripts
│   ├── *.sh            # Shell scripts
│   └── *.js/mjs        # JavaScript utilities
├── migration-chunks/    # Chunked migration files
└── README.md           # Scripts documentation
```

### Archive Structure

```
docs/archive/
├── scripts/
│   ├── diagnostics/     # One-time diagnostic scripts
│   ├── one-time-fixes/  # Applied fixes (kept for reference)
│   ├── obsolete/        # Outdated scripts
│   └── completed/       # Feature implementation scripts
├── migrations/          # Old migration attempts
└── misc/               # Other archived files
```

## Cleanup Process

### 1. Regular Script Cleanup (Monthly)

```bash
# Review scripts folder
ls -la scripts/

# Identify candidates for archiving:
# - Diagnostic scripts that have served their purpose
# - One-time fixes that have been applied
# - Test scripts for completed features
# - Obsolete versions of scripts

# Archive (don't delete) to maintain history
mkdir -p docs/archive/scripts/{diagnostics,one-time-fixes,obsolete,completed}
mv scripts/diagnostic-script.sql docs/archive/scripts/diagnostics/
```

### 2. Migration File Maintenance

#### Naming Convention
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

**Examples:**
- ✅ `20250804152138_fix_customer_jobs_view_security.sql`
- ❌ `20250804_quick_fix.sql` (missing time component)

#### Fixing Naming Issues
```bash
# Find non-standard migration names
ls supabase/migrations/ | grep -v '^[0-9]\{14\}_'

# Rename to standard format
mv 20250801_production_fix.sql 20250801000000_production_fix.sql
```

#### Handling Duplicates
```bash
# Check for timestamp conflicts
ls supabase/migrations/ | cut -c1-14 | sort | uniq -d

# If duplicates found, backup one and keep the most comprehensive
mv duplicate.sql duplicate.sql.backup
```

### 3. Documentation Updates

Always update documentation when cleaning up:

1. **CLEANUP_SUMMARY.md** - Document what was changed
2. **docs/guides/PROJECT_MAINTENANCE.md** - Update this guide
3. **docs/status/project-status.md** - Note cleanup in status

### 4. Security Script Management

Keep security-related scripts even after applying:

```
scripts/
├── fix-function-search-paths-with-drop.sql    # Keep for reference
├── fix-view-with-security-invoker.sql         # Keep for reference
└── add-foreign-key-indexes.sql                # Keep for re-application
```

These scripts document important security fixes and may be needed:
- When setting up new environments
- For security audits
- As reference for similar issues

## Best Practices

### 1. Never Delete, Always Archive
- Maintains project history
- Allows recovery if needed
- Documents evolution of the project

### 2. Use Descriptive Names
```bash
# Bad
fix.sql
test.js
update.sh

# Good
fix-rls-infinite-recursion.sql
test-onboarding-flow.js
update-database-indexes.sh
```

### 3. Document Purpose in Files
```sql
-- =============================================================================
-- Fix SECURITY DEFINER issue on customer_jobs_view
-- =============================================================================
-- Purpose: Remove SECURITY DEFINER to respect RLS policies
-- Created: 2025-08-04
-- Author: Development Team
-- =============================================================================
```

### 4. Regular Review Schedule

**Weekly:**
- Review new scripts added
- Ensure proper naming conventions

**Monthly:**
- Archive completed scripts
- Update documentation
- Clean temporary files

**Quarterly:**
- Review archive folder
- Consider permanent deletion of truly obsolete files
- Update maintenance procedures

## Cleanup Checklist

When performing cleanup:

- [ ] Identify obsolete/completed scripts
- [ ] Create appropriate archive directories
- [ ] Move files to archive (don't delete)
- [ ] Fix migration naming issues
- [ ] Resolve timestamp conflicts
- [ ] Update CLEANUP_SUMMARY.md
- [ ] Update relevant documentation
- [ ] Commit with clear message
- [ ] Tag version if significant cleanup

## Version Control

### Commit Messages for Cleanup
```bash
# Good examples
git commit -m "chore: archive diagnostic scripts and fix migration names"
git commit -m "chore: clean up obsolete scripts (30+ → 17 files)"
git commit -m "fix: resolve migration timestamp conflicts"

# Include details in body
git commit -m "chore: project cleanup and organization

- Archived 8 diagnostic and one-time scripts
- Fixed migration naming (YYYYMMDDHHMMSS format)
- Resolved timestamp conflicts in migrations
- Removed 4 duplicate script versions
- Updated documentation"
```

### When to Tag After Cleanup
Tag a new version after cleanup if:
- Significant number of files reorganized
- Migration issues resolved
- Project structure improved

```bash
git tag -a v0.4.6 -m "Project cleanup and security hardening"
```

## Security Considerations

### Scripts to Always Keep
1. **Security fixes** - Document how vulnerabilities were patched
2. **Function search paths** - Prevent SQL injection
3. **View security changes** - Document SECURITY INVOKER usage
4. **Index additions** - Performance and security

### Scripts Safe to Archive
1. **Diagnostic queries** - One-time analysis
2. **Test data creation** - Feature complete
3. **Old implementations** - Superseded by newer versions
4. **Temporary fixes** - Properly fixed in migrations

## Summary

A clean project structure:
- Improves developer experience
- Reduces confusion
- Maintains clear history
- Facilitates onboarding
- Supports security audits

Regular maintenance prevents accumulation of technical debt and keeps the project manageable as it grows.