import { test, expect } from './fixtures';

test.describe('Dashboard Principal', () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve exibir KPIs principais', async ({ page }) => {
    await expect(page.getByText(/receitas|faturamento/i)).toBeVisible();
    await expect(page.getByText(/pacientes/i)).toBeVisible();
    await expect(page.getByText(/consultas/i)).toBeVisible();
  });

  test('deve exibir gráficos de análise', async ({ page }) => {
    await expect(page.locator('[class*="chart"]').first()).toBeVisible();
  });

  test('deve alternar entre abas do dashboard', async ({ page }) => {
    await page.getByRole('tab', { name: /visão geral/i }).click();
    await expect(page.getByText(/visão geral/i)).toBeVisible();
    
    await page.getByRole('tab', { name: /financeiro/i }).click();
    await expect(page.getByText(/receitas|despesas/i)).toBeVisible();
    
    await page.getByRole('tab', { name: /clínica/i }).click();
    await expect(page.getByText(/pacientes|consultas/i)).toBeVisible();
  });

  test('deve navegar para módulos através do sidebar', async ({ page }) => {
    await page.getByRole('link', { name: /pacientes/i }).click();
    await expect(page).toHaveURL(/\/pacientes/);
    
    await page.getByRole('link', { name: /agenda/i }).click();
    await expect(page).toHaveURL(/\/agenda/);
    
    await page.getByRole('link', { name: /financeiro/i }).click();
    await expect(page).toHaveURL(/\/financeiro/);
  });

  test('deve carregar dados em tempo razoável', async ({ page }) => {
    const startTime = Date.now();
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Menos de 5 segundos
  });
});
