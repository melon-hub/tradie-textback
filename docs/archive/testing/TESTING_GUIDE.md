# Testing Guide

<!-- Updated: 2025-08-03 - Verified and updated with latest testing infrastructure -->

## Overview

This guide covers testing strategies and implementation for the TradiePro application. We use a comprehensive testing approach with unit tests, integration tests, and end-to-end (E2E) tests.

## Test Stack

- **Vitest**: Fast unit and integration testing
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: Cross-browser E2E testing
- **Coverage**: V8 provider with 80% threshold

## Quick Start

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests

# Development mode
npm run test:watch      # Watch mode for TDD
npm run test:ui         # Vitest UI

# Coverage and reporting
npm run test:coverage   # Generate coverage report
npm run test:dashboard  # Open test dashboard
```

## Test Structure

```
tests/
├── unit/                # Unit tests for isolated components
│   ├── hooks.test.tsx   # Hook tests (useAuth, useAnalytics)
│   ├── components.test.tsx # Component tests
│   └── utils.test.ts    # Utility function tests
├── integration/         # Tests for integrated features
├── e2e/                # End-to-end user flows
│   ├── auth.spec.ts    # Authentication flows
│   └── job-management.spec.ts # Job management workflows
├── mocks/              # Reusable mock data
├── helpers/            # Test utilities
└── setup.ts           # Global test configuration
```

## Writing Tests

### Unit Tests

Test individual components and functions in isolation:

```typescript
describe('Phone Formatting', () => {
  it('should format Australian mobile numbers', () => {
    expect(formatPhone('0412345678')).toBe('0412 345 678');
  });
});
```

### Integration Tests

Test how different parts work together:

```typescript
describe('Authentication Flow', () => {
  it('should redirect to dashboard after login', async () => {
    // Test complete auth flow with mocked Supabase
  });
});
```

### E2E Tests

Test complete user journeys:

```typescript
test('tradie can update job quote', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=John Doe');
  await page.click('button:has-text("Edit Quote")');
  // ... complete workflow
});
```

## Mocking Strategy

### Supabase Mocking

We mock the entire Supabase client to avoid real API calls:

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createSupabaseMock()
}));
```

Benefits:
- Tests run instantly
- No API costs
- Predictable test data
- Can't accidentally modify production data

### Test Data

Use consistent test data from `tests/mocks/supabase.ts`:
- `testUser` - Standard test user
- `testTradieProfile` - Tradie profile
- `testClientProfile` - Client profile  
- `testJobs` - Sample job data

## Best Practices

### 1. Test User Behavior
```typescript
// ❌ Bad: Testing implementation
expect(component.state.isLoading).toBe(true);

// ✅ Good: Testing user experience
expect(screen.getByText(/loading/i)).toBeInTheDocument();
```

### 2. Use Testing Library Queries
```typescript
// Preferred queries (in order):
getByRole('button', { name: /submit/i })
getByLabelText('Email')
getByPlaceholderText('Enter your name')
getByText(/welcome/i)
```

### 3. Async Testing
```typescript
// Always use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

### 4. Test Accessibility
```typescript
// Ensure interactive elements are accessible
expect(button).toHaveAccessibleName('Submit form');
expect(input).toHaveAttribute('aria-label', 'Email address');
```

## Running Tests in CI/CD

Tests automatically run on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

GitHub Actions example:
```yaml
- name: Run tests
  run: |
    npm ci
    npm run test:coverage
    npm run test:e2e
```

## Debugging Tests

### Vitest UI
```bash
npm run test:ui
```
Interactive test runner with debugging capabilities.

### Playwright Debug Mode
```bash
npx playwright test --debug
npx playwright test --headed  # See browser
```

### Console Logs
Tests mock console by default. To see logs:
```typescript
// In your test
global.console = console;
```

## Test Coverage

Current thresholds (80%):
- Lines: 80%
- Functions: 80%
- Branches: 70%
- Statements: 80%

View coverage:
```bash
npm run test:coverage
open coverage/index.html
```

## Common Issues

### 1. Mocking Issues
- Ensure mocks are defined before imports
- Use `vi.mock()` at the top of test files

### 2. Async Timeouts
- Increase timeout for slow operations
- Use `waitFor` with custom timeout

### 3. State Leakage
- Clear storage in `beforeEach`
- Reset mocks between tests

## Adding New Tests

1. **Identify what to test**
   - User flows
   - Edge cases
   - Error handling

2. **Choose test type**
   - Unit: Isolated logic
   - Integration: Feature flows
   - E2E: Complete journeys

3. **Write descriptive tests**
   ```typescript
   describe('Job Management', () => {
     it('should allow tradies to update job quotes', async () => {
       // Clear test that anyone can understand
     });
   });
   ```

4. **Run and verify**
   ```bash
   npm run test:watch
   ```

## Test Dashboard

Access the test dashboard for overview:
```bash
npm run test:dashboard
# or
open tests/test-dashboard.html
```

Features:
- Test status overview
- Coverage metrics
- Quick test commands
- Links to detailed reports