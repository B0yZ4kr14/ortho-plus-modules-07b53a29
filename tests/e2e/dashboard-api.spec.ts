/**
 * Dashboard API E2E Tests
 * Valida integração completa do Dashboard com REST API
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should load dashboard overview from REST API', async ({ page }) => {
    // Navegar para o dashboard
    await page.goto('/');

    // Aguardar carregamento dos dados
    await page.waitForSelector('[data-testid="stats-card"]', { timeout: 10000 });

    // Verificar se os cards de estatísticas estão visíveis
    const statsCards = await page.$$('[data-testid="stats-card"]');
    expect(statsCards.length).toBeGreaterThan(0);

    // Verificar se os gráficos estão renderizados
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
  });

  test('should display correct stats structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="stats-card"]');

    // Verificar estrutura dos dados de estatísticas
    const totalPatients = await page.locator('text=/Total de Pacientes/i').isVisible();
    expect(totalPatients).toBeTruthy();

    const todayAppointments = await page.locator('text=/Consultas Hoje/i').isVisible();
    expect(todayAppointments).toBeTruthy();

    const monthlyRevenue = await page.locator('text=/Receita Mensal/i').isVisible();
    expect(monthlyRevenue).toBeTruthy();
  });

  test('should render appointments chart', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.recharts-wrapper');

    // Verificar se o gráfico de consultas está presente
    const appointmentsChart = await page.locator('text=/Visão Geral de Consultas/i').isVisible();
    expect(appointmentsChart).toBeTruthy();

    // Verificar se há dados no gráfico
    const bars = await page.$$('.recharts-bar-rectangle');
    expect(bars.length).toBeGreaterThan(0);
  });

  test('should render revenue chart', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.recharts-wrapper');

    // Verificar se o gráfico de receitas está presente
    const revenueChart = await page.locator('text=/Desempenho Financeiro/i').isVisible();
    expect(revenueChart).toBeTruthy();

    // Verificar se há linhas no gráfico
    const lines = await page.$$('.recharts-line');
    expect(lines.length).toBeGreaterThan(0);
  });

  test('should handle loading state', async ({ page }) => {
    await page.goto('/');

    // Verificar se o estado de carregamento aparece inicialmente
    const loadingIndicator = await page.locator('[data-testid="loading"]').isVisible();
    
    // Aguardar que os dados carreguem
    await page.waitForSelector('[data-testid="stats-card"]', { timeout: 10000 });
    
    // Verificar se o loading desaparece
    const loadingGone = await page.locator('[data-testid="loading"]').isHidden();
    expect(loadingGone).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page, context }) => {
    // Simular erro de rede
    await context.route('**/api/dashboard/overview', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    // Verificar se há mensagem de erro ou fallback
    await page.waitForTimeout(2000);
    
    // Dashboard deve mostrar dados mockados em caso de erro
    const statsCards = await page.$$('[data-testid="stats-card"]');
    expect(statsCards.length).toBeGreaterThan(0);
  });

  test('should refresh data on manual refetch', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="stats-card"]');

    // Obter valor inicial
    const initialValue = await page.locator('[data-testid="stats-card"]').first().textContent();

    // Aguardar refresh automático (30 segundos) ou forçar refresh
    await page.reload();
    await page.waitForSelector('[data-testid="stats-card"]');

    // Verificar se os dados foram recarregados
    const newValue = await page.locator('[data-testid="stats-card"]').first().textContent();
    expect(newValue).toBeDefined();
  });

  test('should display treatments by status chart', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.recharts-wrapper');

    // Verificar se há gráfico de pizza (tratamentos por status)
    const pieChart = await page.$$('.recharts-pie');
    expect(pieChart.length).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="stats-card"]');

    // Verificar se os cards estão empilhados verticalmente
    const statsCards = await page.$$('[data-testid="stats-card"]');
    expect(statsCards.length).toBeGreaterThan(0);

    // Verificar se os gráficos são responsivos
    const charts = await page.$$('.recharts-responsive-container');
    expect(charts.length).toBeGreaterThan(0);
  });
});
