# TradiePro Documentation

<!-- Updated: 2025-08-03 - Added comprehensive testing infrastructure and updated test coverage info -->

## Overview
This documentation covers the TradiePro missed-call management system for Australian tradies. The system automatically sends SMS responses to missed calls and provides a comprehensive job management dashboard.

## Documentation Structure

### 📌 Critical Documentation
Essential project documentation for development and deployment:
- [CLAUDE.md](critical/CLAUDE.md) - Project rules and guidelines for Claude Code
- [ADMIN_DASHBOARD_PLAN.md](critical/ADMIN_DASHBOARD_PLAN.md) - Admin dashboard implementation roadmap
- [MIGRATION_ISSUES.md](critical/MIGRATION_ISSUES.md) - Database migration sync issues and resolution
- [PERFORMANCE_ISSUES.md](critical/PERFORMANCE_ISSUES.md) - Performance bottlenecks and solutions
- [PRODUCTION_CHECKLIST.md](critical/PRODUCTION_CHECKLIST.md) - Must-do items before production

### 📖 Guides
Step-by-step guides for common tasks:
- [ADMIN_SETUP.md](guides/ADMIN_SETUP.md) - How to set up admin users
- [CLIENT_ONBOARDING.md](guides/CLIENT_ONBOARDING.md) - Onboarding new clients (TO BE CREATED)
- [DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md) - Deployment instructions (TO BE CREATED)
- [MIGRATION_PROCESS.md](guides/MIGRATION_PROCESS.md) - Database migration best practices
- [SUPABASE_DEPLOYMENT_GUIDE.md](guides/SUPABASE_DEPLOYMENT_GUIDE.md) - Supabase-specific deployment
- [TESTING.md](../TESTING.md) - Comprehensive testing guide with unit, integration, and E2E tests
- [TESTING_GUIDE.md](guides/TESTING_GUIDE.md) - Detailed testing implementation guide
- [URGENT_PERFORMANCE_FIX.md](guides/URGENT_PERFORMANCE_FIX.md) - Emergency performance fixes

### 📚 Reference
Historical and reference documents:
- [plan.md](reference/plan.md) - Original project plan
- [prd (1).md](reference/prd%20(1).md) - Product requirements document

### 📊 Status Reports
Current implementation status:
- [ADMIN_DASHBOARD_SUMMARY.md](status/ADMIN_DASHBOARD_SUMMARY.md) - Admin dashboard implementation status

### 🔄 User Flows & Architecture
- [USER_FLOWS.md](USER_FLOWS.md) - ASCII flow diagrams for all user types
- [USER_FLOWS_MERMAID.md](USER_FLOWS_MERMAID.md) - Interactive Mermaid diagrams
- [view-diagrams.html](view-diagrams.html) - Browser-viewable flow diagrams

## Quick Links

### For Developers
1. Start with [CLAUDE.md](critical/CLAUDE.md) for project rules
2. Check [PRODUCTION_CHECKLIST.md](critical/PRODUCTION_CHECKLIST.md) before deploying
3. See [MIGRATION_ISSUES.md](critical/MIGRATION_ISSUES.md) for database sync status

### For Admins
1. [ADMIN_SETUP.md](guides/ADMIN_SETUP.md) - Setting up admin access
2. [ADMIN_DASHBOARD_SUMMARY.md](status/ADMIN_DASHBOARD_SUMMARY.md) - Available features

### For Performance Issues
1. [PERFORMANCE_ISSUES.md](critical/PERFORMANCE_ISSUES.md) - Known issues
2. [URGENT_PERFORMANCE_FIX.md](guides/URGENT_PERFORMANCE_FIX.md) - Quick fixes

## Project Status

### ✅ Completed
- Admin dashboard with user/job management
- Performance optimization (22x improvement)
- Migration sync issues resolved
- Business settings and Twilio configuration UI
- Comprehensive test suite (unit, integration, E2E)
- User flow documentation with diagrams
- Test dashboard for monitoring test results
- Testing infrastructure with Vitest, React Testing Library, Playwright
- Test coverage reporting and thresholds
- Claude Code subagents documentation and tools

### 🚧 In Progress
- Twilio API integration
- Production deployment preparation

### 📋 Pending
- Remove development features (admin toggle)
- Implement JWT claims for better auth
- Fix user type naming (client/tradie confusion)
- Simplify customer experience (remove login requirement)

## Testing Infrastructure

### Test Suite Overview
- **Unit Tests**: 12/14 passing (86% pass rate)
- **E2E Tests**: 42 tests configured (21 desktop + 21 mobile)
- **Test Files**: 4 unit test files, 2 E2E test files  
- **Coverage Target**: 80% lines, functions, statements; 70% branches

### Quick Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for TDD
npm run test:coverage # Generate coverage report
npm run test:e2e      # Run E2E tests
npm run test:dashboard # Open test dashboard
```

### Test Dashboard
Access the comprehensive test dashboard at `tests/test-dashboard.html` for:
- Test suite overview and metrics
- Coverage reporting
- Quick test execution
- Links to detailed reports

## Key Technologies
- **Frontend**: React, TypeScript, Vite, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **SMS**: Twilio (integration pending)
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel/Netlify compatible

## Support
For questions or issues, refer to the documentation or create a GitHub issue.