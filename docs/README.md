# TradieText Documentation

<!-- Updated: 2025-08-03 - Added onboarding system implementation and updated project status -->
<!-- Updated: 2025-08-04 - Completed onboarding phases 3-7, enhanced settings, SMS templates, testing -->
<!-- Updated: 2025-08-04 - Consolidated documentation structure and archived duplicates -->
<!-- Updated: 2025-08-04 - Added project maintenance guide and cleanup documentation -->
<!-- Updated: 2025-08-05 - Added notification system, dashboard UI improvements, client/tradie view updates -->
<!-- Updated: 2025-08-05 - Added comprehensive validation system, Google Maps integration, database constraint fixes -->
<!-- Updated: 2025-08-06 - Enhanced validation with RLS recursion detection, added fix scripts -->
<!-- Updated: 2025-08-06 - Fixed critical RLS recursion issues, cleaned up scripts folder, added Sentry monitoring -->
<!-- Updated: 2025-08-06 - Added RLS security scripts, Google API security measures, dashboard UI improvements -->

## Overview
This documentation covers the TradieText missed-call management system for Australian tradies. The system automatically sends SMS responses to missed calls and provides a comprehensive job management dashboard.

## Documentation Structure

### 📌 Critical Documentation
Essential project documentation for development and deployment:
- [PRODUCTION_CHECKLIST.md](critical/PRODUCTION_CHECKLIST.md) - Comprehensive production readiness checklist
- [database-setup.md](critical/database-setup.md) - Database schema and migration guide
- [MIGRATION_ISSUES.md](critical/MIGRATION_ISSUES.md) - Database migration sync issues and resolution
- [PERFORMANCE_ISSUES.md](critical/PERFORMANCE_ISSUES.md) - Performance bottlenecks and solutions
- [RLS_SECURITY.md](critical/RLS_SECURITY.md) - Critical RLS recursion prevention and fixes (2025-08-06)

### 📖 Guides
Step-by-step guides for common tasks:
- [ADMIN_SETUP.md](guides/ADMIN_SETUP.md) - How to set up admin users
- [ONBOARDING_GUIDE.md](guides/ONBOARDING_GUIDE.md) - Complete guide to the onboarding system
- [CLIENT_ONBOARDING.md](guides/CLIENT_ONBOARDING.md) - Client onboarding and testing guide
- [DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md) - Supabase production deployment guide
- [MIGRATION_PROCESS.md](guides/MIGRATION_PROCESS.md) - Database migration best practices
- [PROJECT_MAINTENANCE.md](guides/PROJECT_MAINTENANCE.md) - Project cleanup and organization guide
- [TWILIO_VAULT_SETUP.md](guides/TWILIO_VAULT_SETUP.md) - Secure Twilio credential management
- [URGENT_PERFORMANCE_FIX.md](guides/URGENT_PERFORMANCE_FIX.md) - Emergency performance fixes
- [NOTIFICATION_SYSTEM.md](guides/NOTIFICATION_SYSTEM.md) - Job update notifications and SMS alerts (2025-08-05)
- [VALIDATION_SYSTEM.md](guides/VALIDATION_SYSTEM.md) - Comprehensive validation system guide (2025-08-05)
- [GOOGLE_MAPS_INTEGRATION.md](guides/GOOGLE_MAPS_INTEGRATION.md) - Google Places Autocomplete setup (2025-08-05)
- [google-api-security.md](google-api-security.md) - Google API security configuration and cost controls (2025-08-06)

### 📚 Reference
Historical and reference documents:
- [plan.md](reference/plan.md) - Original project plan
- [prd (1).md](reference/prd%20(1).md) - Product requirements document
- [database-schema.md](reference/database-schema.md) - Complete database schema documentation (2025-08-03)

### 📊 Status Reports
Current implementation status:
- [ADMIN_DASHBOARD_SUMMARY.md](status/ADMIN_DASHBOARD_SUMMARY.md) - Admin dashboard implementation status
- [project-status.md](status/project-status.md) - Overall project status and onboarding progress (2025-08-03)

### 🔄 User Flows & Architecture
- [USER_FLOWS.md](USER_FLOWS.md) - ASCII flow diagrams for all user types
- [USER_FLOWS_MERMAID.md](USER_FLOWS_MERMAID.md) - Interactive Mermaid diagrams
- [view-diagrams.html](view-diagrams.html) - Browser-viewable flow diagrams

### 📁 Testing Documentation
- [TESTING.md](TESTING.md) - Comprehensive testing guide with unit, integration, and E2E tests

### 🗄️ Archive
Historical documentation and outdated plans are stored in the `archive/` folder:
- `archive/onboarding/` - Onboarding phase summaries and implementation details
- `archive/testing/` - Previous testing documentation versions
- `archive/plans/` - Completed implementation plans
- `archive/misc/` - Other outdated documentation

## Quick Links

### For Developers
1. Start with [CLAUDE.md](../CLAUDE.md) for project rules
2. Check [database-setup.md](critical/database-setup.md) for schema changes
3. Check [PRODUCTION_CHECKLIST.md](critical/PRODUCTION_CHECKLIST.md) before deploying
4. See [MIGRATION_ISSUES.md](critical/MIGRATION_ISSUES.md) for database sync status

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
- **Onboarding System Phase 1 & 2**: Enhanced database schema with trade types, service areas, SMS templates, and secure Twilio integration
- **Dev Drawer Improvements**: Fixed memoization, removed page reloads, added onboarding test presets, enhanced deep links
- **Onboarding System Phase 3**: Complete 6-step wizard with progress tracking and public signup flow
- **Phase 4: Twilio Self-Service**: Phone number provisioning, credential management with Vault security
- **Phase 5: Settings Page**: Enhanced with 6 tabs including pricing/availability management
- **Phase 6: SMS Templates**: Professional template library with 20+ templates and variable helper
- **Phase 7: Testing & Demo Data**: 106 passing tests, E2E suite, comprehensive test data

### 🚧 In Progress
- Production deployment preparation
- Performance monitoring setup

### 📋 Pending
- Remove development features (admin toggle)
- Implement JWT claims for better auth
- Fix user type naming (client/tradie confusion)
- Simplify customer experience (remove login requirement)

## Testing Infrastructure

### Test Suite Overview
- **Unit Tests**: 106/106 passing (100% pass rate)
- **E2E Tests**: 30 onboarding tests + 42 general tests (72 total)
- **Test Files**: 9 unit test files, 3 E2E test files  
- **Coverage Target**: 80% lines, functions, statements; 70% branches
- **New Test Coverage**: Onboarding flow, RLS policies, service locations, SMS templates

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
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Vault)
- **SMS**: Twilio (secure integration implemented)
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel/Netlify compatible

## Onboarding System Implementation

### All Phases Complete (2025-08-04)
- **Enhanced Database Schema**: New tables for trade types, service locations, SMS templates, and secure Twilio settings
- **Security**: Twilio credentials stored in Supabase Vault with comprehensive validation
- **Onboarding Wizard**: 6-step public signup flow with progress tracking and auto-save
- **Settings Enhancement**: 6 organized tabs with pricing, availability, and all profile data
- **SMS Templates**: 20+ professional templates with variable helper and mobile preview
- **Testing**: 106 passing tests, E2E coverage, 10 realistic test tradies

### New Database Tables
1. **trade_types**: Classification system for 10 trade types
2. **service_locations**: Postcode-based service areas with surcharges
3. **tenant_sms_templates**: Customizable SMS templates per tradie
4. **twilio_settings**: Secure phone configuration with Vault integration

### Key Features Added
- **Public Onboarding Flow**: Landing → 6-step wizard → Email capture → Magic link
- **Twilio Self-Service**: Phone number search, provisioning, and testing
- **Professional SMS Library**: Trade-specific templates with 50+ variables
- **Pricing Management**: Hourly rates, emergency multipliers, availability settings
- **Dev Tools**: 10 test tradies at different onboarding stages

### Testing & Quality
- **Unit Tests**: Complete coverage for all new services and components
- **Integration Tests**: Full onboarding flow validation
- **Security Tests**: RLS policy verification for data isolation
- **E2E Tests**: 30 onboarding-specific scenarios

## Support
For questions or issues, refer to the documentation or create a GitHub issue.