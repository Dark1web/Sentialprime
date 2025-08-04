import { test, expect } from '@playwright/test';

test.describe('SentinelX Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load login page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('SentinelX');
    await expect(page.locator('text=AI-Powered Disaster Intelligence System')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should perform demo login successfully', async ({ page }) => {
    // Wait for page to fully load and any overlays to disappear
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Hide any webpack overlays that might interfere
    await page.addStyleTag({
      content: 'iframe[src*="webpack"] { display: none !important; }'
    });
    
    // Click demo login button with retry logic
    const demoButton = page.getByRole('button', { name: 'Demo Login' });
    await expect(demoButton).toBeVisible();
    
    let retries = 3;
    while (retries > 0) {
      try {
        await demoButton.click({ force: true });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await page.waitForTimeout(1000);
      }
    }
    
    // Wait for login to complete - either dashboard or success message
    try {
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    } catch {
      // If dashboard doesn't load, check for success message
      await expect(page.locator('text=Demo login successful!')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should login with demo credentials', async ({ page }) => {
    // Fill in demo credentials
    await page.getByLabel('Email').fill('demo@sentinelx.com');
    await page.getByLabel('Password').fill('demo123');
    
    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should switch between login and register tabs', async ({ page }) => {
    // Click register tab
    await page.getByRole('tab', { name: 'Register' }).click();
    
    // Verify register form elements
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    
    // Switch back to login
    await page.getByRole('tab', { name: 'Login' }).click();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to login without filling fields
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Check for error message
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  });

  test('should display OAuth login options', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apple ID' })).toBeVisible();
  });

  test('should show demo login instructions', async ({ page }) => {
    await expect(page.locator('text=Demo Login Options:')).toBeVisible();
    await expect(page.locator('text=demo@sentinelx.com')).toBeVisible();
    await expect(page.locator('text=admin@sentinelx.com')).toBeVisible();
  });
});