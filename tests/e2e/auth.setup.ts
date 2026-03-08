import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/auth');

  // Use first visible email/password inputs to avoid multi-tab ambiguity
  await page.locator('input[type="email"]:visible').first().fill('admin@orthomais.com');
  await page.locator('input[type="password"]:visible').first().fill('Admin123!');
  await page.getByRole('button', { name: /entrar/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 15000 });

  // Verify login succeeded
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

  // Save storage state (includes localStorage with access_token)
  await page.context().storageState({ path: authFile });
});
