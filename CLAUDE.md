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
- **Two user types**: 'client' (tradies who receive jobs) and 'tradie' (admin users)
  - NOTE: This naming is confusing and should be refactored in future
- **Magic link authentication only** - no passwords
- **Dev tools provide quick login** for testing both user types
- **User profiles have user_type field** that determines access levels

### 3. Development Server
- **Default port is 8080** (configured in vite.config.ts)
- **Never hardcode ports** - use dynamic port detection
- **Dev tools should use**: `window.location.port || '8080'`
- **Server may use different ports** if 8080 is busy

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

### 10. Project-Specific Context
- **Australian market focus** - use Australian terminology
- **Mobile-first design** - tradies use phones primarily
- **Multi-tenant architecture** - always filter by tenant/client
- **Production URL**: https://lovable.dev/projects/17ebc76a-2297-472d-aba2-aae2d54dd873

## Quick Reference

### When Starting Work
1. Check current branch and status
2. Run `npm run dev` to start server
3. Open DevToolsPanel to test logins
4. Use `sdb-push` if database changes are needed

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

## Common Issues & Solutions

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