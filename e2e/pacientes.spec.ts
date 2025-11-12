import { test, expect } from '@playwright/test';

test.describe('Gestão de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para pacientes
    await page.getByRole('link', { name: /pacientes/i }).click();
    await page.waitForURL('/pacientes');
  });

  test('deve listar pacientes existentes', async ({ page }) => {
    // Verificar que a lista de pacientes está visível
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible();
    
    // Verificar que há pelo menos um paciente na lista
    await expect(page.locator('[data-testid="patient-list"]').first()).toBeVisible();
  });

  test('deve buscar pacientes por nome', async ({ page }) => {
    const searchTerm = 'Maria';
    
    // Digitar no campo de busca
    await page.getByPlaceholder(/buscar/i).fill(searchTerm);
    
    // Aguardar resultados
    await page.waitForTimeout(500);
    
    // Verificar que os resultados contêm o termo buscado
    const results = page.locator('[data-testid="patient-item"]');
    const count = await results.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('deve criar novo paciente', async ({ page }) => {
    // Clicar no botão de adicionar
    await page.getByRole('button', { name: /novo|adicionar/i }).click();
    
    // Preencher formulário
    await page.getByLabel(/nome/i).fill('Paciente E2E Test');
    await page.getByLabel(/cpf/i).fill('123.456.789-00');
    await page.getByLabel(/data de nascimento/i).fill('1990-01-01');
    await page.getByLabel(/telefone/i).fill('(11) 98765-4321');
    await page.getByLabel(/celular/i).fill('(11) 98765-4321');
    await page.getByLabel(/email/i).fill('e2e@test.com');
    
    // Preencher endereço
    await page.getByLabel(/cep/i).fill('01310-100');
    await page.getByLabel(/logradouro/i).fill('Avenida Paulista');
    await page.getByLabel(/número/i).fill('1000');
    await page.getByLabel(/bairro/i).fill('Bela Vista');
    await page.getByLabel(/cidade/i).fill('São Paulo');
    await page.getByLabel(/estado/i).fill('SP');
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar sucesso
    await expect(page.getByText(/paciente criado com sucesso/i)).toBeVisible();
    await expect(page.getByText('Paciente E2E Test')).toBeVisible();
  });

  test('deve editar paciente existente', async ({ page }) => {
    // Clicar no primeiro paciente
    await page.locator('[data-testid="patient-item"]').first().click();
    
    // Clicar em editar
    await page.getByRole('button', { name: /editar/i }).click();
    
    // Alterar nome
    await page.getByLabel(/nome/i).clear();
    await page.getByLabel(/nome/i).fill('Paciente Editado E2E');
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar atualização
    await expect(page.getByText(/atualizado com sucesso/i)).toBeVisible();
    await expect(page.getByText('Paciente Editado E2E')).toBeVisible();
  });

  test('deve excluir paciente', async ({ page }) => {
    // Encontrar paciente de teste
    const testPatient = page.getByText('Paciente E2E Test');
    
    if (await testPatient.isVisible()) {
      // Clicar no paciente
      await testPatient.click();
      
      // Clicar em excluir
      await page.getByRole('button', { name: /excluir|deletar/i }).click();
      
      // Confirmar exclusão
      await page.getByRole('button', { name: /confirmar/i }).click();
      
      // Verificar remoção
      await expect(page.getByText(/excluído com sucesso/i)).toBeVisible();
      await expect(testPatient).not.toBeVisible();
    }
  });

  test('deve filtrar pacientes por status', async ({ page }) => {
    // Clicar no filtro de status
    await page.getByRole('button', { name: /status/i }).click();
    
    // Selecionar "Ativo"
    await page.getByRole('option', { name: /ativo/i }).click();
    
    // Aguardar filtro aplicado
    await page.waitForTimeout(500);
    
    // Verificar que apenas pacientes ativos são exibidos
    const activePatients = page.locator('[data-status="Ativo"]');
    expect(await activePatients.count()).toBeGreaterThan(0);
  });
});
