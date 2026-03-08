import { test, expect } from './fixtures';

test.describe('Teleodontologia Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should navigate to Teleodonto page', async ({ page }) => {
    await page.goto('/teleodonto');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('/teleodonto');
    await expect(page.locator('h1')).toContainText('Teleodontologia');
  });

  test('should display dashboard metrics', async ({ page }) => {
    await page.goto('/teleodonto');
    
    await expect(page.getByText('Sessões Hoje')).toBeVisible();
    await expect(page.getByText('Duração Média')).toBeVisible();
    await expect(page.getByText('Taxa de Conclusão')).toBeVisible();
    await expect(page.getByText('Satisfação')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/teleodonto');
    
    // Dashboard tab (default)
    await expect(page.getByRole('tabpanel')).toContainText('Sessões Hoje');
    
    // Sessões tab
    await page.click('button:has-text("Sessões")');
    await expect(page.getByText('Sessões Recentes')).toBeVisible();
    
    // Agenda tab
    await page.click('button:has-text("Agenda")');
    await expect(page.getByText('Calendário')).toBeVisible();
  });

  test('should display session list', async ({ page }) => {
    await page.goto('/teleodonto');
    await page.click('button:has-text("Sessões")');
    
    // Verificar se lista de sessões está visível
    await expect(page.getByText('Sessões Recentes')).toBeVisible();
  });
});
