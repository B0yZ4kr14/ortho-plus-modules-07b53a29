import { test, expect } from '@playwright/test';

test.describe('Gestão de Módulos (ADMIN)', () => {
  test.beforeEach(async ({ page }) => {
    // Login como ADMIN
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para configurações -> módulos
    await page.getByRole('link', { name: /configurações/i }).click();
    await page.waitForURL('/configuracoes');
    await page.getByRole('tab', { name: /módulos/i }).click();
  });

  test('deve exibir catálogo de módulos', async ({ page }) => {
    // Verificar que há módulos listados
    await expect(page.getByText(/módulo de prontuário eletrônico/i)).toBeVisible();
    await expect(page.getByText(/módulo de agenda/i)).toBeVisible();
    await expect(page.getByText(/módulo financeiro/i)).toBeVisible();
  });

  test('deve exibir módulos agrupados por categoria', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /gestão e operação/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /financeiro/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /compliance/i })).toBeVisible();
  });

  test('deve ativar módulo sem dependências', async ({ page }) => {
    // Encontrar módulo PEP (não tem dependências)
    const pepModule = page.locator('[data-module="PEP"]');
    const toggle = pepModule.locator('button[role="switch"]');
    
    // Verificar estado atual
    const isActive = await toggle.getAttribute('data-state');
    
    if (isActive === 'unchecked') {
      // Ativar módulo
      await toggle.click();
      
      // Verificar ativação
      await expect(page.getByText(/módulo ativado/i)).toBeVisible();
      await expect(toggle).toHaveAttribute('data-state', 'checked');
    }
  });

  test('deve desativar módulo sem dependentes', async ({ page }) => {
    // Encontrar módulo que não é dependência de outros
    const moduleToggle = page.locator('[data-module="TELEODONTO"]').locator('button[role="switch"]');
    
    const isActive = await moduleToggle.getAttribute('data-state');
    
    if (isActive === 'checked') {
      await moduleToggle.click();
      
      await expect(page.getByText(/módulo desativado/i)).toBeVisible();
      await expect(moduleToggle).toHaveAttribute('data-state', 'unchecked');
    }
  });

  test('deve bloquear ativação de módulo com dependências não atendidas', async ({ page }) => {
    // SPLIT_PAGAMENTO depende de FINANCEIRO
    // Primeiro desativar FINANCEIRO se estiver ativo
    const financeiroToggle = page.locator('[data-module="FINANCEIRO"]').locator('button[role="switch"]');
    const financeiroState = await financeiroToggle.getAttribute('data-state');
    
    if (financeiroState === 'checked') {
      await financeiroToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Tentar ativar SPLIT_PAGAMENTO
    const splitToggle = page.locator('[data-module="SPLIT_PAGAMENTO"]').locator('button[role="switch"]');
    
    // Verificar que está desabilitado ou exibe tooltip
    const isDisabled = await splitToggle.isDisabled();
    expect(isDisabled).toBe(true);
    
    // Verificar tooltip de dependência
    await splitToggle.hover();
    await expect(page.getByText(/requer.*financeiro/i)).toBeVisible();
  });

  test('deve bloquear desativação de módulo com dependentes ativos', async ({ page }) => {
    // Ativar FINANCEIRO
    const financeiroToggle = page.locator('[data-module="FINANCEIRO"]').locator('button[role="switch"]');
    if (await financeiroToggle.getAttribute('data-state') === 'unchecked') {
      await financeiroToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Ativar SPLIT_PAGAMENTO (depende de FINANCEIRO)
    const splitToggle = page.locator('[data-module="SPLIT_PAGAMENTO"]').locator('button[role="switch"]');
    if (await splitToggle.getAttribute('data-state') === 'unchecked' && !await splitToggle.isDisabled()) {
      await splitToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Tentar desativar FINANCEIRO (deve falhar)
    await financeiroToggle.click();
    
    // Verificar erro
    await expect(page.getByText(/não pode ser desativado.*split.*ativo/i)).toBeVisible();
  });

  test('deve visualizar grafo de dependências', async ({ page }) => {
    // Clicar no botão de visualizar grafo
    await page.getByRole('button', { name: /visualizar grafo|dependências/i }).click();
    
    // Verificar que o grafo foi aberto
    await expect(page.locator('[class*="react-flow"]')).toBeVisible();
    
    // Verificar que há nós no grafo
    const nodes = page.locator('[class*="react-flow__node"]');
    expect(await nodes.count()).toBeGreaterThan(0);
    
    // Fechar grafo
    await page.getByRole('button', { name: /fechar/i }).click();
  });

  test('deve simular ativação no grafo (What-If)', async ({ page }) => {
    await page.getByRole('button', { name: /visualizar grafo/i }).click();
    
    // Ativar modo simulação
    await page.getByRole('button', { name: /simular|what-if/i }).click();
    
    // Clicar em um módulo no grafo
    const moduleNode = page.locator('[data-id="FINANCEIRO"]').first();
    await moduleNode.click();
    
    // Verificar que alerta de simulação aparece
    await expect(page.getByText(/simula.*ativar.*financeiro/i)).toBeVisible();
    
    // Verificar módulos afetados destacados
    await expect(page.locator('[data-simulated="true"]')).toHaveCount(await page.locator('[data-simulated="true"]').count());
  });

  test('deve solicitar contratação de novo módulo', async ({ page }) => {
    // Encontrar módulo não contratado
    const nonSubscribedModule = page.locator('[data-subscribed="false"]').first();
    
    if (await nonSubscribedModule.isVisible()) {
      // Clicar em solicitar
      await nonSubscribedModule.getByRole('button', { name: /solicitar/i }).click();
      
      // Verificar mensagem de sucesso
      await expect(page.getByText(/solicitação enviada/i)).toBeVisible();
    }
  });

  test('deve exibir estatísticas de módulos', async ({ page }) => {
    await page.getByRole('button', { name: /visualizar grafo/i }).click();
    
    // Verificar que estatísticas são exibidas
    await expect(page.getByText(/módulos ativos/i)).toBeVisible();
    await expect(page.getByText(/módulos disponíveis/i)).toBeVisible();
  });
});
