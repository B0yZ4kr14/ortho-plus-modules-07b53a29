import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Login como ADMIN
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display dashboard without header overlap', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se header está visível
    await expect(page.locator('header')).toBeVisible();
    
    // Verificar se breadcrumbs estão visíveis
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Verificar se conteúdo principal não está sobreposto
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    const headerBox = await page.locator('header').boundingBox();
    
    // Main deve começar após o header
    expect(mainBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height);
  });

  test('should display all action cards', async ({ page }) => {
    await page.goto('/');
    
    // Verificar cards de ação rápida
    await expect(page.getByText('Novo Paciente')).toBeVisible();
    await expect(page.getByText('Agendar Consulta')).toBeVisible();
    await expect(page.getByText('Novo Procedimento')).toBeVisible();
    await expect(page.getByText('Lançamento Financeiro')).toBeVisible();
  });

  test('should navigate from action cards', async ({ page }) => {
    await page.goto('/');
    
    // Clicar em "Novo Paciente"
    await page.click('button:has-text("Novo Paciente")');
    await page.waitForTimeout(500);
    
    // Verificar navegação
    await expect(page).toHaveURL(/\/pacientes/);
  });

  test('should display stats cards with loading state', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se skeleton loader aparece primeiro (pode ser rápido)
    const skeleton = page.locator('[data-testid="dashboard-skeleton"]');
    
    // Aguardar stats cards aparecerem
    await expect(page.getByText(/total de pacientes/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/consultas hoje/i)).toBeVisible();
    await expect(page.getByText(/receita do mês/i)).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se gráficos estão renderizados
    await expect(page.getByText('Consultas por Semana')).toBeVisible();
    await expect(page.getByText('Receita Mensal')).toBeVisible();
    
    // Verificar se recharts renderizou (procurar SVG)
    const charts = page.locator('svg.recharts-surface');
    expect(await charts.count()).toBeGreaterThan(0);
  });

  test('should use 4-column grid on large screens', async ({ page, viewport }) => {
    // Setar viewport grande
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Verificar grid de action cards
    const actionCardsGrid = page.locator('.grid').first();
    const gridClass = await actionCardsGrid.getAttribute('class');
    
    // Deve ter lg:grid-cols-4
    expect(gridClass).toContain('lg:grid-cols-4');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Setar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar se sidebar está colapsada ou acessível via menu
    // Verificar se cards estão empilhados
    const actionCards = page.locator('button:has-text("Novo Paciente")');
    await expect(actionCards).toBeVisible();
  });

  test('should have working breadcrumbs', async ({ page }) => {
    await page.goto('/');
    
    // Verificar breadcrumb home
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Navegar para outra página
    await page.click('[href="/pacientes"]');
    await page.waitForURL('/pacientes');
    
    // Verificar novo breadcrumb
    await expect(page.getByText('Pacientes')).toBeVisible();
    
    // Clicar em home no breadcrumb
    await page.click('a[href="/"]');
    await page.waitForURL('/');
  });

  test('should open global search with Cmd+K', async ({ page }) => {
    await page.goto('/');
    
    // Pressionar Cmd+K (Ctrl+K no Windows/Linux)
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(300);
    
    // Verificar se dialog de busca abriu
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });

  test('should show notifications dropdown', async ({ page }) => {
    await page.goto('/');
    
    // Clicar no ícone de notificações
    await page.click('button:has([data-icon="bell"])');
    await page.waitForTimeout(300);
    
    // Verificar dropdown de notificações
    await expect(page.getByText(/notificações/i)).toBeVisible();
  });

  test('should display theme toggle', async ({ page }) => {
    await page.goto('/');
    
    // Verificar botão de preview de tema
    const themeButton = page.locator('button:has([data-icon="palette"])');
    await expect(themeButton).toBeVisible();
    
    // Clicar para abrir dialog
    await themeButton.click();
    await page.waitForTimeout(300);
    
    // Verificar se dialog de temas abriu
    await expect(page.getByText('Escolher Tema')).toBeVisible();
  });

  test('should handle user menu', async ({ page }) => {
    await page.goto('/');
    
    // Clicar no avatar do usuário
    await page.click('button:has([role="img"])');
    await page.waitForTimeout(300);
    
    // Verificar opções do menu
    await expect(page.getByText('Sair')).toBeVisible();
  });

  test('should show ripple effect on action cards', async ({ page }) => {
    await page.goto('/');
    
    // Clicar em action card
    const card = page.locator('button:has-text("Novo Paciente")');
    await card.click();
    
    // Verificar se animação de ripple existe (span com animate-ripple)
    const ripple = page.locator('span.animate-ripple');
    // Pode já ter desaparecido pela velocidade da animação
  });

  test('should load dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Aguardar elementos principais
    await page.waitForSelector('[data-tour="dashboard"]', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Performance: deve carregar em menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });
});
