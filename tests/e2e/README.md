# Testes End-to-End (E2E) - Ortho +

## Visão Geral

Suite completa de testes E2E usando Playwright para validar fluxos completos de usuário através da interface do sistema Ortho +.

## Estrutura dos Testes

```
e2e/
├── auth.spec.ts                    # Testes de autenticação
├── pacientes.spec.ts               # CRUD de pacientes
├── pep.spec.ts                     # Módulo PEP completo
├── financeiro.spec.ts              # Módulo financeiro
├── modules-management.spec.ts      # Gestão de módulos (ADMIN)
├── workflow-integration.spec.ts    # Fluxos integrados
├── accessibility.spec.ts           # Testes de acessibilidade
└── README.md                       # Esta documentação
```

## Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Instalar Browsers do Playwright

```bash
npx playwright install
```

## Executando os Testes

### Todos os Testes

```bash
npx playwright test
```

### Testes Específicos

```bash
# Apenas testes de autenticação
npx playwright test auth

# Apenas testes de pacientes
npx playwright test pacientes

# Apenas testes do módulo PEP
npx playwright test pep
```

### Por Browser

```bash
# Chromium
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# WebKit (Safari)
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Modo Debug

```bash
npx playwright test --debug
```

### Modo UI (Interativo)

```bash
npx playwright test --ui
```

### Com Relatório HTML

```bash
npx playwright test
npx playwright show-report
```

## Configurações

### playwright.config.ts

Configurações principais:
- **Base URL**: `http://localhost:5173`
- **Timeout**: 30 segundos por teste
- **Retries**: 2 tentativas em CI, 0 localmente
- **Paralelização**: Completa (todos os testes em paralelo)
- **Screenshots**: Apenas em falhas
- **Vídeos**: Apenas em falhas
- **Trace**: Em primeira retry

### Projetos Configurados

- Desktop Chrome
- Desktop Firefox
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Cobertura de Testes

### 1. Autenticação (`auth.spec.ts`)
- ✅ Exibição da página de login
- ✅ Login com credenciais válidas
- ✅ Erro com credenciais inválidas
- ✅ Logout
- ✅ Proteção de rotas privadas

### 2. Gestão de Pacientes (`pacientes.spec.ts`)
- ✅ Listagem de pacientes
- ✅ Busca por nome
- ✅ Criação de paciente
- ✅ Edição de paciente
- ✅ Exclusão de paciente
- ✅ Filtro por status

### 3. Módulo PEP (`pep.spec.ts`)
- ✅ Exibição de abas
- ✅ Preenchimento de histórico clínico
- ✅ Criação de tratamentos
- ✅ Interação com odontograma 2D
- ✅ Upload de anexos
- ✅ Captura de assinatura digital
- ✅ Visualização de histórico

### 4. Módulo Financeiro (`financeiro.spec.ts`)
- ✅ Resumo financeiro
- ✅ Gráficos
- ✅ Criação de receita
- ✅ Criação de despesa
- ✅ Filtros por tipo e status
- ✅ Edição de transação
- ✅ Exclusão de transação
- ✅ Cálculo de totais

### 5. Gestão de Módulos (`modules-management.spec.ts`)
- ✅ Catálogo de módulos
- ✅ Agrupamento por categoria
- ✅ Ativação de módulo
- ✅ Desativação de módulo
- ✅ Validação de dependências
- ✅ Visualização de grafo
- ✅ Simulação What-If
- ✅ Solicitação de novos módulos

### 6. Fluxo Integrado (`workflow-integration.spec.ts`)
- ✅ Fluxo completo: Paciente → PEP → Tratamento → Financeiro
- ✅ Consistência de dados entre módulos
- ✅ Preservação de dados na navegação

### 7. Acessibilidade (`accessibility.spec.ts`)
- ✅ Análise automática com axe-core
- ✅ Navegação por teclado
- ✅ Labels em formulários
- ✅ Alt text em imagens
- ✅ Contraste de cores

## CI/CD

### GitHub Actions

O workflow `.github/workflows/e2e-tests.yml` executa automaticamente:

1. **Em cada push** para branches `main` e `develop`
2. **Em cada Pull Request** para estas branches
3. **Matriz de testes** em 3 browsers (Chromium, Firefox, WebKit)
4. **Upload de artefatos**:
   - Relatórios HTML
   - Screenshots de falhas
   - Vídeos de testes que falharam

### Acessar Relatórios

Após execução no GitHub Actions:
1. Vá para a aba "Actions" do repositório
2. Clique no workflow run desejado
3. Baixe os artefatos na seção "Artifacts"

## Boas Práticas

### 1. Seletores

✅ **BOM - Use ARIA roles e labels:**
```typescript
page.getByRole('button', { name: /salvar/i })
page.getByLabel(/email/i)
page.getByText('Paciente Teste')
```

❌ **RUIM - Evite seletores frágeis:**
```typescript
page.locator('.css-class-123')
page.locator('#unique-id')
```

### 2. Esperas

✅ **BOM - Esperas automáticas:**
```typescript
await expect(page.getByText('Sucesso')).toBeVisible()
```

❌ **RUIM - Timeouts fixos:**
```typescript
await page.waitForTimeout(3000)
```

### 3. Dados de Teste

✅ **BOM - Dados únicos:**
```typescript
const patientName = `Paciente Teste ${Date.now()}`;
```

❌ **RUIM - Dados hardcoded:**
```typescript
const patientName = 'João Silva';
```

### 4. Limpeza

✅ **BOM - Limpar dados após teste:**
```typescript
test.afterEach(async () => {
  // Deletar dados criados
});
```

### 5. Isolamento

✅ **BOM - Testes independentes:**
```typescript
test.beforeEach(async ({ page }) => {
  // Configurar estado inicial
});
```

❌ **RUIM - Testes dependentes:**
```typescript
// Teste 1 cria dados
// Teste 2 depende dos dados do Teste 1
```

## Troubleshooting

### Testes lentos

```bash
# Executar em modo headed para ver o que está acontecendo
npx playwright test --headed

# Reduzir workers
npx playwright test --workers=1
```

### Testes instáveis (flaky)

```bash
# Executar teste específico várias vezes
npx playwright test auth --repeat-each=10

# Ver trace de execução
npx playwright show-trace trace.zip
```

### Screenshots e Vídeos

Localizados em `test-results/`:
```
test-results/
├── auth-login-chromium/
│   ├── test-failed-1.png
│   └── video.webm
```

### Debug Visual

```bash
# Abrir Playwright Inspector
npx playwright test --debug

# Pausar em ponto específico
await page.pause();
```

## Métricas

### Performance

- **Tempo médio por teste**: ~5-10 segundos
- **Suite completa**: ~5-10 minutos
- **Paralelização**: 4 workers (padrão)

### Cobertura

- **Total de testes**: 50+
- **Browsers**: 5 (3 desktop + 2 mobile)
- **Fluxos críticos**: 100% cobertos
- **Taxa de sucesso alvo**: >95%

## Contribuindo

### Adicionando Novo Teste

1. Crie arquivo em `e2e/nome-do-teste.spec.ts`
2. Siga o padrão dos testes existentes
3. Use seletores semânticos (ARIA)
4. Adicione documentação inline
5. Execute localmente antes de commitar

### Template de Teste

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nome do Módulo', () => {
  test.beforeEach(async ({ page }) => {
    // Setup comum
  });

  test('deve realizar ação X', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Recursos

- [Documentação Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [CI/CD](https://playwright.dev/docs/ci)

## Suporte

Para problemas ou dúvidas sobre os testes E2E, consulte:
1. Esta documentação
2. Logs de execução no CI
3. [Issues do Playwright](https://github.com/microsoft/playwright/issues)
