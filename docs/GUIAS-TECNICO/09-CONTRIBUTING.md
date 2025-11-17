# Guia Técnico: Contribuindo para o Ortho+

**Audiência:** Desenvolvedores, Contributors  
**Nível:** Intermediário  
**Versão:** 4.0.0

---

## Bem-vindo!

Obrigado pelo interesse em contribuir para o Ortho+! Este guia ajudará você a começar.

---

## Código de Conduta

Esperamos que todos os contributors sigam nosso [Código de Conduta](../CODE_OF_CONDUCT.md):

- 🤝 Seja respeitoso e inclusivo
- 💬 Comunique-se de forma clara e construtiva
- 🎯 Foque em melhorar o projeto
- 🚫 Zero tolerância para assédio ou discriminação

---

## Começando

### 1. Fazer Fork do Repositório

```bash
# Via GitHub
# Clique em "Fork" no canto superior direito

# Clone seu fork
git clone https://github.com/seu-usuario/ortho-plus.git
cd ortho-plus

# Adicione o repositório original como upstream
git remote add upstream https://github.com/ortho-plus/ortho-plus.git
```

### 2. Configurar Ambiente Local

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com suas credenciais Supabase
# (criar projeto de teste em supabase.com)

# Iniciar Supabase local (opcional)
supabase start

# Rodar aplicação
npm run dev
```

### 3. Criar Branch para sua Feature

```bash
# Atualizar main
git checkout main
git pull upstream main

# Criar branch
git checkout -b feature/nome-da-feature

# Ou para bugfix
git checkout -b fix/descricao-do-bug
```

---

## Workflow de Desenvolvimento

### 1. Fazer Mudanças

- Escreva código limpo e bem documentado
- Siga os padrões do projeto (ESLint, Prettier)
- Adicione testes quando aplicável
- Atualize documentação se necessário

### 2. Testar Localmente

```bash
# Rodar linter
npm run lint

# Type check
npm run type-check

# Testes unitários
npm run test:unit

# Testes E2E (Playwright)
npm run test:e2e

# Build de produção
npm run build
```

### 3. Commit

**Siga Conventional Commits:**

```bash
# Feature
git commit -m "feat: adiciona filtro por especialidade em dentistas"

# Bugfix
git commit -m "fix: corrige cálculo de idade do paciente"

# Documentação
git commit -m "docs: atualiza guia de instalação"

# Refatoração
git commit -m "refactor: extrai lógica de validação para hook"

# Testes
git commit -m "test: adiciona testes E2E para módulo agenda"

# Chore (build, config, etc)
git commit -m "chore: atualiza dependências"
```

**Formato:**
```
<tipo>(<escopo>): <descrição curta>

<corpo opcional: explicação detalhada>

<footer opcional: breaking changes, issues fechadas>
```

**Exemplos:**
```bash
feat(pep): adiciona suporte a upload de radiografias DICOM

Implementa parser de arquivos DICOM no módulo PEP permitindo
upload direto de radiografias digitais sem conversão prévia.

Closes #456
```

```bash
fix(auth): corrige refresh token expirado prematuramente

O refresh token estava expirando antes do esperado devido a
timezone incorreto. Ajustado para UTC.

Fixes #789
```

### 4. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature
```

**No GitHub:**
1. Acesse seu fork
2. Clique em **"Compare & pull request"**
3. Preencha template de PR:

```markdown
## Descrição

Adiciona filtro por especialidade na listagem de dentistas, permitindo
administradores encontrarem rapidamente profissionais específicos.

## Tipo de Mudança

- [ ] 🐛 Bugfix (correção de bug)
- [x] ✨ Feature (nova funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📝 Documentação

## Checklist

- [x] Código segue style guide do projeto
- [x] Realizei self-review do código
- [x] Comentei partes complexas do código
- [x] Atualizei documentação relacionada
- [x] Mudanças não geram novos warnings
- [x] Adicionei testes (se aplicável)
- [x] Todos os testes passam localmente
- [x] Mudanças dependentes foram mergeadas

## Screenshots (se aplicável)

[Adicione screenshots ou GIFs]

## Issues Relacionadas

Closes #123
Related to #456
```

4. Aguarde review do time

---

## Code Review Process

### O Que Esperamos

**Aprovação requer:**
- ✅ Pelo menos **2 aprovações** de maintainers
- ✅ Todos os **testes automatizados passando**
- ✅ **Sem conflitos** com branch main
- ✅ Code coverage **não diminuiu**
- ✅ Lighthouse score **não piorou** (performance)

### Feedback

Reviewers podem solicitar mudanças. **Seja receptivo:**
- 💬 Responda educadamente
- 🔄 Faça ajustes solicitados
- 📝 Explique decisões de design se necessário
- 🙏 Agradeça pelo feedback

### Após Aprovação

```bash
# Atualizar sua branch com main (se necessário)
git checkout main
git pull upstream main
git checkout feature/nome-da-feature
git rebase main

# Push atualizado (force push após rebase)
git push origin feature/nome-da-feature --force-with-lease
```

Maintainer fará **squash and merge** para main.

---

## Padrões de Código

### TypeScript

```typescript
// ✅ BOM: Tipos explícitos
interface Patient {
  id: string;
  fullName: string;
  birthDate: Date;
}

const getPatient = async (id: string): Promise<Patient | null> => {
  // ...
};

// ❌ EVITE: Tipos implícitos
const getPatient = async (id) => {
  // ...
};
```

### React Components

```typescript
// ✅ BOM: Componente funcional tipado
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ❌ EVITE: Props sem tipagem
export function Button({ onClick, children, variant }) {
  // ...
}
```

### Hooks Personalizados

```typescript
// ✅ BOM: Hook reutilizável com tipagem
export function usePatients(clinicId: string) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPatients();
  }, [clinicId]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select()
        .eq('clinic_id', clinicId);
      
      if (error) throw error;
      setPatients(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { patients, loading, error, refetch: fetchPatients };
}
```

### Nomes Descritivos

```typescript
// ✅ BOM: Nomes descritivos
const fetchActivePatientsByClinic = async (clinicId: string) => { ... };
const isAppointmentConfirmed = (appointment: Appointment): boolean => { ... };

// ❌ EVITE: Nomes genéricos
const getData = async (id: string) => { ... };
const check = (obj: any): boolean => { ... };
```

---

## Estrutura de Pastas

```
src/
├── application/          # Use cases (lógica de negócio)
│   └── use-cases/
├── domain/               # Entidades e interfaces
│   ├── entities/
│   └── repositories/
├── infrastructure/       # Implementações concretas
│   ├── repositories/
│   └── external/
├── components/           # Componentes React
│   ├── shared/           # Componentes reutilizáveis
│   ├── settings/         # Componentes de configuração
│   └── ui/               # Componentes base (shadcn)
├── pages/                # Páginas (rotas)
├── hooks/                # Custom hooks
├── contexts/             # React contexts
├── lib/                  # Utilitários
└── integrations/         # Integrações externas
    └── supabase/
```

**Onde adicionar seu código:**

- **Nova feature de negócio:** `application/use-cases/<modulo>/`
- **Nova entidade:** `domain/entities/`
- **Nova página:** `pages/`
- **Novo componente UI:** `components/shared/`
- **Novo hook:** `hooks/`

---

## Testes

### Unit Tests (Vitest)

```typescript
// src/hooks/usePatients.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePatients } from './usePatients';

describe('usePatients', () => {
  it('should fetch patients on mount', async () => {
    const { result } = renderHook(() => usePatients('clinic-123'));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.patients).toHaveLength(3);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/pacientes.spec.ts
import { test, expect } from '@playwright/test';

test('criar novo paciente', async ({ page }) => {
  await page.goto('/pacientes');
  await page.click('text=Novo Paciente');
  
  await page.fill('[name="fullName"]', 'João da Silva');
  await page.fill('[name="cpf"]', '123.456.789-00');
  await page.fill('[name="birthDate"]', '1990-05-15');
  
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=Paciente criado com sucesso')).toBeVisible();
});
```

---

## Documentação

### Comentários de Código

```typescript
/**
 * Calcula o risco cirúrgico do paciente baseado em histórico médico
 * 
 * @param patient - Dados do paciente incluindo condições médicas
 * @returns Score de 0-100 (0=baixo risco, 100=crítico)
 * 
 * @example
 * const riskScore = calculateSurgicalRisk(patient);
 * if (riskScore > 75) {
 *   alert('Paciente de alto risco, considerar avaliação adicional');
 * }
 */
export function calculateSurgicalRisk(patient: Patient): number {
  let score = 0;
  
  if (patient.hasCardiovascularDisease) score += 25;
  if (patient.hasDiabetes && !patient.diabetesControlled) score += 20;
  // ...
  
  return Math.min(score, 100);
}
```

### README de Módulos

Ao adicionar novo módulo, crie `docs/MODULOS/<nome-modulo>.md`:

```markdown
# Módulo: [Nome]

## Descrição
[O que o módulo faz]

## Arquitetura
[Diagrama de componentes]

## Dependências
- Módulo X
- Biblioteca Y

## Como Usar
[Exemplos de código]

## Testes
[Como testar o módulo]
```

---

## Arquitetura e Padrões

### Clean Architecture (DDD)

O Ortho+ segue princípios de Clean Architecture:

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │  ← React Components
├─────────────────────────────────────┤
│     Application Layer               │  ← Use Cases
├─────────────────────────────────────┤
│     Domain Layer                    │  ← Entities, Business Logic
├─────────────────────────────────────┤
│     Infrastructure Layer            │  ← DB, APIs, External Services
└─────────────────────────────────────┘
```

**Regras:**
- Domain **não pode depender** de Infrastructure
- Use Cases **orquestram** entidades e repositories
- UI **consome** use cases via hooks

### Exemplo: Adicionar Nova Feature

**1. Definir entidade (domain):**
```typescript
// src/domain/entities/Treatment.ts
export class Treatment {
  private constructor(private props: TreatmentProps) {}
  
  static create(props: Omit<TreatmentProps, 'id'>): Treatment {
    // Validações de negócio
    if (!props.description || props.description.length < 10) {
      throw new Error('Descrição deve ter pelo menos 10 caracteres');
    }
    
    return new Treatment({ ...props, id: crypto.randomUUID() });
  }
  
  // Métodos de negócio
  markAsCompleted(): void {
    if (this.props.status === 'completed') {
      throw new Error('Tratamento já está completo');
    }
    this.props.status = 'completed';
    this.props.completedAt = new Date();
  }
}
```

**2. Definir repository interface (domain):**
```typescript
// src/domain/repositories/ITreatmentRepository.ts
export interface ITreatmentRepository {
  findById(id: string): Promise<Treatment | null>;
  findByPatientId(patientId: string): Promise<Treatment[]>;
  save(treatment: Treatment): Promise<void>;
  update(treatment: Treatment): Promise<void>;
}
```

**3. Implementar repository (infrastructure):**
```typescript
// src/infrastructure/repositories/SupabaseTreatmentRepository.ts
export class SupabaseTreatmentRepository implements ITreatmentRepository {
  async findById(id: string): Promise<Treatment | null> {
    const { data, error } = await supabase
      .from('pep_tratamentos')
      .select()
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return TreatmentMapper.toDomain(data);
  }
  
  // ... outros métodos
}
```

**4. Criar use case (application):**
```typescript
// src/application/use-cases/treatment/CompleteTreatmentUseCase.ts
export class CompleteTreatmentUseCase {
  constructor(private repository: ITreatmentRepository) {}
  
  async execute(treatmentId: string): Promise<void> {
    const treatment = await this.repository.findById(treatmentId);
    
    if (!treatment) {
      throw new NotFoundError('Tratamento não encontrado');
    }
    
    treatment.markAsCompleted(); // Lógica de domínio
    
    await this.repository.update(treatment);
  }
}
```

**5. Criar hook para UI (presentation):**
```typescript
// src/hooks/useTreatments.ts
export function useTreatments(patientId: string) {
  const repository = new SupabaseTreatmentRepository();
  const completeTreatmentUC = new CompleteTreatmentUseCase(repository);
  
  const completeTreatment = async (id: string) => {
    try {
      await completeTreatmentUC.execute(id);
      toast.success('Tratamento concluído');
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return { completeTreatment };
}
```

---

## Style Guide

### Componentes React

```typescript
// ✅ BOM: Props interface + destructuring
interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <div>{children}</div>
    </div>
  );
}

// ❌ EVITE: Sem tipagem
export function Card(props) {
  return <div>{props.children}</div>;
}
```

### Performance

```typescript
// ✅ BOM: Memoização para evitar re-renders
const PatientsList = React.memo(({ patients }: PatientsListProps) => {
  const sortedPatients = useMemo(() => 
    [...patients].sort((a, b) => a.name.localeCompare(b.name)),
    [patients]
  );
  
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  return (
    <ul>
      {sortedPatients.map(p => (
        <li key={p.id} onClick={() => handleClick(p.id)}>
          {p.name}
        </li>
      ))}
    </ul>
  );
});
```

### Tailwind CSS (Design System)

```typescript
// ✅ BOM: Usar tokens semânticos
<div className="bg-background text-foreground border border-border">
  <h2 className="text-primary">Título</h2>
  <p className="text-muted-foreground">Subtítulo</p>
</div>

// ❌ EVITE: Cores hardcoded
<div className="bg-white text-black border border-gray-300">
  <h2 className="text-blue-600">Título</h2>
  <p className="text-gray-500">Subtítulo</p>
</div>
```

---

## Tipos de Contribuições

### 🐛 Bugfixes

- Correção de bugs reportados em Issues
- Correção de problemas encontrados durante uso
- Melhorias de robustez e tratamento de erros

### ✨ Features

- Novos módulos descentralizados
- Melhorias em módulos existentes
- Integrações com novos serviços

### 📝 Documentação

- Guias de usuário
- Guias técnicos
- Tutoriais
- Comentários de código
- README melhorados

### 🧪 Testes

- Testes unitários
- Testes de integração
- Testes E2E (Playwright)
- Testes de performance

### 🎨 UI/UX

- Melhorias de design
- Acessibilidade (WCAG AAA)
- Responsividade mobile
- Animações e micro-interações

---

## Contribuições Especiais

### Security Researchers

Encontrou vulnerabilidade? Veja [SECURITY.md](../../SECURITY.md)

### Translators

Quer traduzir para outro idioma? Entre em contato: i18n@orthoplus.com.br

### Designers

Sugestões de UI/UX? Abra issue com label `design`

---

## Comunicação

### Onde Tirar Dúvidas?

- **GitHub Discussions:** Para discussões gerais
- **GitHub Issues:** Para bugs e feature requests
- **Discord:** Chat em tempo real (link no README)
- **Email:** contribuidores@orthoplus.com.br

### Boas Práticas de Comunicação

✅ **Seja claro e específico**
✅ **Forneça contexto** (screenshots, logs, reprodução)
✅ **Seja paciente** (mantainers são voluntários ou ocupados)
✅ **Agradeça** pelo tempo e esforço dos outros

---

## Reconhecimento

Contributors ativos são reconhecidos:

- 🏆 **Contributors.md:** Nome permanente na lista
- 🎁 **Swag Pack:** Camiseta + adesivos (após 3 PRs mergeados)
- 💼 **LinkedIn Recommendation:** Para contributors frequentes
- 🌟 **Early Access:** Acesso antecipado a novas features

---

## Referências

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Obrigado por contribuir! 🙏**

**© 2025 Ortho Plus. Código aberto sob licença MIT.**
