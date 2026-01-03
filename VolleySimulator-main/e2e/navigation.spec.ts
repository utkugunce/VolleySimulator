import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page loaded
    await expect(page).toHaveTitle(/Volley/i);
  });

  test('should navigate to leagues page', async ({ page }) => {
    await page.goto('/');
    
    // Find and click on leagues link
    await page.click('a[href="/ligler"]');
    
    // Check navigation worked
    await expect(page).toHaveURL(/ligler/);
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check main navigation elements exist
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('League Pages', () => {
  test('should load VSL league page', async ({ page }) => {
    await page.goto('/vsl/gunceldurum');
    
    // Should show standings table
    await expect(page.locator('table, [data-testid="standings"]')).toBeVisible({ timeout: 10000 });
  });

  test('should load 1.Lig page', async ({ page }) => {
    await page.goto('/1lig/gunceldurum');
    
    // Should show standings
    await expect(page.locator('table, [data-testid="standings"]')).toBeVisible({ timeout: 10000 });
  });

  test('should load prediction game page', async ({ page }) => {
    await page.goto('/vsl/tahminoyunu');
    
    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Leaderboard', () => {
  test('should load leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Should show leaderboard content
    await expect(page.locator('body')).toBeVisible();
  });
});
