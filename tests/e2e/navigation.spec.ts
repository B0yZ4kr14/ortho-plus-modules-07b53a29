import { test, expect } from '@playwright/test';

test.describe('Navigation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate through 5 bounded contexts', async ({ page }) => {
    // CLÍNICA
    await page.click('[data-testid="menu-clinica"]');
    await expect(page.locator('text=Pacientes')).toBeVisible();
    await expect(page.locator('text=Agenda')).toBeVisible();
    
    // FINANCEIRO
    await page.click('[data-testid="menu-financeiro"]');
    await expect(page.locator('text=Contas a Receber')).toBeVisible();
    await expect(page.locator('text=PDV')).toBeVisible();
    await expect(page.locator('text=Notas Fiscais')).toBeVisible();
    
    // OPERAÇÕES
    await page.click('[data-testid="menu-operacoes"]');
    await expect(page.locator('text=Estoque')).toBeVisible();
    
    // CRESCIMENTO
    await page.click('[data-testid="menu-crescimento"]');
    await expect(page.locator('text=CRM')).toBeVisible();
    await expect(page.locator('text=Marketing')).toBeVisible();
    
    // CONFIGURAÇÕES
    await page.click('[data-testid="menu-configuracoes"]');
    await expect(page.locator('text=Gestão de Módulos')).toBeVisible();
  });

  test('should collapse and expand sidebar', async ({ page }) => {
    // Verificar sidebar expandido
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('data-collapsed', 'false');
    
    // Colapsar
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('data-collapsed', 'true');
    
    // Expandir
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('data-collapsed', 'false');
  });

  test('should navigate to missing pages', async ({ page }) => {
    // Notas Fiscais
    await page.goto('/financeiro/fiscal/notas');
    await expect(page.locator('text=Notas Fiscais')).toBeVisible();
    
    // Conciliação Bancária
    await page.goto('/financeiro/conciliacao');
    await expect(page.locator('text=Conciliação Bancária')).toBeVisible();
    
    // Fluxo Digital
    await page.goto('/fluxo-digital');
    await expect(page.locator('text=Fluxo Digital')).toBeVisible();
    
    // Scanner Mobile
    await page.goto('/estoque/scanner');
    await expect(page.locator('text=Scanner Mobile')).toBeVisible();
    
    // Comunicação
    await page.goto('/comunicacao');
    await expect(page.locator('text=Comunicação')).toBeVisible();
  });
});
