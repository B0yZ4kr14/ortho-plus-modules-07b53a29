import { test, expect } from '@playwright/test';

test.describe('Lead Conversion E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('sb-yxpoqjyfgotkytwtifau-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should create lead and convert to patient', async ({ page }) => {
    // Navigate to CRM
    await page.goto('/crm');
    
    await expect(page.locator('h1')).toContainText('CRM');

    // Create new lead
    await page.click('button:has-text("Novo Lead")');

    await page.fill('input[name="name"]', 'Maria Oliveira');
    await page.fill('input[name="email"]', 'maria@example.com');
    await page.fill('input[name="phone"]', '11987654321');
    await page.selectOption('select[name="source"]', 'SITE');

    await page.click('button[type="submit"]');

    // Verify lead created
    await expect(page.locator('.sonner')).toContainText('Lead criado');
    await expect(page.locator('text=Maria Oliveira')).toBeVisible();

    // Move through funnel
    const leadCard = page.locator('text=Maria Oliveira').locator('..');
    
    // Update to QUALIFICADO
    await leadCard.click();
    await page.click('button:has-text("Qualificar")');
    await expect(page.locator('[data-testid="lead-status"]')).toContainText('QUALIFICADO');

    // Update to PROPOSTA
    await page.click('button:has-text("Enviar Proposta")');
    await expect(page.locator('[data-testid="lead-status"]')).toContainText('PROPOSTA');

    // Convert
    await page.click('button:has-text("Converter em Paciente")');
    await page.click('button:has-text("Confirmar Conversão")');

    // Verify conversion
    await expect(page.locator('.sonner')).toContainText('Lead convertido');
    await expect(page.locator('[data-testid="lead-status"]')).toContainText('CONVERTIDO');
    
    // Verify score is 100
    await expect(page.locator('[data-testid="lead-score"]')).toContainText('100');
  });

  test('should track lead activities', async ({ page }) => {
    await page.goto('/crm');

    // Click on existing lead
    await page.click('[data-testid="lead-card"]:first-child');

    // Add activity
    await page.click('button:has-text("Nova Atividade")');
    await page.fill('textarea[name="notes"]', 'Ligação realizada - cliente interessado');
    await page.selectOption('select[name="type"]', 'LIGACAO');
    await page.click('button:has-text("Salvar Atividade")');

    // Verify activity in timeline
    await expect(page.locator('[data-testid="activity-timeline"]')).toContainText('Ligação realizada');
  });

  test('should show lead funnel statistics', async ({ page }) => {
    await page.goto('/crm/funil');

    // Verify funnel stages
    await expect(page.locator('[data-testid="stage-novo"]')).toBeVisible();
    await expect(page.locator('[data-testid="stage-qualificado"]')).toBeVisible();
    await expect(page.locator('[data-testid="stage-proposta"]')).toBeVisible();
    await expect(page.locator('[data-testid="stage-convertido"]')).toBeVisible();

    // Verify conversion rate calculation
    const conversionRate = await page.locator('[data-testid="conversion-rate"]').textContent();
    expect(conversionRate).toMatch(/\d+%/);

    // Verify average time in funnel
    const avgTime = await page.locator('[data-testid="avg-conversion-time"]').textContent();
    expect(avgTime).toBeTruthy();
  });
});
