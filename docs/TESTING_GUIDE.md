# Testing Guide - Ortho+ V5.2

## Overview

Este guia cobre a estratégia de testes do Ortho+, incluindo **E2E (Playwright)**, **Unit Tests (Vitest)** e **Integration Tests**.

## Stack de Testes

- **E2E**: Playwright (testes de fluxo completo)
- **Unit**: Vitest (testes de lógica isolada)
- **Acessibilidade**: Axe Core (WCAG 2.1 AA)

## Estrutura de Testes

```
tests/
├── e2e/                        # Testes End-to-End (Playwright)
│   ├── auth.spec.ts
│   ├── patients.spec.ts
│   ├── agenda.spec.ts
│   ├── financeiro.spec.ts
│   └── navigation.spec.ts
│
├── unit/                       # Testes Unitários (Vitest)
│   ├── domain/
│   │   ├── Patient.test.ts
│   │   └── Appointment.test.ts
│   ├── use-cases/
│   │   └── CreatePatient.test.ts
│   └── utils/
│       └── crypto-cache.test.ts
│
└── integration/                # Testes de Integração
    ├── backend-switching.test.ts
    └── supabase-auth.test.ts
```

## E2E Tests (Playwright)

### Configuração

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Exemplo: Teste de Autenticação

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'admin@orthoplus.com');
    await page.fill('[data-testid="password-input"]', 'Admin123!');
    await page.click('[data-testid="login-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Bem-vindo')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('[data-testid="email-input"]', 'invalid@test.com');
    await page.fill('[data-testid="password-input"]', 'wrong');
    await page.click('[data-testid="login-button"]');
    
    // Verify error message
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
  });
});
```

### Exemplo: Teste de Pacientes

```typescript
// tests/e2e/patients.spec.ts
test('should create a new patient', async ({ page }) => {
  await page.goto('/pacientes');
  
  await page.click('[data-testid="new-patient-button"]');
  
  // Fill patient form
  await page.fill('[name="full_name"]', 'João da Silva');
  await page.fill('[name="cpf"]', '123.456.789-00');
  await page.fill('[name="phone"]', '(11) 98765-4321');
  await page.fill('[name="email"]', 'joao@example.com');
  
  await page.click('[data-testid="save-patient-button"]');
  
  // Verify success toast
  await expect(page.locator('text=Paciente cadastrado com sucesso')).toBeVisible();
  
  // Verify patient appears in list
  await expect(page.locator('text=João da Silva')).toBeVisible();
});
```

### Rodando Testes E2E

```bash
# Rodar todos os testes
npm run test:e2e

# Rodar testes em modo UI (debug)
npm run test:e2e:ui

# Rodar testes em um browser específico
npx playwright test --project=chromium

# Gerar relatório HTML
npx playwright show-report
```

## Unit Tests (Vitest)

### Configuração

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### Exemplo: Teste de Entidade de Domínio

```typescript
// tests/unit/domain/Patient.test.ts
import { describe, it, expect } from 'vitest';
import { Patient } from '@/modules/pacientes/domain/Patient';

describe('Patient Entity', () => {
  it('should create a valid patient', () => {
    const patient = Patient.create({
      id: '123',
      full_name: 'João Silva',
      cpf: '12345678900',
      clinic_id: 'clinic-1',
      status: 'ATIVO',
    });

    expect(patient.full_name).toBe('João Silva');
    expect(patient.status).toBe('ATIVO');
  });

  it('should calculate risk level correctly', () => {
    const patient = Patient.create({
      id: '123',
      full_name: 'João Silva',
      cpf: '12345678900',
      clinic_id: 'clinic-1',
      has_diabetes: true,
      has_hypertension: true,
      status: 'ATIVO',
    });

    patient.calculateRiskScore();

    expect(patient.risk_level).toBe('alto');
    expect(patient.risk_score_overall).toBeGreaterThan(50);
  });
});
```

### Exemplo: Teste de Use Case

```typescript
// tests/unit/use-cases/CreatePatient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { CreatePatientUseCase } from '@/application/use-cases/patient/CreatePatientUseCase';

describe('CreatePatientUseCase', () => {
  it('should create patient and emit event', async () => {
    // Mock repository
    const mockRepo = {
      save: vi.fn().mockResolvedValue({ id: '123' }),
    };

    // Mock event bus
    const mockEventBus = {
      publish: vi.fn(),
    };

    const useCase = new CreatePatientUseCase(mockRepo, mockEventBus);

    const result = await useCase.execute({
      full_name: 'João Silva',
      cpf: '12345678900',
      clinic_id: 'clinic-1',
    });

    expect(result.success).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledOnce();
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'Pacientes.PacienteCriado',
      })
    );
  });
});
```

### Rodando Unit Tests

```bash
# Rodar todos os unit tests
npm run test:unit

# Rodar com coverage
npm run test:unit -- --coverage

# Rodar em modo watch
npm run test:unit -- --watch

# Rodar testes específicos
npm run test:unit -- Patient.test.ts
```

## Integration Tests

### Exemplo: Teste de Backend Switching

```typescript
// tests/integration/backend-switching.test.ts
import { describe, it, expect } from 'vitest';
import { BackendProvider, useBackend } from '@/lib/providers/BackendProvider';

describe('Backend Switching', () => {
  it('should switch from Supabase to PostgreSQL', async () => {
    const { switchBackend, backendType } = useBackend();

    expect(backendType).toBe('supabase');

    await switchBackend('postgresql');

    expect(backendType).toBe('postgresql');
    expect(localStorage.getItem('selected_backend')).toBe('postgresql');
  });

  it('should maintain data consistency after switch', async () => {
    const { backend, switchBackend } = useBackend();

    // Query data from Supabase
    const { data: supabaseData } = await backend.data.query('patients');

    // Switch to PostgreSQL
    await switchBackend('postgresql');

    // Query same data from PostgreSQL
    const { data: postgresData } = await backend.data.query('patients');

    // Should have same number of records (assuming sync)
    expect(supabaseData.length).toBe(postgresData.length);
  });
});
```

## Accessibility Tests (Axe Core)

### Configuração

```bash
npm install --save-dev @axe-core/playwright
```

### Exemplo de Teste

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have accessibility violations on login page', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on forms', async ({ page }) => {
    await page.goto('/pacientes/novo');

    const nameInput = page.locator('[name="full_name"]');
    expect(await nameInput.getAttribute('aria-label')).toBeTruthy();

    const cpfInput = page.locator('[name="cpf"]');
    expect(await cpfInput.getAttribute('aria-label')).toBeTruthy();
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit -- --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps ${{ matrix.browser }}
      - run: npx playwright test --project=${{ matrix.browser }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results-${{ matrix.browser }}
          path: test-results/
```

## Coverage Targets

| Tipo | Alvo | Atual (V5.2) |
|------|------|--------------|
| **Unit Tests** | 80%+ | 45% |
| **E2E Tests** | 80%+ | 35% |
| **Integration** | 60%+ | 20% |
| **Accessibility** | 100% (WCAG AA) | 60% |

## Best Practices

### ✅ DO

- Usar `data-testid` para seletores consistentes
- Escrever testes isolados (não depender de ordem)
- Mockar APIs externas (não fazer calls reais)
- Testar fluxos críticos primeiro (auth, pagamentos)
- Rodar testes em CI antes de merge

### ❌ DON'T

- Usar seletores CSS frágeis (`.button-primary`)
- Fazer testes dependentes de outros testes
- Escrever testes muito longos (>50 linhas)
- Ignorar falhas intermitentes ("flaky tests")
- Testar detalhes de implementação

## Troubleshooting

### Testes E2E Falhando

```bash
# Aumentar timeout
npx playwright test --timeout=60000

# Rodar em modo headed (ver navegador)
npx playwright test --headed

# Debug com Playwright Inspector
npx playwright test --debug
```

### Testes Lentos

- Desabilitar animações CSS em testes
- Usar `page.waitForLoadState('networkidle')` com cuidado
- Paralelizar testes com `fullyParallel: true`

### Coverage Baixo

- Identificar módulos sem cobertura: `npm run test:unit -- --coverage`
- Priorizar testar lógica de domínio (entities, use cases)
- Evitar testar componentes triviais (simples renders)

## Recursos

- [Playwright Docs](https://playwright.dev/)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Axe Core](https://www.deque.com/axe/)
