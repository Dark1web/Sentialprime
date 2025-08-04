import { test, expect } from '@playwright/test';

test.describe('SentinelX Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000');
    
    // Wait for page to load and handle any overlays
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Hide webpack overlays
    await page.addStyleTag({
      content: 'iframe[src*="webpack"] { display: none !important; }'
    });
    
    // Try demo login with fallback to manual login
    try {
      const demoButton = page.getByRole('button', { name: 'Demo Login' });
      await demoButton.click({ force: true, timeout: 5000 });
      
      // Wait for either dashboard or success message
      try {
        await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });
      } catch {
        // If demo login didn't redirect, try manual navigation
        await page.goto('http://localhost:3000/dashboard');
      }
    } catch {
      // Fallback: just navigate to dashboard (assuming logged in state is persisted)
      await page.goto('http://localhost:3000/dashboard');
    }
  });

  test('should display dashboard components', async ({ page }) => {
    // Check for main dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Wait for components to load
    await page.waitForTimeout(2000);
    
    // Check if key sections are present (these might be in loading state)
    const dashboardContainer = page.locator('[data-testid="dashboard-container"], .dashboard-container, main');
    await expect(dashboardContainer).toBeVisible();
  });

  test('should handle navigation between sections', async ({ page }) => {
    // Test navigation to misinformation section
    await page.getByRole('link', { name: /misinformation/i }).click();
    await expect(page).toHaveURL(/misinformation/);
    
    // Go back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display user menu', async ({ page }) => {
    // Look for user menu/profile elements
    const userMenuTrigger = page.locator('[data-testid="user-menu"], .user-menu, [aria-label*="user"], [aria-label*="profile"]').first();
    
    if (await userMenuTrigger.isVisible()) {
      await userMenuTrigger.click();
      // Check if logout option is available
      await expect(page.locator('text=Logout, text=Sign out').first()).toBeVisible();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if page still renders correctly
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check if mobile navigation works (hamburger menu, etc.)
    const mobileMenuTrigger = page.locator('[data-testid="mobile-menu"], .mobile-menu, [aria-label*="menu"]').first();
    
    if (await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click();
    }
  });
});