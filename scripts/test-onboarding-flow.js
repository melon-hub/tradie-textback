#!/usr/bin/env node

/**
 * Test script to verify the onboarding flow is working correctly
 * This tests the public onboarding flow from landing page to completion
 */

const puppeteer = require('puppeteer');

async function testOnboardingFlow() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    console.log('🚀 Starting onboarding flow test...\n');

    // 1. Navigate to landing page
    console.log('1. Navigating to landing page...');
    await page.goto('http://localhost:8080/landing');
    await page.waitForSelector('text="Start 14-Day Free Trial"');
    console.log('✅ Landing page loaded\n');

    // 2. Click Start Trial button
    console.log('2. Clicking Start Trial button...');
    await page.click('button:has-text("Start 14-Day Free Trial")');
    await page.waitForSelector('text="Welcome to Tradie TextBack"');
    console.log('✅ Onboarding wizard started\n');

    // 3. Welcome Step - Click Next
    console.log('3. Welcome step...');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text="Basic Information"');
    console.log('✅ Moved to Basic Information step\n');

    // 4. Basic Information Step
    console.log('4. Filling Basic Information...');
    await page.fill('input[name="name"]', 'John Test Tradie');
    await page.fill('input[name="phone"]', '0412345678');
    await page.selectOption('select[name="trade_primary"]', 'plumber');
    await page.fill('input[name="years_experience"]', '10');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text="Business Details"');
    console.log('✅ Basic information completed\n');

    // 5. Business Details Step
    console.log('5. Filling Business Details...');
    await page.fill('input[name="business_name"]', 'Test Plumbing Services');
    await page.fill('input[name="abn"]', '12345678901');
    await page.fill('input[name="license_number"]', 'PL123456');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text="Service Area"');
    console.log('✅ Business details completed\n');

    // 6. Service Area Step
    console.log('6. Setting Service Area...');
    // Add some postcodes
    await page.fill('input[placeholder*="postcode"]', '2000');
    await page.keyboard.press('Enter');
    await page.fill('input[placeholder*="postcode"]', '2001');
    await page.keyboard.press('Enter');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text="SMS Templates"');
    console.log('✅ Service area configured\n');

    // 7. SMS Templates Step (Skip)
    console.log('7. Skipping SMS Templates...');
    await page.click('button:has-text("Skip")');
    await page.waitForSelector('text="Review & Confirm"');
    console.log('✅ Moved to Review step\n');

    // 8. Review Step
    console.log('8. Review & Confirm...');
    // Accept terms
    await page.click('input#terms');
    await page.click('input#privacy');
    
    // Verify Next button is enabled
    const nextButton = await page.$('button:has-text("Next")');
    const isDisabled = await nextButton.evaluate(btn => btn.disabled);
    
    if (isDisabled) {
      throw new Error('Next button is still disabled after accepting terms!');
    }
    
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text="Almost Done!"');
    console.log('✅ Review completed - Email step shown\n');

    // 9. Email Entry Step
    console.log('9. Entering email...');
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Check if email preview is shown
    await page.waitForSelector('text="Welcome Email Preview"');
    console.log('✅ Email preview displayed\n');

    // 10. Complete signup
    console.log('10. Completing signup...');
    await page.click('button:has-text("Start Free Trial")');
    
    // Should redirect to auth page with success message
    await page.waitForSelector('text="Check your email"', { timeout: 10000 });
    console.log('✅ Signup completed successfully!\n');

    console.log('🎉 All tests passed! Onboarding flow is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot on failure
    await page.screenshot({ path: 'onboarding-error.png' });
    console.log('Screenshot saved as onboarding-error.png');
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testOnboardingFlow().catch(console.error);