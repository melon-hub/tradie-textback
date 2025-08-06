# CLAUDE.md - Tradie Textback Project Rules

## Project Overview
This is a missed-call management system for Australian tradies. It automatically sends SMS responses to missed calls and provides a job management dashboard.

## Available Claude Code Subagents
When you need specialized help, use the Task tool to invoke these subagents:

### Installed Subagents (from 0xfurai/claude-code-subagents)
- **ui-generator**: Creates beautiful, responsive UI components using Tailwind/shadcn
- **api-integrator**: Helps integrate external APIs (Twilio, Stripe, etc.)
- **database-architect**: Designs and optimizes database schemas and queries
- **code-reviewer**: Reviews code for best practices and potential issues
- **documentation-writer**: Creates comprehensive documentation
- **test-generator**: Generates unit and integration tests
- **performance-optimizer**: Identifies and fixes performance bottlenecks
- **security-auditor**: Finds security vulnerabilities and suggests fixes
- **refactoring-assistant**: Helps refactor and improve code structure
- **debugging-helper**: Assists with debugging complex issues

### How to Use Subagents
```
Use the Task tool with:
- subagent_type: "ui-generator" (or any agent above)
- description: "Brief task description"
- prompt: "Detailed instructions for the agent"
```

### When to Use Subagents
- **ui-generator**: When creating new components or improving UI
- **api-integrator**: For Twilio SMS or Stripe payment integration
- **database-architect**: For complex queries or schema changes
- **code-reviewer**: After implementing major features
- **security-auditor**: Before going to production

### IMPORTANT: Subagent Announcement Rule
**ALWAYS announce which subagent you're about to use before invoking the Task tool, even if it's the general subagent. For example:**
- "I'll use the ui-generator subagent to create this component"
- "I'll use the database-architect subagent to design this schema"
- "I'll use the general subagent to search across the codebase"

## 🚨 CRITICAL: RLS RECURSION PREVENTION (TOP PRIORITY)

### The #1 Cause of Database Timeouts: RLS Recursion
This issue has caused **HOURS of debugging** and will break your app completely. Follow these rules religiously:

### The Golden Rules for RLS Policies

#### Rule 1: NEVER use `auth.uid()` directly in profiles table
```sql
-- ❌ NEVER DO THIS (causes infinite recursion, 42P17 errors, 20s timeouts)
CREATE POLICY "profiles_policy" ON profiles
  USING (auth.uid() = user_id);

-- ✅ ALWAYS DO THIS (works perfectly, no recursion)
CREATE POLICY "profiles_policy" ON profiles
  USING ((SELECT auth.uid()) = user_id);
```

#### Rule 2: NEVER query the same table within its own policy
```sql
-- ❌ NEVER DO THIS (infinite recursion)
CREATE POLICY "profiles_tradie_view" ON profiles
USING (EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'tradie'
));

-- ✅ DO THIS INSTEAD (simple, no recursion)
CREATE POLICY "profiles_authenticated_read" ON profiles
USING ((SELECT auth.uid()) IS NOT NULL);
```

#### Rule 3: NEVER use JWT claims in profiles policies
```sql
-- ❌ AVOID THIS (breaks with dev tools)
USING (auth.jwt() ->> 'user_type' = 'tradie')

-- ✅ USE THIS (works everywhere)
USING ((SELECT auth.uid()) IS NOT NULL)
```

### Daily RLS Health Check (MANDATORY)
```bash
# Run this EVERY DAY before starting work
psql $DATABASE_URL -f scripts/validate-rls-health.sql

# Or in Supabase SQL Editor, run the validate-rls-health.sql script
```

### Emergency Fix When RLS Breaks
```sql
-- If you get 42P17 errors or 20-second timeouts, run this IMMEDIATELY:
-- 1. First, disable RLS temporarily to regain access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Then run the safe re-enable script
-- Copy contents of scripts/enable-rls-safe.sql to Supabase SQL Editor
```

### Prevention Checklist
- [ ] ALWAYS test after creating/modifying RLS policies
- [ ] NEVER commit migrations with complex profiles policies
- [ ] Run `validate-rls-health.sql` daily
- [ ] Keep policies SIMPLE - complexity = recursion risk
- [ ] Test with dev tools login after any RLS change

### CRITICAL: Avoid Complex RLS Policies
**NEVER create RLS policies that check other tables, especially not the same table**

```sql
-- ❌ BAD - Causes recursion when profiles checks profiles
CREATE POLICY "profiles_tradie_view_all" ON profiles
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.user_type = 'tradie'
));

-- ✅ GOOD - Simple, no recursion
CREATE POLICY "profiles_authenticated_read" ON profiles
USING ((SELECT auth.uid()) IS NOT NULL);
```

### Quick RLS Debug Commands
```sql
-- If you get 42P17 error (infinite recursion), run this:
DROP POLICY IF EXISTS [problematic_policy_name] ON [table_name];

-- To see what's causing recursion:
SELECT policyname, qual::text 
FROM pg_policies 
WHERE schemaname = 'public' 
AND qual::text LIKE '%EXISTS%';
```

**This was learned the hard way** - we spent hours debugging "customer_jobs_view" thinking it was a view problem, when the real issue was RLS recursion in the profiles table causing timeouts.

## CRITICAL RULES TO REMEMBER

### 0. ALWAYS ASK CLARIFYING QUESTIONS FIRST
- **Before implementing any solution**, ask questions to understand:
  - What is the user trying to achieve? (not just what they asked for)
  - Is this for testing with real data or just UI preview?
  - What is the actual problem they're experiencing?
  - Have they tried something already that didn't work?
- **Don't assume** - A request for "auth help" could mean:
  - Fixing login bugs
  - Creating test users
  - Building a UI preview system
  - Debugging redirect issues
- **Prevent wasted time** by spending 30 seconds asking rather than 3 hours building the wrong thing

### 1. Database & Supabase
- **ALWAYS use `./bin/sdb-push` script** - NEVER use direct supabase commands or expose API keys
- **Check for existing .env.local** before creating new ones
- **The .env.local contains sensitive PGPASSWORD** - never overwrite without checking
- **Use environment variables** for all sensitive data
- **Database structure**: jobs table has client_id field linking to auth.users

#### IMPORTANT: Finding .env.local files
- **Hidden files start with a dot (.)** - use `ls -la` not just `ls`
- **Always check with**: `ls -la | grep .env` to find all env files
- **If .env.local is missing**, check these locations:
  - Current directory: `ls -la .env*`
  - Check if it exists: `test -f .env.local && echo "exists" || echo "missing"`
  - Read it directly: `cat .env.local` (if it exists)
- **The .env.local file should contain**:
  - SUPABASE_PROJECT_ID=cjxejmljovszxuleibqn
  - SUPABASE_API_KEY (service role key)
  - PGPASSWORD (database password)
  - DB_URL (full connection string)

### 2. Authentication & User Types
- **Two user types**: 'client' (customers who submit jobs) and 'tradie' (service providers)
  - NOTE: This naming is confusing - 'client' = customers, 'tradie' = actual tradies
- **Magic link authentication only** - no passwords
- **Dev tools provide quick login** for testing both user types
- **User profiles have user_type field** that determines access levels

#### Auth State Management
- Profile is cached in localStorage to prevent flickering
- Cache includes user_id validation to ensure correct user
- Only clear cache on explicit sign out
- Added `onboarding_completed` field to Profile interface
- Fixed auth state flickering issue in `/src/hooks/useAuth.ts`

#### Dashboard Differences by User Type
- **Tradies see**: Stats cards (urgent/new jobs, total value), all jobs, analytics tab
- **Clients see**: Their submitted jobs, tradie contact info, job status updates
- Stats cards are hidden from client view to avoid confusion

### 3. Development Server
- **Default port is 8080** (configured in vite.config.ts)
- **IMPORTANT: Always check what's running before starting server** with `lsof -i :8080`
- **Only run on port 8080** - do not let Vite auto-increment ports
- **If port 8080 is in use**, the existing server is already running - use that instead
- **Never hardcode ports** - use dynamic port detection
- **Dev tools should use**: `window.location.port || '8080'`

### 4. RLS (Row Level Security) Policies
- **Clients can only see their own jobs** (filtered by client_id)
- **Tradies can see all jobs** from all clients
- **Always check user_type** in RLS policies
- **Policies are in**: supabase/migrations/20250801_production_fix.sql

### 5. Common Commands
```bash
# Push database changes (ALWAYS use this) - secure script in bin/
./bin/sdb-push

# Generate TypeScript types - secure script in bin/
./bin/sdb-types

# Start dev server
npm run dev
```

### 6. File Structure
- `/src/pages/Dashboard.tsx` - Main dashboard component
- `/src/pages/JobCard.tsx` - Job detail view
- `/src/components/DevToolsPanel.tsx` - Development tools
- `/src/types/database.types.ts` - Auto-generated Supabase types
- `/supabase/migrations/` - Database migrations

### 7. Common Pitfalls to Avoid
- ❌ Don't create new .env files without checking existing ones
- ❌ Don't use `supabase db push` directly - use `./bin/sdb-push`
- ❌ Don't expose API keys or credentials in bash commands
- ❌ Don't hardcode localhost:8082 or any specific port
- ❌ Don't forget to check user_type for conditional rendering
- ❌ Don't mix up "client" (tradie) vs "client" (customer) terminology
- ❌ **Don't create complex RLS policies** - keep them simple to avoid recursion
- ❌ **Don't create 30+ SQL scripts** - fix issues in the code when possible

### 8. Testing & Development
- **Use DevToolsPanel** for quick user switching and testing
- **Test both user types**: Client view and Tradie view
- **Always run sdb-push** after database changes
- **Check browser console** for Supabase errors

### 9. Code Style
- **TypeScript strict mode** is enabled
- **Follow existing patterns** in components
- **No emojis** unless user explicitly requests
- **Keep code changes minimal** and focused

### 9.1 UI/UX Patterns
- **Status Badges**: Use icon + text for clarity (Phone icon for "contacted", etc)
- **Time Display**: Show relative time with absolute time in tooltip
- **Mobile Optimization**: Header stays fixed, proper touch targets, responsive text
- **Color Coding**: Green for recent, yellow for older, red for urgent
- **Client Cards**: Show tradie info prominently, job type as title
- **Tradie Cards**: Show customer name, value, urgency prominently

### 10. Project-Specific Context
- **Australian market focus** - use Australian terminology
- **Mobile-first design** - tradies use phones primarily
- **Multi-tenant architecture** - always filter by tenant/client
- **Production URL**: https://lovable.dev/projects/17ebc76a-2297-472d-aba2-aae2d54dd873

### 11. Notification System & Job Updates
- **Visual Indicators**: Updated jobs show blue "Updated" badge and ring highlight
- **SMS Notifications**: Sent via Twilio when clients update job details
- **Edge Function**: `send-job-update-sms` handles SMS sending
- **Notification Logs**: All notifications tracked in `notification_logs` table
- **Client Editing**: Clients can edit location and description for "new" status jobs
- **Real-time Updates**: Dashboard subscribes to changes for instant updates

#### Update Flow
1. Client edits job (location/description) in JobCard view
2. System updates job and triggers edge function
3. SMS sent to tradie if Twilio configured
4. Dashboard shows visual indicators for 24 hours
5. All updates logged with timestamps

#### SMS Requirements
- Requires Twilio credentials in Settings → Twilio tab
- Without Twilio, only visual indicators work
- SMS format: "Job Update: [Customer] updated their [Type] request..."

## Quick Reference

### When Starting Work
1. Check current branch and status
2. **FIRST**: Check for .env.local file with `ls -la .env*`
3. **SECOND**: Run validation check: `npm run validate` or `/validate`
   - This checks environment, database, constraints, migrations, etc.
   - **NEW**: Now includes migration sync validation (malformed, duplicates, mismatches)
   - Use `npm run validate:fix` to auto-fix issues (including migration repairs)
   - Use `/validate migrations` to check only migration sync
4. **THIRD**: Sync remote migrations with `supabase db pull` if needed
5. **CHECK SERVER**: Run `lsof -i :8080` to see if dev server is already running
   - If running, use existing server at http://localhost:8080
   - If not running, then run `npm run dev` to start server
6. Open DevToolsPanel to test logins
7. Use `./bin/sdb-push` if database changes are needed

### When Database Issues Occur
1. Check .env.local has correct PGPASSWORD
2. Run `source .env.local && echo $PGPASSWORD` to verify
3. Use `./bin/sdb-push` to sync database
4. Generate fresh types with `./bin/sdb-types`
5. **CRITICAL**: If you get constraint violations, check the actual database constraints:
   - The error message tells you exactly which constraint failed
   - Database constraints may not match your migration files
   - Always verify constraints are actually applied

### When Auth Issues Occur
1. Check user profile exists in profiles table
2. Verify user_type is set correctly
3. Check RLS policies aren't blocking access
4. Use DevToolsPanel to test different user types

## Recent Updates & Features

### Dashboard Improvements (Aug 2025)
- **Timezone Support**: All timestamps display in user's local timezone
- **Status Icons**: Visual icons added to status badges for better clarity
- **Mobile UI Fixes**: Resolved header wrapping, font sizing, and filter layout issues
- **Client Dashboard**: Removed tradie-focused stats, added job summary card
- **Job Updates**: Clients can edit location/description on "new" jobs
- **Update Notifications**: SMS alerts + visual indicators for job changes
- **Branding**: Changed from "TradiePro" to "TradieText"

### Key UI Components
- **Badge Components**: Used instead of emojis for professional appearance
- **Responsive Design**: Mobile-first with proper breakpoints (xs:475px+)
- **Filter Dropdown**: Functional status filter with all job states
- **Message Button**: Direct SMS to tradie from client dashboard

## Emergency Fixes (When Everything is Broken)

### Profile Timeout (42P17 Error - Infinite Recursion)
```sql
-- Nuclear fix - just make profiles readable by all authenticated users
DROP POLICY IF EXISTS "profiles_tradie_view_all" ON profiles;
DROP POLICY IF EXISTS "profiles_tradie_view_all_temp" ON profiles;
DROP POLICY IF EXISTS "profiles_tradie_view_all_fixed" ON profiles;
CREATE POLICY "profiles_authenticated_read" ON profiles 
FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
```

### Client Can't See Jobs
```sql
-- Let all authenticated users see jobs temporarily
DROP POLICY IF EXISTS "jobs_clients_view_own" ON jobs;
CREATE POLICY "jobs_authenticated_view" ON jobs 
FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- Give test client a phone that matches jobs
UPDATE profiles SET phone = '+61423456789'
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'testclient@dev.local');
```

### When to Use SQL vs Code Fixes
- **Use SQL for**: Initial setup, migrations, indexes
- **Use CODE for**: Business logic, UI behavior, data filtering
- **AVOID SQL for**: Complex RLS policies, frequent data updates, UI-driven changes

## Common Issues & Solutions

### 🆕 Quick Fix for Migration Issues
If you're getting migration sync errors, run:
```bash
npm run validate:fix              # Auto-fixes most issues
./scripts/fix-migration-sync.sh repair  # Dedicated migration repair
```

### Session Startup Issues
**VERY COMMON**: Every new session encounters these errors:
```bash
Error: (eval):source:1: no such file or directory: .env.local
Error: Remote migration versions not found in local migrations directory
```

**Solution Steps (IN ORDER):**
1. **Check for .env.local**: `ls -la .env*`
   - If missing, you need the PGPASSWORD and project secrets
   - Create .env.local with required environment variables
2. **Sync remote migrations**: `supabase db pull`
   - This downloads missing migration files from remote database
   - Always run this before attempting sdb-push
3. **Then proceed**: `sdb-push` should work after syncing

**Prevention:**
- Always run `supabase db pull` at start of each session
- Keep .env.local in .gitignore but backed up elsewhere
- Add this to daily startup checklist

### RLS Policy Infinite Recursion (42P17 Error)
- **Symptom**: 
  - PostgreSQL error code 42P17 (invalid_object_definition)
  - Profile fetch timeouts (20+ seconds)
  - "infinite recursion detected in policy" errors
  - Customer dashboard not loading jobs
  - 500 errors when accessing protected resources
  
- **Root Cause**: 
  - Using `auth.uid()` directly in profiles table RLS policies causes PostgreSQL to recursively evaluate the policy
  - The database tries to check the policy to access profiles, which requires checking the policy, creating an infinite loop
  
- **The Fix - CRITICAL PATTERN**:
  ```sql
  -- ❌ WRONG - Causes recursion
  CREATE POLICY "profiles_select" ON profiles
    USING (auth.uid() = user_id);
  
  -- ✅ CORRECT - Prevents recursion
  CREATE POLICY "profiles_select" ON profiles
    USING ((SELECT auth.uid()) = user_id);
  ```
  
- **Why This Works**:
  - `(SELECT auth.uid())` creates a subquery that evaluates once
  - PostgreSQL caches the result and doesn't re-evaluate for each row
  - This breaks the recursion cycle
  
- **Quick Detection**:
  ```bash
  # Run validation to detect RLS recursion
  npm run validate
  
  # Or check specifically
  psql -f scripts/validate-rls-policies.sql
  ```
  
- **Quick Fix**:
  ```bash
  # Auto-fix RLS recursion issues
  npm run validate:fix
  
  # Or run the fix script directly
  psql -f scripts/fix-rls-recursion.sql
  ```
  
- **Prevention**:
  - ALWAYS use `(SELECT auth.uid())` in profiles table policies
  - Run validation after any RLS policy changes
  - Test with actual user sessions, not just service role

### Migration Sync Issues (COMPREHENSIVE)
**Common Problems & Solutions:**

#### 1. Malformed Migrations (e.g., `20250801` without timestamp)
- **Symptom**: "Remote migration versions not found" that won't go away
- **Cause**: Migration entry missing timestamp (just YYYYMMDD instead of YYYYMMDDHHMMSS)
- **Fix**:
  ```sql
  -- Run in Supabase SQL Editor
  DELETE FROM supabase_migrations.schema_migrations 
  WHERE version ~ '^[0-9]{8}$';
  ```
- **Prevention**: Always use full timestamps in migration names

#### 2. Duplicate Migration Entries
- **Symptom**: Confusing migration status, sync errors
- **Cause**: Same version appears multiple times in migration table
- **Fix**:
  ```sql
  -- Removes duplicates, keeps oldest
  DELETE FROM supabase_migrations.schema_migrations 
  WHERE version = 'YOUR_VERSION' 
  AND ctid NOT IN (
    SELECT MIN(ctid) FROM supabase_migrations.schema_migrations 
    WHERE version = 'YOUR_VERSION'
  );
  ```

#### 3. Local-Remote Mismatch
- **Symptom**: "Found local migration files to be inserted before the last migration"
- **Fix Options**:
  - Quick: `supabase db push --include-all`
  - Repair: `supabase migration repair --status applied YYYYMMDDHHMMSS`
  - Auto: `./scripts/fix-migration-sync.sh repair`

#### 4. Quick Migration Validation & Repair
```bash
# Check migration sync status
npm run validate                    # Full validation including migrations
npm run validate migrations         # Just migration checks
./scripts/fix-migration-sync.sh check  # Detailed migration status

# Auto-repair most issues
npm run validate:fix                # Includes migration repair
./scripts/fix-migration-sync.sh repair # Dedicated migration repair

# Manual fixes when needed
# 1. Apply SQL in Supabase Dashboard
# 2. Then: ./bin/sdb-types to regenerate types
```

#### 5. Daily Migration Workflow
```bash
# Start of session - ALWAYS
supabase db pull                    # Get remote migrations
npm run validate                    # Check everything is synced

# Before pushing changes
./bin/sdb-push                      # Will show if issues exist

# If issues occur
./scripts/fix-migration-sync.sh repair  # Auto-fix most problems
```

### Database Constraint Violations (NEW!)
- **Symptom**: "new row for relation 'jobs' violates check constraint" errors
- **Cause**: Code expects values that database constraint doesn't allow
- **Fix**:
  1. Run `scripts/validate-constraints.sql` in Supabase SQL Editor
  2. Check actual constraint definition vs expected values
  3. Update constraint if needed: `ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;`
  4. Add correct constraint with all needed values
- **Prevention**: Always test new status/enum values by actually using them in the UI

### Valid Database Constraints
- **Job statuses**: 'new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled'
  - ⚠️ NOTE: Database previously had different constraint than code expected
  - ALWAYS verify with: `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'jobs'::regclass AND contype = 'c';`
- **Urgency levels**: 'low', 'medium', 'high', 'urgent'
- **User types**: 'client', 'tradie'
- **tenant_sms_templates.template_type**: 'missed_call', 'after_hours', 'new_job', 'job_update', 'reminder'
- **job_photos.upload_status**: Limited values (check constraint before bulk inserts)

### SQL CTE Scope
- CTEs in PostgreSQL are scoped to single statements
- Cannot share CTEs across multiple INSERT/UPDATE statements
- Each statement needs its own WITH clause

## Test Data Management

### Overview
The project includes a comprehensive test data management system accessible through the Dev Drawer.

### Key Components
- **SQL Functions** (`/scripts/test-data-functions-v2.sql`, `/scripts/client-test-data-functions.sql`):
  - `create_test_job_for_current_user()` - Creates jobs with time offsets
  - `create_test_client_jobs()` - Creates client-submitted jobs
  - `clear_current_user_test_data()` - Cleans up test data
  - Uses `auth.uid()` to avoid permission issues

- **TypeScript Library** (`/src/lib/test-data-manager.ts`):
  - Wrapper for SQL functions
  - Preset configurations for quick testing
  - Random job generator for bulk data

- **UI Components**:
  - `TestDataManager.tsx` - Main test data UI with 3 tabs (Quick Actions, Custom Job, Stats)
  - `ClientTestDataManager.tsx` - Client-specific test tools
  - Integrated into Dev Drawer (Cmd+K)

### Dev Users
- `testadmin@dev.local` (password: test123) - Admin dashboard access
- `testtradie@dev.local` (password: test123) - Tradie dashboard, jobs
- `testclient@dev.local` (password: test123) - Client dashboard, multi-tradie support

### Usage
1. Open Dev Drawer (Cmd+K)
2. Navigate to Test Data tab
3. Use Quick Actions for bulk operations or Custom Job for specific scenarios
4. Time slider allows creating jobs from past (up to 30 days)

### Testing with Different Roles
1. Use test accounts to verify role-specific features
2. Client accounts can view jobs submitted to tradies
3. Test data functions adapt based on current user type
4. Time-based testing available through Dev Drawer

## Testing

The project has a comprehensive test suite. When making changes:

### Running Tests
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Requirements
- All new features must have tests
- Maintain 80% code coverage
- Test both happy and error paths
- E2E tests for critical workflows

### Test Files
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`
- Test utilities: `tests/helpers/`, `tests/mocks/`

### Before Committing
Always run tests to ensure nothing is broken:
```bash
npm test
npm run lint
```

## Custom Slash Commands

### Available Commands
Claude Code supports custom slash commands for quick actions:

- `/docs` - Quick check of what files have changed
- `/update-docs` - Full documentation update process (analyzes changes and updates all docs)
- `/git` - Complete git workflow: commit, auto-tag, and push to GitHub

### Command Details

- **`/docs`**: Just runs the script to show changed files. Quick way to see what's been modified.
- **`/update-docs`**: Full process - runs script, analyzes changes, updates documentation, and stages updates.
- **`/git [message]`**: All-in-one git workflow that:
  - Shows current status and changes
  - Stages all files
  - Commits with your message (or auto-generates one)
  - Auto-increments version tag (v1.0.1 → v1.0.2)
  - Pushes both commits and tags to GitHub
  - Shows summary with links
  
  Example: `/git Fixed authentication bug and updated tests`

### Adding New Slash Commands
1. **Location**: Commands must be placed in `~/.claude/commands/` (personal) or `.claude/commands/` (project)
2. **Format**: Create a `.md` file with the command name (e.g., `mycommand.md` becomes `/mycommand`)
3. **Structure**:
   ```markdown
   ---
   description: "Brief description of command"
   allowed-tools: ["bash", "read", "write", "edit"]
   ---
   
   # Command Title
   
   Your prompt here. Use $ARGUMENTS for dynamic input.
   ```
4. **Activation**: Restart Claude Code after adding new commands
5. **Testing**: Type `/` to see all available commands

### Example Command File
```markdown
---
description: "Run project tests"
allowed-tools: ["bash"]
---

Run the test suite with: npm test $ARGUMENTS
```

### Troubleshooting
- Commands not showing? Restart Claude Code
- Check file permissions: `ls -la ~/.claude/commands/`
- Ensure `.md` extension on command files
- Personal commands in `~/.claude/commands/` work more reliably

## Database Constraint Best Practices (LEARNED THE HARD WAY)

### The Problem We Hit
- Code tried to use status values that the database constraint didn't allow
- Migration files existed but weren't applied to production
- Error only showed up when users tried to update job status
- Wasted time debugging because we assumed migrations were applied

### How to Prevent This
1. **Before Any Status/Enum Changes**:
   ```sql
   -- Check current constraints in Supabase SQL Editor
   SELECT 
     conname AS constraint_name,
     pg_get_constraintdef(oid) AS constraint_definition
   FROM pg_constraint 
   WHERE conrelid = 'jobs'::regclass AND contype = 'c';
   ```

2. **After Writing Migration Files**:
   - Don't assume `./bin/sdb-push` worked
   - Manually verify in Supabase SQL Editor
   - Test the actual constraint with a dummy update

3. **When Adding New Status Values**:
   - Update constraint in migration
   - Update TypeScript types
   - Update any UI dropdowns/buttons
   - TEST by actually clicking the button

4. **Create Validation Scripts**:
   ```bash
   # Add to scripts/validate-constraints.sql
   -- This shows all constraints vs what code expects
   ```

### Key Lesson
**NEVER trust that database constraints match your code**. Always verify, especially after deployments or migrations. The database is the source of truth, not your migration files.

## Comprehensive Validation System (NEW!)

### Quick Validation Commands
```bash
# Basic validation check
npm run validate
# Or use slash command: /validate

# Auto-fix common issues
npm run validate:fix
# Or: /validate fix

# Detailed verbose output
npm run validate:verbose
# Or: /validate verbose

# Complete validation suite
npm run validate:all
# Or: /validate all
```

### What Gets Validated
The validation system checks **45+ individual items** across 11 categories:
1. **Environment Variables** - All required secrets and configs
2. **Database Connectivity** - Connection and permissions
3. **Database Constraints** - Status values, urgency levels, etc.
4. **Migration Status** - Schema sync and type generation
5. **Security Configuration** - RLS policies, API keys
6. **Build System** - Dependencies and TypeScript
7. **Test Configuration** - Test setup and coverage
8. **Edge Functions** - SMS functions deployment
9. **API Endpoints** - REST API health
10. **Data Integrity** - Orphaned records, foreign keys
11. **Performance** - Indexes and query optimization

### When to Run Validation
- **Always at session start** - Catch issues early
- **Before deployments** - Ensure production readiness
- **After migrations** - Verify constraints applied
- **When debugging** - Find configuration issues
- **In CI/CD** - Automated quality gates

## Sentry Error Monitoring (IMPORTANT)

### Setup Complete
Sentry is fully configured for error tracking and performance monitoring:
- **Organization**: melon-36
- **Project**: javascript-react
- **DSN**: Already hardcoded in `/src/lib/sentry.ts`
- **Dashboard**: https://melon-36.sentry.io/issues/

### Key Configuration
- **Source Maps**: Automatically uploaded on production builds
- **Auth Token**: `SENTRY_AUTH_TOKEN=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`
  - Add this to Netlify environment variables for production deployments
  - Already in `.env.local` for local builds

### Known Issues & Fixes
- **`__WS_TOKEN__` Error**: If you get this error, the `lovable-tagger` component is causing issues
  - Fix: Comment out `componentTagger()` in `vite.config.ts`
  - This is already disabled to prevent the error

### What's Being Tracked
- JavaScript errors (automatic)
- Unhandled promise rejections
- Network failures
- Performance metrics (10% sampling in production)
- Session replays for errors
- User context (when logged in)

### Testing Sentry
1. **Test Page**: Visit `/sentry-test` in development
2. **Quick Console Test**:
   ```javascript
   throw new Error('Test error - ' + Date.now())
   ```
3. **Check Dashboard**: Errors appear at https://melon-36.sentry.io/issues/

### Security Headers & Protection
- **CSP Headers**: Configured in `netlify.toml` with Sentry domains allowed
- **Robots.txt**: Blocks all search engines from indexing
- **X-Robots-Tag**: Additional protection against indexing
- **Password Protection**: Active via `PasswordProtect` component
- **Dev Tools**: Only visible in development (`import.meta.env.DEV`)

### For Production Deployment
1. Add `SENTRY_AUTH_TOKEN` to Netlify environment variables
2. Source maps will auto-upload during build
3. Errors will be tracked with full stack traces
4. Monitor at: https://melon-36.sentry.io/issues/

## Remember
This is a business-critical application for tradies' livelihoods. Always prioritize:
- Reliability over features
- Security over convenience  
- Mobile experience over desktop
- Simplicity over complexity