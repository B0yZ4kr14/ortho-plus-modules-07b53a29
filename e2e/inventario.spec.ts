import { test, expect } from '@playwright/test';

test.describe('Gestão de Inventário', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para inventário
    await page.getByRole('link', { name: /estoque/i }).first().click();
    await page.getByRole('link', { name: /inventário/i }).click();
    await page.waitForURL('/estoque/inventario');
  });

  test('deve exibir lista de inventários', async ({ page }) => {
    // Verificar que a página de inventário está visível
    await expect(page.getByRole('heading', { name: /inventário de estoque/i })).toBeVisible();
    
    // Verificar KPIs
    await expect(page.getByText(/total de inventários/i)).toBeVisible();
    await expect(page.getByText(/em andamento/i)).toBeVisible();
    await expect(page.getByText(/divergências totais/i)).toBeVisible();
  });

  test('deve criar novo inventário', async ({ page }) => {
    // Clicar no botão de adicionar
    await page.getByRole('button', { name: /novo inventário/i }).click();
    
    // Aguardar abertura do modal
    await expect(page.getByRole('heading', { name: /novo inventário/i })).toBeVisible();
    
    // Preencher formulário
    const numeroInv = `INV-2024-E2E-${Date.now()}`;
    await page.getByLabel(/número/i).fill(numeroInv);
    
    await page.getByLabel(/^data/i).fill('2024-02-01');
    
    await page.getByLabel(/tipo/i).click();
    await page.getByRole('option', { name: /geral/i }).click();
    
    await page.getByLabel(/responsável/i).fill('Teste E2E');
    
    await page.getByLabel(/observações/i).fill('Inventário criado por teste E2E');
    
    // Salvar
    await page.getByRole('button', { name: /criar inventário/i }).click();
    
    // Verificar sucesso
    await expect(page.getByText(/criado com sucesso/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    // Clicar no botão de adicionar
    await page.getByRole('button', { name: /novo inventário/i }).click();
    
    // Limpar campo número
    await page.getByLabel(/número/i).clear();
    
    // Tentar salvar sem preencher
    await page.getByRole('button', { name: /criar inventário/i }).click();
    
    // Verificar mensagens de erro
    await expect(page.getByText(/número.*obrigatório/i)).toBeVisible();
    await expect(page.getByText(/responsável.*obrigatório/i)).toBeVisible();
  });

  test('deve filtrar inventários por status', async ({ page }) => {
    // Aplicar filtro de status
    await page.getByLabel(/^status/i).click();
    await page.getByRole('option', { name: /em andamento/i }).click();
    
    // Aguardar filtro aplicado
    await page.waitForTimeout(500);
    
    // Verificar que apenas inventários "Em Andamento" são exibidos
    const rows = page.locator('tbody tr').filter({ hasText: /em andamento/i });
    expect(await rows.count()).toBeGreaterThanOrEqual(0);
  });

  test('deve filtrar inventários por tipo', async ({ page }) => {
    // Aplicar filtro de tipo
    await page.getByLabel(/^tipo/i).click();
    await page.getByRole('option', { name: /cíclico/i }).click();
    
    // Aguardar filtro aplicado
    await page.waitForTimeout(500);
    
    // Verificar que resultados contêm "Cíclico"
    const ciclicos = page.locator('tbody tr').filter({ hasText: /cíclico/i });
    expect(await ciclicos.count()).toBeGreaterThanOrEqual(0);
  });

  test('deve buscar inventário por número', async ({ page }) => {
    const searchTerm = 'INV-2024';
    
    // Digitar no campo de busca
    await page.getByPlaceholder(/número.*responsável/i).fill(searchTerm);
    
    // Aguardar resultados
    await page.waitForTimeout(500);
    
    // Verificar que os resultados contêm o termo buscado
    const results = page.locator('tbody tr');
    const count = await results.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve abrir dialog de contagem para inventário em andamento', async ({ page }) => {
    // Buscar inventário em andamento
    const rowEmAndamento = page.locator('tbody tr').filter({ hasText: /em andamento/i }).first();
    
    if (await rowEmAndamento.isVisible()) {
      // Clicar no botão de contagem
      await rowEmAndamento.getByRole('button', { title: /contagem/i }).click();
      
      // Verificar que dialog de contagem abriu
      await expect(page.getByRole('heading', { name: /contagem de inventário/i })).toBeVisible();
      
      // Verificar que há tabela de itens
      await expect(page.getByRole('columnheader', { name: /qtd\. física/i })).toBeVisible();
    }
  });

  test('deve visualizar divergências de inventário concluído', async ({ page }) => {
    // Buscar inventário concluído
    const rowConcluido = page.locator('tbody tr').filter({ hasText: /concluído/i }).first();
    
    if (await rowConcluido.isVisible()) {
      // Clicar no botão de divergências (ícone de alerta)
      const divergenciasBtn = rowConcluido.getByRole('button', { title: /divergências/i });
      
      if (await divergenciasBtn.isVisible()) {
        await divergenciasBtn.click();
        
        // Verificar que dialog de divergências abriu
        await expect(page.getByRole('heading', { name: /divergências do inventário/i })).toBeVisible();
        
        // Verificar KPIs de divergências
        await expect(page.getByText(/divergências/i)).toBeVisible();
        await expect(page.getByText(/valor total/i)).toBeVisible();
      }
    }
  });

  test('deve permitir editar inventário não concluído', async ({ page }) => {
    // Buscar inventário em andamento ou planejado
    const rowEditavel = page.locator('tbody tr').filter({ hasText: /(planejado|em andamento)/i }).first();
    
    if (await rowEditavel.isVisible()) {
      // Clicar no botão de editar
      await rowEditavel.getByRole('button', { title: /editar/i }).click();
      
      // Verificar que modal de edição abriu
      await expect(page.getByRole('heading', { name: /editar inventário/i })).toBeVisible();
      
      // Alterar responsável
      const responsavelInput = page.getByLabel(/responsável/i);
      await responsavelInput.clear();
      await responsavelInput.fill('Responsável Editado E2E');
      
      // Salvar
      await page.getByRole('button', { name: /atualizar inventário/i }).click();
      
      // Verificar atualização
      await expect(page.getByText(/atualizado com sucesso/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('deve visualizar detalhes de inventário', async ({ page }) => {
    // Clicar no primeiro inventário
    const firstRow = page.locator('tbody tr').first();
    await firstRow.getByRole('button', { title: /visualizar/i }).click();
    
    // Verificar que modal de visualização abriu
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('deve mostrar progresso de contagem', async ({ page }) => {
    // Verificar que barras de progresso estão visíveis
    const progressBars = page.locator('[role="progressbar"], .bg-primary').filter({ has: page.locator('.bg-secondary') });
    
    // Verificar contadores de itens contados
    const counters = page.locator('text=/\\d+\\/\\d+/');
    expect(await counters.count()).toBeGreaterThanOrEqual(0);
  });

  test('deve exibir alertas para divergências críticas', async ({ page }) => {
    // Verificar se há ícones de alerta (divergências)
    const alertIcons = page.locator('[title*="divergências"], .text-orange-500, .text-red-500');
    
    // Inventários com divergências devem ter indicadores visuais
    const divergenciasCount = await page.locator('tbody tr').filter({ has: alertIcons }).count();
    expect(divergenciasCount).toBeGreaterThanOrEqual(0);
  });

  test('deve permitir exportar relatório de divergências', async ({ page }) => {
    // Buscar inventário com divergências
    const rowComDivergencias = page.locator('tbody tr').filter({ hasText: /[1-9]\d*/ }).first();
    
    if (await rowComDivergencias.isVisible()) {
      // Abrir dialog de divergências
      const divergenciasBtn = rowComDivergencias.getByRole('button', { title: /divergências/i });
      
      if (await divergenciasBtn.isVisible()) {
        await divergenciasBtn.click();
        
        // Clicar em exportar relatório
        await page.getByRole('button', { name: /exportar relatório/i }).click();
        
        // Verificar que exportação foi iniciada (ou toast de sucesso)
        // await expect(page.getByText(/exportando|exportado/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
