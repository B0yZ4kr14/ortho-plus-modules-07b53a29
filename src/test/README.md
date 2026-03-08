# Suite de Testes - Ortho +

## Visão Geral

Esta suite de testes valida hooks críticos, componentes modulares e fluxos de integração do sistema Ortho +.

## Estrutura

```
src/test/
├── setup.ts                          # Configuração global dos testes
├── README.md                         # Esta documentação
└── integration/
    └── module-workflow.test.tsx      # Testes de integração entre módulos

src/modules/
├── pacientes/hooks/
│   └── usePatientsStore.test.ts     # Testes do hook de pacientes
├── financeiro/hooks/
│   └── useFinanceiroStore.test.ts   # Testes do hook financeiro
└── pep/hooks/
    └── useOdontogramaStore.test.ts  # Testes do hook do odontograma

src/components/
└── ModuleCard.test.tsx               # Testes do componente ModuleCard
```

## Comandos

### Executar todos os testes
```bash
npm run test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

### Executar testes com UI interativa
```bash
npm run test:ui
```

## Tipos de Testes

### 1. Testes Unitários de Hooks

Validam a lógica de negócio isolada dos hooks customizados:

- **usePatientsStore**: CRUD de pacientes, filtros, persistência
- **useFinanceiroStore**: Transações, cálculos financeiros, filtros
- **useOdontogramaStore**: Manipulação de odontograma, histórico, superfícies

### 2. Testes de Componentes

Validam renderização e interação de componentes React:

- **ModuleCard**: Exibição de módulos, toggles, solicitações

### 3. Testes de Integração

Validam fluxos completos entre múltiplos módulos:

- Criação de paciente → PEP → Tratamento → Financeiro
- Consistência de dados entre módulos
- Filtros cross-module
- Cálculos agregados

## Cobertura de Código

Os testes cobrem:

- ✅ Hooks críticos de gerenciamento de estado
- ✅ Componentes de interface modulares
- ✅ Fluxos de integração entre módulos
- ✅ Persistência em localStorage
- ✅ Validação de dados
- ✅ Cálculos e agregações

Áreas excluídas da cobertura:
- Arquivos de configuração
- Mocks e fixtures
- Tipos TypeScript
- Código gerado

## Mocks

### API Client
Mockado para evitar chamadas reais ao backend durante testes.

### Toast Notifications
Mockado para evitar renderização de notificações.

### React Router
Mockado para simular navegação.

## Boas Práticas

1. **Cleanup Automático**: Cada teste limpa localStorage e sessionStorage
2. **Isolamento**: Testes não dependem uns dos outros
3. **Realismo**: Testes de integração simulam fluxos reais de usuário
4. **Cobertura**: Foco em caminhos críticos e edge cases
5. **Performance**: Testes rápidos com mocks apropriados

## Adicionando Novos Testes

Para adicionar testes a um novo módulo:

1. Crie arquivo `[nome].test.ts` ou `[nome].test.tsx`
2. Importe utilities de `@testing-library/react`
3. Use `describe` para agrupar testes relacionados
4. Use `it` para cada caso de teste individual
5. Limpe estado no `beforeEach` se necessário

Exemplo:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('MyNewHook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should do something', () => {
    // Test implementation
  });
});
```

## Executando Testes no CI/CD

Adicione ao pipeline:
```yaml
- name: Run tests
  run: npm run test:coverage
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```
