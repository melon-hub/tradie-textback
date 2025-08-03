import { test, expect } from '@playwright/test';

test.describe('Job Management E2E Tests', () => {
  // Helper to set up authenticated session
  async function setupAuth(page, userType: 'tradie' | 'client' = 'tradie') {
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
          name: userType === 'tradie' ? 'Test Tradie' : 'Test Client',
          phone: '+61412345678',
          user_type: userType,
          is_admin: false,
        },
      });
    });
    
    // Mock jobs data
    await page.route('**/rest/v1/jobs*', route => {
      route.fulfill({
        status: 200,
        json: [
          {
            id: 'job-1',
            client_id: 'test-user-id',
            customer_name: 'John Doe',
            phone: '+61412345678',
            job_type: 'Plumbing',
            location: 'Sydney NSW',
            urgency: 'high',
            status: 'new',
            estimated_value: 250,
            description: 'Leaking tap in kitchen',
            preferred_time: 'Morning',
            created_at: new Date().toISOString(),
          },
          {
            id: 'job-2',
            client_id: 'test-user-id',
            customer_name: 'Jane Smith',
            phone: '+61498765432',
            job_type: 'Electrical',
            location: 'Melbourne VIC',
            urgency: 'medium',
            status: 'contacted',
            estimated_value: 500,
            description: 'Install new power points',
            preferred_time: 'Afternoon',
            created_at: new Date().toISOString(),
          },
        ],
      });
    });
  }

  test('should display jobs list on dashboard', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    
    // Should see jobs
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
    
    // Should see job details
    await expect(page.getByText('Plumbing')).toBeVisible();
    await expect(page.getByText('Electrical')).toBeVisible();
    
    // Should see urgency badges
    await expect(page.getByText('high')).toBeVisible();
    await expect(page.getByText('medium')).toBeVisible();
  });

  test('should navigate to job details', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    
    // Click on first job
    await page.getByText('John Doe').click();
    
    // Should navigate to job details
    await expect(page).toHaveURL(/\/job\/job-1/);
    
    // Should see full job details
    await expect(page.getByText('Leaking tap in kitchen')).toBeVisible();
    await expect(page.getByText('$250')).toBeVisible();
  });

  test('should filter jobs by status', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    
    // Click on status filter
    await page.getByRole('button', { name: /all status/i }).click();
    await page.getByRole('option', { name: /new/i }).click();
    
    // Should only show new jobs
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).not.toBeVisible();
  });

  test('should update job status', async ({ page }) => {
    await setupAuth(page);
    
    // Mock job update
    await page.route('**/rest/v1/jobs*', route => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          json: { status: 'contacted' },
        });
      } else {
        route.continue();
      }
    });
    
    await page.goto('/job/job-1');
    
    // Update status
    await page.getByRole('button', { name: /status/i }).click();
    await page.getByRole('option', { name: /contacted/i }).click();
    
    // Should show success message
    await expect(page.getByText(/updated successfully/i)).toBeVisible();
  });

  test('should edit job quote as tradie', async ({ page }) => {
    await setupAuth(page, 'tradie');
    await page.goto('/job/job-1');
    
    // Click edit quote
    await page.getByRole('button', { name: /edit quote/i }).click();
    
    // Enter new quote
    await page.getByPlaceholder(/enter quote/i).fill('350');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show updated quote
    await expect(page.getByText('$350')).toBeVisible();
  });

  test('should not allow clients to edit quotes', async ({ page }) => {
    await setupAuth(page, 'client');
    await page.goto('/job/job-1');
    
    // Edit button should not be visible
    await expect(page.getByRole('button', { name: /edit quote/i })).not.toBeVisible();
  });

  test('should search jobs', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    
    // Search for customer
    await page.getByPlaceholder(/search/i).fill('John');
    
    // Should only show matching job
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).not.toBeVisible();
  });

  test('should sort jobs by urgency', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    
    // Get initial order
    const jobCards = page.locator('[role="article"]');
    const firstJobBefore = await jobCards.first().textContent();
    
    // Sort by urgency
    await page.getByRole('button', { name: /sort/i }).click();
    await page.getByRole('option', { name: /urgency/i }).click();
    
    // High urgency job should be first now
    const firstJobAfter = await jobCards.first().textContent();
    expect(firstJobAfter).toContain('high');
  });

  test('should handle empty jobs list', async ({ page }) => {
    await setupAuth(page);
    
    // Mock empty jobs response
    await page.route('**/rest/v1/jobs*', route => {
      route.fulfill({
        status: 200,
        json: [],
      });
    });
    
    await page.goto('/dashboard');
    
    // Should show empty state
    await expect(page.getByText(/no jobs found/i)).toBeVisible();
  });

  test('should refresh jobs list', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    
    let requestCount = 0;
    await page.route('**/rest/v1/jobs*', route => {
      requestCount++;
      route.continue();
    });
    
    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();
    
    // Should make new request
    expect(requestCount).toBeGreaterThan(1);
  });

  test('should export job to SMS format', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/job/job-1');
    
    // Click export
    await page.getByRole('button', { name: /export/i }).click();
    await page.getByRole('option', { name: /sms/i }).click();
    
    // Should copy to clipboard
    await expect(page.getByText(/copied to clipboard/i)).toBeVisible();
  });

  test('should handle job update errors', async ({ page }) => {
    await setupAuth(page);
    
    // Mock failed update
    await page.route('**/rest/v1/jobs*', route => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 500,
          json: { error: 'Server error' },
        });
      } else {
        route.continue();
      }
    });
    
    await page.goto('/job/job-1');
    
    // Try to update
    await page.getByRole('button', { name: /status/i }).click();
    await page.getByRole('option', { name: /contacted/i }).click();
    
    // Should show error
    await expect(page.getByText(/failed to update/i)).toBeVisible();
  });
});

test.describe('Mobile Job Management', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
  });

  test('should be usable on mobile', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    
    // Jobs should be visible in mobile view
    await expect(page.getByText('John Doe')).toBeVisible();
    
    // Should be able to tap on job
    await page.getByText('John Doe').tap();
    
    // Should navigate to details
    await expect(page).toHaveURL(/\/job\/job-1/);
    
    // Details should be visible on mobile
    await expect(page.getByText('Leaking tap in kitchen')).toBeInViewport();
  });
});