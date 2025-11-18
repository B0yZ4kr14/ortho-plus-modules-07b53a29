import { test, expect } from '@playwright/test';

test.describe('Crypto Payment Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@orthoplus.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/financeiro/crypto');
  });

  test('should display crypto dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pagamentos em Criptomoedas');
    await expect(page.locator('[data-testid="btc-balance"]')).toBeVisible();
    await expect(page.locator('[data-testid="usdt-balance"]')).toBeVisible();
  });

  test('should create PSBT transaction', async ({ page }) => {
    await page.click('button:has-text("Nova Transação PSBT")');
    await page.waitForSelector('[data-testid="psbt-builder"]');
    
    await page.fill('input[name="destinatario"]', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    await page.fill('input[name="valor_btc"]', '0.001');
    await page.fill('input[name="fee_rate"]', '5');
    
    await page.click('button:has-text("Criar PSBT")');
    await expect(page.locator('[data-testid="psbt-output"]')).toBeVisible();
  });

  test('should generate QR code for PSBT', async ({ page }) => {
    await page.click('button:has-text("Nova Transação PSBT")');
    await page.waitForSelector('[data-testid="psbt-builder"]');
    
    await page.fill('input[name="destinatario"]', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    await page.fill('input[name="valor_btc"]', '0.001');
    await page.click('button:has-text("Criar PSBT")');
    
    await page.click('button:has-text("Gerar QR Code")');
    await expect(page.locator('[data-testid="psbt-qr-code"]')).toBeVisible();
  });

  test('should integrate with Krux hardware wallet', async ({ page }) => {
    await page.click('[data-testid="krux-tab"]');
    await page.click('button:has-text("Conectar Krux")');
    
    await page.waitForSelector('[data-testid="krux-connection-status"]');
    await expect(page.locator('text=Aguardando dispositivo')).toBeVisible();
    
    // Simular scan de QR code
    await page.click('button:has-text("Simular Conexão")');
    await expect(page.locator('text=Krux conectado')).toBeVisible();
  });

  test('should sign transaction with Krux', async ({ page }) => {
    await page.click('[data-testid="krux-tab"]');
    await page.click('button:has-text("Conectar Krux")');
    await page.click('button:has-text("Simular Conexão")');
    
    await page.click('button:has-text("Assinar Transação")');
    await page.waitForSelector('[data-testid="transaction-to-sign"]');
    
    await page.click('button:has-text("Confirmar Assinatura")');
    await expect(page.locator('.toast')).toContainText('Transação assinada com sucesso');
  });

  test('should configure xPub for watch-only wallet', async ({ page }) => {
    await page.click('[data-testid="configuracoes-tab"]');
    await page.click('button:has-text("Configurar xPub")');
    
    await page.fill('textarea[name="xpub"]', 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz');
    await page.selectOption('select[name="derivation_path"]', "m/84'/0'/0'");
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('xPub configurada com sucesso');
  });

  test('should monitor incoming Bitcoin payments', async ({ page }) => {
    await page.click('[data-testid="monitoring-tab"]');
    await expect(page.locator('[data-testid="monitored-addresses"]')).toBeVisible();
    
    const addresses = page.locator('[data-testid="address-row"]');
    const count = await addresses.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should configure DCA strategy', async ({ page }) => {
    await page.click('[data-testid="estrategias-tab"]');
    await page.click('button:has-text("Nova Estratégia DCA")');
    
    await page.fill('input[name="valor_mensal"]', '1000.00');
    await page.selectOption('select[name="moeda"]', 'BTC');
    await page.fill('input[name="dia_compra"]', '10');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Estratégia DCA configurada');
  });

  test('should set price alerts', async ({ page }) => {
    await page.click('[data-testid="alertas-tab"]');
    await page.click('button:has-text("Novo Alerta")');
    
    await page.selectOption('select[name="moeda"]', 'BTC');
    await page.selectOption('select[name="tipo_alerta"]', 'ACIMA');
    await page.fill('input[name="preco_alvo"]', '100000');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Alerta de preço criado');
  });

  test('should display portfolio summary', async ({ page }) => {
    await page.click('[data-testid="portfolio-tab"]');
    await expect(page.locator('[data-testid="total-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="allocation-chart"]')).toBeVisible();
    
    await expect(page.locator('text=Bitcoin (BTC)')).toBeVisible();
    await expect(page.locator('text=Tether (USDT)')).toBeVisible();
  });

  test('should export crypto transactions to CSV', async ({ page }) => {
    await page.click('[data-testid="transacoes-tab"]');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar CSV")')
    ]);
    
    expect(download.suggestedFilename()).toMatch(/crypto-transactions-.*\.csv/);
  });
});
