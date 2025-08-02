# TradiePro Documentation

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
- [TESTING.md](guides/TESTING.md) - Testing procedures (TO BE CREATED)
- [URGENT_PERFORMANCE_FIX.md](guides/URGENT_PERFORMANCE_FIX.md) - Emergency performance fixes

### 📚 Reference
Historical and reference documents:
- [plan.md](reference/plan.md) - Original project plan
- [prd (1).md](reference/prd%20(1).md) - Product requirements document

### 📊 Status Reports
Current implementation status:
- [ADMIN_DASHBOARD_SUMMARY.md](status/ADMIN_DASHBOARD_SUMMARY.md) - Admin dashboard implementation status

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

### 🚧 In Progress
- Twilio API integration
- Production deployment preparation

### 📋 Pending
- Remove development features (admin toggle)
- Implement JWT claims for better auth
- Complete testing documentation

## Key Technologies
- **Frontend**: React, TypeScript, Vite, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **SMS**: Twilio (integration pending)
- **Deployment**: Vercel/Netlify compatible

## Support
For questions or issues, refer to the documentation or create a GitHub issue.