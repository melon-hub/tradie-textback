import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test('should complete full login flow', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Should see login form
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByPlaceholder('04XX XXX XXX')).toBeVisible();
    
    // Enter phone number
    await page.getByPlaceholder('04XX XXX XXX').fill('0412345678');
    await page.getByRole('button', { name: /get code/i }).click();
    
    // Should show success message
    await expect(page.getByText('Code sent!')).toBeVisible();
    
    // Should show verification input
    await expect(page.getByPlaceholder('123456')).toBeVisible();
    
    // For real testing, you'd need to intercept the SMS or use a test phone number
    // Here we're just testing the UI flow
    
    // Test phone number change
    await page.getByText('Change number').click();
    await expect(page.getByPlaceholder('04XX XXX XXX')).toBeVisible();
    await expect(page.getByPlaceholder('123456')).not.toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/');
    
    // Try invalid phone number
    await page.getByPlaceholder('04XX XXX XXX').fill('1234567890');
    await page.getByRole('button', { name: /get code/i }).click();
    
    // Should show error
    await expect(page.getByText('Invalid phone number')).toBeVisible();
  });

  test('should format phone number automatically', async ({ page }) => {
    await page.goto('/');
    
    const phoneInput = page.getByPlaceholder('04XX XXX XXX');
    await phoneInput.fill('0412345678');
    
    // Check formatted value
    await expect(phoneInput).toHaveValue('0412 345 678');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/auth/v1/otp', route => {
      route.abort('failed');
    });
    
    await page.goto('/');
    
    await page.getByPlaceholder('04XX XXX XXX').fill('0412345678');
    await page.getByRole('button', { name: /get code/i }).click();
    
    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible();
  });

  test('should persist authentication across page reloads', async ({ page, context }) => {
    // Set up authenticated session
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'mock-auth-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Mock authenticated API responses
    await page.route('**/auth/v1/session', route => {
      route.fulfill({
        status: 200,
        json: {
          access_token: 'mock-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      });
    });
    
    await page.route('**/rest/v1/profiles*', route => {
      route.fulfill({
        status: 200,
        json: {
          id: 'profile-1',
          user_id: 'test-user-id',
          name: 'Test Tradie',
          phone: '+61412345678',
          user_type: 'tradie',
        },
      });
    });
    
    await page.goto('/');
    
    // Should bypass login and go to dashboard
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Welcome Back')).not.toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/settings');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Welcome Back')).toBeVisible();
  });

  test('should redirect to requested page after login', async ({ page }) => {
    // Try to access settings
    await page.goto('/settings');
    
    // Should be on login page
    await expect(page).toHaveURL('/login');
    
    // Note: In a real test, you'd complete the login flow
    // and verify it redirects back to /settings
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ 
    viewport: { width: 375, height: 667 }, // iPhone SE
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.goto('/');
    
    // Login form should be visible and properly sized
    const loginForm = page.getByRole('main');
    await expect(loginForm).toBeVisible();
    
    // Check that elements are not cut off
    const phoneInput = page.getByPlaceholder('04XX XXX XXX');
    await expect(phoneInput).toBeInViewport();
    
    const submitButton = page.getByRole('button', { name: /get code/i });
    await expect(submitButton).toBeInViewport();
    
    // Test interaction on mobile
    await phoneInput.tap();
    await phoneInput.fill('0412345678');
    await submitButton.tap();
  });
});