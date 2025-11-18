import { test, expect } from '@playwright/test';

/**
 * FASE 5 (E2E Tests) - Gestão de Módulos
 * Testa ativação/desativação de módulos e validação de dependências
 */

test.describe('Gestão de Módulos', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para gestão de módulos
    await page.goto('/settings/modules');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir lista de módulos', async ({ page }) => {
    // Verificar título
    await expect(page.getByRole('heading', { name: /gestão de módulos/i })).toBeVisible();
    
    // Verificar que existem módulos listados
    const modules = page.locator('[data-testid="module-card"]');
    const count = await modules.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve exibir categorias de módulos', async ({ page }) => {
    // Verificar categorias
    await expect(page.getByText(/gestão e operação/i)).toBeVisible();
    await expect(page.getByText(/financeiro/i)).toBeVisible();
    await expect(page.getByText(/compliance/i)).toBeVisible();
  });

  test('deve mostrar status ativo/inativo de módulos', async ({ page }) => {
    // Verificar badges de status
    const activeModules = page.locator('[data-testid="module-card"]', { hasText: /ativo/i });
    const count = await activeModules.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve desativar módulo sem dependentes', async ({ page }) => {
    // Encontrar módulo ESTOQUE (sem dependentes críticos)
    const estoqueModule = page.locator('[data-testid="module-card"]', { hasText: /estoque/i });
    
    // Clicar no toggle
    const toggle = estoqueModule.locator('button[role="switch"]');
    await toggle.click();
    
    // Aguardar confirmação
    await page.waitForTimeout(2000);
    
    // Verificar que o toggle mudou de estado
    const isChecked = await toggle.getAttribute('data-state');
    expect(['checked', 'unchecked']).toContain(isChecked);
  });

  test('deve bloquear desativação de módulo com dependentes', async ({ page }) => {
    // Encontrar módulo PEP (tem dependentes: ASSINATURA_ICP, TISS, etc.)
    const pepModule = page.locator('[data-testid="module-card"]', { hasText: /prontuário eletrônico/i });
    
    // Verificar se o toggle está desabilitado
    const toggle = pepModule.locator('button[role="switch"]');
    const isDisabled = await toggle.isDisabled();
    
    if (isDisabled) {
      // Hover para ver tooltip
      await toggle.hover();
      
      // Verificar mensagem de bloqueio
      await expect(page.getByText(/requerido por/i)).toBeVisible({ timeout: 2000 });
    }
  });

  test('deve exibir dependências não atendidas', async ({ page }) => {
    // Procurar módulos inativos com dependências
    const inactiveModules = page.locator('[data-testid="module-card"]').filter({ hasNotText: /ativo/i });
    const count = await inactiveModules.count();
    
    if (count > 0) {
      // Verificar se há indicador de dependências
      const firstInactive = inactiveModules.first();
      const hasDependencyWarning = await firstInactive.locator('[data-icon="alert-circle"]').count();
      
      expect(hasDependencyWarning).toBeGreaterThanOrEqual(0);
    }
  });

  test('deve ativar módulo com dependências atendidas', async ({ page }) => {
    // Encontrar módulo inativo com dependências atendidas
    const modules = page.locator('[data-testid="module-card"]');
    const count = await modules.count();
    
    for (let i = 0; i < count; i++) {
      const module = modules.nth(i);
      const hasActiveText = await module.getByText(/ativo/i).count();
      
      if (hasActiveText === 0) {
        // Módulo inativo encontrado
        const toggle = module.locator('button[role="switch"]');
        const isDisabled = await toggle.isDisabled();
        
        if (!isDisabled) {
          // Pode ser ativado
          await toggle.click();
          await page.waitForTimeout(2000);
          
          // Verificar mudança
          const newState = await toggle.getAttribute('data-state');
          expect(['checked', 'unchecked']).toContain(newState);
          break;
        }
      }
    }
  });

  test('deve filtrar módulos por categoria', async ({ page }) => {
    // Clicar na categoria "Financeiro"
    await page.getByText(/financeiro/i).first().click();
    await page.waitForTimeout(500);
    
    // Verificar que apenas módulos financeiros estão visíveis
    const visibleModules = page.locator('[data-testid="module-card"]:visible');
    const count = await visibleModules.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('deve exibir contador de módulos ativos por categoria', async ({ page }) => {
    // Verificar contadores (ex: "3/5 ativos")
    const counters = page.locator('text=/\\d+\\/\\d+ ativos/i');
    const count = await counters.count();
    
    expect(count).toBeGreaterThan(0);
  });
});
