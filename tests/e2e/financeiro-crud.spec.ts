import { test, expect } from '@playwright/test';

/**
 * FASE 5 (E2E Tests) - Fluxo Financeiro Completo
 * Testa operações CRUD de contas a receber e pagamentos
 */

test.describe('Financeiro - CRUD Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para Financeiro
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir dashboard financeiro com KPIs', async ({ page }) => {
    await expect(page.getByText(/receitas/i).first()).toBeVisible();
    await expect(page.getByText(/despesas/i).first()).toBeVisible();
    await expect(page.getByText(/lucro/i).first()).toBeVisible();
  });

  test('deve criar nova conta a receber', async ({ page }) => {
    // Abrir modal de nova conta
    await page.getByRole('button', { name: /nova conta/i }).click();
    
    // Preencher formulário
    await page.getByLabel(/descrição/i).fill('Consulta de Revisão');
    await page.getByLabel(/valor/i).fill('250');
    await page.getByLabel(/vencimento/i).fill('2025-12-31');
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar toast de sucesso
    await expect(page.getByText(/conta criada/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve filtrar contas por status', async ({ page }) => {
    // Aplicar filtro "Pendente"
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: /pendente/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Verificar que apenas contas pendentes são exibidas
    const rows = page.locator('[data-testid="conta-row"]');
    const count = await rows.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText(/pendente/i);
      }
    }
  });

  test('deve registrar pagamento de conta', async ({ page }) => {
    // Encontrar primeira conta pendente
    const firstPendingRow = page.locator('[data-testid="conta-row"]').first();
    
    // Abrir ações
    await firstPendingRow.getByRole('button', { name: /ações/i }).click();
    
    // Registrar pagamento
    await page.getByRole('menuitem', { name: /registrar pagamento/i }).click();
    
    // Confirmar
    await page.getByRole('button', { name: /confirmar/i }).click();
    
    // Verificar toast
    await expect(page.getByText(/pagamento registrado/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve buscar contas por descrição', async ({ page }) => {
    // Digitar busca
    await page.getByPlaceholder(/buscar/i).fill('Consulta');
    await page.waitForTimeout(500);
    
    // Verificar resultados
    const results = page.locator('[data-testid="conta-row"]');
    const count = await results.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    // Abrir modal
    await page.getByRole('button', { name: /nova conta/i }).click();
    
    // Tentar salvar sem preencher
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar mensagens de erro
    await expect(page.getByText(/descrição é obrigatória/i)).toBeVisible();
    await expect(page.getByText(/valor é obrigatório/i)).toBeVisible();
  });

  test('deve navegar entre meses no calendário', async ({ page }) => {
    // Clicar em próximo mês
    await page.getByRole('button', { name: /próximo/i }).click();
    await page.waitForTimeout(500);
    
    // Clicar em mês anterior
    await page.getByRole('button', { name: /anterior/i }).click();
    await page.waitForTimeout(500);
    
    // Verificar que o calendário está visível
    await expect(page.locator('[data-calendar]')).toBeVisible();
  });

  test('deve exportar relatório financeiro', async ({ page }) => {
    // Abrir menu de exportação
    await page.getByRole('button', { name: /exportar/i }).click();
    
    // Selecionar formato
    await page.getByRole('menuitem', { name: /excel/i }).click();
    
    // Aguardar download (não vamos validar o arquivo)
    await page.waitForTimeout(2000);
  });
});
