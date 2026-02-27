import { test, expect } from '@playwright/test';

test.describe('Gestão de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    await page.goto('/pacientes');
  });

  test('deve exibir lista de pacientes', async ({ page }) => {
    await expect(page.getByText(/pacientes/i)).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('deve abrir modal de cadastro de paciente', async ({ page }) => {
    await page.getByRole('button', { name: /novo paciente|adicionar/i }).click();
    
    await expect(page.getByText(/cadastrar paciente/i)).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/cpf/i)).toBeVisible();
  });

  test('deve validar campos obrigatórios ao cadastrar', async ({ page }) => {
    await page.getByRole('button', { name: /novo paciente|adicionar/i }).click();
    await page.getByRole('button', { name: /salvar|cadastrar/i }).click();
    
    await expect(page.getByText(/campo.*obrigatório/i).first()).toBeVisible();
  });

  test('deve filtrar pacientes por nome', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i);
    await searchInput.fill('João');
    
    await page.waitForTimeout(500); // Debounce
    
    const rows = page.getByRole('row');
    await expect(rows).not.toHaveCount(0);
  });

  test('deve exibir detalhes do paciente', async ({ page }) => {
    const firstPatient = page.getByRole('row').nth(1);
    await firstPatient.click();
    
    await expect(page.getByText(/detalhes|prontuário/i)).toBeVisible();
  });
});
