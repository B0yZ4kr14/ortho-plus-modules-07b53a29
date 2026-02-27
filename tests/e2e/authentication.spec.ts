import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('deve realizar login com sucesso', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/senha/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await expect(page.getByText(/erro|inválid/i)).toBeVisible();
  });

  test('deve realizar logout com sucesso', async ({ page }) => {
    // Login
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Logout
    await page.getByRole('button', { name: /sair|logout/i }).click();
    await page.waitForURL('/auth');
    await expect(page).toHaveURL('/auth');
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await expect(page.getByText(/email.*obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha.*obrigatório/i)).toBeVisible();
  });
});
