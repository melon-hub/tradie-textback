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
- **ALWAYS use `sdb-push` alias** - NEVER use direct supabase commands
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
# Push database changes (ALWAYS use this)
sdb-push

# Generate TypeScript types
sdb-types

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
- ❌ Don't use `supabase db push` directly - use `sdb-push`
- ❌ Don't hardcode localhost:8082 or any specific port
- ❌ Don't forget to check user_type for conditional rendering
- ❌ Don't mix up "client" (tradie) vs "client" (customer) terminology

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
3. **SECOND**: Sync remote migrations with `supabase db pull`
4. **CHECK SERVER**: Run `lsof -i :8080` to see if dev server is already running
   - If running, use existing server at http://localhost:8080
   - If not running, then run `npm run dev` to start server
5. Open DevToolsPanel to test logins
6. Use `sdb-push` if database changes are needed

### When Database Issues Occur
1. Check .env.local has correct PGPASSWORD
2. Run `source .env.local && echo $PGPASSWORD` to verify
3. Use `sdb-push` to sync database
4. Generate fresh types with `sdb-types`

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

## Common Issues & Solutions

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

### RLS Policy Infinite Recursion
- **Symptom**: 500 errors, "infinite recursion detected in policy"
- **Cause**: Policies that reference themselves (e.g., checking user_type in profiles while selecting from profiles)
- **Fix**: Use simple policies without subqueries to the same table

### Migration File Issues
- **Symptom**: "Remote migration versions not found" errors
- **Cause**: Migration files don't match naming pattern or are out of sync
- **Fix**: 
  - Use format: `YYYYMMDDHHMMSS_description.sql`
  - Run migrations directly in Supabase SQL editor if needed
  - Mark as applied with: `supabase migration repair --status applied YYYYMMDD`

### Valid Database Constraints
- **Job statuses**: 'new', 'in_progress', 'completed', 'cancelled'
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

## Remember
This is a business-critical application for tradies' livelihoods. Always prioritize:
- Reliability over features
- Security over convenience  
- Mobile experience over desktop
- Simplicity over complexity