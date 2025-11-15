# 🚀 Guia de Desenvolvimento - Ortho+ V4.0

## 📋 Índice

1. [Setup Inicial](#setup-inicial)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
4. [Criando Novos Módulos](#criando-novos-módulos)
5. [Trabalhando com DDD](#trabalhando-com-ddd)
6. [Supabase & Backend](#supabase--backend)
7. [Testes](#testes)
8. [Deploy](#deploy)

---

## 🔧 Setup Inicial

### Requisitos

- Node.js 18+
- npm ou bun
- Git
- VS Code (recomendado)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/your-org/orthoplus.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

---

## 📁 Estrutura do Projeto

```
src/
├── core/                      # Núcleo da aplicação
│   ├── layout/               # Layouts (Sidebar, Header, etc)
│   └── router/               # Configuração de rotas
├── modules/                   # Módulos de negócio (DDD)
│   ├── pacientes/
│   │   ├── domain/           # Entidades, Value Objects
│   │   ├── application/      # Use Cases
│   │   ├── infrastructure/   # Repositórios
│   │   └── presentation/     # Componentes UI, Hooks
│   ├── financeiro/
│   ├── crm/
│   └── ...
├── infrastructure/            # Infraestrutura global
│   ├── di/                   # Dependency Injection
│   └── mappers/              # Data Mappers
├── components/                # Componentes compartilhados
│   ├── ui/                   # Shadcn UI components
│   └── shared/               # Componentes genéricos
├── contexts/                  # React Contexts
├── hooks/                     # Custom Hooks globais
└── lib/                       # Utilitários
```

---

## 🎯 Padrões de Desenvolvimento

### 1. Naming Conventions

```typescript
// ✅ Componentes: PascalCase
export function PatientCard() {}

// ✅ Hooks: camelCase com prefixo 'use'
export function usePatients() {}

// ✅ Constantes: UPPER_SNAKE_CASE
export const MAX_PATIENTS = 100;

// ✅ Interfaces: PascalCase com 'I' prefix (opcional)
export interface IPatientRepository {}

// ✅ Types: PascalCase
export type PatientStatus = 'active' | 'inactive';
```

### 2. Imports Order

```typescript
// 1. React & React ecosystem
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. External libraries
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

// 3. Internal modules
import { Patient } from '@/modules/pacientes/domain/entities/Patient';
import { usePatients } from '@/modules/pacientes/presentation/hooks';

// 4. UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 5. Utilities
import { cn } from '@/lib/utils';

// 6. Styles
import './styles.css';
```

### 3. Component Structure

```typescript
// ✅ Estrutura recomendada
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PatientCardProps {
  patientId: string;
  onEdit?: () => void;
}

export function PatientCard({ patientId, onEdit }: PatientCardProps) {
  // 1. Hooks de estado
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. Hooks customizados
  const { patient, isLoading } = usePatient(patientId);
  
  // 3. Handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.();
  };
  
  // 4. Early returns
  if (isLoading) return <Skeleton />;
  if (!patient) return <NotFound />;
  
  // 5. Render
  return (
    <Card>
      <h2>{patient.name}</h2>
      <Button onClick={handleEdit}>Edit</Button>
    </Card>
  );
}
```

---

## 🏗️ Criando Novos Módulos

### Passo 1: Estrutura de Pastas

```bash
# Criar estrutura DDD para novo módulo
mkdir -p src/modules/novo-modulo/{domain,application,infrastructure,presentation}
mkdir -p src/modules/novo-modulo/domain/{entities,value-objects,repositories}
mkdir -p src/modules/novo-modulo/application/use-cases
mkdir -p src/modules/novo-modulo/infrastructure/repositories
mkdir -p src/modules/novo-modulo/presentation/{components,hooks,pages}
```

### Passo 2: Entidades (Domain)

```typescript
// src/modules/novo-modulo/domain/entities/MinhaEntidade.ts
export class MinhaEntidade {
  private constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly createdAt: Date
  ) {}

  static create(props: Omit<MinhaEntidade, 'id' | 'createdAt'>): MinhaEntidade {
    return new MinhaEntidade(
      crypto.randomUUID(),
      props.nome,
      new Date()
    );
  }

  static restore(props: MinhaEntidade): MinhaEntidade {
    return new MinhaEntidade(props.id, props.nome, props.createdAt);
  }
}
```

### Passo 3: Repository Interface (Domain)

```typescript
// src/modules/novo-modulo/domain/repositories/IMinhaEntidadeRepository.ts
import { MinhaEntidade } from '../entities/MinhaEntidade';

export interface IMinhaEntidadeRepository {
  save(entity: MinhaEntidade): Promise<MinhaEntidade>;
  findById(id: string): Promise<MinhaEntidade | null>;
  findAll(): Promise<MinhaEntidade[]>;
  update(entity: MinhaEntidade): Promise<MinhaEntidade>;
  delete(id: string): Promise<void>;
}
```

### Passo 4: Repository Implementation (Infrastructure)

```typescript
// src/modules/novo-modulo/infrastructure/repositories/SupabaseMinhaEntidadeRepository.ts
import { supabase } from '@/integrations/supabase/client';
import { IMinhaEntidadeRepository } from '../../domain/repositories/IMinhaEntidadeRepository';
import { MinhaEntidade } from '../../domain/entities/MinhaEntidade';

export class SupabaseMinhaEntidadeRepository implements IMinhaEntidadeRepository {
  async save(entity: MinhaEntidade): Promise<MinhaEntidade> {
    const { data, error } = await supabase
      .from('minha_tabela')
      .insert({
        id: entity.id,
        nome: entity.nome,
        created_at: entity.createdAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return MinhaEntidade.restore(data);
  }

  async findById(id: string): Promise<MinhaEntidade | null> {
    const { data, error } = await supabase
      .from('minha_tabela')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return MinhaEntidade.restore(data);
  }

  // ... outros métodos
}
```

### Passo 5: Use Case (Application)

```typescript
// src/modules/novo-modulo/application/use-cases/CreateMinhaEntidadeUseCase.ts
import { MinhaEntidade } from '../../domain/entities/MinhaEntidade';
import { IMinhaEntidadeRepository } from '../../domain/repositories/IMinhaEntidadeRepository';

interface CreateMinhaEntidadeInput {
  nome: string;
}

export class CreateMinhaEntidadeUseCase {
  constructor(private repository: IMinhaEntidadeRepository) {}

  async execute(input: CreateMinhaEntidadeInput): Promise<MinhaEntidade> {
    const entity = MinhaEntidade.create(input);
    return this.repository.save(entity);
  }
}
```

### Passo 6: Hook (Presentation)

```typescript
// src/modules/novo-modulo/presentation/hooks/useMinhasEntidades.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/infrastructure/di/ServiceProvider';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { CreateMinhaEntidadeUseCase } from '../../application/use-cases/CreateMinhaEntidadeUseCase';

export function useMinhasEntidades() {
  const queryClient = useQueryClient();
  const createUseCase = useService<CreateMinhaEntidadeUseCase>(
    SERVICE_KEYS.CREATE_MINHA_ENTIDADE_USE_CASE
  );

  const { data, isLoading } = useQuery({
    queryKey: ['minhas-entidades'],
    queryFn: async () => {
      // implementação
    }
  });

  const createMutation = useMutation({
    mutationFn: (input: { nome: string }) => createUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhas-entidades'] });
    }
  });

  return {
    entidades: data,
    isLoading,
    create: createMutation.mutate
  };
}
```

### Passo 7: Registrar no DI Container

```typescript
// src/infrastructure/di/bootstrap.ts

// Adicionar chave no SERVICE_KEYS
export const SERVICE_KEYS = {
  // ... existing keys
  MINHA_ENTIDADE_REPOSITORY: 'MINHA_ENTIDADE_REPOSITORY',
  CREATE_MINHA_ENTIDADE_USE_CASE: 'CREATE_MINHA_ENTIDADE_USE_CASE',
} as const;

// Registrar no bootstrap
container.register(
  SERVICE_KEYS.MINHA_ENTIDADE_REPOSITORY,
  () => new SupabaseMinhaEntidadeRepository(),
  true
);

container.register(
  SERVICE_KEYS.CREATE_MINHA_ENTIDADE_USE_CASE,
  () => new CreateMinhaEntidadeUseCase(
    container.resolve(SERVICE_KEYS.MINHA_ENTIDADE_REPOSITORY)
  ),
  true
);
```

---

## 🗄️ Supabase & Backend

### Migrations

```bash
# Criar nova migration
supabase migration new create_minha_tabela

# Executar migrations
supabase db push
```

### RLS Policies

```sql
-- Sempre use Security Definer functions para evitar recursão
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM profiles WHERE id = auth.uid()
$$;

-- Policy usando a function
CREATE POLICY "Users can view own clinic data"
ON minha_tabela
FOR SELECT
USING (clinic_id = get_user_clinic_id());
```

### Edge Functions

```typescript
// supabase/functions/minha-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  // Sua lógica aqui
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

---

## 🧪 Testes

```bash
# Executar testes
npm test

# Com coverage
npm run test:coverage

# E2E
npm run test:e2e
```

---

## 🚀 Deploy

```bash
# Build de produção
npm run build

# Preview do build
npm run preview

# Deploy (via Lovable ou Vercel/Netlify)
npm run deploy
```

---

## 📚 Recursos Adicionais

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Happy Coding! 🎉**
