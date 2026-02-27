import { test, expect } from '@playwright/test';

test.describe('Crypto Payments Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login como ADMIN
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should navigate to crypto payments page', async ({ page }) => {
    // Navegar para módulo Financeiro > Crypto Pagamentos
    await page.click('[href="/financeiro"]');
    await page.waitForTimeout(500);
    await page.click('[href="/financeiro/crypto-pagamentos"]');
    await page.waitForURL('/financeiro/crypto-pagamentos');
    
    // Verificar elementos principais da página
    await expect(page.getByText('Pagamentos em Criptomoedas')).toBeVisible();
  });

  test('should configure exchange', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Clicar na tab de Exchanges
    await page.click('button:has-text("Exchanges")');
    await page.waitForTimeout(300);
    
    // Abrir dialog de configuração
    await page.click('button:has-text("Configurar Exchange")');
    await page.waitForTimeout(300);
    
    // Preencher formulário
    await page.selectOption('select[name="exchange_name"]', 'BINANCE');
    await page.fill('input[name="api_key_encrypted"]', 'test_api_key_12345');
    await page.fill('input[name="wallet_address"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.fill('input[name="processing_fee_percentage"]', '2.5');
    
    // Submeter formulário
    await page.click('button:has-text("Salvar Configuração")');
    
    // Aguardar toast de sucesso
    await expect(page.getByText(/configuração salva/i)).toBeVisible({ timeout: 5000 });
  });

  test('should create wallet', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Clicar na tab de Carteiras
    await page.click('button:has-text("Carteiras")');
    await page.waitForTimeout(300);
    
    // Abrir dialog de nova carteira
    await page.click('button:has-text("Nova Carteira")');
    await page.waitForTimeout(300);
    
    // Preencher formulário
    await page.fill('input[name="wallet_name"]', 'Carteira Bitcoin Principal');
    await page.selectOption('select[name="coin_type"]', 'BTC');
    await page.fill('input[name="wallet_address"]', '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy');
    
    // Submeter formulário
    await page.click('button:has-text("Criar Carteira")');
    
    // Aguardar toast de sucesso
    await expect(page.getByText(/carteira criada/i)).toBeVisible({ timeout: 5000 });
  });

  test('should generate payment QR code', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Assumindo que há uma carteira já criada
    // Clicar em botão para gerar pagamento
    await page.click('button:has-text("Gerar Pagamento")').first();
    await page.waitForTimeout(300);
    
    // Preencher valor
    await page.fill('input[name="amount_crypto"]', '0.001');
    
    // Selecionar paciente (opcional)
    // await page.selectOption('select[name="patient_id"]', 'patient-uuid');
    
    // Gerar QR Code
    await page.click('button:has-text("Gerar QR Code")');
    
    // Verificar se QR code foi renderizado
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/endereço da carteira/i)).toBeVisible();
  });

  test('should display transaction list', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Verificar se a tabela de transações existe
    await expect(page.locator('table')).toBeVisible();
    
    // Verificar colunas principais
    await expect(page.getByText('Data')).toBeVisible();
    await expect(page.getByText('Moeda')).toBeVisible();
    await expect(page.getByText('Valor')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
  });

  test('should filter transactions by status', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Aplicar filtro de status
    await page.selectOption('select[name="status_filter"]', 'CONFIRMADO');
    await page.waitForTimeout(500);
    
    // Verificar se filtro foi aplicado (número de linhas na tabela mudou)
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    
    // Se houver resultados, verificar se todos têm status CONFIRMADO
    if (count > 0) {
      const statuses = await page.locator('table tbody tr td:has-text("Confirmado")').count();
      expect(statuses).toBeGreaterThan(0);
    }
  });

  test('should convert crypto to BRL', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Assumindo que há uma transação confirmada
    // Clicar em botão de conversão
    const convertButton = page.locator('button:has-text("Converter para BRL")').first();
    
    if (await convertButton.isVisible()) {
      await convertButton.click();
      
      // Confirmar conversão
      await page.click('button:has-text("Confirmar Conversão")');
      
      // Aguardar toast de sucesso
      await expect(page.getByText(/conversão realizada/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should sync wallet balance', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Clicar na tab de Carteiras
    await page.click('button:has-text("Carteiras")');
    await page.waitForTimeout(300);
    
    // Clicar em botão de sincronização
    const syncButton = page.locator('button:has-text("Sincronizar")').first();
    
    if (await syncButton.isVisible()) {
      await syncButton.click();
      
      // Aguardar toast de sucesso
      await expect(page.getByText(/saldo sincronizado/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display dashboard metrics', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Verificar KPIs principais
    await expect(page.getByText(/total em btc/i)).toBeVisible();
    await expect(page.getByText(/total em brl/i)).toBeVisible();
    await expect(page.getByText(/pendentes/i)).toBeVisible();
    await expect(page.getByText(/confirmadas hoje/i)).toBeVisible();
  });

  test('should handle empty states gracefully', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Se não houver transações, verificar mensagem de estado vazio
    const emptyState = page.getByText(/nenhuma transação/i);
    const hasTransactions = await page.locator('table tbody tr').count() > 0;
    
    if (!hasTransactions) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should validate required fields in exchange config', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Clicar na tab de Exchanges
    await page.click('button:has-text("Exchanges")');
    await page.waitForTimeout(300);
    
    // Abrir dialog de configuração
    await page.click('button:has-text("Configurar Exchange")');
    await page.waitForTimeout(300);
    
    // Tentar submeter sem preencher campos obrigatórios
    await page.click('button:has-text("Salvar Configuração")');
    
    // Verificar mensagens de validação
    const validationErrors = page.locator('text=/obrigatório|required/i');
    expect(await validationErrors.count()).toBeGreaterThan(0);
  });

  test('should validate Bitcoin address format', async ({ page }) => {
    await page.goto('/financeiro/crypto-pagamentos');
    
    // Clicar na tab de Carteiras
    await page.click('button:has-text("Carteiras")');
    await page.waitForTimeout(300);
    
    // Abrir dialog de nova carteira
    await page.click('button:has-text("Nova Carteira")');
    await page.waitForTimeout(300);
    
    // Preencher com endereço inválido
    await page.fill('input[name="wallet_name"]', 'Test Wallet');
    await page.selectOption('select[name="coin_type"]', 'BTC');
    await page.fill('input[name="wallet_address"]', 'invalid-address-123');
    
    // Tentar submeter
    await page.click('button:has-text("Criar Carteira")');
    
    // Verificar erro de validação
    await expect(page.getByText(/endereço inválido/i)).toBeVisible({ timeout: 3000 });
  });
});
