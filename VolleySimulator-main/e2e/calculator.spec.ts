import { test, expect } from '@playwright/test';

test.describe('Calculator Flow (1. Lig Groups)', () => {
    test.beforeEach(async ({ page }) => {
        // Go to 1. Lig Game page (public access confirmed after AuthGuard fix)
        await page.goto('/1lig/tahminoyunu', { waitUntil: 'networkidle' });
    });

    test('should allow switching groups and predicting matches', async ({ page }) => {
        // 1. Verify default group (A. Grup) is active / FENERBAHÇE MEDICANA visible
        await page.waitForSelector('table');
        await expect(page.locator('text=FENERBAHÇE MEDICANA').first()).toBeVisible();

        // 2. Switch to B. Grup
        // Handling responsive UI: Mobile uses <select>, Desktop uses <button>
        // Button text is "B GRUBU" (normalized from data), Select option is "B GRUBU".
        const groupSelect = page.locator('select');
        const groupButton = page.getByRole('button', { name: 'B GRUBU' });

        if (await groupSelect.isVisible()) {
            await groupSelect.selectOption('B GRUBU');
        } else {
            await expect(groupButton).toBeVisible();
            await groupButton.click();
        }

        // 3. Verify B. Grup is active
        // Wait for transition
        await page.waitForTimeout(2000); // React state update

        // Locate ILBANK row (in B Group)
        const ilbankRow = page.locator('tr', { hasText: 'İLBANK' }).first();
        await expect(ilbankRow).toBeVisible();
        const initialText = await ilbankRow.innerText();

        // Verify A Group team is gone
        await expect(page.locator('text=FENERBAHÇE MEDICANA').first()).not.toBeVisible();

        // 4. Find match for ILBANK
        const matchCard = page.locator('[id^="match-"]').filter({ hasText: 'İLBANK' }).first();
        await expect(matchCard).toBeVisible();

        // 5. Predict Score 3-0
        const btn30 = matchCard.locator('button', { hasText: '3-0' });
        await btn30.click();

        // 6. Verify Standings Update
        await page.waitForTimeout(500); // Wait for calculation
        const updatedText = await ilbankRow.innerText();

        expect(updatedText).not.toBe(initialText);
    });
});
