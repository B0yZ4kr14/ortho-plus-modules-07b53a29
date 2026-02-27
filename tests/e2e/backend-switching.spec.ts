import { test, expect } from '@playwright/test';

/**
 * FASE 5 (E2E Tests) - Backend Abstraction
 * Testa alternância entre Supabase e Ubuntu Server (PostgreSQL)
 */

test.describe('Backend Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para configurações
    await page.goto('/configuracoes');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir seletor de backend', async ({ page }) => {
    // Clicar na aba de Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Verificar que o seletor está visível
    await expect(page.getByText(/backend ativo/i)).toBeVisible();
    await expect(page.locator('select[name="backend"]')).toBeVisible();
  });

  test('deve listar backends disponíveis', async ({ page }) => {
    // Clicar na aba de Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Verificar opções do select
    const select = page.locator('select[name="backend"]');
    await expect(select.locator('option[value="supabase"]')).toBeVisible();
    await expect(select.locator('option[value="ubuntu-server"]')).toBeVisible();
  });

  test('deve exibir backend atualmente ativo', async ({ page }) => {
    // Clicar na aba de Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Verificar valor selecionado
    const select = page.locator('select[name="backend"]');
    const currentValue = await select.inputValue();
    
    expect(['supabase', 'ubuntu-server', 'postgresql']).toContain(currentValue);
  });

  test('deve alternar para Ubuntu Server', async ({ page }) => {
    // Clicar na aba de Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Selecionar Ubuntu Server
    await page.locator('select[name="backend"]').selectOption('ubuntu-server');
    
    // Verificar toast de confirmação
    await expect(page.getByText(/backend alterado/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve alternar para Supabase', async ({ page }) => {
    // Clicar na aba de Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Selecionar Supabase
    await page.locator('select[name="backend"]').selectOption('supabase');
    
    // Verificar toast de confirmação
    await expect(page.getByText(/backend alterado/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve persistir seleção após reload', async ({ page }) => {
    // Clicar na aba de Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Selecionar Supabase
    await page.locator('select[name="backend"]').selectOption('supabase');
    await page.waitForTimeout(1000);
    
    // Recarregar página
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Voltar para Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Verificar que a seleção foi mantida
    const select = page.locator('select[name="backend"]');
    const currentValue = await select.inputValue();
    
    expect(currentValue).toBe('supabase');
  });

  test('deve exibir indicador de status do backend', async ({ page }) => {
    // Clicar na aba de Administração
    await page.getByRole('tab', { name: /administração/i }).click();
    
    // Verificar indicador de status (badge ou texto)
    await expect(page.getByText(/status/i)).toBeVisible();
  });

  test('deve manter funcionalidade após troca de backend', async ({ page }) => {
    // Alternar backend
    await page.goto('/configuracoes');
    await page.getByRole('tab', { name: /administração/i }).click();
    await page.locator('select[name="backend"]').selectOption('supabase');
    await page.waitForTimeout(2000);
    
    // Testar funcionalidade básica (navegação para pacientes)
    await page.goto('/pacientes');
    await page.waitForLoadState('networkidle');
    
    // Verificar que a página carregou
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible();
  });
});
