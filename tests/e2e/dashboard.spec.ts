import { test, expect } from '@playwright/test';

test.describe('Dashboard Principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
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
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Menos de 5 segundos
  });
});
