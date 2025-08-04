# Testing Updates Required for Schema Changes

## Overview
The Phase 1 database schema changes require updates to existing tests and new test coverage.

## Affected Test Areas

### 1. Profile-Related Tests
**Files to Update:**
- `tests/unit/hooks/useAuth.test.tsx`
- `tests/unit/hooks/useProfile.test.tsx`
- Any component tests that use profile data

**New Fields to Mock:**
```typescript
{
  // Existing fields...
  trade_primary: 'plumber',
  trade_secondary: ['electrician'],
  business_name: 'Test Plumbing Services',
  abn: '12345678901',
  service_postcodes: ['2000', '2001'],
  service_radius_km: 25,
  license_number: 'L12345',
  license_expiry: '2025-12-31',
  insurance_provider: 'Test Insurance Co',
  insurance_expiry: '2025-12-31',
  years_experience: 10,
  specializations: ['emergency', 'commercial'],
  languages_spoken: ['English', 'Spanish'],
  onboarding_completed: true,
  onboarding_step: 6,
  callback_window_minutes: 30,
  after_hours_enabled: false,
  timezone: 'Australia/Sydney'
}
```

### 2. New Table Tests
**Create New Test Files:**
- `tests/unit/services/tradeTypes.test.ts`
- `tests/unit/services/serviceLocations.test.ts`
- `tests/unit/services/smsTemplates.test.ts`
- `tests/unit/services/twilioSettings.test.ts`

### 3. Database Mock Updates
**Update `tests/mocks/supabase.ts`:**
- Add mocks for new tables
- Update profile type definitions
- Add query responses for new tables

### 4. Integration Tests
**Update Integration Tests:**
- Test onboarding flow with new fields
- Test trade type selection
- Test service area configuration
- Test SMS template CRUD operations

### 5. E2E Tests
**New E2E Scenarios:**
- Complete onboarding journey
- Trade type filtering
- Service area search
- SMS template customization

## Mock Data Requirements

### Trade Types Mock
```typescript
export const mockTradeTypes = [
  { code: 'plumber', label: 'Plumber', category: 'construction', typical_urgency: 'high' },
  { code: 'electrician', label: 'Electrician', category: 'construction', typical_urgency: 'high' },
  // ... other trades
];
```

### Service Locations Mock
```typescript
export const mockServiceLocations = [
  { postcode: '2000', suburb: 'Sydney', state: 'NSW', travel_time: 15, surcharge: 0 },
  { postcode: '2001', suburb: 'Sydney', state: 'NSW', travel_time: 20, surcharge: 10 },
];
```

### SMS Templates Mock
```typescript
export const mockSmsTemplates = [
  {
    template_type: 'missed_call',
    content: 'Hi {customer_name}, thanks for calling...',
    variables: ['customer_name', 'business_name', 'callback_window']
  },
  // ... other templates
];
```

## Test Utilities to Create

### Profile Builder
```typescript
export function buildProfile(overrides = {}) {
  return {
    ...defaultProfile,
    ...newProfileFields,
    ...overrides
  };
}
```

### Onboarding State Helper
```typescript
export function getOnboardingState(step: number) {
  return {
    onboarding_completed: step >= 6,
    onboarding_step: step,
    // ... other step-specific data
  };
}
```

## Testing Priorities

1. **High Priority:**
   - Update existing profile tests to not break
   - Add basic coverage for new tables
   - Update mock data generators

2. **Medium Priority:**
   - Add comprehensive onboarding flow tests
   - Test RLS policies for new tables
   - Add validation tests for constraints

3. **Low Priority:**
   - Performance tests for new indexes
   - Edge case handling
   - Stress testing with large datasets

## Notes
- All test updates should use the new TypeScript types from `database.types.ts`
- Consider using factory patterns for complex test data
- Ensure RLS policies are tested for security
- Add tests for the secure Twilio credential storage pattern