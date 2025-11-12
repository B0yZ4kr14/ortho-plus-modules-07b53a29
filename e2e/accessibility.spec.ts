import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Testes de Acessibilidade', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('dashboard não deve ter violações de acessibilidade', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('página de pacientes não deve ter violações', async ({ page }) => {
    await page.goto('/pacientes');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('módulo PEP não deve ter violações', async ({ page }) => {
    await page.goto('/pep');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('módulo financeiro não deve ter violações', async ({ page }) => {
    await page.goto('/financeiro');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('deve ser navegável apenas pelo teclado', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Testar navegação por Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verificar que o foco está visível
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('formulários devem ter labels associadas', async ({ page }) => {
    await page.goto('/pacientes');
    await page.getByRole('button', { name: /novo/i }).click();
    
    // Verificar que todos os inputs têm labels
    const inputs = await page.locator('input[type="text"], input[type="email"]').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('imagens devem ter alt text', async ({ page }) => {
    await page.goto('/dashboard');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('deve ter contraste adequado', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
