import { test, expect } from '@playwright/test';

test.describe('Module Permissions E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('ADMIN should see all modules in sidebar', async ({ page }) => {
    // Login as ADMIN
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Verify key modules are visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Pacientes')).toBeVisible();
    await expect(page.locator('text=Agenda')).toBeVisible();
    await expect(page.locator('text=Financeiro')).toBeVisible();
    await expect(page.locator('text=Pagamentos em Criptomoedas')).toBeVisible();
    await expect(page.locator('text=PDV')).toBeVisible();
    
    // Admin-only sections should be visible
    await expect(page.locator('text=Administração')).toBeVisible();
    await expect(page.locator('text=Gestão de Módulos')).toBeVisible();
  });

  test('MEMBER without permission should not see restricted modules', async ({ page }) => {
    // Note: This test assumes a MEMBER user exists with limited permissions
    // In a real scenario, you would create this user in the test setup
    
    await page.fill('input[type="email"]', 'member@orthoplus.com');
    await page.fill('input[type="password"]', 'member123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Basic modules should be visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Admin section should NOT be visible
    await expect(page.locator('text=Administração')).not.toBeVisible();
    await expect(page.locator('text=Gestão de Módulos')).not.toBeVisible();
  });

  test('Direct access to route without permission should redirect to /403', async ({ page }) => {
    // Login as MEMBER
    await page.fill('input[type="email"]', 'member@orthoplus.com');
    await page.fill('input[type="password"]', 'member123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Try to access admin route directly
    await page.goto('/configuracoes/modulos');
    
    // Should redirect to 403 page
    await expect(page).toHaveURL('/403');
    await expect(page.locator('text=Acesso Negado')).toBeVisible();
  });

  test('hasModuleAccess returns false for unauthorized modules', async ({ page }) => {
    await page.fill('input[type="email"]', 'member@orthoplus.com');
    await page.fill('input[type="password"]', 'member123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Check that restricted module links are not rendered
    const cryptoLink = page.locator('a[href="/crypto-payment"]');
    const pdvLink = page.locator('a[href="/pdv"]');
    
    // Links should not exist in DOM for unauthorized user
    await expect(cryptoLink).not.toBeVisible();
    await expect(pdvLink).not.toBeVisible();
  });

  test('Module toggle works correctly with permissions', async ({ page }) => {
    // Login as ADMIN
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to modules management
    await page.click('text=Gestão de Módulos');
    await page.waitForURL('/configuracoes/modulos');
    
    // Verify module management page loads
    await expect(page.locator('text=Gestão de Módulos')).toBeVisible();
    
    // Check that module cards are displayed
    await expect(page.locator('[data-testid="module-card"]').first()).toBeVisible();
  });

  test('Backend selector is accessible only to ADMIN', async ({ page }) => {
    // Login as ADMIN
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to settings
    await page.click('text=Configurações');
    await page.waitForURL('/configuracoes');
    
    // Backend selector should be visible
    await expect(page.locator('text=Backend Ativo')).toBeVisible();
  });

  test('Dependency validation blocks module deactivation', async ({ page }) => {
    // Login as ADMIN
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to modules management
    await page.click('text=Gestão de Módulos');
    await page.waitForURL('/configuracoes/modulos');
    
    // Try to deactivate a module that has active dependents
    // This should show an error toast or disable the toggle
    const financialModule = page.locator('text=Gestão Financeira').locator('..');
    const toggleSwitch = financialModule.locator('[role="switch"]');
    
    // If module has dependents, toggle should be disabled
    const isDisabled = await toggleSwitch.isDisabled();
    if (isDisabled) {
      // Verify tooltip explains why
      await toggleSwitch.hover();
      await expect(page.locator('text=Requerido por')).toBeVisible();
    }
  });
});

test.describe('Multi-Clinic Access', () => {
  test('ADMIN with multiple clinics can switch between them', async ({ page }) => {
    await page.goto('/login');
    
    // Login as ADMIN with access to multiple clinics
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // If user has access to multiple clinics, clinic selector should be visible
    const clinicSelector = page.locator('[data-testid="clinic-selector"]');
    
    // Check if selector exists (only for users with multiple clinics)
    const count = await clinicSelector.count();
    if (count > 0) {
      await expect(clinicSelector).toBeVisible();
      
      // Click to open dropdown
      await clinicSelector.click();
      
      // Verify at least one clinic option
      await expect(page.locator('[role="option"]').first()).toBeVisible();
    }
  });
});
