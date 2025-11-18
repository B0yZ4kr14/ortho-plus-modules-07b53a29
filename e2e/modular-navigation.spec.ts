/**
 * Modular Navigation E2E Tests
 * Valida navegação baseada em Bounded Contexts (DDD)
 */

import { test, expect } from '@playwright/test';

test.describe('Modular Navigation (DDD)', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display all bounded contexts in sidebar', async ({ page }) => {
    // Verificar se todos os contextos limitados estão visíveis
    const expectedContexts = [
      'PACIENTES',
      'PEP',
      'FINANCEIRO',
      'INVENTÁRIO',
      'MARKETING',
      'PDV',
      'CONFIGURAÇÕES',
      'BI',
      'COMPLIANCE'
    ];

    for (const context of expectedContexts) {
      const contextElement = await page.locator(`text=${context}`).isVisible();
      expect(contextElement).toBeTruthy();
    }
  });

  test('should navigate to PACIENTES module', async ({ page }) => {
    await page.click('text=PACIENTES');
    await page.waitForURL(/\/pacientes/);
    
    // Verificar se a página de pacientes carregou
    await expect(page.locator('h1:has-text("Pacientes")')).toBeVisible();
  });

  test('should navigate to PEP module', async ({ page }) => {
    await page.click('text=PEP');
    
    // Verificar se há sub-items do PEP
    const prontuarioLink = await page.locator('text=/Prontuários/i').isVisible();
    expect(prontuarioLink).toBeTruthy();
  });

  test('should navigate to FINANCEIRO module', async ({ page }) => {
    await page.click('text=FINANCEIRO');
    
    // Verificar se há sub-items financeiros
    const transacoesLink = await page.locator('text=/Transações/i').isVisible();
    expect(transacoesLink).toBeTruthy();
  });

  test('should navigate to INVENTÁRIO module', async ({ page }) => {
    await page.click('text=INVENTÁRIO');
    
    // Verificar se há sub-items de inventário
    const produtosLink = await page.locator('text=/Produtos/i').isVisible();
    expect(produtosLink).toBeTruthy();
  });

  test('should highlight active bounded context', async ({ page }) => {
    await page.click('text=PACIENTES');
    await page.waitForURL(/\/pacientes/);
    
    // Verificar se o item está destacado (classe active)
    const activeItem = await page.locator('[data-active="true"]').count();
    expect(activeItem).toBeGreaterThan(0);
  });

  test('should collapse/expand sidebar', async ({ page }) => {
    // Verificar se o botão de toggle existe
    const toggleButton = await page.locator('[data-testid="sidebar-trigger"]');
    await expect(toggleButton).toBeVisible();
    
    // Colapsar sidebar
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Verificar se sidebar está colapsada (mini width)
    const sidebar = await page.locator('[data-testid="sidebar"]');
    const isCollapsed = await sidebar.evaluate(el => el.classList.contains('w-14'));
    expect(isCollapsed).toBeTruthy();
    
    // Expandir sidebar
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Verificar se sidebar está expandida
    const isExpanded = await sidebar.evaluate(el => el.classList.contains('w-60'));
    expect(isExpanded).toBeTruthy();
  });

  test('should persist sidebar state', async ({ page, context }) => {
    // Colapsar sidebar
    await page.click('[data-testid="sidebar-trigger"]');
    await page.waitForTimeout(500);
    
    // Navegar para outra página
    await page.click('text=PACIENTES');
    await page.waitForURL(/\/pacientes/);
    
    // Verificar se o estado colapsado persiste
    const sidebar = await page.locator('[data-testid="sidebar"]');
    const isCollapsed = await sidebar.evaluate(el => el.classList.contains('w-14'));
    expect(isCollapsed).toBeTruthy();
  });

  test('should show only active modules for MEMBER users', async ({ page }) => {
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');
    
    // Login como MEMBER
    await page.goto('/login');
    await page.fill('input[type="email"]', 'member@orthoplus.com');
    await page.fill('input[type="password"]', 'Member123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Verificar se apenas módulos permitidos estão visíveis
    const configLink = await page.locator('text=CONFIGURAÇÕES').isVisible();
    expect(configLink).toBeFalsy(); // MEMBER não deve ver Configurações
  });

  test('should render mobile menu correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar se há menu mobile
    const mobileMenu = await page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
    
    // Abrir menu mobile
    await mobileMenu.click();
    
    // Verificar se os contextos estão visíveis no menu mobile
    const pacientesLink = await page.locator('text=PACIENTES').isVisible();
    expect(pacientesLink).toBeTruthy();
  });
});
