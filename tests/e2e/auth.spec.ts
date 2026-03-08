import { expect, test } from "@playwright/test";

test.describe("Autenticação", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) =>
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`),
    );
    page.on("pageerror", (err) =>
      console.log(`[Browser Error]: ${err.message}`),
    );
    await page.goto("/");
  });

  test("deve exibir página de login para usuários não autenticados", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/.*auth/);
    await expect(page.getByRole("heading", { name: /ortho/i })).toBeVisible();
  });

  test("deve fazer login com credenciais válidas", async ({ page }) => {
    // Preencher formulário de login
    await page
      .getByPlaceholder("seu@email.com")
      .first()
      .fill("admin@orthomais.com");
    await page.getByPlaceholder("••••••••").first().fill("Admin123!");

    // Clicar no botão de login
    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    // Aguardar redirecionamento para dashboard
    await expect(page).toHaveURL("/");
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test("deve exibir erro com credenciais inválidas", async ({ page }) => {
    await page
      .getByPlaceholder("seu@email.com")
      .first()
      .fill("invalido@email.com");
    await page.getByPlaceholder("••••••••").first().fill("senhaErrada");

    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    // Verificar mensagem de erro
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });

  test("deve fazer logout com sucesso", async ({ page }) => {
    // Login primeiro
    await page.goto("/auth");
    await page
      .getByPlaceholder("seu@email.com")
      .first()
      .fill("admin@orthomais.com");
    await page.getByPlaceholder("••••••••").first().fill("Admin123!");
    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await page.waitForURL("/");

    // Fazer logout
    await page.locator('[data-tour="user-menu"]').click();
    await page.getByRole("menuitem", { name: /sair/i }).click();

    // Verificar redirecionamento para login
    await expect(page).toHaveURL(/.*auth/);
  });

  test("deve proteger rotas privadas", async ({ page }) => {
    // Tentar acessar rota protegida sem login
    await page.goto("/pacientes");

    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*auth/);
  });

  test("deve validar campos vazios", async ({ page }) => {
    // Clicar em Entrar com o form vazio
    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    // Mensagens de erro baseadas no Zod schema do app
    await expect(page.getByText(/email inválido/i)).toBeVisible();
    await expect(
      page.getByText(/senha deve ter no mínimo 6 caracteres/i),
    ).toBeVisible();
  });
});
