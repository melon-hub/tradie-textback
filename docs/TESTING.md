# Testing Guide - Tradie Textback

<!-- Updated: 2025-08-03 - Added onboarding schema changes notice and updated test requirements -->

## Overview

This guide covers the comprehensive testing strategy for the Tradie Textback application. We use a combination of unit tests, integration tests, and end-to-end (E2E) tests to ensure high quality and reliability.

## ⚠️ Important Notice - Database Schema Changes (2025-08-03)

The database schema has been significantly updated with new onboarding-related tables:
- `trade_types` - Trade classification system
- `service_locations` - Postcode-based service areas
- `tenant_sms_templates` - Customizable SMS templates
- `twilio_settings` - Secure phone configuration
- Enhanced `profiles` table with 18 new columns

**Action Required**: Tests that depend on database schemas may need updates. See [TESTING_UPDATES_REQUIRED.md](TESTING_UPDATES_REQUIRED.md) for specific changes needed.

## Test Stack

- **Vitest**: Fast unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **Coverage**: V8 coverage provider

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open test dashboard
npm run test:dashboard
```

## Current Test Status

As of 2025-08-03:
- **Unit Tests**: 12/14 passing (86% pass rate)
- **E2E Tests**: 42 tests configured (21 desktop + 21 mobile)
- **Test Files**: 4 unit test files, 2 E2E test files
- **Coverage Target**: 80% lines, functions, statements; 70% branches
- **Test Infrastructure**: Fully configured with Vitest, React Testing Library, Playwright
- **⚠️ Schema Changes**: Database schema updated with onboarding tables - tests may need updating

### Passing Tests:
✅ Example tests (4/4)
✅ Utility function tests (5/5)
✅ Auth hook basic test (1/2)
✅ Component tests (2/2)

### Known Issues:
- 2 hook tests need fixing (mocking configuration)
- Coverage reporting configured but needs baseline generation
- E2E tests require dev server running on port 8080
- **Schema-dependent tests may fail** until test data is updated for new onboarding tables

## Test Types

### 1. Unit Tests

Unit tests verify individual components, hooks, and utilities in isolation.

```bash
# Run unit tests only
npm run test:unit

# Location: tests/unit/
```

**Key Unit Tests:**
- `useAuth.test.tsx` - Authentication hook functionality
- `useAnalytics.test.tsx` - Analytics data processing
- `LoginForm.test.tsx` - Login form validation and submission
- `JobCard.test.tsx` - Job card rendering and interactions

### 2. Integration Tests

Integration tests verify how different parts of the application work together.

```bash
# Run integration tests only
npm run test:integration

# Location: tests/integration/
```

**Key Integration Tests:**
- `auth.test.tsx` - Full authentication flow
- User type handling (client vs tradie)
- Session persistence

### 3. End-to-End Tests

E2E tests verify complete user workflows from start to finish.

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Location: tests/e2e/
```

**Key E2E Tests:**
- `auth.spec.ts` - Login/logout workflows
- `job-management.spec.ts` - Job CRUD operations

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── hooks/              # Hook tests
│   └── components/         # Component tests
├── integration/            # Integration tests
├── e2e/                   # End-to-end tests
├── mocks/                 # Mock data and utilities
│   └── supabase.ts       # Supabase client mocks
├── helpers/               # Test utilities
│   └── renderWithProviders.tsx
├── factories/             # Test data factories
├── setup.ts              # Global test setup
└── test-dashboard.html   # Test reporting dashboard
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobCard } from '@/components/jobs/JobCard';
import { renderWithProviders } from '../../helpers/renderWithProviders';

describe('JobCard', () => {
  it('should render job details', () => {
    renderWithProviders(<JobCard job={mockJob} />);
    
    expect(screen.getByText(mockJob.customer_name)).toBeInTheDocument();
    expect(screen.getByText(mockJob.job_type)).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
describe('Authentication Flow', () => {
  it('should complete full login flow', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    
    // Enter phone number
    await user.type(screen.getByPlaceholderText('04XX XXX XXX'), '0412345678');
    await user.click(screen.getByRole('button', { name: /get code/i }));
    
    // Verify redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should display jobs on dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Should see job list
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page.getByText('Plumbing')).toBeVisible();
});
```

## Mocking

### Supabase Mock

The `tests/mocks/supabase.ts` file provides a comprehensive Supabase mock:

```typescript
import { createSupabaseMock, mockUser, mockTradieProfile } from '../mocks/supabase';

// Use in tests
const mockSupabase = createSupabaseMock({
  user: mockUser,
  profile: mockTradieProfile,
  jobs: mockJobs,
});
```

### Custom Render Function

Use `renderWithProviders` for components that need React Router and React Query:

```typescript
import { renderWithProviders } from '../helpers/renderWithProviders';

renderWithProviders(<YourComponent />);
```

## Coverage

We maintain an 80% coverage threshold:

```javascript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,
  },
}
```

View coverage reports:
- HTML Report: `coverage/index.html`
- Console: Run `npm run test:coverage`

## Test Dashboard

Access the comprehensive test dashboard for real-time test monitoring:

```bash
npm run test:dashboard
# Opens tests/test-dashboard.html in your browser
```

### Dashboard Features:
- **Test Suite Overview**: Real-time status of all test suites
- **Coverage Metrics**: Visual coverage reporting with thresholds
- **Quick Test Execution**: One-click test running for different suites
- **Results History**: Links to detailed HTML and JSON reports
- **Performance Metrics**: Test execution times and trends
- **CI/CD Integration**: Status indicators for automated testing

### Dashboard Sections:
1. **Unit Tests**: Individual component and utility tests
2. **Integration Tests**: Feature-level testing scenarios
3. **E2E Tests**: Complete user workflow validation
4. **Coverage Reports**: Line, function, branch, and statement coverage
5. **Test Artifacts**: Screenshots, videos, and trace files from failures

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks
- Scheduled nightly runs

### GitHub Actions Workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Run unit tests with coverage
  run: npm run test:coverage

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: test-results
    path: |
      test-results/
      playwright-report/
      coverage/
```

### Test Reporting:
- **Coverage Reports**: Generated in `coverage/` directory
- **E2E Reports**: Available in `playwright-report/` 
- **Test Results**: JSON format in `test-results/`
- **Artifacts**: Screenshots and videos for failed E2E tests

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Mock Management
- Keep mocks close to tests
- Use factory functions for complex data
- Clear mocks between tests

### 3. Async Testing
- Always use `waitFor` for async operations
- Handle loading states explicitly
- Test error scenarios

### 4. Component Testing
- Test user interactions, not implementation
- Verify accessibility (ARIA roles, labels)
- Test edge cases and error states

### 5. E2E Testing
- Focus on critical user paths
- Use data-testid sparingly
- Test on multiple viewport sizes

## Debugging Tests

### Vitest UI

```bash
npm run test:ui
```

Interactive test runner with:
- Test filtering
- Real-time results
- Stack traces

### Playwright Debug Mode

```bash
# Debug mode
npx playwright test --debug

# Headed mode
npx playwright test --headed
```

### Console Debugging

Tests mock console methods. To see logs during tests:

```typescript
// Temporarily in test file
global.console = console;
```

## Common Issues

### 1. Flaky Tests
- Use `waitFor` for async operations
- Avoid fixed timeouts
- Mock external dependencies

### 2. Test Isolation
- Clear sessionStorage/localStorage
- Reset mocks between tests
- Use `beforeEach` for setup

### 3. Coverage Gaps
- Check uncovered lines in reports
- Add tests for error handling
- Test edge cases

## Extending Tests

### Adding New Test Types

1. Create test file in appropriate directory
2. Import necessary utilities and mocks
3. Write tests following existing patterns
4. Run tests to verify
5. Update this documentation

### Testing Onboarding Features (2025-08-03)

New onboarding system requires tests for:
- Trade type selection and validation
- Service area configuration (postcodes vs radius)
- SMS template customization
- Twilio integration (mocked)
- Multi-step wizard navigation
- Auto-save functionality
- Onboarding completion tracking

Use the new DevDrawer presets for testing:
- `plumber-sydney`: Complete profile
- `electrician-melbourne`: Licensed tradie
- `incomplete-onboarding`: Mid-flow testing
- `twilio-configured`: Post-Twilio setup
- `twilio-pending`: Pre-verification state

### Custom Matchers

Add custom matchers in `tests/setup.ts`:

```typescript
expect.extend({
  toBeValidPhoneNumber(received) {
    const pass = /^04\d{2}\s?\d{3}\s?\d{3}$/.test(received);
    return {
      pass,
      message: () => `expected ${received} to be valid Australian phone number`,
    };
  },
});
```

## Future Improvements

1. **Visual Regression Testing**
   - Add Percy or Chromatic integration
   - Screenshot comparisons

2. **Performance Testing**
   - Add Lighthouse CI
   - Bundle size monitoring

3. **Accessibility Testing**
   - Integrate axe-core
   - WCAG compliance checks

4. **API Contract Testing**
   - Add Pact or similar
   - Verify Supabase API contracts

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)