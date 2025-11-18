import { test, expect } from '@playwright/test';

test.describe('Patient Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume login já está configurado
  });

  test('should create patient with marketing data and canonical status', async ({ page }) => {
    // Navegar para cadastro de paciente
    await page.click('[data-testid="quick-action-new-patient"]');
    
    // Preencher dados básicos
    await page.fill('[name="full_name"]', 'João Silva Teste');
    await page.fill('[name="cpf"]', '123.456.789-00');
    await page.fill('[name="phone"]', '(11) 98765-4321');
    await page.fill('[name="email"]', 'joao.teste@example.com');
    
    // Selecionar status canônico
    await page.click('[data-testid="patient-status-select"]');
    await page.click('[data-value="PROSPECT"]');
    
    // Navegar para aba de Marketing
    await page.click('[data-testid="tab-marketing"]');
    
    // Preencher dados de marketing
    await page.fill('[name="marketing_campaign"]', 'Campanha Verão 2024');
    await page.fill('[name="marketing_source"]', 'Google Ads');
    await page.fill('[name="marketing_event"]', 'Feira de Saúde');
    await page.fill('[name="marketing_promoter"]', 'João Promotor');
    
    // Salvar paciente
    await page.click('[type="submit"]');
    
    // Verificar sucesso
    await expect(page.locator('text=Paciente cadastrado com sucesso')).toBeVisible();
  });

  test('should view unified patient page with 7 tabs', async ({ page }) => {
    // Navegar para lista de pacientes
    await page.goto('/pacientes');
    
    // Clicar no primeiro paciente
    await page.click('[data-testid="patient-row"]:first-child');
    
    // Verificar todas as 7 abas
    await expect(page.locator('[data-testid="tab-cadastro"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-prontuario"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-odontograma"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-imagens"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-tratamento"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-financeiro"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-timeline"]')).toBeVisible();
    
    // Navegar entre abas
    await page.click('[data-testid="tab-prontuario"]');
    await expect(page.locator('text=Histórico Clínico')).toBeVisible();
    
    await page.click('[data-testid="tab-timeline"]');
    await expect(page.locator('[data-testid="timeline-event"]')).toBeVisible();
  });

  test('should use global search with Cmd+K', async ({ page }) => {
    // Ativar busca global
    await page.keyboard.press('Meta+K');
    
    // Verificar modal de busca aberto
    await expect(page.locator('[data-testid="global-search-modal"]')).toBeVisible();
    
    // Digitar termo de busca
    await page.fill('[data-testid="global-search-input"]', 'João');
    
    // Aguardar resultados
    await page.waitForSelector('[data-testid="search-result"]');
    
    // Verificar categorias de resultados
    await expect(page.locator('text=Pacientes')).toBeVisible();
    await expect(page.locator('text=Orçamentos')).toBeVisible();
    
    // Clicar em resultado
    await page.click('[data-testid="search-result"]:first-child');
    
    // Verificar navegação
    await expect(page).toHaveURL(/\/pacientes\/.+/);
  });

  test('should display dynamic sidebar badges', async ({ page }) => {
    await page.goto('/');
    
    // Verificar badges no sidebar
    await expect(page.locator('[data-testid="badge-appointments"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-overdue"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-defaulters"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-recalls"]')).toBeVisible();
    
    // Verificar valores numéricos
    const appointmentsBadge = await page.textContent('[data-testid="badge-appointments"]');
    expect(parseInt(appointmentsBadge || '0')).toBeGreaterThanOrEqual(0);
  });

  test('should use quick actions', async ({ page }) => {
    await page.goto('/');
    
    // Verificar botões de quick action
    await expect(page.locator('[data-testid="quick-action-new-patient"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-schedule"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-new-sale"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-new-budget"]')).toBeVisible();
    
    // Testar ação rápida de agendamento
    await page.click('[data-testid="quick-action-schedule"]');
    await expect(page).toHaveURL(/\/agenda/);
  });

  test('should view marketing ROI dashboard', async ({ page }) => {
    await page.goto('/dashboards/comercial');
    
    // Verificar KPIs principais
    await expect(page.locator('[data-testid="kpi-cac"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-roi"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-converted"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-conversion-rate"]')).toBeVisible();
    
    // Verificar gráfico de ROI por campanha
    await expect(page.locator('[data-testid="chart-campaign-roi"]')).toBeVisible();
    
    // Verificar tabela de performance por origem
    await expect(page.locator('[data-testid="table-source-performance"]')).toBeVisible();
  });

  test('should change patient status and track history', async ({ page }) => {
    await page.goto('/pacientes');
    await page.click('[data-testid="patient-row"]:first-child');
    
    // Ir para aba de cadastro
    await page.click('[data-testid="tab-cadastro"]');
    
    // Alterar status
    await page.click('[data-testid="patient-status-select"]');
    await page.click('[data-value="TRATAMENTO"]');
    
    // Salvar
    await page.click('[type="submit"]');
    await expect(page.locator('text=Status atualizado')).toBeVisible();
    
    // Ir para timeline
    await page.click('[data-testid="tab-timeline"]');
    
    // Verificar evento de mudança de status
    await expect(page.locator('text=Mudança de Status')).toBeVisible();
    await expect(page.locator('text=PROSPECT → TRATAMENTO')).toBeVisible();
  });
});
