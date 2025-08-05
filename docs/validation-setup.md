# Validation System Setup and Usage

This document explains how to set up and use the comprehensive validation system for the tradie-textback project.

## Overview

The validation system includes three main components:

1. **Bash Script** (`scripts/validate-all.sh`) - Comprehensive system validation
2. **TypeScript Test Suite** (`tests/validation.test.ts`) - Programmatic validation with detailed reporting
3. **NPM Scripts** - Easy-to-use commands for different validation scenarios

## Quick Start

```bash
# Run basic validation
npm run validate

# Run validation with automatic fixes
npm run validate:fix

# Run detailed validation with verbose output
npm run validate:verbose

# Run TypeScript validation tests
npm run test:validation

# Run both bash and TypeScript validation
npm run validate:all
```

## Available Commands

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run validate` | Run basic validation checks |
| `npm run validate:fix` | Run validation with automatic fixes |
| `npm run validate:verbose` | Run validation with detailed output |
| `npm run test:validation` | Run TypeScript validation test suite |
| `npm run validate:all` | Run both bash and TypeScript validation |

### Direct Script Usage

```bash
# Basic validation
./scripts/validate-all.sh

# With automatic fixes
./scripts/validate-all.sh --fix

# With verbose output
./scripts/validate-all.sh --verbose

# Both flags
./scripts/validate-all.sh --fix --verbose
```

## Setting Up /validate Slash Command

To create a `/validate` slash command in your development environment, follow these steps:

### Option 1: Shell Alias (Recommended)

Add to your shell configuration file (`.bashrc`, `.zshrc`, etc.):

```bash
# Tradie-Textback validation alias
alias /validate='cd /path/to/tradie-textback && npm run validate:all'
alias /validate-fix='cd /path/to/tradie-textback && npm run validate:fix'
alias /validate-verbose='cd /path/to/tradie-textback && npm run validate:verbose'
```

Then reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

Usage:
```bash
/validate          # Run full validation
/validate-fix      # Run with fixes
/validate-verbose  # Run with verbose output
```

### Option 2: Global NPM Script

Create a global command using NPM:

```bash
# Install globally (run from project root)
npm link

# Then use from anywhere
tradie-textback-validate
```

### Option 3: VS Code Task

Add to `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Validate All",
            "type": "shell",
            "command": "npm run validate:all",
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            },
            "problemMatcher": []
        },
        {
            "label": "Validate with Fix",
            "type": "shell",
            "command": "npm run validate:fix",
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            },
            "problemMatcher": []
        }
    ]
}
```

Access via `Ctrl+Shift+P` → "Tasks: Run Task" → "Validate All"

### Option 4: Custom Shell Function

Add to your shell configuration:

```bash
# Advanced validation function
validate() {
    local project_dir="/path/to/tradie-textback"
    local current_dir=$(pwd)
    
    cd "$project_dir" || {
        echo "❌ Could not find tradie-textback project directory"
        return 1
    }
    
    case "${1:-basic}" in
        "fix"|"--fix")
            echo "🔧 Running validation with fixes..."
            npm run validate:fix
            ;;
        "verbose"|"--verbose")
            echo "🔍 Running verbose validation..."
            npm run validate:verbose
            ;;
        "test"|"--test")
            echo "🧪 Running TypeScript validation tests..."
            npm run test:validation
            ;;
        "all"|"--all")
            echo "🚀 Running comprehensive validation..."
            npm run validate:all
            ;;
        *)
            echo "🔍 Running basic validation..."
            npm run validate
            ;;
    esac
    
    cd "$current_dir" || true
}

# Create slash command alias
alias /validate='validate'
```

Usage:
```bash
/validate          # Basic validation
/validate fix      # With fixes
/validate verbose  # Verbose output
/validate test     # TypeScript tests only
/validate all      # Full validation
```

## What Gets Validated

### 1. Environment Variables
- ✅ Required environment variables are set
- ✅ URL formats are valid
- ✅ Optional variables are noted

### 2. Dependencies
- ✅ Node modules are installed
- ✅ Dependencies are up to date
- ✅ Package files are consistent

### 3. Database Connectivity
- ✅ Supabase connection works
- ✅ Service role permissions
- ✅ Table accessibility

### 4. Database Schema
- ✅ Required tables exist
- ✅ Database constraints match expectations
- ✅ Data integrity checks

### 5. Migration Status
- ✅ Migration files are present
- ✅ Database is up to date
- ✅ Type generation is current

### 6. Security Configuration
- ✅ RLS policies are working
- ✅ No exposed secrets
- ✅ Proper key separation

### 7. Test Configuration
- ✅ Test files are configured
- ✅ Test directories exist
- ✅ Coverage setup is working

### 8. Build System
- ✅ Project builds successfully
- ✅ Development server starts
- ✅ Type checking passes

### 9. Edge Functions
- ✅ Functions are deployed
- ✅ Function files are present
- ✅ Configuration is correct

### 10. API Endpoints
- ✅ REST API endpoints respond
- ✅ Authentication works
- ✅ Data access permissions

### 11. Data Integrity
- ✅ No orphaned records
- ✅ Foreign key consistency
- ✅ Constraint violations

## Interpreting Results

### Success Output
```
✅ All validation checks passed!
Total checks: 45
Passed: 45
Failed: 0
```

### Failure Output
```
❌ 3 validation checks failed.
Total checks: 45
Passed: 42
Failed: 3

Run with --fix to attempt automatic fixes.
Run with --verbose for detailed information.
```

### Common Issues and Fixes

| Issue | Description | Auto-Fix Available | Manual Fix |
|-------|-------------|-------------------|------------|
| Missing .env.local | Environment file not found | ❌ | Copy .env.example to .env.local |
| Outdated dependencies | package-lock.json newer than node_modules | ✅ | npm install |
| Outdated types | Database schema changed | ✅ | Run bin/sdb-types |
| Build failure | TypeScript or build errors | ❌ | Fix TypeScript errors |
| Database connectivity | Cannot connect to Supabase | ❌ | Check environment variables |
| Missing migrations | Database schema out of sync | ❌ | Run bin/sdb-push |

## Integration with CI/CD

### GitHub Actions

Add to `.github/workflows/validation.yml`:

```yaml
name: Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run validation
        run: npm run validate:all
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
          PGPASSWORD: ${{ secrets.PGPASSWORD }}
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Running validation checks..."
npm run validate

if [ $? -ne 0 ]; then
    echo "❌ Validation failed. Commit aborted."
    echo "Run 'npm run validate:fix' to attempt fixes."
    exit 1
fi

echo "✅ Validation passed."
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Customization

### Adding Custom Checks

#### Bash Script
Edit `scripts/validate-all.sh` and add your check in a new section:

```bash
# 12. Custom Check
echo -e "${PURPLE}=== 12. CUSTOM CHECK ===${NC}"

if [ -f "your-custom-file.txt" ]; then
    check_passed "Custom file exists"
else
    check_failed "Custom file missing"
fi
```

#### TypeScript Tests
Edit `tests/validation.test.ts` and add a new method:

```typescript
async validateCustomCheck(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Your custom validation logic here
    
    return results;
}
```

### Configuration

The validation system reads configuration from:
- Environment variables (.env.local)
- Package.json scripts
- Supabase configuration (supabase/config.toml)

## Troubleshooting

### Common Permission Issues

```bash
# Make scripts executable
chmod +x scripts/validate-all.sh
chmod +x bin/sdb-push
chmod +x bin/sdb-types
```

### Environment Variable Issues

1. Copy example file: `cp .env.example .env.local`
2. Fill in your actual values
3. Never commit .env.local to version control

### Database Connection Issues

1. Check your Supabase project ID
2. Verify your service role key
3. Ensure your IP is whitelisted in Supabase
4. Test connection manually with psql

### Build Issues

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear TypeScript cache: `npx tsc --build --clean`
3. Update dependencies: `npm update`

## Support

If you encounter issues with the validation system:

1. Run with `--verbose` flag for detailed output
2. Check the troubleshooting section above
3. Review the specific error messages
4. Ensure all prerequisites are installed

The validation system is designed to help catch issues early and maintain project health. Regular use will help prevent common deployment and development problems.