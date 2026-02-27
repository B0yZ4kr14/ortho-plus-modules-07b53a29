import { test, expect } from '@playwright/test';

test.describe('Gestão de Módulos (ADMIN)', () => {
  test.beforeEach(async ({ page }) => {
    // Login como ADMIN
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para gestão de módulos
    await page.goto('/settings/modules');
  });

  test('deve exibir lista completa de módulos', async ({ page }) => {
    await expect(page.getByText(/gestão de módulos/i)).toBeVisible();
    
    // Verificar categorias principais
    await expect(page.getByText(/gestão e operação/i)).toBeVisible();
    await expect(page.getByText(/financeiro/i)).toBeVisible();
    await expect(page.getByText(/crescimento e marketing/i)).toBeVisible();
  });

  test('deve ativar módulo sem dependências', async ({ page }) => {
    // Localizar um módulo inativo sem dependências
    const moduleCard = page.locator('[data-module="AGENDA"]').first();
    const toggleSwitch = moduleCard.locator('button[role="switch"]');
    
    const isActive = await toggleSwitch.getAttribute('data-state');
    
    if (isActive === 'unchecked') {
      await toggleSwitch.click();
      await expect(page.getByText(/módulo ativado com sucesso/i)).toBeVisible();
    }
  });

  test('deve bloquear ativação de módulo com dependências não atendidas', async ({ page }) => {
    // SPLIT_PAGAMENTO depende de FINANCEIRO
    const splitModule = page.locator('[data-module="SPLIT_PAGAMENTO"]').first();
    const toggleSwitch = splitModule.locator('button[role="switch"]');
    
    // Tentar ativar sem dependência
    await toggleSwitch.click();
    
    // Deve mostrar erro de dependência
    await expect(page.getByText(/requer o módulo/i)).toBeVisible();
  });

  test('deve bloquear desativação de módulo com dependentes ativos', async ({ page }) => {
    // Primeiro ativar FINANCEIRO
    const financeiroModule = page.locator('[data-module="FINANCEIRO"]').first();
    await financeiroModule.locator('button[role="switch"]').click();
    await page.waitForTimeout(500);
    
    // Ativar SPLIT_PAGAMENTO (dependente)
    const splitModule = page.locator('[data-module="SPLIT_PAGAMENTO"]').first();
    await splitModule.locator('button[role="switch"]').click();
    await page.waitForTimeout(500);
    
    // Tentar desativar FINANCEIRO (deve falhar)
    await financeiroModule.locator('button[role="switch"]').click();
    await expect(page.getByText(/este módulo é requerido/i)).toBeVisible();
  });

  test('deve exibir informações de dependências no tooltip', async ({ page }) => {
    const moduleCard = page.locator('[data-module="SPLIT_PAGAMENTO"]').first();
    
    // Hover para mostrar tooltip
    await moduleCard.hover();
    
    // Verificar que tooltip mostra dependências
    await expect(page.getByText(/requer/i)).toBeVisible();
  });
});

test.describe('Visualização de Módulos (MEMBER)', () => {
  test.beforeEach(async ({ page }) => {
    // Login como MEMBER
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('member@orthomais.com');
    await page.getByLabel(/senha/i).fill('Member123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('MEMBER não deve ter acesso à gestão de módulos', async ({ page }) => {
    await page.goto('/settings/modules');
    
    // Deve ser redirecionado ou mostrar acesso negado
    await expect(page).not.toHaveURL('/settings/modules');
  });

  test('MEMBER deve ver apenas módulos ativos e autorizados na sidebar', async ({ page }) => {
    // Verificar que sidebar mostra apenas módulos permitidos
    const sidebar = page.locator('[data-sidebar]');
    
    // Módulos básicos devem estar visíveis
    await expect(sidebar.getByText(/pacientes/i)).toBeVisible();
    
    // Módulos administrativos NÃO devem estar visíveis
    await expect(sidebar.getByText(/gestão de módulos/i)).not.toBeVisible();
  });
});
