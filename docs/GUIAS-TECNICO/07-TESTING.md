# Guia Técnico: Estratégia de Testes

**Audiência:** Desenvolvedores, QA Engineers  
**Nível:** Avançado  
**Versão:** 4.0.0

---

## Visão Geral

Este guia detalha a estratégia completa de testes do Ortho+, incluindo testes unitários, integração, E2E, performance e segurança.

---

## Pirâmide de Testes

```
          /\
         /  \        E2E (10%)
        /____\       Lentos, caros, frágeis
       /      \      
      /  INT   \     Integration (30%)
     /          \    Médio custo
    /____________\   
   /              \  
  /     UNIT       \ Unit Tests (60%)
 /__________________\ Rápidos, baratos, confiáveis
```

---

## Unit Tests (Vitest)

### Configuração

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts'
      ],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Setup File

**src/test/setup.ts:**
```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
```

### Exemplo: Testar Hook

**src/hooks/usePatients.test.ts:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePatients } from './usePatients';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('usePatients', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch patients successfully', async () => {
    const mockPatients = [
      { id: '1', name: 'João Silva', cpf: '123.456.789-00' },
      { id: '2', name: 'Maria Santos', cpf: '987.654.321-00' }
    ];

    // Mock Supabase response
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: mockPatients,
        error: null
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock
    } as any);

    const { result } = renderHook(() => usePatients('clinic-id'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPatients);
    expect(selectMock).toHaveBeenCalledWith('*');
  });

  it('should handle errors', async () => {
    const mockError = { message: 'Database error' };

    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock
    } as any);

    const { result } = renderHook(() => usePatients('clinic-id'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});
```

### Exemplo: Testar Componente

**src/components/PatientCard.test.tsx:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientCard } from './PatientCard';

describe('PatientCard', () => {
  const mockPatient = {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'joao@example.com'
  };

  it('should render patient information', () => {
    render(<PatientCard patient={mockPatient} />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<PatientCard patient={mockPatient} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockPatient.id);
  });

  it('should show confirmation dialog when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<PatientCard patient={mockPatient} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /excluir/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/tem certeza/i)).toBeInTheDocument();
  });
});
```

### Rodar Testes Unitários

```bash
# Rodar todos os testes
npm run test

# Rodar com cobertura
npm run test:coverage

# Rodar em modo watch
npm run test:watch

# Rodar apenas testes específicos
npm run test -- usePatients

# Rodar com UI interativa
npm run test:ui
```

---

## Integration Tests

### Testar Edge Functions

**supabase/functions/_tests/getMyModules.test.ts:**
```typescript
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.test('getMyModules should return active modules', async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  // Criar usuário de teste
  const { data: { user } } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'Test123!@#'
  });

  // Chamar Edge Function
  const { data, error } = await supabase.functions.invoke('getMyModules', {
    body: { clinicId: user?.user_metadata?.clinic_id }
  });

  assertEquals(error, null);
  assertEquals(Array.isArray(data), true);
  assertEquals(data.length > 0, true);

  // Cleanup
  await supabase.auth.admin.deleteUser(user!.id);
});
```

### Rodar Testes de Integração

```bash
# Testar Edge Function localmente
deno test --allow-net --allow-env supabase/functions/_tests/

# Testar contra Supabase remoto
SUPABASE_URL=<url> SUPABASE_ANON_KEY=<key> deno test
```

---

## E2E Tests (Playwright)

### Configuração

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
});
```

### Exemplo: Teste de Login

**e2e/auth/login.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('[name="email"]', 'admin@clinica.com');
    await page.fill('[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Bem-vindo')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('[name="email"]', 'admin@clinica.com');
    await page.fill('[name="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email ou senha incorretos')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email inválido')).toBeVisible();
  });
});
```

### Exemplo: Teste de Fluxo Completo

**e2e/patient/create-patient.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Create Patient Flow', () => {
  test.use({ storageState: 'auth-state.json' }); // Usar sessão salva

  test('should create a new patient successfully', async ({ page }) => {
    // Navegar para pacientes
    await page.goto('/pacientes');
    await page.click('button:has-text("Novo Paciente")');

    // Preencher formulário
    await page.fill('[name="name"]', 'João da Silva Teste');
    await page.fill('[name="cpf"]', '123.456.789-00');
    await page.fill('[name="phone"]', '(11) 98765-4321');
    await page.fill('[name="email"]', 'joao.teste@example.com');
    await page.fill('[name="birthdate"]', '1990-01-15');

    // Submeter
    await page.click('button[type="submit"]');

    // Verificar sucesso
    await expect(page.locator('text=Paciente criado com sucesso')).toBeVisible();

    // Verificar que paciente aparece na lista
    await page.goto('/pacientes');
    await expect(page.locator('text=João da Silva Teste')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/pacientes');
    await page.click('button:has-text("Novo Paciente")');

    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Verificar mensagens de erro
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
    await expect(page.locator('text=CPF é obrigatório')).toBeVisible();
  });
});
```

### Rodar Testes E2E

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Rodar em modo headed (ver navegador)
npm run test:e2e -- --headed

# Rodar apenas um arquivo
npm run test:e2e -- login.spec.ts

# Rodar com debug
npm run test:e2e -- --debug

# Gerar relatório HTML
npx playwright show-report
```

---

## Performance Tests

### Lighthouse CI

**.lighthouserc.js:**
```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/pacientes',
        'http://localhost:5173/agenda'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### Load Testing (Artillery)

**artillery.yml:**
```yaml
config:
  target: 'https://app.orthoplus.com.br'
  phases:
    - duration: 60
      arrivalRate: 5
      name: Warm up
    - duration: 300
      arrivalRate: 20
      name: Sustained load
    - duration: 120
      arrivalRate: 50
      name: Spike
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.TEST_JWT }}'

scenarios:
  - name: View patients list
    flow:
      - get:
          url: '/api/pacientes'
          expect:
            - statusCode: 200
            - contentType: json

  - name: Create appointment
    flow:
      - post:
          url: '/api/appointments'
          json:
            patient_id: '{{ $randomString() }}'
            dentist_id: '{{ $randomString() }}'
            start_time: '{{ $randomString() }}'
            end_time: '{{ $randomString() }}'
          expect:
            - statusCode: 201

  - name: Search products
    flow:
      - get:
          url: '/api/produtos'
          qs:
            search: '{{ $randomString() }}'
          expect:
            - statusCode: 200
            - hasProperty: data
```

**Rodar:**
```bash
npm install -g artillery
artillery run artillery.yml
```

---

## Security Tests

### OWASP ZAP

**zap-scan.sh:**
```bash
#!/bin/bash

docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://app.orthoplus.com.br \
  -r zap-report.html \
  -J zap-report.json \
  -w zap-report.md
```

### Snyk (Vulnerability Scanning)

```bash
# Instalar Snyk CLI
npm install -g snyk

# Autenticar
snyk auth

# Escanear dependências
snyk test

# Escanear código
snyk code test

# Monitorar continuamente
snyk monitor
```

---

## CI/CD Integration

### GitHub Actions

**.github/workflows/test.yml:**
```yaml
name: Tests

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

---

## Test Data Management

### Fixtures

**src/test/fixtures/patients.ts:**
```typescript
export const mockPatients = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
    phone: '(11) 98765-4321'
  },
  {
    id: '2',
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria@example.com',
    phone: '(11) 91234-5678'
  }
];
```

### Factories

**src/test/factories/patient.factory.ts:**
```typescript
import { faker } from '@faker-js/faker';

export function createMockPatient(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    cpf: faker.string.numeric(11),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    birthdate: faker.date.past().toISOString(),
    ...overrides
  };
}
```

---

## Best Practices

### ✅ DO

- Escrever testes antes do código (TDD quando apropriado)
- Manter testes isolados e independentes
- Usar factories/fixtures para dados de teste
- Mockar dependências externas (APIs, banco)
- Cobrir casos de erro, não apenas happy path
- Rodar testes no CI/CD

### ❌ DON'T

- Testar detalhes de implementação
- Criar dependências entre testes
- Usar dados de produção em testes
- Ignorar testes falhando (fix or delete)
- Over-mockar (testar apenas mocks)
- Escrever testes muito lentos

---

## Referências

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Martin Fowler - Testing Strategies](https://martinfowler.com/articles/practical-test-pyramid.html)

---

**Próximos Passos:**
- [Guia: Deployment](06-DEPLOYMENT.md)
- [Guia: Performance Optimization](08-PERFORMANCE.md)
