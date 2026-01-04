import { test, expect } from '@playwright/test';

test.describe('Simulation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Go to VSL Game page (public access confirmed)
        await page.goto('/vsl/tahminoyunu', { waitUntil: 'networkidle' });
    });

    test('should update standings when prediction is made', async ({ page }) => {
        // 1. Wait for matches to load
        await page.waitForSelector('[id^="match-"]');

        // 2. Select the first upcoming match
        const firstMatch = page.locator('[id^="match-"]').first();

        // Get team names to find them in standings
        // Note: Team names in matches might differ slightly from standings if normalized,
        // but usually they match. FixtureList trims them.
        const homeLink = firstMatch.locator('a[href^="/takimlar/"]').first();
        const homeTeam = await homeLink.innerText();

        console.log(`Testing with Home Team: ${homeTeam}`);

        // 3. Find Home Team row in Standings
        // StandingsTable row usually contains the team name div
        const row = page.locator('tr').filter({ hasText: homeTeam }).first();

        // Helper to get Points (P) from row.
        // Assuming standard table layout: #, Team, O, G, M, ... P
        // We can just snapshot the text.
        await expect(row).toBeVisible();
        const initialRowText = await row.innerText();
        console.log(`Initial Row: ${initialRowText}`);

        // 4. Make a 3-0 prediction
        const btn30 = firstMatch.locator('button', { hasText: '3-0' });
        await btn30.click();

        // 5. Verify Standings Update
        // The update happens client-side instantly
        await page.waitForTimeout(500);

        const updatedRowText = await row.innerText();
        console.log(`Updated Row: ${updatedRowText}`);

        expect(updatedRowText).not.toBe(initialRowText);

        // 6. Reset (toggle off) to clean up state? 
        // Or just let it be (localStorage persists but browser context might clear it?)
        // Playwright creates new context per test usually.
    });

    test('should randomize predictions', async ({ page }) => {
        // 1. Handle Confirm Dialog
        page.on('dialog', dialog => dialog.accept());

        // 2. Click Randomize
        const randomBtn = page.getByRole('button', { name: /Rastgele/i });
        await expect(randomBtn).toBeVisible();
        await randomBtn.click();

        // 3. Verify Success Toast
        // Toast usually appears at bottom right
        await expect(page.locator('text=maç rastgele tahmin edildi')).toBeVisible({ timeout: 5000 });

        // 4. Verify some matches are predicted
        // 4. Verify some matches are predicted
        // Check for ANY selected score button (Green for home win, Red for away win)
        const selectedButtons = page.locator('button.bg-emerald-700, button.bg-rose-700');
        await expect(selectedButtons.first()).toBeVisible();
        expect(await selectedButtons.count()).toBeGreaterThan(0);
    });
});
