import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir página de login para usuários não autenticados', async ({ page }) => {
    await expect(page).toHaveURL(/.*auth/);
    await expect(page.getByRole('heading', { name: /ortho/i })).toBeVisible();
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    // Preencher formulário de login
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    
    // Clicar no botão de login
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Aguardar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalido@email.com');
    await page.getByLabel(/senha/i).fill('senhaErrada');
    
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Verificar mensagem de erro
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });

  test('deve fazer logout com sucesso', async ({ page }) => {
    // Login primeiro
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await page.waitForURL('/dashboard');
    
    // Fazer logout
    await page.getByRole('button', { name: /sair|logout/i }).click();
    
    // Verificar redirecionamento para login
    await expect(page).toHaveURL(/.*auth/);
  });

  test('deve proteger rotas privadas', async ({ page }) => {
    // Tentar acessar rota protegida sem login
    await page.goto('/pacientes');
    
    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*auth/);
  });
});
