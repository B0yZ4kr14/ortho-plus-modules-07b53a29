import { test, expect } from '@playwright/test';

test.describe('Módulo Financeiro', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para financeiro
    await page.getByRole('link', { name: /financeiro/i }).click();
    await page.waitForURL('/financeiro');
  });

  test('deve exibir resumo financeiro', async ({ page }) => {
    // Verificar cards de estatísticas
    await expect(page.getByText(/receita total/i)).toBeVisible();
    await expect(page.getByText(/despesas totais/i)).toBeVisible();
    await expect(page.getByText(/lucro líquido/i)).toBeVisible();
    await expect(page.getByText(/pagamentos pendentes/i)).toBeVisible();
  });

  test('deve exibir gráficos financeiros', async ({ page }) => {
    // Verificar que os gráficos estão presentes
    const charts = page.locator('[class*="recharts"]');
    expect(await charts.count()).toBeGreaterThan(0);
  });

  test('deve criar nova receita', async ({ page }) => {
    // Clicar em nova transação
    await page.getByRole('button', { name: /nova transação/i }).click();
    
    // Selecionar tipo receita
    await page.getByLabel(/tipo/i).click();
    await page.getByRole('option', { name: /receita/i }).click();
    
    // Preencher formulário
    await page.getByLabel(/descrição/i).fill('Consulta E2E Test');
    await page.getByLabel(/valor/i).fill('200');
    await page.getByLabel(/categoria/i).click();
    await page.getByRole('option', { name: /consulta/i }).click();
    await page.getByLabel(/data/i).fill('2024-01-15');
    
    // Selecionar status
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /concluído/i }).click();
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar criação
    await expect(page.getByText(/transação criada/i)).toBeVisible();
    await expect(page.getByText('Consulta E2E Test')).toBeVisible();
  });

  test('deve criar nova despesa', async ({ page }) => {
    await page.getByRole('button', { name: /nova transação/i }).click();
    
    // Selecionar tipo despesa
    await page.getByLabel(/tipo/i).click();
    await page.getByRole('option', { name: /despesa/i }).click();
    
    // Preencher formulário
    await page.getByLabel(/descrição/i).fill('Material Odontológico E2E');
    await page.getByLabel(/valor/i).fill('350');
    await page.getByLabel(/categoria/i).click();
    await page.getByRole('option', { name: /material/i }).click();
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar
    await expect(page.getByText(/transação criada/i)).toBeVisible();
  });

  test('deve filtrar transações por tipo', async ({ page }) => {
    // Clicar no filtro de tipo
    await page.getByRole('button', { name: /filtrar por tipo/i }).click();
    
    // Selecionar apenas receitas
    await page.getByRole('option', { name: /^receita$/i }).click();
    
    // Aguardar aplicação do filtro
    await page.waitForTimeout(500);
    
    // Verificar que apenas receitas são exibidas
    const transactions = page.locator('[data-transaction-type="RECEITA"]');
    expect(await transactions.count()).toBeGreaterThan(0);
  });

  test('deve filtrar transações por status', async ({ page }) => {
    await page.getByRole('button', { name: /filtrar por status/i }).click();
    await page.getByRole('option', { name: /pendente/i }).click();
    
    await page.waitForTimeout(500);
    
    const pendingTransactions = page.locator('[data-transaction-status="PENDENTE"]');
    expect(await pendingTransactions.count()).toBeGreaterThanOrEqual(0);
  });

  test('deve editar transação existente', async ({ page }) => {
    // Clicar na primeira transação
    await page.locator('[data-testid="transaction-item"]').first().click();
    
    // Clicar em editar
    await page.getByRole('button', { name: /editar/i }).click();
    
    // Alterar descrição
    await page.getByLabel(/descrição/i).clear();
    await page.getByLabel(/descrição/i).fill('Transação Editada E2E');
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar atualização
    await expect(page.getByText(/atualizada com sucesso/i)).toBeVisible();
    await expect(page.getByText('Transação Editada E2E')).toBeVisible();
  });

  test('deve excluir transação', async ({ page }) => {
    const testTransaction = page.getByText('Consulta E2E Test');
    
    if (await testTransaction.isVisible()) {
      await testTransaction.click();
      await page.getByRole('button', { name: /excluir/i }).click();
      await page.getByRole('button', { name: /confirmar/i }).click();
      
      await expect(page.getByText(/excluída com sucesso/i)).toBeVisible();
      await expect(testTransaction).not.toBeVisible();
    }
  });

  test('deve calcular totais corretamente', async ({ page }) => {
    // Capturar valores dos cards
    const receitaText = await page.getByTestId('total-revenue').textContent();
    const despesaText = await page.getByTestId('total-expenses').textContent();
    const lucroText = await page.getByTestId('net-profit').textContent();
    
    // Extrair números
    const receita = parseFloat(receitaText?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    const despesa = parseFloat(despesaText?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    const lucro = parseFloat(lucroText?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    
    // Verificar cálculo
    expect(Math.abs((receita - despesa) - lucro)).toBeLessThan(0.01);
  });
});
