import { test, expect } from '@playwright/test';

test.describe('Módulo PEP - Prontuário Eletrônico', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@orthomais.com');
    await page.getByLabel(/senha/i).fill('Admin123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navegar para PEP
    await page.getByRole('link', { name: /prontuário|pep/i }).click();
    await page.waitForURL('/pep');
  });

  test('deve exibir abas do prontuário', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /histórico clínico/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tratamentos/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /odontograma/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /anexos/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /assinatura/i })).toBeVisible();
  });

  test('deve preencher histórico clínico', async ({ page }) => {
    // Clicar na aba histórico clínico
    await page.getByRole('tab', { name: /histórico clínico/i }).click();
    
    // Preencher anamnese
    await page.getByLabel(/queixa principal/i).fill('Dor no dente 11');
    await page.getByLabel(/história da doença/i).fill('Dor há 3 dias');
    
    // Preencher diagnóstico
    await page.getByLabel(/diagnóstico/i).fill('Cárie dentária');
    
    // Salvar
    await page.getByRole('button', { name: /salvar histórico/i }).click();
    
    // Verificar sucesso
    await expect(page.getByText(/histórico salvo/i)).toBeVisible();
  });

  test('deve criar novo tratamento', async ({ page }) => {
    // Navegar para aba tratamentos
    await page.getByRole('tab', { name: /tratamentos/i }).click();
    
    // Clicar em novo tratamento
    await page.getByRole('button', { name: /novo tratamento/i }).click();
    
    // Preencher formulário
    await page.getByLabel(/título/i).fill('Restauração Dente 11');
    await page.getByLabel(/descrição/i).fill('Restauração em resina composta');
    await page.getByLabel(/dente/i).fill('11');
    await page.getByLabel(/valor estimado/i).fill('500');
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar criação
    await expect(page.getByText(/tratamento criado/i)).toBeVisible();
    await expect(page.getByText('Restauração Dente 11')).toBeVisible();
  });

  test('deve interagir com odontograma 2D', async ({ page }) => {
    // Navegar para aba odontograma
    await page.getByRole('tab', { name: /odontograma/i }).click();
    
    // Selecionar status "cariado"
    await page.getByRole('button', { name: /cariado/i }).click();
    
    // Clicar em um dente (dente 11)
    await page.locator('[data-tooth="11"]').click();
    
    // Verificar que o dente mudou de cor
    await expect(page.locator('[data-tooth="11"]')).toHaveAttribute('data-status', 'cariado');
    
    // Verificar estatísticas atualizadas
    await expect(page.getByText(/cariados: 1/i)).toBeVisible();
  });

  test('deve fazer upload de anexo', async ({ page }) => {
    // Navegar para aba anexos
    await page.getByRole('tab', { name: /anexos/i }).click();
    
    // Criar arquivo de teste
    const fileContent = 'Conteúdo do arquivo de teste';
    const buffer = Buffer.from(fileContent, 'utf-8');
    
    // Upload do arquivo
    await page.setInputFiles('input[type="file"]', {
      name: 'teste.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });
    
    // Verificar upload
    await expect(page.getByText(/arquivo enviado/i)).toBeVisible();
    await expect(page.getByText('teste.txt')).toBeVisible();
  });

  test('deve capturar assinatura digital', async ({ page }) => {
    // Navegar para aba assinatura
    await page.getByRole('tab', { name: /assinatura/i }).click();
    
    // Localizar canvas de assinatura
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Simular desenho de assinatura (arrastar mouse)
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 100);
      await page.mouse.up();
    }
    
    // Salvar assinatura
    await page.getByRole('button', { name: /salvar assinatura/i }).click();
    
    // Verificar sucesso
    await expect(page.getByText(/assinatura salva/i)).toBeVisible();
  });

  test('deve visualizar histórico de alterações do odontograma', async ({ page }) => {
    // Navegar para odontograma
    await page.getByRole('tab', { name: /odontograma/i }).click();
    
    // Fazer algumas alterações
    await page.getByRole('button', { name: /cariado/i }).click();
    await page.locator('[data-tooth="11"]').click();
    
    await page.getByRole('button', { name: /obturado/i }).click();
    await page.locator('[data-tooth="12"]').click();
    
    // Abrir histórico
    await page.getByRole('tab', { name: /histórico odonto/i }).click();
    
    // Verificar que há entradas no histórico
    await expect(page.getByText(/dente 11/i)).toBeVisible();
    await expect(page.getByText(/dente 12/i)).toBeVisible();
  });
});
