# Onboarding Implementation Plan

## Overview
This document outlines the comprehensive plan for implementing a robust onboarding system for tradies and clients, including trade type classification, Twilio phone provisioning, and enhanced testing capabilities.

## Phase 1: Database Schema & Core Data Model
**Lead Agent:** database-architect  
**Duration:** 2-3 hours

### Checklist:
- [ ] Create migration for enhanced profiles table
- [ ] Add trade type fields and constraints
- [ ] Create trade_types reference table
- [ ] Create service_locations table
- [ ] Create tenant_sms_templates table
- [ ] Create twilio_settings table
- [ ] Set up RLS policies for all new tables
- [ ] Add indexes for performance
- [ ] Test migrations locally
- [ ] Deploy to production

### Todo Items:
1. **Enhanced Profiles Table**
   ```sql
   - trade_primary TEXT with CHECK constraint
   - trade_secondary TEXT[]
   - business_name TEXT
   - abn TEXT
   - service_postcodes TEXT[]
   - service_radius_km NUMERIC
   - license_number TEXT
   - license_expiry DATE
   - insurance_provider TEXT
   - insurance_expiry DATE
   - years_experience INTEGER
   - specializations JSONB
   - languages_spoken JSONB
   - onboarding_completed BOOLEAN
   - onboarding_step INTEGER
   - callback_window_minutes INTEGER
   - after_hours_enabled BOOLEAN
   - timezone TEXT
   ```

2. **New Tables**
   - trade_types (code, label, category, typical_urgency, icon_name)
   - service_locations (postcode, suburb, state, travel_time, surcharge)
   - tenant_sms_templates (type, content, variables, is_active)
   - twilio_settings (number, sid, capabilities, webhook_url, status)

## Phase 2: Dev Drawer Improvements & Testing Infrastructure
**Lead Agent:** refactoring-assistant  
**Supporting:** typescript-expert  
**Duration:** 2 hours

### Checklist:
- [ ] Fix DevAuthSwitch memoization
- [ ] Remove window.location.reload()
- [ ] Implement proper cache clearing
- [ ] Add onboarding test presets
- [ ] Enhance deep links with context
- [ ] Add Twilio test scenarios
- [ ] Update todo tracking in drawer
- [ ] Add keyboard shortcuts
- [ ] Test all role switching scenarios

### Todo Items:
1. **Fix Existing Issues**
   - Memoize DevAuthSwitch: `useMemo(() => new DevAuthSwitch(queryClient), [queryClient])`
   - Replace reload with: `queryClient.clear()` + `fetchProfile()` + `navigate()`
   - Clear sessionStorage on role switch

2. **New Test Presets**
   ```typescript
   ONBOARDING_PRESETS = [
     'plumber-sydney' (complete profile),
     'electrician-melbourne' (with license),
     'incomplete-onboarding' (step 2),
     'twilio-configured',
     'twilio-pending'
   ]
   ```

3. **Enhanced Deep Links**
   - Include: devRole, preset, onboardingStep, trade, twilioStatus
   - Auto-apply on mount

## Phase 3: Onboarding Wizard UI Components
**Lead Agent:** ui-generator  
**Supporting:** react-expert  
**Duration:** 3-4 hours

### Checklist:
- [ ] Create OnboardingWizard container
- [ ] Build BasicInfoStep component
- [ ] Build BusinessDetailsStep component
- [ ] Build ServiceAreaStep component
- [ ] Build TwilioSetupStep component
- [ ] Build TemplatesStep component
- [ ] Build ReviewStep component
- [ ] Add progress tracking
- [ ] Implement auto-save
- [ ] Add validation with Zod
- [ ] Create skip functionality
- [ ] Add mobile responsiveness

### Todo Items:
1. **Component Structure**
   ```
   /src/components/onboarding/
     OnboardingWizard.tsx
     OnboardingContext.tsx
     steps/
       BasicInfoStep.tsx
       BusinessDetailsStep.tsx
       ServiceAreaStep.tsx
       TwilioSetupStep.tsx
       TemplatesStep.tsx
       ReviewStep.tsx
   ```

2. **Step Details**
   - Step 1: Name, phone, email, trade type, years experience
   - Step 2: ABN, insurance, license, specializations
   - Step 3: Postcodes or radius, travel surcharges
   - Step 4: Twilio number provisioning
   - Step 5: SMS templates setup
   - Step 6: Review and confirm

## Phase 4: Twilio Self-Service Integration
**Lead Agent:** api-integrator  
**Supporting:** nodejs-expert, security-auditor  
**Duration:** 4-5 hours

### Checklist:
- [ ] Create twilio-search-numbers edge function
- [ ] Create twilio-purchase-number edge function
- [ ] Create twilio-verify-forwarding edge function
- [ ] Add webhook signature validation
- [ ] Implement rate limiting
- [ ] Add error handling for compliance issues
- [ ] Create forwarding instruction components
- [ ] Build verification widget
- [ ] Test with real Twilio sandbox
- [ ] Document API endpoints

### Todo Items:
1. **Edge Functions**
   - `/twilio-search-numbers` - Search available AU numbers
   - `/twilio-purchase-number` - Purchase and configure
   - `/twilio-verify-forwarding` - Test webhook connectivity

2. **UI Components**
   - Number search interface
   - Purchase confirmation
   - Forwarding instructions (iOS/Android)
   - Carrier-specific guides
   - Real-time verification status

3. **Security**
   - Store Twilio credentials in Supabase secrets
   - Validate webhook signatures
   - Audit log all provisioning attempts

## Phase 5: Settings Page Enhancements
**Lead Agent:** refactoring-assistant  
**Supporting:** ui-generator  
**Duration:** 2 hours

### Checklist:
- [ ] Add business identity header
- [ ] Fix useEffect navigation guard
- [ ] Create Trade & Service tab
- [ ] Create Business Hours tab
- [ ] Update Twilio settings display
- [ ] Add form validation
- [ ] Implement dirty state detection
- [ ] Add success/error toasts
- [ ] Test RLS policies

### Todo Items:
1. **New Tabs Structure**
   - Business Info (enhanced)
   - Trade & Service Area
   - Hours & Availability
   - Phone & SMS (Twilio)
   - SMS Templates
   - Notifications

2. **Header Enhancement**
   ```tsx
   <h1>Settings</h1>
   <p>{business_name} · {trade_primary} · {phone}</p>
   ```

## Phase 6: SMS Templates Management
**Lead Agent:** ui-generator  
**Supporting:** typescript-expert  
**Duration:** 2 hours

### Checklist:
- [ ] Create template editor component
- [ ] Add variable insertion UI
- [ ] Build live preview
- [ ] Add character counter
- [ ] Implement SMS segment calculator
- [ ] Create default templates
- [ ] Add template validation
- [ ] Test variable replacement

### Todo Items:
1. **Template Types**
   - missed_call
   - after_hours
   - reminder
   - scheduled_confirm
   - quote_ready

2. **Variables**
   - {customer_name}
   - {business_name}
   - {intake_link}
   - {callback_window}
   - {next_business_day}
   - {job_id}

## Phase 7: Testing & Demo Data
**Lead Agent:** test-generator  
**Supporting:** debugging-helper  
**Duration:** 2 hours

### Checklist:
- [ ] Write unit tests for validation
- [ ] Create integration tests for flows
- [ ] Build E2E test scenarios
- [ ] Create demo data seeds
- [ ] Test all user journeys
- [ ] Verify RLS policies
- [ ] Performance testing
- [ ] Mobile testing

### Todo Items:
1. **Test Scenarios**
   - New tradie complete onboarding
   - Twilio number provisioning
   - Template customization
   - Role switching in dev drawer
   - Incomplete onboarding resume

2. **Demo Seeds**
   - Busy plumber (15 jobs, all features)
   - New electrician (onboarding incomplete)
   - Multi-trade handyman
   - After-hours specialist

## Implementation Order

1. **Week 1**
   - Phase 1: Database (Day 1-2)
   - Phase 2: Dev Drawer (Day 2-3)
   - Phase 3: Start Onboarding UI (Day 3-5)

2. **Week 2**
   - Phase 4: Twilio Integration (Day 6-8)
   - Phase 5: Settings Enhancement (Day 8-9)
   - Phase 6: Templates (Day 9-10)

3. **Week 3**
   - Phase 7: Testing (Day 11-12)
   - Bug fixes and polish (Day 13-14)
   - Deploy to production (Day 15)

## Success Criteria

- [ ] Onboarding completion rate > 80%
- [ ] Twilio setup success rate > 90%
- [ ] Average onboarding time < 5 minutes
- [ ] All tests passing
- [ ] No critical RLS vulnerabilities
- [ ] Mobile responsive
- [ ] Dev testing cycle < 30 seconds

## Notes

- Start with postcode-based service areas (simpler than radius)
- Single user per business model initially
- Core trade types: plumber, electrician, carpenter, hvac, handyman, landscaper, locksmith, painter, tiler, roofer
- Twilio credentials must be server-side only
- All personal data must respect AU privacy laws