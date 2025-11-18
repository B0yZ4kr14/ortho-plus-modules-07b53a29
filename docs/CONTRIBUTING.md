# Guia de Contribuição - Ortho+

## Bem-vindo!

Obrigado por considerar contribuir para o Ortho+! Este documento fornece diretrizes para garantir que sua contribuição seja integrada de forma eficiente.

## Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Começar](#como-começar)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
5. [Padrões de Código](#padrões-de-código)
6. [Testes](#testes)
7. [Commits e Pull Requests](#commits-e-pull-requests)

## Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Demonstre empatia com outros membros

## Como Começar

### Pré-requisitos

- Node.js 18+
- Bun ou npm
- Git
- Conta no GitHub

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/your-org/ortho-plus.git
cd ortho-plus

# Instale dependências
bun install

# Configure variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
bun run dev
```

## Estrutura do Projeto

```
ortho-plus/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── modules/          # Módulos de negócio (DDD)
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilitários e configurações
│   ├── infrastructure/   # Backend abstraction layer
│   └── types/            # TypeScript type definitions
├── backend/              # Backend Node.js (monólito modular)
├── e2e/                  # Testes end-to-end (Playwright)
├── docs/                 # Documentação técnica
└── public/               # Assets estáticos
```

## Workflow de Desenvolvimento

### 1. Crie uma Branch

```bash
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 2. Desenvolva

- Siga os padrões de código estabelecidos
- Escreva testes para novas funcionalidades
- Mantenha commits pequenos e focados

### 3. Teste

```bash
# Testes unitários
bun run test

# Testes E2E
bun run test:e2e

# Linter
bun run lint
```

### 4. Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: adiciona validação de CPF no cadastro de pacientes"
git commit -m "fix: corrige cálculo de valor total no orçamento"
git commit -m "docs: atualiza guia de contribuição"
```

Tipos de commit:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta funcionalidade)
- `refactor`: Refatoração de código
- `test`: Adição/correção de testes
- `chore`: Tarefas de manutenção

### 5. Push e Pull Request

```bash
git push origin feature/nome-da-feature
```

Crie um Pull Request no GitHub seguindo o template:

```markdown
## Descrição
[Descreva as mudanças realizadas]

## Tipo de Mudança
- [ ] Nova funcionalidade (feat)
- [ ] Correção de bug (fix)
- [ ] Refatoração (refactor)
- [ ] Documentação (docs)

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Build está passando
- [ ] Testes E2E estão passando

## Screenshots (se aplicável)
[Adicione capturas de tela]

## Issues Relacionadas
Closes #123
```

## Padrões de Código

### TypeScript

- **Type Safety**: Evite `any`, use tipos específicos
- **Interfaces**: Prefira interfaces para objetos públicos
- **Naming**: camelCase para variáveis, PascalCase para componentes

```typescript
// ✅ BOM
interface Patient {
  id: string;
  name: string;
  cpf: string;
}

const fetchPatients = async (): Promise<Patient[]> => {
  // ...
};

// ❌ RUIM
const fetchPatients = async (): Promise<any> => {
  // ...
};
```

### React

- **Functional Components**: Use sempre componentes funcionais
- **Hooks**: Siga as regras dos hooks
- **Memoização**: Use `memo`, `useMemo`, `useCallback` quando apropriado

```tsx
// ✅ BOM
import { memo, useCallback } from 'react';

const PatientCard = memo(({ patient, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(patient.id);
  }, [patient.id, onEdit]);

  return <div onClick={handleEdit}>{patient.name}</div>;
});

// ❌ RUIM
const PatientCard = ({ patient, onEdit }) => {
  return <div onClick={() => onEdit(patient.id)}>{patient.name}</div>;
};
```

### Styling

- **Tailwind CSS**: Use semantic tokens de `index.css`
- **Evite inline styles**: Prefira classes do Tailwind
- **Dark Mode**: Use `dark:` prefix para suporte a tema escuro

```tsx
// ✅ BOM
<div className="bg-background text-foreground rounded-lg shadow-md">

// ❌ RUIM
<div style={{ backgroundColor: '#fff', color: '#000' }}>
```

### Backend

- **DDD**: Siga Domain-Driven Design
- **Separation of Concerns**: Controller → UseCase → Repository
- **Error Handling**: Use try-catch e retorne erros estruturados

```typescript
// ✅ BOM
export class CadastrarPacienteController {
  async handle(req: Request, res: Response) {
    try {
      const useCase = new CadastrarPacienteUseCase(this.db);
      const result = await useCase.execute(req.body);
      return res.status(201).json(result);
    } catch (error) {
      logger.error('Erro ao cadastrar paciente', error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }
}
```

## Testes

### Testes Unitários (Vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './utils';

describe('calculateTotal', () => {
  it('deve calcular total corretamente', () => {
    expect(calculateTotal([10, 20, 30])).toBe(60);
  });

  it('deve retornar 0 para array vazio', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```

### Testes E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('deve fazer login com sucesso', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Commits e Pull Requests

### Mensagens de Commit

- Use o tempo presente ("adiciona" não "adicionou")
- Limite a primeira linha a 72 caracteres
- Referencie issues e PRs quando relevante

### Code Review

- Responda a todos os comentários
- Seja aberto a feedback
- Faça mudanças solicitadas prontamente
- Resolva conflitos antes de solicitar merge

### Merge

- Squash commits antes do merge (se necessário)
- Delete branch após merge
- Atualize sua branch local após merge

## Dúvidas?

- Abra uma issue no GitHub
- Entre em contato com os mantenedores
- Consulte a documentação em `/docs`

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

**Obrigado por contribuir para o Ortho+!** 🦷✨
