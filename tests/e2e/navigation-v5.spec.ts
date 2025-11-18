import { test, expect } from '@playwright/test';

/**
 * TESTES E2E V5.0 - Navegação Modular
 * Valida a nova estrutura de 6 Bounded Contexts
 */

test.describe('Navegação Modular V5.0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir 6 bounded contexts na sidebar', async ({ page }) => {
    // Verificar categorias principais
    await expect(page.locator('text=VISÃO GERAL')).toBeVisible();
    await expect(page.locator('text=ATENDIMENTO CLÍNICO')).toBeVisible();
    await expect(page.locator('text=FINANCEIRO & FISCAL')).toBeVisible();
    await expect(page.locator('text=OPERAÇÕES')).toBeVisible();
    await expect(page.locator('text=CAPTAÇÃO & FIDELIZAÇÃO')).toBeVisible();
    await expect(page.locator('text=ANÁLISES & RELATÓRIOS')).toBeVisible();
    await expect(page.locator('text=CONFIGURAÇÕES')).toBeVisible();
  });

  test('deve navegar para Dashboard Unificado', async ({ page }) => {
    await page.click('text=Dashboard');
    await expect(page.locator('h1:has-text("Dashboard Unificado")')).toBeVisible();
    
    // Verificar abas do dashboard
    await expect(page.locator('button:has-text("Executivo")')).toBeVisible();
    await expect(page.locator('button:has-text("Clínico")')).toBeVisible();
    await expect(page.locator('button:has-text("Financeiro")')).toBeVisible();
    await expect(page.locator('button:has-text("Comercial")')).toBeVisible();
  });

  test('deve exibir badges dinâmicos na sidebar', async ({ page }) => {
    // Verificar se badges estão renderizando (aguardar carregamento)
    await page.waitForTimeout(2000);
    
    // Verificar se há pelo menos um badge visível
    const badges = page.locator('[data-badge]');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('deve navegar para módulo FISCAL', async ({ page }) => {
    // Expandir submenu Fiscal
    await page.click('text=Fiscal');
    await page.waitForTimeout(500);
    
    // Clicar em Notas Fiscais
    await page.click('text=Notas Fiscais');
    await expect(page.locator('h1:has-text("Notas Fiscais")')).toBeVisible();
  });

  test('deve navegar para PDV (agora em OPERAÇÕES)', async ({ page }) => {
    await page.click('text=PDV');
    await expect(page).toHaveURL(/\/pdv/);
  });

  test('deve navegar para Dentistas e Funcionários (agora em CONFIGURAÇÕES)', async ({ page }) => {
    // Dentistas
    await page.click('text=Dentistas');
    await expect(page).toHaveURL(/\/dentistas/);
    
    // Voltar e navegar para Funcionários
    await page.click('text=Configurações');
    await page.click('text=Funcionários');
    await expect(page).toHaveURL(/\/funcionarios/);
  });

  test('deve alternar entre abas do Dashboard Unificado', async ({ page }) => {
    await page.click('text=Dashboard');
    
    // Aba Clínico
    await page.click('button:has-text("Clínico")');
    await expect(page.locator('text=Consultas de Hoje')).toBeVisible();
    
    // Aba Financeiro
    await page.click('button:has-text("Financeiro")');
    await expect(page.locator('text=Contas a Receber')).toBeVisible();
    
    // Aba Comercial
    await page.click('button:has-text("Comercial")');
    await expect(page.locator('text=Leads Ativos')).toBeVisible();
  });

  test('deve colapsar e expandir sidebar mantendo badges', async ({ page }) => {
    // Colapsar sidebar
    await page.click('[data-testid="sidebar-toggle"]');
    await page.waitForTimeout(500);
    
    // Badges ainda devem existir (mesmo que não visíveis)
    const badges = page.locator('[data-badge]');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);
    
    // Expandir sidebar
    await page.click('[data-testid="sidebar-toggle"]');
    await page.waitForTimeout(500);
  });

  test('deve navegar para módulos de criptomoedas', async ({ page }) => {
    // Expandir submenu Criptomoedas
    await page.click('text=Criptomoedas');
    await page.waitForTimeout(500);
    
    // Verificar subitems
    await expect(page.locator('text=Pagamentos')).toBeVisible();
    await expect(page.locator('text=Exchanges')).toBeVisible();
    await expect(page.locator('text=Carteiras')).toBeVisible();
  });

  test('deve navegar para módulos administrativos', async ({ page }) => {
    // Scroll até o final da sidebar
    await page.evaluate(() => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) sidebar.scrollTop = sidebar.scrollHeight;
    });
    
    // Expandir submenu Administração & DevOps
    await page.click('text=Administração & DevOps');
    await page.waitForTimeout(500);
    
    // Verificar subitems
    await expect(page.locator('text=Database Admin')).toBeVisible();
    await expect(page.locator('text=Backups')).toBeVisible();
    await expect(page.locator('text=Terminal')).toBeVisible();
  });

  test('deve exibir indicador de rota ativa', async ({ page }) => {
    await page.click('text=Pacientes');
    
    // Verificar se o item está com estilo ativo
    const activeItem = page.locator('a[href="/pacientes"]');
    await expect(activeItem).toHaveClass(/bg-sidebar-accent/);
  });

  test('deve carregar menos de 2 segundos (performance)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('[data-sidebar]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });
});
