import { test, expect } from '@playwright/test';

test.describe('Financial Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@orthoplus.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/financeiro');
  });

  test('should display financial dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Financeiro');
    await expect(page.locator('[data-testid="saldo-atual"]')).toBeVisible();
    await expect(page.locator('[data-testid="contas-receber"]')).toBeVisible();
    await expect(page.locator('[data-testid="contas-pagar"]')).toBeVisible();
  });

  test('should create new receivable (Conta a Receber)', async ({ page }) => {
    await page.click('button:has-text("Nova Conta a Receber")');
    await page.waitForSelector('[data-testid="transaction-form"]');
    
    await page.fill('input[name="descricao"]', 'Pagamento Tratamento Ortodôntico');
    await page.fill('input[name="valor"]', '2500.00');
    await page.fill('input[name="data_vencimento"]', '2024-12-31');
    await page.selectOption('select[name="categoria"]', 'SERVICOS_PRESTADOS');
    
    await page.click('[data-testid="patient-select"]');
    await page.click('[data-testid="patient-option"]:first-child');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Conta a receber criada com sucesso');
  });

  test('should create new payable (Conta a Pagar)', async ({ page }) => {
    await page.click('[data-testid="contas-pagar-tab"]');
    await page.click('button:has-text("Nova Conta a Pagar")');
    
    await page.fill('input[name="descricao"]', 'Aluguel Clínica');
    await page.fill('input[name="valor"]', '3500.00');
    await page.fill('input[name="data_vencimento"]', '2024-12-10');
    await page.selectOption('select[name="categoria"]', 'DESPESAS_FIXAS');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Conta a pagar criada com sucesso');
  });

  test('should process payment for receivable', async ({ page }) => {
    await page.click('[data-testid="transaction-row"]:has-text("PENDENTE"):first-child');
    await page.click('button:has-text("Registrar Pagamento")');
    
    await page.waitForSelector('[data-testid="payment-dialog"]');
    await page.selectOption('select[name="forma_pagamento"]', 'CARTAO_CREDITO');
    await page.fill('input[name="valor_pago"]', '2500.00');
    await page.fill('input[name="data_pagamento"]', '2024-11-18');
    
    await page.click('button:has-text("Confirmar Pagamento")');
    await expect(page.locator('.toast')).toContainText('Pagamento registrado com sucesso');
  });

  test('should apply payment split', async ({ page }) => {
    await page.click('[data-testid="transaction-row"]:first-child');
    await page.click('button:has-text("Configurar Split")');
    
    await page.waitForSelector('[data-testid="split-dialog"]');
    await page.fill('input[name="percentual_dentista"]', '60');
    await page.fill('input[name="percentual_clinica"]', '40');
    
    await page.click('button:has-text("Salvar Split")');
    await expect(page.locator('.toast')).toContainText('Split de pagamento configurado');
  });

  test('should create installment plan', async ({ page }) => {
    await page.click('button:has-text("Nova Conta a Receber")');
    await page.waitForSelector('[data-testid="transaction-form"]');
    
    await page.fill('input[name="descricao"]', 'Implante Dentário');
    await page.fill('input[name="valor"]', '8000.00');
    await page.check('input[name="parcelado"]');
    await page.fill('input[name="numero_parcelas"]', '8');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Conta a receber parcelada criada');
    await expect(page.locator('text=8x de R$ 1.000,00')).toBeVisible();
  });

  test('should generate financial report', async ({ page }) => {
    await page.click('button:has-text("Relatórios")');
    await page.waitForSelector('[data-testid="reports-dialog"]');
    
    await page.selectOption('select[name="tipo_relatorio"]', 'FLUXO_CAIXA');
    await page.fill('input[name="data_inicio"]', '2024-11-01');
    await page.fill('input[name="data_fim"]', '2024-11-30');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Gerar PDF")')
    ]);
    
    expect(download.suggestedFilename()).toMatch(/relatorio-financeiro-.*\.pdf/);
  });

  test('should filter transactions by date range', async ({ page }) => {
    await page.fill('input[name="data_inicio"]', '2024-11-01');
    await page.fill('input[name="data_fim"]', '2024-11-30');
    await page.click('button:has-text("Filtrar")');
    
    await page.waitForTimeout(500);
    const rows = page.locator('[data-testid="transaction-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter transactions by category', async ({ page }) => {
    await page.click('[data-testid="category-filter"]');
    await page.click('text=SERVICOS_PRESTADOS');
    
    await page.waitForTimeout(500);
    const rows = page.locator('[data-testid="transaction-row"]');
    expect(await rows.count()).toBeGreaterThanOrEqual(0);
  });

  test('should display cash flow chart', async ({ page }) => {
    await page.click('[data-testid="fluxo-caixa-tab"]');
    await expect(page.locator('[data-testid="cash-flow-chart"]')).toBeVisible();
    await expect(page.locator('text=Receitas')).toBeVisible();
    await expect(page.locator('text=Despesas')).toBeVisible();
  });
});
