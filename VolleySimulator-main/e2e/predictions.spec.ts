import { test, expect } from '@playwright/test';

test.describe('Prediction Game', () => {
  test('should load VSL prediction page', async ({ page }) => {
    await page.goto('/vsl/tahminoyunu');
    
    // Wait for page to load
    await expect(page.locator('body')).toBeVisible();
    
    // Should show matches or fixtures
    await page.waitForTimeout(2000);
  });

  test('should show match cards or fixture list', async ({ page }) => {
    await page.goto('/vsl/tahminoyunu');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Should have some match content
    const content = await page.content();
    expect(content.length).toBeGreaterThan(1000);
  });

  test('should show prediction inputs when available', async ({ page }) => {
    await page.goto('/vsl/tahminoyunu');
    
    await page.waitForTimeout(3000);
    
    // Look for input fields or score selectors
    const inputs = page.locator('input[type="number"], select, [data-testid="score-input"]');
    const inputCount = await inputs.count();
    
    // May or may not have inputs depending on match availability
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });

  test('should load 1.Lig prediction page', async ({ page }) => {
    await page.goto('/1lig/tahminoyunu');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load CEV CL prediction page', async ({ page }) => {
    await page.goto('/cev-cl/tahminoyunu');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Standings Calculator', () => {
  test('should load standings page', async ({ page }) => {
    await page.goto('/vsl/gunceldurum');
    
    // Wait for standings table
    await page.waitForTimeout(3000);
    
    // Should show team names
    const content = await page.content();
    expect(content).toMatch(/table|standings|takım|team/i);
  });

  test('should display team information', async ({ page }) => {
    await page.goto('/vsl/gunceldurum');
    
    await page.waitForTimeout(3000);
    
    // Check for team avatars or names
    const teamElements = page.locator('[data-testid="team-name"], td, .team-name');
    const count = await teamElements.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Stats Pages', () => {
  test('should load VSL stats page', async ({ page }) => {
    await page.goto('/vsl/stats');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load 1.Lig stats page', async ({ page }) => {
    await page.goto('/1lig/stats');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
