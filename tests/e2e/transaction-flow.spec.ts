import { test, expect } from '@playwright/test';

test.describe('Transaction Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('sb-yxpoqjyfgotkytwtifau-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should create and pay a transaction', async ({ page }) => {
    // Navigate to financeiro
    await page.goto('/financeiro');
    
    // Wait for page load
    await expect(page.locator('h1')).toContainText('Financeiro');

    // Open create dialog
    await page.click('button:has-text("Nova Transação")');

    // Fill form
    await page.fill('input[name="description"]', 'Consulta Teste E2E');
    await page.fill('input[name="amount"]', '150');
    await page.selectOption('select[name="type"]', 'RECEITA');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify toast
    await expect(page.locator('.sonner')).toContainText('Transação criada');

    // Find transaction in list
    const transaction = page.locator('text=Consulta Teste E2E').first();
    await expect(transaction).toBeVisible();

    // Click to mark as paid
    await transaction.click();
    await page.click('button:has-text("Marcar como Paga")');
    
    // Select payment method
    await page.selectOption('select[name="paymentMethod"]', 'PIX');
    await page.click('button:has-text("Confirmar Pagamento")');

    // Verify paid status
    await expect(page.locator('text=PAGA')).toBeVisible();
  });

  test('should filter transactions by period', async ({ page }) => {
    await page.goto('/financeiro');

    // Open period filter
    await page.click('button:has-text("Período")');
    
    // Select last month
    await page.click('text=Mês Passado');

    // Verify URL updated
    await expect(page).toHaveURL(/period=lastMonth/);

    // Verify filter applied
    await expect(page.locator('[data-testid="period-badge"]')).toContainText('Mês Passado');
  });

  test('should calculate correct cash flow', async ({ page }) => {
    await page.goto('/financeiro/fluxo-caixa');

    // Wait for charts to load
    await page.waitForSelector('[data-testid="cash-flow-chart"]');

    // Verify summary cards
    const receitas = await page.locator('[data-testid="total-receitas"]').textContent();
    const despesas = await page.locator('[data-testid="total-despesas"]').textContent();
    const saldo = await page.locator('[data-testid="saldo"]').textContent();

    expect(receitas).toBeTruthy();
    expect(despesas).toBeTruthy();
    expect(saldo).toBeTruthy();

    // Verify math: saldo = receitas - despesas
    const receitasNum = parseFloat(receitas!.replace(/[^0-9.-]+/g, ''));
    const despesasNum = parseFloat(despesas!.replace(/[^0-9.-]+/g, ''));
    const saldoNum = parseFloat(saldo!.replace(/[^0-9.-]+/g, ''));

    expect(saldoNum).toBeCloseTo(receitasNum - despesasNum, 2);
  });
});
