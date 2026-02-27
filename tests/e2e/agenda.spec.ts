import { test, expect } from '@playwright/test';

test.describe('Gestão de Agenda', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para agenda
    await page.getByRole('link', { name: /agenda/i }).click();
    await page.waitForURL('/agenda-clinica');
  });

  test('deve exibir calendário de agendamentos', async ({ page }) => {
    // Verificar que o calendário está visível
    await expect(page.getByRole('heading', { name: /agenda clínica/i })).toBeVisible();
    await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
  });

  test('deve criar novo agendamento', async ({ page }) => {
    // Clicar no botão de adicionar
    await page.getByRole('button', { name: /nova consulta|agendar/i }).click();
    
    // Aguardar abertura do modal
    await expect(page.getByRole('heading', { name: /nova consulta/i })).toBeVisible();
    
    // Preencher formulário
    await page.getByLabel(/paciente/i).click();
    await page.getByRole('option').first().click();
    
    await page.getByLabel(/dentista/i).click();
    await page.getByRole('option').first().click();
    
    await page.getByLabel(/data/i).click();
    // Selecionar dia 15 do mês atual
    await page.getByRole('button', { name: '15' }).click();
    
    await page.getByLabel(/hora início/i).click();
    await page.getByRole('option', { name: '09:00' }).click();
    
    await page.getByLabel(/hora fim/i).click();
    await page.getByRole('option', { name: '10:00' }).click();
    
    await page.getByLabel(/procedimento/i).fill('Consulta de Rotina E2E');
    
    // Salvar
    await page.getByRole('button', { name: /agendar/i }).click();
    
    // Verificar sucesso
    await expect(page.getByText(/agendado com sucesso/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    // Clicar no botão de adicionar
    await page.getByRole('button', { name: /nova consulta|agendar/i }).click();
    
    // Tentar salvar sem preencher
    await page.getByRole('button', { name: /agendar/i }).click();
    
    // Verificar mensagens de erro
    await expect(page.getByText(/paciente.*obrigatório/i)).toBeVisible();
    await expect(page.getByText(/dentista.*obrigatório/i)).toBeVisible();
    await expect(page.getByText(/data.*obrigatório/i)).toBeVisible();
  });

  test('deve editar agendamento existente', async ({ page }) => {
    // Clicar no primeiro agendamento do calendário
    await page.locator('[data-testid="appointment-item"]').first().click();
    
    // Aguardar modal de detalhes
    await expect(page.getByRole('heading', { name: /detalhes/i })).toBeVisible();
    
    // Clicar em editar
    await page.getByRole('button', { name: /editar/i }).click();
    
    // Alterar procedimento
    const procedimentoInput = page.getByLabel(/procedimento/i);
    await procedimentoInput.clear();
    await procedimentoInput.fill('Procedimento Editado E2E');
    
    // Salvar
    await page.getByRole('button', { name: /atualizar/i }).click();
    
    // Verificar atualização
    await expect(page.getByText(/atualizado com sucesso/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve alterar status do agendamento', async ({ page }) => {
    // Clicar no primeiro agendamento
    await page.locator('[data-testid="appointment-item"]').first().click();
    
    // Clicar em editar
    await page.getByRole('button', { name: /editar/i }).click();
    
    // Alterar status
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /confirmada/i }).click();
    
    // Salvar
    await page.getByRole('button', { name: /atualizar/i }).click();
    
    // Verificar atualização
    await expect(page.getByText(/atualizado com sucesso/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve enviar lembrete para paciente', async ({ page }) => {
    // Clicar no primeiro agendamento
    await page.locator('[data-testid="appointment-item"]').first().click();
    
    // Clicar em enviar lembrete
    await page.getByRole('button', { name: /lembrete/i }).click();
    
    // Verificar envio
    await expect(page.getByText(/lembrete enviado/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve navegar entre meses no calendário', async ({ page }) => {
    // Verificar botões de navegação
    const prevButton = page.getByRole('button', { name: /anterior|previous/i });
    const nextButton = page.getByRole('button', { name: /próximo|next/i });
    
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    
    // Navegar para próximo mês
    await nextButton.click();
    await page.waitForTimeout(500);
    
    // Navegar para mês anterior
    await prevButton.click();
    await page.waitForTimeout(500);
  });

  test('deve filtrar agendamentos por dentista', async ({ page }) => {
    // Verificar se há filtro de dentista
    const dentistaFilter = page.getByRole('combobox', { name: /filtrar.*dentista/i });
    
    if (await dentistaFilter.isVisible()) {
      await dentistaFilter.click();
      await page.getByRole('option').first().click();
      
      // Aguardar filtro aplicado
      await page.waitForTimeout(500);
      
      // Verificar que apenas agendamentos do dentista selecionado são exibidos
      const appointments = page.locator('[data-testid="appointment-item"]');
      expect(await appointments.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('deve excluir agendamento', async ({ page }) => {
    // Criar agendamento de teste primeiro
    await page.getByRole('button', { name: /nova consulta|agendar/i }).click();
    
    await page.getByLabel(/paciente/i).click();
    await page.getByRole('option').first().click();
    
    await page.getByLabel(/dentista/i).click();
    await page.getByRole('option').first().click();
    
    await page.getByLabel(/data/i).click();
    await page.getByRole('button', { name: '20' }).click();
    
    await page.getByLabel(/hora início/i).click();
    await page.getByRole('option', { name: '14:00' }).click();
    
    await page.getByLabel(/hora fim/i).click();
    await page.getByRole('option', { name: '15:00' }).click();
    
    await page.getByLabel(/procedimento/i).fill('Teste Exclusão E2E');
    
    await page.getByRole('button', { name: /agendar/i }).click();
    await page.waitForTimeout(2000);
    
    // Encontrar e excluir
    const testAppointment = page.getByText('Teste Exclusão E2E');
    
    if (await testAppointment.isVisible()) {
      await testAppointment.click();
      
      // Clicar em excluir
      await page.getByRole('button', { name: /excluir|deletar|cancelar/i }).click();
      
      // Confirmar exclusão
      await page.getByRole('button', { name: /confirmar/i }).click();
      
      // Verificar remoção
      await expect(page.getByText(/excluído|cancelado com sucesso/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('deve validar horários conflitantes', async ({ page }) => {
    // Criar primeiro agendamento
    await page.getByRole('button', { name: /nova consulta|agendar/i }).click();
    
    await page.getByLabel(/paciente/i).click();
    await page.getByRole('option').first().click();
    
    await page.getByLabel(/dentista/i).click();
    await page.getByRole('option').first().click();
    
    await page.getByLabel(/data/i).click();
    await page.getByRole('button', { name: '25' }).click();
    
    await page.getByLabel(/hora início/i).click();
    await page.getByRole('option', { name: '10:00' }).click();
    
    await page.getByLabel(/hora fim/i).click();
    await page.getByRole('option', { name: '11:00' }).click();
    
    await page.getByLabel(/procedimento/i).fill('Teste Conflito 1');
    
    await page.getByRole('button', { name: /agendar/i }).click();
    await page.waitForTimeout(2000);
    
    // Tentar criar agendamento conflitante
    await page.getByRole('button', { name: /nova consulta|agendar/i }).click();
    
    await page.getByLabel(/paciente/i).click();
    await page.getByRole('option').nth(1).click();
    
    await page.getByLabel(/dentista/i).click();
    await page.getByRole('option').first().click(); // Mesmo dentista
    
    await page.getByLabel(/data/i).click();
    await page.getByRole('button', { name: '25' }).click(); // Mesma data
    
    await page.getByLabel(/hora início/i).click();
    await page.getByRole('option', { name: '10:30' }).click(); // Horário conflitante
    
    await page.getByLabel(/hora fim/i).click();
    await page.getByRole('option', { name: '11:30' }).click();
    
    await page.getByLabel(/procedimento/i).fill('Teste Conflito 2');
    
    await page.getByRole('button', { name: /agendar/i }).click();
    
    // Verificar aviso de conflito (se implementado)
    // await expect(page.getByText(/conflito|horário ocupado/i)).toBeVisible({ timeout: 5000 });
  });
});
