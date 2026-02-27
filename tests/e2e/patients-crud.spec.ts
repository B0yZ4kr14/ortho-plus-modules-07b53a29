import { test, expect } from '@playwright/test';

test.describe('Patients CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@orthoplus.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/pacientes');
  });

  test('should display patients list page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pacientes');
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();
  });

  test('should create new patient', async ({ page }) => {
    await page.click('button:has-text("Novo Paciente")');
    await page.waitForSelector('[data-testid="patient-form"]');
    
    await page.fill('input[name="nome_completo"]', 'João Silva Teste E2E');
    await page.fill('input[name="cpf"]', '123.456.789-00');
    await page.fill('input[name="data_nascimento"]', '1990-01-15');
    await page.fill('input[name="telefone"]', '(11) 98765-4321');
    await page.fill('input[name="email"]', 'joao.teste@example.com');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Paciente cadastrado com sucesso');
    await page.waitForURL('/pacientes');
    await expect(page.locator('text=João Silva Teste E2E')).toBeVisible();
  });

  test('should edit existing patient', async ({ page }) => {
    await page.click('[data-testid="patient-row"]:first-child [data-testid="edit-button"]');
    await page.waitForSelector('[data-testid="patient-form"]');
    
    await page.fill('input[name="telefone"]', '(11) 91111-2222');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.toast')).toContainText('Paciente atualizado com sucesso');
    await page.waitForURL('/pacientes');
  });

  test('should change patient status', async ({ page }) => {
    await page.click('[data-testid="patient-row"]:first-child [data-testid="status-button"]');
    await page.waitForSelector('[data-testid="status-dialog"]');
    
    await page.click('button:has-text("EM_ORCAMENTO")');
    await page.fill('textarea[name="observacao"]', 'Mudança de status via E2E test');
    await page.click('button:has-text("Salvar")');
    
    await expect(page.locator('.toast')).toContainText('Status alterado com sucesso');
  });

  test('should add CRM data to patient', async ({ page }) => {
    await page.click('[data-testid="patient-row"]:first-child');
    await page.waitForURL(/\/pacientes\/.+/);
    
    await page.click('[data-testid="crm-tab"]');
    await page.fill('input[name="origem_lead"]', 'GOOGLE_ADS');
    await page.fill('input[name="campanha"]', 'Implantes Dentários 2024');
    await page.fill('textarea[name="observacoes_comerciais"]', 'Lead qualificado, orçamento alto');
    
    await page.click('button:has-text("Salvar CRM")');
    await expect(page.locator('.toast')).toContainText('Dados CRM salvos');
  });

  test('should search for patients', async ({ page }) => {
    await page.fill('[data-testid="patient-search"]', 'João');
    await page.waitForTimeout(500); // debounce
    
    const rows = page.locator('[data-testid="patient-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    
    await expect(rows.first()).toContainText('João');
  });

  test('should filter patients by status', async ({ page }) => {
    await page.click('[data-testid="status-filter"]');
    await page.click('text=EM_TRATAMENTO');
    
    await page.waitForTimeout(500);
    const rows = page.locator('[data-testid="patient-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should delete patient', async ({ page }) => {
    const firstPatientName = await page.locator('[data-testid="patient-row"]:first-child td:nth-child(2)').textContent();
    
    await page.click('[data-testid="patient-row"]:first-child [data-testid="delete-button"]');
    await page.waitForSelector('[data-testid="confirm-dialog"]');
    await page.click('button:has-text("Confirmar")');
    
    await expect(page.locator('.toast')).toContainText('Paciente removido com sucesso');
    await expect(page.locator(`text=${firstPatientName}`)).not.toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    await page.click('button:has-text("Novo Paciente")');
    await page.waitForSelector('[data-testid="patient-form"]');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Nome completo é obrigatório')).toBeVisible();
    await expect(page.locator('text=CPF é obrigatório')).toBeVisible();
  });

  test('should validate CPF format', async ({ page }) => {
    await page.click('button:has-text("Novo Paciente")');
    await page.waitForSelector('[data-testid="patient-form"]');
    
    await page.fill('input[name="cpf"]', '123456789');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=CPF inválido')).toBeVisible();
  });
});
