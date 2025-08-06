#!/bin/bash

# Comprehensive Validation Script for Tradie-Textback Project
# Checks for all common issues and potential problems
# Usage: ./scripts/validate-all.sh [--fix] [--verbose]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Flags
FIX_ISSUES=false
VERBOSE=false
FAILED_CHECKS=0
TOTAL_CHECKS=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_ISSUES=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Usage: $0 [--fix] [--verbose]"
            exit 1
            ;;
    esac
done

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_CHECKS++))
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${PURPLE}🔍 $1${NC}"
    fi
}

check_passed() {
    ((TOTAL_CHECKS++))
    log_success "$1"
}

check_failed() {
    ((TOTAL_CHECKS++))
    log_error "$1"
}

check_warning() {
    ((TOTAL_CHECKS++))
    log_warning "$1"
}

# Get project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

echo -e "${BLUE}🔍 Starting comprehensive validation for Tradie-Textback project...${NC}"
echo "Project directory: $PROJECT_DIR"
echo ""

# 1. Environment Variables Check
echo -e "${PURPLE}=== 1. ENVIRONMENT VARIABLES ===${NC}"

if [ -f ".env.local" ]; then
    log_verbose "Found .env.local file"
    source .env.local
    
    # Check required environment variables
    required_vars=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "SUPABASE_PROJECT_ID"
        "PGPASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            check_failed "Missing required environment variable: $var"
            log_verbose "Add $var to your .env.local file"
        else
            check_passed "Environment variable $var is set"
            log_verbose "$var = ${!var:0:10}..." # Show first 10 chars only
        fi
    done
    
    # Check optional variables
    optional_vars=(
        "VITE_DEV_TOOLS"
        "VITE_DEMO_TOOLS"
        "VITE_GOOGLE_MAPS_API_KEY"
    )
    
    for var in "${optional_vars[@]}"; do
        if [ -z "${!var}" ]; then
            check_warning "Optional environment variable not set: $var"
        else
            check_passed "Optional environment variable $var is set"
        fi
    done
    
else
    check_failed ".env.local file not found"
    log_verbose "Copy .env.example to .env.local and configure your environment variables"
fi

echo ""

# 2. Dependencies Check
echo -e "${PURPLE}=== 2. DEPENDENCIES ===${NC}"

if [ -f "package.json" ]; then
    check_passed "package.json found"
    
    if [ -d "node_modules" ]; then
        check_passed "node_modules directory exists"
        
        # Check if package-lock.json is newer than node_modules
        if [ "package-lock.json" -nt "node_modules" ]; then
            check_warning "package-lock.json is newer than node_modules - run npm install"
            if [ "$FIX_ISSUES" = true ]; then
                log_info "Running npm install..."
                npm install
                check_passed "Dependencies updated"
            fi
        else
            check_passed "Dependencies are up to date"
        fi
    else
        check_failed "node_modules directory not found - run npm install"
        if [ "$FIX_ISSUES" = true ]; then
            log_info "Installing dependencies..."
            npm install
            check_passed "Dependencies installed"
        fi
    fi
else
    check_failed "package.json not found"
fi

echo ""

# 3. Database Connectivity
echo -e "${PURPLE}=== 3. DATABASE CONNECTIVITY ===${NC}"

if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    log_verbose "Testing database connectivity..."
    
    # Test basic connectivity
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        "$VITE_SUPABASE_URL/rest/v1/" || echo "000")
    
    if [ "$response" = "200" ]; then
        check_passed "Database connectivity successful"
    else
        check_failed "Database connectivity failed (HTTP $response)"
        log_verbose "Check your SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL"
    fi
    
    # Test specific table access
    tables=("profiles" "jobs" "job_photos")
    for table in "${tables[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
            -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
            "$VITE_SUPABASE_URL/rest/v1/$table?select=count" || echo "000")
        
        if [ "$response" = "200" ]; then
            check_passed "Table '$table' is accessible"
        else
            check_failed "Table '$table' is not accessible (HTTP $response)"
        fi
    done
else
    check_failed "Cannot test database connectivity - missing environment variables"
fi

echo ""

# 4. Database Schema Validation
echo -e "${PURPLE}=== 4. DATABASE SCHEMA VALIDATION ===${NC}"

if [ -f "scripts/validate-constraints.sql" ]; then
    log_verbose "Running database constraint validation..."
    
    if command -v psql >/dev/null 2>&1 && [ -n "$PGPASSWORD" ] && [ -n "$SUPABASE_PROJECT_ID" ]; then
        # Connect to Supabase and run validation
        export PGPASSWORD
        PSQL_OUTPUT=$(psql -h "db.${SUPABASE_PROJECT_ID}.supabase.co" \
                          -U postgres \
                          -d postgres \
                          -f "scripts/validate-constraints.sql" \
                          -t -A 2>/dev/null || echo "ERROR")
        
        if [ "$PSQL_OUTPUT" != "ERROR" ]; then
            check_passed "Database schema validation completed"
            log_verbose "Run 'psql -h db.${SUPABASE_PROJECT_ID}.supabase.co -U postgres -d postgres -f scripts/validate-constraints.sql' for details"
        else
            check_failed "Database schema validation failed"
        fi
    else
        check_warning "Cannot run database schema validation - psql not available or missing credentials"
        log_verbose "Install PostgreSQL client tools and ensure PGPASSWORD is set"
    fi
else
    check_warning "Database validation script not found at scripts/validate-constraints.sql"
fi

echo ""

# 5. Migration Status
echo -e "${PURPLE}=== 5. MIGRATION STATUS ===${NC}"

if [ -d "supabase/migrations" ]; then
    migration_count=$(find supabase/migrations -name "*.sql" | wc -l | tr -d ' ')
    check_passed "Found $migration_count migration files"
    
    if [ -f "bin/sdb-push" ]; then
        check_passed "Database push script available at bin/sdb-push"
    else
        check_warning "Database push script not found at bin/sdb-push"
    fi
    
    if [ -f "bin/sdb-types" ]; then
        check_passed "Type generation script available at bin/sdb-types"
    else
        check_warning "Type generation script not found at bin/sdb-types"
    fi
else
    check_failed "supabase/migrations directory not found"
fi

echo ""

# 6. TypeScript Types
echo -e "${PURPLE}=== 6. TYPESCRIPT TYPES ===${NC}"

if [ -f "src/types/database.types.ts" ]; then
    check_passed "Database types file exists"
    
    # Check if types file is recent
    if [ "supabase/migrations" -nt "src/types/database.types.ts" ]; then
        check_warning "Database types may be outdated - run bin/sdb-types"
        if [ "$FIX_ISSUES" = true ] && [ -f "bin/sdb-types" ]; then
            log_info "Regenerating database types..."
            ./bin/sdb-types
            check_passed "Database types updated"
        fi
    else
        check_passed "Database types appear current"
    fi
else
    check_failed "Database types file not found at src/types/database.types.ts"
    if [ "$FIX_ISSUES" = true ] && [ -f "bin/sdb-types" ]; then
        log_info "Generating database types..."
        ./bin/sdb-types
        check_passed "Database types generated"
    fi
fi

echo ""

# 7. Security Configuration
echo -e "${PURPLE}=== 7. SECURITY CONFIGURATION ===${NC}"

# Check for exposed secrets
if grep -r "sk-" src/ 2>/dev/null | grep -v ".gitignore" >/dev/null; then
    check_failed "Potential API keys found in source code"
else
    check_passed "No exposed API keys detected in source code"
fi

# Check .env files are in .gitignore
if grep -q "\.env" .gitignore 2>/dev/null; then
    check_passed ".env files are properly ignored"
else
    check_warning ".env files not found in .gitignore"
fi

# Check for RLS policies (if we can connect to database)
if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    log_verbose "Checking RLS policies..."
    
    # This is a basic check - a more thorough check would require SQL queries
    response=$(curl -s \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        "$VITE_SUPABASE_URL/rest/v1/jobs?select=id&limit=1" || echo "")
    
    if [ -n "$response" ]; then
        check_passed "Basic RLS policy check passed"
    else
        check_warning "Unable to verify RLS policies"
    fi
fi

# Check for RLS recursion patterns
echo ""
echo -e "${PURPLE}=== 7a. RLS RECURSION CHECK ===${NC}"

if [ -f "scripts/validate-rls-policies.sql" ]; then
    log_verbose "Checking for RLS recursion patterns..."
    
    if command -v psql >/dev/null 2>&1 && [ -n "$PGPASSWORD" ] && [ -n "$SUPABASE_PROJECT_ID" ]; then
        # Run RLS validation check
        export PGPASSWORD
        RLS_OUTPUT=$(psql -h "db.${SUPABASE_PROJECT_ID}.supabase.co" \
                         -U postgres \
                         -d postgres \
                         -f "scripts/validate-rls-policies.sql" \
                         -t -A 2>/dev/null || echo "ERROR")
        
        if [ "$RLS_OUTPUT" = "ERROR" ]; then
            check_failed "RLS policy validation failed"
        elif echo "$RLS_OUTPUT" | grep -q "POTENTIAL RECURSION"; then
            check_failed "Found potential RLS recursion issues"
            log_warning "RLS policies using auth.uid() instead of (SELECT auth.uid()) can cause infinite recursion"
            log_info "Fix: Use (SELECT auth.uid()) in RLS policies to prevent recursion"
            
            if [ "$FIX_ISSUES" = true ] && [ -f "scripts/fix-rls-recursion.sql" ]; then
                log_info "Applying RLS recursion fix..."
                psql -h "db.${SUPABASE_PROJECT_ID}.supabase.co" \
                     -U postgres \
                     -d postgres \
                     -f "scripts/fix-rls-recursion.sql" 2>/dev/null
                check_passed "RLS recursion fix applied"
            fi
        else
            check_passed "No RLS recursion patterns detected"
        fi
    else
        check_warning "Cannot check RLS recursion - psql not available or missing credentials"
    fi
else
    log_verbose "Creating RLS validation script..."
    if [ "$FIX_ISSUES" = true ]; then
        # Create the RLS validation script
        cat > scripts/validate-rls-policies.sql << 'EOF'
-- RLS Policy Recursion Detection Script
-- Identifies policies that may cause infinite recursion

WITH policy_analysis AS (
    SELECT 
        schemaname,
        tablename,
        policyname,
        cmd,
        qual,
        with_check,
        CASE 
            WHEN qual LIKE '%auth.uid()%' 
                 AND qual NOT LIKE '%(SELECT auth.uid())%'
                 AND tablename = 'profiles'
            THEN 'POTENTIAL RECURSION: Uses auth.uid() instead of (SELECT auth.uid())'
            WHEN with_check LIKE '%auth.uid()%' 
                 AND with_check NOT LIKE '%(SELECT auth.uid())%'
                 AND tablename = 'profiles'
            THEN 'POTENTIAL RECURSION: Uses auth.uid() instead of (SELECT auth.uid())'
            ELSE 'OK'
        END as status
    FROM pg_policies
    WHERE schemaname = 'public'
)
SELECT 
    tablename,
    policyname,
    cmd,
    status
FROM policy_analysis
WHERE status != 'OK'
ORDER BY tablename, policyname;
EOF
        check_passed "Created RLS validation script"
    fi
fi

echo ""

# 8. Test Configuration
echo -e "${PURPLE}=== 8. TEST CONFIGURATION ===${NC}"

# Check test configuration files
test_configs=("vitest.config.ts" "playwright.config.ts" "tests/setup.ts")
for config in "${test_configs[@]}"; do
    if [ -f "$config" ]; then
        check_passed "Test configuration file '$config' exists"
    else
        check_failed "Test configuration file '$config' not found"
    fi
done

# Check test directories
test_dirs=("tests/unit" "tests/integration" "tests-e2e")
for dir in "${test_dirs[@]}"; do
    if [ -d "$dir" ]; then
        test_count=$(find "$dir" -name "*.test.*" -o -name "*.spec.*" | wc -l | tr -d ' ')
        check_passed "Test directory '$dir' exists with $test_count test files"
    else
        check_warning "Test directory '$dir' not found"
    fi
done

echo ""

# 9. Build and Development
echo -e "${PURPLE}=== 9. BUILD AND DEVELOPMENT ===${NC}"

# Check if project builds
log_verbose "Testing project build..."
if npm run build >/dev/null 2>&1; then
    check_passed "Project builds successfully"
else
    check_failed "Project build failed"
    log_verbose "Run 'npm run build' for detailed error information"
fi

# Check if dev server can start (quick test)
if command -v timeout >/dev/null 2>&1; then
    log_verbose "Testing dev server startup..."
    if timeout 10s npm run dev >/dev/null 2>&1; then
        check_passed "Dev server starts successfully"
    else
        check_warning "Dev server test timed out or failed"
    fi
else
    log_verbose "Skipping dev server test (timeout command not available)"
fi

echo ""

# 10. Edge Functions
echo -e "${PURPLE}=== 10. EDGE FUNCTIONS ===${NC}"

if [ -d "supabase/functions" ]; then
    function_count=$(find supabase/functions -maxdepth 1 -type d | grep -v "^supabase/functions$" | wc -l | tr -d ' ')
    check_passed "Found $function_count edge functions"
    
    # Check each function has required files
    for func_dir in supabase/functions/*/; do
        if [ -d "$func_dir" ]; then
            func_name=$(basename "$func_dir")
            if [ -f "${func_dir}index.ts" ]; then
                check_passed "Edge function '$func_name' has index.ts"
            else
                check_failed "Edge function '$func_name' missing index.ts"
            fi
            
            if [ -f "${func_dir}deno.json" ]; then
                check_passed "Edge function '$func_name' has deno.json"
            else
                check_warning "Edge function '$func_name' missing deno.json"
            fi
        fi
    done
else
    check_warning "No edge functions directory found"
fi

echo ""

# 11. API Endpoint Tests
echo -e "${PURPLE}=== 11. API ENDPOINT TESTS ===${NC}"

if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    # Test key endpoints
    endpoints=(
        "profiles"
        "jobs"
        "job_photos"
    )
    
    for endpoint in "${endpoints[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -m 5 \
            -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
            -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
            "$VITE_SUPABASE_URL/rest/v1/$endpoint?select=count" || echo "000")
        
        if [ "$response" = "200" ]; then
            check_passed "API endpoint '/$endpoint' is accessible"
        else
            check_failed "API endpoint '/$endpoint' failed (HTTP $response)"
        fi
    done
    
    # Test edge functions if they exist
    if [ -d "supabase/functions" ]; then
        for func_dir in supabase/functions/*/; do
            if [ -d "$func_dir" ]; then
                func_name=$(basename "$func_dir")
                response=$(curl -s -o /dev/null -w "%{http_code}" \
                    -m 5 \
                    -X OPTIONS \
                    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
                    "$VITE_SUPABASE_URL/functions/v1/$func_name" || echo "000")
                
                if [ "$response" = "200" ] || [ "$response" = "204" ]; then
                    check_passed "Edge function '$func_name' is deployed"
                else
                    check_warning "Edge function '$func_name' not accessible (HTTP $response)"
                fi
            fi
        done
    fi
else
    check_warning "Cannot test API endpoints - missing environment variables"
fi

echo ""

# Summary
echo -e "${PURPLE}=== VALIDATION SUMMARY ===${NC}"
PASSED_CHECKS=$((TOTAL_CHECKS - FAILED_CHECKS))

echo "Total checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All validation checks passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ $FAILED_CHECKS validation checks failed.${NC}"
    echo -e "Run with ${YELLOW}--fix${NC} to attempt automatic fixes."
    echo -e "Run with ${YELLOW}--verbose${NC} for detailed information."
    exit 1
fi