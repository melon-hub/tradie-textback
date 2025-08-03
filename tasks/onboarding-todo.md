# Onboarding Implementation Todo List

## Current Status
- [x] Created comprehensive plan document
- [x] Analyzed existing code structure
- [x] Identified all required changes
- [x] Created Phase 1 database migration
- [x] Built enhanced profiles schema
- [x] Created all required tables with RLS
- [x] Created SECURE migration (removed auth_token storage)
- [x] Split migration into executable chunks
- [x] Update documentation
- [ ] Apply migration chunks in Supabase
- [ ] Generate TypeScript types

## Immediate Next Steps
1. [ ] Run update-docs function
2. [ ] Commit and push current state
3. [ ] Create feature branch for onboarding

## Phase 1: Database Schema (Day 1)
### Morning Session
- [x] Create migration file: 20250803100000_onboarding_schema.sql
- [x] Add trade_primary and trade_secondary to profiles
- [x] Add business fields (name, ABN, service areas)
- [x] Add onboarding tracking fields
- [x] Create trade_types reference table

### Afternoon Session  
- [x] Create service_locations table
- [x] Create tenant_sms_templates table
- [x] Create twilio_settings table
- [x] Add all RLS policies
- [ ] Test migration locally (in progress)
- [ ] Push migration to production

## Phase 2: Dev Drawer Fixes (Day 2) ✅
### Morning Session
- [x] Fix DevAuthSwitch memoization issue
- [x] Remove window.location.reload() calls
- [x] Implement proper cache clearing
- [x] Add sessionStorage clearing on switch

### Afternoon Session
- [x] Create onboarding test presets
- [x] Add preset application logic
- [x] Enhance deep links
- [x] Add status display for onboarding
- [x] Test all scenarios

**Status:** COMPLETE - Dev Drawer now supports seamless testing with onboarding presets

## Phase 3: Onboarding Wizard (Days 3-4)
### Day 3 - Structure
- [ ] Create OnboardingWizard.tsx container
- [ ] Set up OnboardingContext for state
- [ ] Create BasicInfoStep component
- [ ] Create BusinessDetailsStep component
- [ ] Add progress tracking UI

### Day 4 - Completion
- [ ] Create ServiceAreaStep component
- [ ] Create TwilioSetupStep component
- [ ] Create TemplatesStep component
- [ ] Create ReviewStep component
- [ ] Add Zod validation schemas
- [ ] Implement auto-save functionality

## Phase 4: Twilio Integration (Days 5-6)
### Day 5 - Backend
- [ ] Create twilio-search-numbers function
- [ ] Create twilio-purchase-number function
- [ ] Create twilio-verify-forwarding function
- [ ] Add webhook endpoints
- [ ] Set up Twilio secrets in Supabase

### Day 6 - Frontend
- [ ] Build number search UI
- [ ] Create purchase flow
- [ ] Add forwarding instructions
- [ ] Build verification widget
- [ ] Test end-to-end flow

## Phase 5: Settings Enhancement (Day 7)
- [ ] Add business identity to header
- [ ] Fix navigation guard with useEffect
- [ ] Create Trade & Service Area tab
- [ ] Create Business Hours tab
- [ ] Update existing forms
- [ ] Add proper validation

## Phase 6: Templates Management (Day 8)
- [ ] Create TemplatesForm component
- [ ] Add variable insertion buttons
- [ ] Build live preview panel
- [ ] Add character/segment counter
- [ ] Create default templates
- [ ] Test variable replacement

## Phase 7: Testing & Polish (Days 9-10)
### Day 9 - Testing
- [ ] Write unit tests for validation
- [ ] Create integration tests
- [ ] Build E2E scenarios
- [ ] Test mobile responsiveness
- [ ] Verify all RLS policies

### Day 10 - Demo & Documentation
- [ ] Create demo data seeds
- [ ] Update user documentation
- [ ] Record demo video
- [ ] Final bug fixes
- [ ] Deploy to production

## Code Quality Checklist
For each component/function:
- [ ] TypeScript types defined
- [ ] Zod validation added
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Mobile responsive
- [ ] Accessibility considered
- [ ] Tests written
- [ ] Documentation updated

## Testing Checklist
For each feature:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing complete
- [ ] Dev Drawer preset works
- [ ] Mobile testing done
- [ ] Cross-browser verified

## Deployment Checklist
- [ ] All migrations run successfully
- [ ] Environment variables set
- [ ] Edge functions deployed
- [ ] RLS policies verified
- [ ] Performance acceptable
- [ ] Monitoring in place

## Daily Standup Template
Each day, update:
1. What was completed yesterday
2. What will be done today
3. Any blockers or issues
4. Questions for clarification

## Risk Register
1. **Twilio Compliance**: May need AU address verification
2. **RLS Complexity**: Multi-tenant policies need careful testing  
3. **Mobile UX**: Onboarding must work well on phones
4. **Data Migration**: Existing users need default values

## Definition of Done
A feature is complete when:
- Code is written and reviewed
- Tests are passing
- Documentation is updated
- Dev Drawer preset exists
- Mobile tested
- Deployed to production

---

## Migration Files Created

### 20250803100000_onboarding_schema.sql
**Status:** Created, ready for testing
**Includes:**
- Enhanced profiles table with trade types, business info, onboarding tracking
- trade_types reference table with predefined Australian trade categories
- service_locations table for postcode-based service areas
- tenant_sms_templates table for customizable SMS messaging
- twilio_settings table for phone number management
- Complete RLS policies for all new tables
- Performance indexes on frequently queried columns

**Note:** Migration deployment issues have been resolved. The migration is structured to be idempotent and includes proper error handling for existing constraints.

## Session Management Issues

### Common Startup Problem
When starting new sessions, we encounter:
```bash
Error: (eval):source:1: no such file or directory: .env.local
Error: Remote migration versions not found in local migrations directory
```

### Solution Steps (Add to Todo)
- [ ] Document .env.local setup requirements
- [ ] Add supabase db pull to sync remote migrations
- [ ] Update CLAUDE.md with session startup checklist

---

Last Updated: 2025-08-03
Next Review: End of Day 1