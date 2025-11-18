import { test, expect } from '@playwright/test';

test.describe('PEP (Prontuário Eletrônico) Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@orthoplus.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should create new prontuário for patient', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('button:has-text("Novo Prontuário")');
    
    await page.waitForSelector('[data-testid="prontuario-form"]');
    await page.click('[data-testid="patient-select"]');
    await page.click('[data-testid="patient-option"]:first-child');
    
    await page.fill('textarea[name="queixa_principal"]', 'Dor no dente 36');
    await page.fill('textarea[name="historico_doenca_atual"]', 'Paciente relata dor há 3 dias');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Prontuário criado com sucesso');
  });

  test('should fill anamnese form', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    await page.click('[data-testid="anamnese-tab"]');
    await page.check('input[name="tem_doenca_cardiovascular"]');
    await page.check('input[name="tem_diabetes"]');
    await page.fill('textarea[name="medicamentos_uso_continuo"]', 'Metformina 850mg, Losartana 50mg');
    await page.fill('textarea[name="alergias"]', 'Penicilina');
    
    await page.click('button:has-text("Salvar Anamnese")');
    await expect(page.locator('.toast')).toContainText('Anamnese salva com sucesso');
  });

  test('should interact with odontograma', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    await page.click('[data-testid="odontograma-tab"]');
    await page.waitForSelector('[data-testid="odontograma-canvas"]');
    
    // Clicar no dente 36
    await page.click('[data-testid="tooth-36"]');
    await page.click('button:has-text("Cariado")');
    
    // Clicar no dente 46
    await page.click('[data-testid="tooth-46"]');
    await page.click('button:has-text("Restaurado")');
    
    await page.click('button:has-text("Salvar Odontograma")');
    await expect(page.locator('.toast')).toContainText('Odontograma salvo com sucesso');
  });

  test('should add treatment plan', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    await page.click('[data-testid="plano-tratamento-tab"]');
    await page.click('button:has-text("Adicionar Procedimento")');
    
    await page.fill('input[name="procedimento"]', 'Restauração em Resina Composta');
    await page.fill('input[name="dente"]', '36');
    await page.fill('input[name="valor"]', '350.00');
    await page.click('button:has-text("Adicionar")');
    
    await expect(page.locator('text=Restauração em Resina Composta')).toBeVisible();
  });

  test('should record clinical evolution', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    await page.click('[data-testid="evolucao-tab"]');
    await page.click('button:has-text("Nova Evolução")');
    
    await page.fill('textarea[name="evolucao"]', 'Paciente retornou para avaliação. Dor reduzida. Seguir com tratamento.');
    await page.fill('input[name="procedimento_realizado"]', 'Consulta de retorno');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Evolução registrada com sucesso');
  });

  test('should upload attachment to prontuário', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    await page.click('[data-testid="anexos-tab"]');
    await page.setInputFiles('input[type="file"]', './e2e/fixtures/test-xray.jpg');
    
    await page.fill('input[name="descricao_anexo"]', 'Radiografia periapical dente 36');
    await page.click('button:has-text("Upload")');
    
    await expect(page.locator('.toast')).toContainText('Anexo enviado com sucesso');
    await expect(page.locator('text=Radiografia periapical dente 36')).toBeVisible();
  });

  test('should sign prontuário digitally', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    await page.click('[data-testid="assinatura-tab"]');
    await page.waitForSelector('[data-testid="signature-canvas"]');
    
    // Simular assinatura (desenho no canvas)
    const canvas = page.locator('[data-testid="signature-canvas"]');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 100);
      await page.mouse.up();
    }
    
    await page.click('button:has-text("Assinar Prontuário")');
    await expect(page.locator('.toast')).toContainText('Prontuário assinado digitalmente');
  });

  test('should view prontuário history', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    await page.click('[data-testid="historico-tab"]');
    await expect(page.locator('[data-testid="history-timeline"]')).toBeVisible();
    
    const events = page.locator('[data-testid="history-event"]');
    const count = await events.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should export prontuário to PDF', async ({ page }) => {
    await page.goto('/prontuario');
    await page.click('[data-testid="prontuario-row"]:first-child');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar PDF")')
    ]);
    
    expect(download.suggestedFilename()).toMatch(/prontuario-.*\.pdf/);
  });

  test('should search prontuários by patient name', async ({ page }) => {
    await page.goto('/prontuario');
    await page.fill('[data-testid="prontuario-search"]', 'João');
    await page.waitForTimeout(500);
    
    const rows = page.locator('[data-testid="prontuario-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
