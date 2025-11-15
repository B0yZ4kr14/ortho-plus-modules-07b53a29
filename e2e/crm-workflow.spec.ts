import { test, expect } from '@playwright/test';

test.describe('CRM Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login (você precisa ajustar com credenciais válidas)
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@orthoplus.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should navigate to CRM page', async ({ page }) => {
    await page.click('a[href="/crm-kanban"]');
    await expect(page).toHaveURL('/crm-kanban');
    await expect(page.locator('h1')).toContainText('CRM');
  });

  test('should display lead kanban board', async ({ page }) => {
    await page.goto('/crm-kanban');
    
    // Verificar colunas do kanban
    await expect(page.getByText('Novos')).toBeVisible();
    await expect(page.getByText('Contato')).toBeVisible();
    await expect(page.getByText('Proposta')).toBeVisible();
    await expect(page.getByText('Ganho')).toBeVisible();
  });

  test('should open lead creation dialog', async ({ page }) => {
    await page.goto('/crm-kanban');
    await page.click('button:has-text("Novo Lead")');
    
    // Verificar se o dialog abriu
    await expect(page.getByText('Criar Novo Lead')).toBeVisible();
  });

  test('should create a new lead', async ({ page }) => {
    await page.goto('/crm-kanban');
    await page.click('button:has-text("Novo Lead")');
    
    // Preencher formulário
    await page.fill('input[name="name"]', 'João Test');
    await page.fill('input[name="email"]', 'joao@test.com');
    await page.fill('input[name="phone"]', '11999999999');
    await page.fill('input[name="estimated_value"]', '1500');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar se foi criado (aguardar toast)
    await expect(page.getByText('Lead criado com sucesso')).toBeVisible();
  });
});
