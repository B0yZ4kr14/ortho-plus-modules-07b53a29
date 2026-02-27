import { test, expect } from '@playwright/test';

test.describe('Módulo Financeiro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    await page.goto('/financeiro');
  });

  test('deve exibir dashboard financeiro', async ({ page }) => {
    await expect(page.getByText(/gestão financeira/i)).toBeVisible();
    await expect(page.getByText(/receitas/i)).toBeVisible();
    await expect(page.getByText(/despesas/i)).toBeVisible();
  });
});
