# 🏆 Golden Pattern - Template para Criação de Módulos

**Baseado no Módulo:** PEP (Prontuário Eletrônico do Paciente)  
**Versão:** 1.0  
**Última Atualização:** 14/11/2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquitetura](#estrutura-de-arquitetura)
3. [Passo a Passo de Implementação](#passo-a-passo)
4. [Integração com Sistema de Módulos](#integração-módulos)
5. [Proteção de Acesso (RLS)](#rls)
6. [Auditoria e Compliance](#auditoria)
7. [Checklist de Validação](#checklist)

---

## 🎯 Visão Geral {#visão-geral}

Este documento define o **Golden Pattern** - um template validado para criação de módulos no sistema Ortho+. O padrão foi validado através do módulo PEP e deve ser replicado para todos os novos módulos.

### Princípios do Golden Pattern

1. **Modularidade:** Cada módulo é independente e plug-and-play
2. **Proteção de Acesso:** Integração com sistema de gestão de módulos
3. **Segurança:** RLS policies para multi-tenancy
4. **Auditoria:** Logs de todas as ações críticas
5. **UX Consistente:** Padrões de interface e feedback

---

## 🏗️ Estrutura de Arquitetura {#estrutura-de-arquitetura}

### Estrutura de Pastas Recomendada

```
src/
├── pages/
│   └── [ModuleName].tsx           # Página principal (ex: PEP.tsx)
│
├── modules/
│   └── [module-name]/             # Pasta do módulo (ex: pep/)
│       ├── components/
│       │   ├── [Feature]Form.tsx  # Formulários (ex: HistoricoClinicoForm)
│       │   ├── [Feature]List.tsx  # Listas
│       │   ├── [Feature]Upload.tsx# Uploads
│       │   └── ...
│       ├── hooks/
│       │   └── use[Feature].ts    # Custom hooks (ex: useOdontogramaSupabase)
│       ├── types/
│       │   └── [module].types.ts  # TypeScript types
│       └── utils/
│           └── [module].utils.ts  # Utilidades
│
├── core/
│   └── layout/
│       └── Sidebar/
│           └── sidebar.config.ts  # Configuração da sidebar
│
└── contexts/
    └── AuthContext.tsx            # Context de autenticação
```

### Exemplo Real: Módulo PEP

```
src/
├── pages/
│   └── PEP.tsx                    # Página principal do PEP
│
├── modules/
│   └── pep/
│       ├── components/
│       │   ├── HistoricoClinicoForm.tsx
│       │   ├── TratamentoForm.tsx
│       │   ├── AnexosUpload.tsx
│       │   ├── EvolucoesTimeline.tsx
│       │   ├── Odontograma2D.tsx
│       │   ├── Odontograma3D.tsx
│       │   ├── AssinaturaDigital.tsx
│       │   └── ProntuarioPDF.tsx
│       ├── hooks/
│       │   └── useOdontogramaSupabase.ts
│       └── types/
│           └── pep.types.ts
│
└── core/layout/Sidebar/sidebar.config.ts
```

---

## 🚀 Passo a Passo de Implementação {#passo-a-passo}

### Etapa 1: Criar a Página Principal

**Arquivo:** `src/pages/[ModuleName].tsx`

```tsx
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

export default function ModuleName() {
  const { hasModuleAccess } = useAuth();
  const [activeTab, setActiveTab] = useState('main');

  // Verificação de acesso (opcional, já protegido pela sidebar)
  if (!hasModuleAccess('MODULE_KEY')) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Módulo não ativo</AlertTitle>
          <AlertDescription>
            Este módulo não está ativo para sua clínica. 
            Entre em contato com o administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nome do Módulo"
        subtitle="Descrição breve do módulo"
        icon={IconComponent}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="main">Principal</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          {/* Conteúdo principal */}
        </TabsContent>

        <TabsContent value="settings">
          {/* Configurações */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Etapa 2: Adicionar Rota Protegida

**Arquivo:** `src/App.tsx`

```tsx
// Importar a página
import ModuleName from './pages/ModuleName';

// Ou lazy load (recomendado para páginas pesadas)
const ModuleName = lazy(() => import('./pages/ModuleName'));

// Adicionar rota
<Route
  path="/module-path"
  element={
    <ProtectedRoute>
      <Suspense fallback={<LoadingState />}>
        <ModuleName />
      </Suspense>
    </ProtectedRoute>
  }
/>
```

### Etapa 3: Configurar Link na Sidebar

**Arquivo:** `src/core/layout/Sidebar/sidebar.config.ts`

```tsx
import { IconComponent } from 'lucide-react';

export const menuGroups: MenuGroup[] = [
  {
    label: 'Categoria',
    items: [
      {
        title: 'Nome do Módulo',
        url: '/module-path',
        icon: IconComponent,
        moduleKey: 'MODULE_KEY' // 🔑 IMPORTANTE: Chave do módulo
      }
    ]
  }
];
```

**Chaves de Módulos Disponíveis:**
```typescript
// Gestão e Operação
'PEP', 'AGENDA', 'ORCAMENTOS', 'ODONTOGRAMA', 'ESTOQUE'

// Financeiro
'FINANCEIRO', 'SPLIT_PAGAMENTO', 'INADIMPLENCIA'

// Crescimento e Marketing
'CRM', 'MARKETING_AUTO', 'BI'

// Compliance
'LGPD', 'ASSINATURA_ICP', 'TISS', 'TELEODONTO'

// Inovação
'FLUXO_DIGITAL', 'IA'
```

### Etapa 4: Criar Componentes do Módulo

**Estrutura Recomendada:**

```tsx
// src/modules/[module-name]/components/FeatureForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  field1: z.string().min(1, 'Campo obrigatório'),
  field2: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FeatureFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FeatureForm({ onSuccess, onCancel }: FeatureFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { field1: '', field2: '' }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabase
        .from('table_name')
        .insert([data]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Registro criado com sucesso',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar registro',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campo 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">Salvar</Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
```

### Etapa 5: Criar Custom Hooks

```tsx
// src/modules/[module-name]/hooks/useFeature.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFeature(id: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setData(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('table_name')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Dados atualizados',
      });
      
      fetchData(); // Reload
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar',
        variant: 'destructive',
      });
    }
  };

  return { data, loading, updateData, refetch: fetchData };
}
```

---

## 🔗 Integração com Sistema de Módulos {#integração-módulos}

### Como Funciona

1. **Configuração no Catálogo:**
   - Cada módulo tem uma entrada na tabela `module_catalog` com `module_key` único

2. **Ativação pela Clínica:**
   - Administrador ativa/desativa módulos na página `/settings/modules`
   - Sistema verifica dependências antes de ativar/desativar

3. **Controle de Acesso:**
   - `AuthContext` expõe `hasModuleAccess(moduleKey: string)`
   - Sidebar renderiza links apenas para módulos ativos
   - Páginas podem verificar acesso (opcional)

### Verificação de Acesso

```tsx
// Em qualquer componente
import { useAuth } from '@/contexts/AuthContext';

const { hasModuleAccess } = useAuth();

// Verificar se módulo está ativo
if (hasModuleAccess('MODULE_KEY')) {
  // Renderizar feature
} else {
  // Exibir mensagem ou ocultar
}
```

### Renderização Condicional na Sidebar

```tsx
// sidebar.config.ts
{
  title: 'Meu Módulo',
  url: '/meu-modulo',
  icon: Icon,
  moduleKey: 'MEU_MODULO' // 🔑 Chave de controle
}

// O sistema automaticamente:
// - Renderiza o link SE módulo ativo
// - Oculta o link SE módulo inativo
// - Não renderiza grupos vazios
```

---

## 🔒 Proteção de Acesso (RLS) {#rls}

### Row Level Security Policies Padrão

**Princípio:** Cada usuário deve ver apenas dados da sua clínica (multi-tenancy).

#### Policy 1: SELECT (Visualizar)

```sql
CREATE POLICY "Users can view own clinic data"
ON public.table_name
FOR SELECT
USING (
  clinic_id = (SELECT public.get_user_clinic_id(auth.uid()))
);
```

#### Policy 2: INSERT (Criar)

```sql
CREATE POLICY "Users can insert for own clinic"
ON public.table_name
FOR INSERT
WITH CHECK (
  clinic_id = (SELECT public.get_user_clinic_id(auth.uid()))
);
```

#### Policy 3: UPDATE (Atualizar)

```sql
CREATE POLICY "Users can update own clinic data"
ON public.table_name
FOR UPDATE
USING (
  clinic_id = (SELECT public.get_user_clinic_id(auth.uid()))
)
WITH CHECK (
  clinic_id = (SELECT public.get_user_clinic_id(auth.uid()))
);
```

#### Policy 4: DELETE (Excluir)

```sql
CREATE POLICY "Users can delete own clinic data"
ON public.table_name
FOR DELETE
USING (
  clinic_id = (SELECT public.get_user_clinic_id(auth.uid()))
);
```

### Estrutura de Tabela Padrão

```sql
CREATE TABLE public.module_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Campos específicos do módulo
  field1 TEXT,
  field2 INTEGER,
  ...
);

-- Habilitar RLS
ALTER TABLE public.module_table ENABLE ROW LEVEL SECURITY;

-- Adicionar policies (ver acima)
-- Adicionar trigger de updated_at
CREATE TRIGGER update_module_table_updated_at
  BEFORE UPDATE ON public.module_table
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 📊 Auditoria e Compliance {#auditoria}

### Sistema de Auditoria

Todas as ações críticas devem ser registradas na tabela `audit_logs`.

#### Trigger Automático (Recomendado)

```sql
-- Função de log
CREATE OR REPLACE FUNCTION public.log_module_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    clinic_id,
    user_id,
    action,
    details
  )
  VALUES (
    NEW.clinic_id,
    auth.uid(),
    TG_OP || '_MODULE_RECORD', -- INSERT_MODULE_RECORD, UPDATE_MODULE_RECORD, etc.
    jsonb_build_object(
      'record_id', NEW.id,
      'timestamp', now(),
      'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
      'new_data', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER log_module_changes_trigger
  AFTER INSERT OR UPDATE ON public.module_table
  FOR EACH ROW
  EXECUTE FUNCTION public.log_module_changes();
```

#### Log Manual (Alternativa)

```tsx
// Em componentes/hooks
import { supabase } from '@/integrations/supabase/client';

async function logAction(action: string, details: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id')
    .eq('id', user?.id)
    .single();

  await supabase.from('audit_logs').insert({
    clinic_id: profile?.clinic_id,
    user_id: user?.id,
    action,
    details,
  });
}

// Uso
await logAction('FEATURE_ACTIVATED', {
  feature: 'nome_da_feature',
  timestamp: new Date().toISOString(),
});
```

---

## ✅ Checklist de Validação {#checklist}

Use este checklist para validar a implementação do módulo:

### 1. Estrutura de Arquivos
- [ ] Página principal criada em `src/pages/[ModuleName].tsx`
- [ ] Componentes modulares em `src/modules/[module-name]/components/`
- [ ] Hooks personalizados em `src/modules/[module-name]/hooks/`
- [ ] Types definidos em `src/modules/[module-name]/types/`

### 2. Roteamento
- [ ] Rota adicionada em `App.tsx`
- [ ] Rota protegida com `<ProtectedRoute>`
- [ ] Lazy loading implementado (se página pesada)
- [ ] Redirecionamento para `/auth` funciona se não autenticado

### 3. Integração com Sidebar
- [ ] Link adicionado em `sidebar.config.ts`
- [ ] `moduleKey` configurado corretamente
- [ ] Link aparece apenas quando módulo ativo
- [ ] Link desaparece quando módulo inativo
- [ ] Grupo vazio não renderiza (se todos os links ocultos)

### 4. Proteção de Acesso (RLS)
- [ ] Tabelas criadas com campo `clinic_id`
- [ ] RLS habilitado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Policy SELECT criada (visualizar própria clínica)
- [ ] Policy INSERT criada (criar para própria clínica)
- [ ] Policy UPDATE criada (atualizar própria clínica)
- [ ] Policy DELETE criada (excluir própria clínica)
- [ ] Função `get_user_clinic_id(auth.uid())` utilizada

### 5. Auditoria
- [ ] Trigger de auditoria criado OU
- [ ] Log manual implementado nos componentes
- [ ] Ações críticas registradas (CREATE, UPDATE, DELETE)
- [ ] Detalhes suficientes para compliance LGPD

### 6. UX/UI
- [ ] Loading states implementados
- [ ] Error handling com toast notifications
- [ ] Confirmações para ações destrutivas
- [ ] Responsividade (mobile/desktop)
- [ ] Feedback visual (loading spinners, success messages)
- [ ] Empty states (quando sem dados)

### 7. TypeScript
- [ ] Types definidos para entidades
- [ ] Props tipados em componentes
- [ ] Hooks retornam tipos corretos
- [ ] Sem uso de `any` (exceto casos extremos)

### 8. Testes (Opcional)
- [ ] Testes unitários para hooks
- [ ] Testes de integração para componentes
- [ ] Testes E2E para fluxos críticos (Playwright)

### 9. Documentação
- [ ] README do módulo criado (opcional)
- [ ] Comentários em código complexo
- [ ] Exemplos de uso documentados

### 10. Performance
- [ ] Queries otimizadas (seleciona apenas campos necessários)
- [ ] Lazy loading de componentes pesados
- [ ] Debounce em inputs de busca
- [ ] Cache de dados quando apropriado

---

## 📚 Exemplos de Código Completos

### Exemplo 1: Página Simples com CRUD

```tsx
// src/pages/MyModule.tsx
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import { MyModuleForm } from '@/modules/my-module/components/MyModuleForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export default function MyModule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('my_module_table')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu Módulo"
        subtitle="Gerencie os dados do módulo"
      />

      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Registro</DialogTitle>
            </DialogHeader>
            <MyModuleForm
              onSuccess={() => {
                setDialogOpen(false);
                fetchData();
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data}
        loading={loading}
        columns={[
          { header: 'Nome', accessorKey: 'name' },
          { header: 'Data', accessorKey: 'created_at' },
        ]}
      />
    </div>
  );
}
```

---

## 🎯 Padrões de Nomenclatura

### Arquivos

- **Páginas:** `[ModuleName].tsx` (PascalCase) - Ex: `PEP.tsx`, `Financeiro.tsx`
- **Componentes:** `[FeatureName].tsx` (PascalCase) - Ex: `HistoricoForm.tsx`
- **Hooks:** `use[FeatureName].ts` (camelCase) - Ex: `useOdontograma.ts`
- **Types:** `[module].types.ts` (lowercase) - Ex: `pep.types.ts`
- **Utils:** `[module].utils.ts` (lowercase) - Ex: `pep.utils.ts`

### Variáveis

- **Componentes:** `PascalCase` - Ex: `MyComponent`
- **Funções:** `camelCase` - Ex: `fetchData()`, `handleSubmit()`
- **Constantes:** `UPPER_SNAKE_CASE` - Ex: `MAX_FILE_SIZE`
- **Types/Interfaces:** `PascalCase` - Ex: `UserData`, `FormValues`

### Database

- **Tabelas:** `snake_case` (plural) - Ex: `pep_tratamentos`, `module_catalog`
- **Colunas:** `snake_case` - Ex: `clinic_id`, `created_at`
- **Functions:** `snake_case` - Ex: `get_user_clinic_id()`
- **Triggers:** `snake_case` - Ex: `log_module_changes_trigger`

---

## 🚀 Próximos Passos

Após implementar um novo módulo seguindo este Golden Pattern:

1. **Validar Checklist:** Certifique-se de que todos os itens estão ✅
2. **Testar Integração:** Ative/desative o módulo e verifique renderização
3. **Testar Segurança:** Valide RLS policies com diferentes usuários/clínicas
4. **Documentar Diferenças:** Se houver desvios do padrão, documente o motivo
5. **Atualizar Golden Pattern:** Se descobrir melhorias, atualize este documento

---

## 📞 Suporte

Para dúvidas sobre implementação de módulos:
- Consulte documentação de fases: `FASE-1-STATUS.md`, `FASE-2-STATUS.md`, `FASE-3-STATUS.md`
- Revise o código do módulo PEP: `src/pages/PEP.tsx` e `src/modules/pep/`

---

**Última Revisão:** 14/11/2025  
**Versão do Pattern:** 1.0  
**Módulo de Referência:** PEP (Prontuário Eletrônico do Paciente)
