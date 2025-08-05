# Validation System Guide

<!-- Created: 2025-08-05 - Comprehensive validation system documentation -->

## Overview

The TradieText project includes a comprehensive validation system that checks for 45+ potential issues across 11 categories. This system helps catch configuration problems, database mismatches, and security issues before they affect users.

## Quick Start

### Running Validation

```bash
# Basic validation check
npm run validate

# Auto-fix common issues
npm run validate:fix

# Detailed verbose output
npm run validate:verbose

# Complete validation suite (includes TypeScript tests)
npm run validate:all

# Using slash command
/validate
/validate fix
/validate verbose
```

## What Gets Validated

### 1. Environment Variables
- Required variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.
- Optional variables: Google Maps API, Twilio credentials
- Checks `.env` and `.env.local` files

### 2. Dependencies & Build System
- Node modules installation
- Package.json consistency
- TypeScript compilation
- Development server configuration

### 3. Database Connectivity
- Supabase connection
- Database permissions
- Service role key validity

### 4. Database Schema & Constraints
- Table existence and structure
- Check constraints (especially job status values)
- Foreign key relationships
- Data type consistency

### 5. Migration Status
- Local vs remote migration sync
- Applied migrations tracking
- Type generation freshness

### 6. Security Configuration
- RLS (Row Level Security) policies
- API key separation (anon vs service role)
- Secret exposure in code
- CORS and security headers

### 7. Test Configuration
- Test file existence
- Test runner configuration
- Coverage settings

### 8. Edge Functions
- SMS notification functions
- Function deployment status
- Twilio integration

### 9. API Endpoints
- REST API health
- Authentication endpoints
- Protected route access

### 10. Data Integrity
- Orphaned records
- Invalid foreign keys
- Constraint violations
- Data consistency

### 11. Performance Indicators
- Missing indexes
- Query performance
- Bundle size

## Common Issues & Fixes

### Database Constraint Mismatch
**Symptom**: "new row for relation 'jobs' violates check constraint"

**Fix**:
1. Run validation: `npm run validate`
2. Check constraint definition in output
3. Run SQL fix script if needed

### Missing Environment Variables
**Symptom**: Validation shows missing VITE_SUPABASE_URL

**Fix**:
1. Check `.env.local` exists
2. Copy from `.env.example` if needed
3. Fill in required values

### Migration Out of Sync
**Symptom**: "Remote migration versions not found"

**Fix**:
1. Run `supabase db pull`
2. Then run `./bin/sdb-push`
3. Generate fresh types: `./bin/sdb-types`

## Validation Scripts

### Main Script: `scripts/validate-all.sh`
- Bash script with comprehensive checks
- Supports `--fix` flag for auto-fixes
- Supports `--verbose` for detailed output
- Exit codes for CI/CD integration

### TypeScript Tests: `tests/validation.test.ts`
- Programmatic validation
- Integration with Vitest
- Detailed error reporting

### SQL Validation: `scripts/validate-constraints.sql`
- Database-specific constraint checks
- Shows expected vs actual values
- Identifies invalid data

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Validate Project
  run: npm run validate
  
- name: Run Validation Tests
  run: npm run test:validation
```

## Creating Custom Validations

To add new validation checks:

1. Edit `scripts/validate-all.sh`
2. Add your check in the appropriate section
3. Use the helper functions: `check_command`, `log_success`, `log_error`
4. Update the validation test in `tests/validation.test.ts`

Example:
```bash
check_command "my-check" "Checking custom requirement" \
  'test -f important-file.txt' \
  "important-file.txt is missing"
```

## Troubleshooting

### Validation Fails on Fresh Clone
1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill in required environment variables
4. Run `supabase db pull`

### False Positives
Some checks may fail in development but work in production:
- Edge functions (not deployed locally)
- Production URLs (different in dev)
- SSL certificates (local uses self-signed)

Use `--verbose` flag to see detailed error context.

## Best Practices

1. **Run validation at session start**: Catch issues early
2. **Use before deployments**: Ensure production readiness
3. **After database changes**: Verify constraints match code
4. **In CI/CD**: Automated quality gates
5. **When debugging**: Find configuration issues quickly

## Related Documentation

- [Database Setup](../critical/database-setup.md)
- [Migration Process](./MIGRATION_PROCESS.md)
- [Testing Guide](../TESTING.md)
- [Production Checklist](../critical/PRODUCTION_CHECKLIST.md)