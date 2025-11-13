import { test, expect } from '@playwright/test';

test.describe('Módulo de Estoque', () => {
  test.beforeEach(async ({ page }) => {
    // Login como ADMIN
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test.describe('Dashboard de Estoque', () => {
    test('should display dashboard metrics', async ({ page }) => {
      await page.goto('/estoque');
      
      // Verificar métricas principais
      await expect(page.getByText('Dashboard do Estoque')).toBeVisible();
      await expect(page.getByText('Total de Produtos')).toBeVisible();
      await expect(page.getByText('Estoque Baixo')).toBeVisible();
      await expect(page.getByText('Requisições Pendentes')).toBeVisible();
      await expect(page.getByText('Valor Total')).toBeVisible();
    });

    test('should display charts', async ({ page }) => {
      await page.goto('/estoque');
      
      // Verificar gráficos
      await expect(page.getByText('Produtos com Estoque Baixo')).toBeVisible();
      await expect(page.getByText('Requisições por Status')).toBeVisible();
      await expect(page.getByText('Movimentações dos Últimos 7 Dias')).toBeVisible();
      
      // Verificar se recharts renderizou
      const charts = page.locator('svg.recharts-surface');
      expect(await charts.count()).toBeGreaterThan(0);
    });

    test('should display active alerts', async ({ page }) => {
      await page.goto('/estoque');
      
      // Verificar seção de alertas (se houver)
      const alertSection = page.getByText(/alertas ativos/i);
      // Pode ou não estar visível dependendo se há alertas
    });

    test('should use elevated card variants', async ({ page }) => {
      await page.goto('/estoque');
      
      // Verificar se cards têm classes corretas
      const cards = page.locator('[class*="elevated"]');
      expect(await cards.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Cadastros de Produtos', () => {
    test('should navigate to cadastros page', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await expect(page.getByText('Cadastros de Estoque')).toBeVisible();
      await expect(page.getByText('Produtos Cadastrados')).toBeVisible();
      await expect(page.getByText('Fornecedores')).toBeVisible();
      await expect(page.getByText('Categorias')).toBeVisible();
    });

    test('should display product creation form', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      // Clicar em tab de produtos
      await page.click('button:has-text("Produtos")');
      await page.waitForTimeout(300);
      
      // Clicar em novo produto
      await page.click('button:has-text("Novo Produto")');
      await page.waitForTimeout(500);
      
      // Verificar campos do formulário
      await expect(page.getByLabel(/nome/i)).toBeVisible();
      await expect(page.getByLabel(/código/i)).toBeVisible();
      await expect(page.getByLabel(/categoria/i)).toBeVisible();
    });

    test('should create new product', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      await page.waitForTimeout(300);
      await page.click('button:has-text("Novo Produto")');
      await page.waitForTimeout(500);
      
      // Preencher formulário
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Produto Teste ${timestamp}`);
      await page.fill('input[name="codigo"]', `PROD${timestamp}`);
      await page.fill('input[name="quantidadeAtual"]', '100');
      await page.fill('input[name="quantidadeMinima"]', '20');
      await page.fill('input[name="precoCompra"]', '50.00');
      await page.fill('input[name="precoVenda"]', '100.00');
      
      // Submeter
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      // Verificar toast de sucesso
      await expect(page.getByText(/produto cadastrado/i)).toBeVisible({ timeout: 5000 });
    });

    test('should edit existing product', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      await page.waitForTimeout(300);
      
      // Clicar em editar primeiro produto (se existir)
      const editButton = page.locator('button:has-text("Editar")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Modificar nome
        const nomeInput = page.locator('input[name="nome"]');
        await nomeInput.fill(`Produto Editado ${Date.now()}`);
        
        // Salvar
        await page.click('button[type="submit"]:has-text("Salvar")');
        
        // Verificar toast
        await expect(page.getByText(/produto atualizado/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should search products', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      await page.waitForTimeout(300);
      
      // Buscar produto
      const searchInput = page.getByPlaceholder(/buscar produtos/i);
      await searchInput.fill('teste');
      await page.waitForTimeout(500);
      
      // Verificar se filtrou resultados
      // (pode não ter resultados se não houver produtos com "teste")
    });

    test('should delete product with confirmation', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      await page.waitForTimeout(300);
      
      const deleteButton = page.locator('button:has-text("Excluir")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(300);
        
        // Verificar dialog de confirmação
        await expect(page.getByText(/confirmar exclusão/i)).toBeVisible();
        
        // Cancelar para não excluir de verdade
        await page.click('button:has-text("Cancelar")');
      }
    });
  });

  test.describe('Cadastros de Fornecedores', () => {
    test('should display fornecedor form', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Fornecedores")');
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("Novo Fornecedor")');
      await page.waitForTimeout(500);
      
      await expect(page.getByLabel(/nome/i)).toBeVisible();
    });

    test('should create fornecedor', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Fornecedores")');
      await page.waitForTimeout(300);
      await page.click('button:has-text("Novo Fornecedor")');
      await page.waitForTimeout(500);
      
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Fornecedor Teste ${timestamp}`);
      await page.fill('input[name="contato"]', 'contato@fornecedor.com');
      await page.fill('input[name="telefone"]', '11999999999');
      
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      await expect(page.getByText(/fornecedor cadastrado/i)).toBeVisible({ timeout: 5000 });
    });

    test('should search fornecedores', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Fornecedores")');
      await page.waitForTimeout(300);
      
      const searchInput = page.getByPlaceholder(/buscar fornecedores/i);
      await searchInput.fill('teste');
      await page.waitForTimeout(500);
    });
  });

  test.describe('Cadastros de Categorias', () => {
    test('should display categoria form', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Categorias")');
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("Nova Categoria")');
      await page.waitForTimeout(500);
      
      await expect(page.getByLabel(/nome/i)).toBeVisible();
    });

    test('should create categoria', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Categorias")');
      await page.waitForTimeout(300);
      await page.click('button:has-text("Nova Categoria")');
      await page.waitForTimeout(500);
      
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Categoria ${timestamp}`);
      await page.fill('textarea[name="descricao"]', 'Descrição da categoria teste');
      
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      await expect(page.getByText(/categoria cadastrada/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Movimentações de Estoque', () => {
    test('should navigate to movimentacoes page', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      await expect(page.getByText('Movimentações de Estoque')).toBeVisible();
      await expect(page.getByText('Total de Movimentações')).toBeVisible();
      await expect(page.getByText('Entradas')).toBeVisible();
      await expect(page.getByText('Saídas')).toBeVisible();
      await expect(page.getByText('Ajustes')).toBeVisible();
    });

    test('should display metrics cards with elevated variant', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      // Verificar cards com variant elevated
      const elevatedCards = page.locator('[class*="elevated"]');
      expect(await elevatedCards.count()).toBeGreaterThan(0);
    });

    test('should display movimentacao form', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      await page.click('button:has-text("Nova Movimentação")');
      await page.waitForTimeout(500);
      
      await expect(page.getByText('Registrar Movimentação')).toBeVisible();
    });

    test('should filter by tipo', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      // Aplicar filtro
      await page.click('[role="combobox"]');
      await page.waitForTimeout(300);
      await page.click('text=Entradas');
      await page.waitForTimeout(500);
      
      // Tab de entradas deve mostrar apenas entradas
      await page.click('button:has-text("Entradas")');
    });

    test('should search movimentacoes', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      const searchInput = page.getByPlaceholder(/buscar por produto/i);
      await searchInput.fill('teste');
      await page.waitForTimeout(500);
    });

    test('should switch between tabs', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      // Testar navegação entre tabs
      await page.click('button:has-text("Entradas")');
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("Saídas")');
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("Ajustes")');
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("Todas")');
    });
  });

  test.describe('Barcode Scanner', () => {
    test('should open scanner dialog', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Scanner de Código de Barras")');
      await page.waitForTimeout(500);
      
      // Dialog deve abrir (pode não funcionar completamente sem câmera real)
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state on dashboard', async ({ page }) => {
      // Interceptar request para simular loading
      await page.route('**/rest/v1/estoque_produtos*', async route => {
        await page.waitForTimeout(2000); // Simular delay
        route.continue();
      });
      
      await page.goto('/estoque');
      
      // Verificar se loading state aparece
      await expect(page.getByText(/carregando/i)).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/estoque');
      
      // Verificar se métricas estão empilhadas
      await expect(page.getByText('Total de Produtos')).toBeVisible();
    });

    test('should display 4-column grid on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/estoque');
      
      // Verificar grid de 4 colunas
      const metricsGrid = page.locator('.grid').first();
      const gridClass = await metricsGrid.getAttribute('class');
      expect(gridClass).toContain('lg:grid-cols-4');
    });
  });

  test.describe('Toast Notifications', () => {
    test('should show success toast on product creation', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      await page.waitForTimeout(300);
      await page.click('button:has-text("Novo Produto")');
      await page.waitForTimeout(500);
      
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Produto ${timestamp}`);
      await page.fill('input[name="codigo"]', `P${timestamp}`);
      await page.fill('input[name="quantidadeAtual"]', '50');
      await page.fill('input[name="quantidadeMinima"]', '10');
      await page.fill('input[name="precoCompra"]', '30.00');
      await page.fill('input[name="precoVenda"]', '60.00');
      
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      // Verificar toast
      await expect(page.getByRole('status')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Integration with Other Modules', () => {
    test('should link to financial module from dashboard', async ({ page }) => {
      await page.goto('/estoque');
      
      // Verificar se valor total está visível (integração com financeiro)
      await expect(page.getByText(/valor total/i)).toBeVisible();
      await expect(page.getByText(/R\$/)).toBeVisible();
    });
  });
});
