import { test, expect } from '@playwright/test';

test.describe('Fluxo Integrado: Paciente → PEP → Tratamento → Agendamento → Financeiro', () => {
  const patientName = `Paciente Fluxo E2E ${Date.now()}`;
  
  test('deve completar fluxo completo de atendimento', async ({ page }) => {
    // ========== ETAPA 1: LOGIN ==========
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // ========== ETAPA 2: CRIAR PACIENTE ==========
    await page.getByRole('link', { name: /pacientes/i }).click();
    await page.waitForURL('/pacientes');
    
    await page.getByRole('button', { name: /novo|adicionar/i }).click();
    
    // Preencher dados do paciente
    await page.getByLabel(/nome/i).fill(patientName);
    await page.getByLabel(/cpf/i).fill('111.222.333-44');
    await page.getByLabel(/data de nascimento/i).fill('1985-05-15');
    await page.getByLabel(/telefone/i).fill('(11) 91234-5678');
    await page.getByLabel(/celular/i).fill('(11) 91234-5678');
    await page.getByLabel(/email/i).fill('fluxo@e2e.test');
    
    // Endereço
    await page.getByLabel(/cep/i).fill('01310-100');
    await page.getByLabel(/logradouro/i).fill('Avenida Paulista');
    await page.getByLabel(/número/i).fill('1000');
    await page.getByLabel(/bairro/i).fill('Bela Vista');
    await page.getByLabel(/cidade/i).fill('São Paulo');
    await page.getByLabel(/estado/i).fill('SP');
    
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/paciente criado/i)).toBeVisible();
    
    // ========== ETAPA 3: ABRIR PRONTUÁRIO (PEP) ==========
    await page.getByRole('link', { name: /prontuário|pep/i }).click();
    await page.waitForURL('/pep');
    
    // Preencher histórico clínico
    await page.getByRole('tab', { name: /histórico clínico/i }).click();
    await page.getByLabel(/queixa principal/i).fill('Dor no dente 11 e 21');
    await page.getByLabel(/história da doença/i).fill('Dor intensa há 5 dias');
    await page.getByLabel(/diagnóstico/i).fill('Cárie dentária em dentes 11 e 21');
    await page.getByRole('button', { name: /salvar histórico/i }).click();
    await expect(page.getByText(/histórico salvo/i)).toBeVisible();
    
    // ========== ETAPA 4: MARCAR ODONTOGRAMA ==========
    await page.getByRole('tab', { name: /^odontograma$/i }).click();
    
    // Selecionar status cariado
    await page.getByRole('button', { name: /cariado/i }).click();
    
    // Marcar dentes 11 e 21
    await page.locator('[data-tooth="11"]').click();
    await page.locator('[data-tooth="21"]').click();
    
    // Verificar marcações
    await expect(page.locator('[data-tooth="11"]')).toHaveAttribute('data-status', 'cariado');
    await expect(page.locator('[data-tooth="21"]')).toHaveAttribute('data-status', 'cariado');
    await expect(page.getByText(/cariados: 2/i)).toBeVisible();
    
    // ========== ETAPA 5: CRIAR TRATAMENTOS ==========
    await page.getByRole('tab', { name: /tratamentos/i }).click();
    
    // Tratamento 1: Restauração dente 11
    await page.getByRole('button', { name: /novo tratamento/i }).click();
    await page.getByLabel(/título/i).fill('Restauração Dente 11');
    await page.getByLabel(/descrição/i).fill('Restauração em resina composta face mesial');
    await page.getByLabel(/dente/i).fill('11');
    await page.getByLabel(/valor estimado/i).fill('400');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/tratamento criado/i)).toBeVisible();
    
    // Tratamento 2: Restauração dente 21
    await page.getByRole('button', { name: /novo tratamento/i }).click();
    await page.getByLabel(/título/i).fill('Restauração Dente 21');
    await page.getByLabel(/descrição/i).fill('Restauração em resina composta face distal');
    await page.getByLabel(/dente/i).fill('21');
    await page.getByLabel(/valor estimado/i).fill('400');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/tratamento criado/i)).toBeVisible();
    
    // ========== ETAPA 6: CRIAR TRANSAÇÕES FINANCEIRAS ==========
    await page.getByRole('link', { name: /financeiro/i }).click();
    await page.waitForURL('/financeiro');
    
    // Criar receita para tratamento
    await page.getByRole('button', { name: /nova transação/i }).click();
    
    await page.getByLabel(/tipo/i).click();
    await page.getByRole('option', { name: /receita/i }).click();
    
    await page.getByLabel(/descrição/i).fill(`Tratamento - ${patientName}`);
    await page.getByLabel(/valor/i).fill('800'); // Total dos dois tratamentos
    
    await page.getByLabel(/categoria/i).click();
    await page.getByRole('option', { name: /tratamento/i }).click();
    
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /pendente/i }).click();
    
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/transação criada/i)).toBeVisible();
    
    // Verificar que a transação aparece na lista
    await expect(page.getByText(`Tratamento - ${patientName}`)).toBeVisible();
    await expect(page.getByText('R$ 800')).toBeVisible();
    
    // ========== ETAPA 7: VERIFICAR DASHBOARD ==========
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.waitForURL('/dashboard');
    
    // Verificar que as estatísticas foram atualizadas
    await expect(page.getByTestId('total-patients')).toContainText(/\d+/);
    await expect(page.getByTestId('pending-payments')).toContainText(/\d+/);
    
    // ========== ETAPA 8: LIMPEZA (OPCIONAL) ==========
    // Deletar paciente de teste
    await page.getByRole('link', { name: /pacientes/i }).click();
    await page.waitForURL('/pacientes');
    
    const testPatient = page.getByText(patientName);
    if (await testPatient.isVisible()) {
      await testPatient.click();
      await page.getByRole('button', { name: /excluir/i }).click();
      await page.getByRole('button', { name: /confirmar/i }).click();
      await expect(page.getByText(/excluído com sucesso/i)).toBeVisible();
    }
  });

  test('deve manter consistência de dados entre módulos', async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Capturar total de pacientes no dashboard
    const dashboardPatients = await page.getByTestId('total-patients').textContent();
    const dashboardCount = parseInt(dashboardPatients?.replace(/\D/g, '') || '0');
    
    // Navegar para pacientes e contar
    await page.getByRole('link', { name: /pacientes/i }).click();
    await page.waitForURL('/pacientes');
    
    const patientItems = page.locator('[data-testid="patient-item"]');
    const patientListCount = await patientItems.count();
    
    // Verificar consistência
    expect(dashboardCount).toBe(patientListCount);
  });

  test('deve preservar dados ao navegar entre módulos', async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Criar transação no financeiro
    await page.getByRole('link', { name: /financeiro/i }).click();
    const uniqueDesc = `Teste Preservação ${Date.now()}`;
    
    await page.getByRole('button', { name: /nova transação/i }).click();
    await page.getByLabel(/tipo/i).click();
    await page.getByRole('option', { name: /receita/i }).click();
    await page.getByLabel(/descrição/i).fill(uniqueDesc);
    await page.getByLabel(/valor/i).fill('150');
    await page.getByLabel(/categoria/i).click();
    await page.getByRole('option', { name: /consulta/i }).click();
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Navegar para outro módulo
    await page.getByRole('link', { name: /pacientes/i }).click();
    await page.waitForURL('/pacientes');
    
    // Voltar para financeiro
    await page.getByRole('link', { name: /financeiro/i }).click();
    await page.waitForURL('/financeiro');
    
    // Verificar que a transação ainda está lá
    await expect(page.getByText(uniqueDesc)).toBeVisible();
  });
});
