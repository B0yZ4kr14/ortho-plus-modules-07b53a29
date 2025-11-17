# Referência de API: Tabelas Supabase

**Audiência:** Desenvolvedores  
**Versão:** 4.0.0

---

## Visão Geral

Esta documentação descreve todas as tabelas do banco de dados PostgreSQL do Ortho+ hospedado no Supabase, incluindo estrutura, RLS policies, índices e relacionamentos.

---

## Tabelas Core

### `clinics`

**Descrição:** Tabela de tenants (clínicas)

**Estrutura:**
```sql
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Usuários veem apenas sua própria clínica

**Índices:**
- `idx_clinics_cnpj` ON (cnpj)

---

### `profiles`

**Descrição:** Extensão de `auth.users` com dados adicionais

**Estrutura:**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  clinic_id UUID REFERENCES public.clinics(id),
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Usuários podem ver/editar apenas seu próprio perfil

**Relacionamentos:**
- `clinic_id` → `clinics.id`
- `id` → `auth.users.id`

---

### `user_roles`

**Descrição:** Roles de usuários (RBAC)

**Estrutura:**
```sql
CREATE TABLE public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MEMBER')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);
```

**RLS Policies:**
- Apenas ADMIN pode gerenciar roles

**Valores permitidos:**
- `ADMIN`: Administrador (acesso total)
- `MEMBER`: Membro (acesso conforme permissões)

---

### `user_module_permissions`

**Descrição:** Permissões granulares por módulo

**Estrutura:**
```sql
CREATE TABLE public.user_module_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  module_key TEXT NOT NULL,
  has_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_key)
);
```

**RLS Policies:**
- ADMIN pode gerenciar permissões de sua clínica

---

## Módulos

### `module_catalog`

**Descrição:** Catálogo mestre de módulos disponíveis

**Estrutura:**
```sql
CREATE TABLE public.module_catalog (
  id SERIAL PRIMARY KEY,
  module_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Público (SELECT para usuários autenticados)

**Categorias:**
- `Core`
- `Financeiro`
- `Inovação`
- `Compliance`
- `Configuração`

---

### `clinic_modules`

**Descrição:** Módulos ativos por clínica

**Estrutura:**
```sql
CREATE TABLE public.clinic_modules (
  id SERIAL PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  module_catalog_id INTEGER NOT NULL REFERENCES public.module_catalog(id),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinic_id, module_catalog_id)
);
```

**RLS Policies:**
- Usuários veem apenas módulos de sua clínica
- Apenas ADMIN pode ativar/desativar

**Índices:**
- `idx_clinic_modules_clinic` ON (clinic_id, is_active)

---

### `module_dependencies`

**Descrição:** Grafo de dependências entre módulos

**Estrutura:**
```sql
CREATE TABLE public.module_dependencies (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES public.module_catalog(id),
  depends_on_module_id INTEGER NOT NULL REFERENCES public.module_catalog(id),
  UNIQUE(module_id, depends_on_module_id)
);
```

**RLS Policies:**
- Público (SELECT)

**Exemplo:**
```sql
-- NFe depende de FINANCEIRO
INSERT INTO module_dependencies (module_id, depends_on_module_id)
VALUES (
  (SELECT id FROM module_catalog WHERE module_key = 'NFE'),
  (SELECT id FROM module_catalog WHERE module_key = 'FINANCEIRO')
);
```

---

## Pacientes

### `pacientes`

**Descrição:** Cadastro de pacientes

**Estrutura:**
```sql
CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  nome TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Usuários veem apenas pacientes de sua clínica
- ADMIN pode CRUD completo
- MEMBER pode SELECT (se tiver permissão)

**Índices:**
- `idx_pacientes_clinic` ON (clinic_id)
- `idx_pacientes_cpf` ON (cpf)
- `idx_pacientes_nome` ON (nome) USING gin(to_tsvector('portuguese', nome))

---

### `prontuarios`

**Descrição:** Prontuário Eletrônico do Paciente (PEP)

**Estrutura:**
```sql
CREATE TABLE public.prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  dentist_id UUID REFERENCES auth.users(id),
  data_consulta TIMESTAMPTZ NOT NULL,
  anamnese TEXT,
  historico_clinico TEXT,
  diagnostico TEXT,
  plano_tratamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Apenas usuários com permissão 'PEP' podem acessar

**Índices:**
- `idx_prontuarios_clinic_paciente` ON (clinic_id, paciente_id)
- `idx_prontuarios_data` ON (data_consulta DESC)

---

## Financeiro

### `contas_receber`

**Descrição:** Contas a receber de pacientes

**Estrutura:**
```sql
CREATE TABLE public.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  paciente_id UUID REFERENCES public.pacientes(id),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  status TEXT CHECK (status IN ('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA')),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Acesso apenas com permissão 'FINANCEIRO'

**Índices:**
- `idx_contas_receber_clinic_status` ON (clinic_id, status)
- `idx_contas_receber_vencimento` ON (data_vencimento)

---

### `contas_pagar`

**Descrição:** Contas a pagar a fornecedores

**Estrutura:**
```sql
CREATE TABLE public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  fornecedor TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT CHECK (status IN ('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA')),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Acesso apenas com permissão 'FINANCEIRO'

---

### `split_pagamentos`

**Descrição:** Divisão de pagamentos entre profissionais

**Estrutura:**
```sql
CREATE TABLE public.split_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  conta_receber_id UUID REFERENCES public.contas_receber(id),
  profissional_id UUID REFERENCES auth.users(id),
  percentual DECIMAL(5,2) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'PENDENTE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Estoque

### `produtos`

**Descrição:** Cadastro de produtos

**Estrutura:**
```sql
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  nome TEXT NOT NULL,
  codigo_sku TEXT,
  codigo_barras TEXT,
  categoria TEXT,
  subcategoria TEXT,
  unidade_medida TEXT,
  quantidade_atual INTEGER DEFAULT 0,
  quantidade_minima INTEGER,
  quantidade_maxima INTEGER,
  custo_unitario DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  localizacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Acesso apenas com permissão 'ESTOQUE'

**Índices:**
- `idx_produtos_clinic_categoria` ON (clinic_id, categoria)
- `idx_produtos_codigo_barras` ON (codigo_barras)

---

### `estoque_movimentacoes`

**Descrição:** Movimentações de estoque (entradas/saídas)

**Estrutura:**
```sql
CREATE TABLE public.estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  tipo TEXT CHECK (tipo IN ('ENTRADA', 'SAIDA', 'AJUSTE')),
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_estoque_mov_clinic_produto` ON (clinic_id, produto_id, created_at DESC)

---

### `inventarios`

**Descrição:** Inventários físicos periódicos

**Estrutura:**
```sql
CREATE TABLE public.inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  responsavel_id UUID REFERENCES auth.users(id),
  tipo TEXT CHECK (tipo IN ('COMPLETO', 'PARCIAL')),
  status TEXT CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `inventario_itens`

**Descrição:** Itens contados em cada inventário

**Estrutura:**
```sql
CREATE TABLE public.inventario_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventario_id UUID NOT NULL REFERENCES public.inventarios(id),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  quantidade_sistema INTEGER NOT NULL,
  quantidade_fisica INTEGER,
  divergencia INTEGER GENERATED ALWAYS AS (quantidade_fisica - quantidade_sistema) STORED,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Colunas Computadas:**
- `divergencia`: Calculada automaticamente (física - sistema)

---

## Agenda

### `appointments`

**Descrição:** Agendamentos de consultas

**Estrutura:**
```sql
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  dentist_id UUID NOT NULL REFERENCES auth.users(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'CANCELADO')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Acesso apenas com permissão 'AGENDA'

**Índices:**
- `idx_appointments_clinic_date` ON (clinic_id, start_datetime)
- `idx_appointments_dentist` ON (dentist_id, start_datetime)

---

### `blocked_times`

**Descrição:** Horários bloqueados (férias, folgas)

**Estrutura:**
```sql
CREATE TABLE public.blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  dentist_id UUID NOT NULL REFERENCES auth.users(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Auditoria

### `audit_logs`

**Descrição:** Logs de auditoria (LGPD)

**Estrutura:**
```sql
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Apenas ADMIN pode ler logs

**Índices:**
- `idx_audit_logs_clinic_created` ON (clinic_id, created_at DESC)
- `idx_audit_logs_user` ON (user_id, created_at DESC)

**Exemplo de Uso:**
```typescript
await supabase.from('audit_logs').insert({
  clinic_id: user.clinic_id,
  user_id: user.id,
  action: 'DELETE_PATIENT',
  target_table: 'pacientes',
  target_id: patientId,
  old_data: { nome: 'João Silva', cpf: '12345678900' },
  ip_address: req.headers['x-forwarded-for'],
  user_agent: req.headers['user-agent']
});
```

---

## Backups

### `scheduled_exports`

**Descrição:** Agendamentos de backups automáticos

**Estrutura:**
```sql
CREATE TABLE public.scheduled_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  name TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('DIARIO', 'SEMANAL', 'MENSAL')),
  backup_type TEXT CHECK (backup_type IN ('FULL', 'INCREMENTAL', 'DIFERENCIAL')),
  destination TEXT CHECK (destination IN ('LOCAL', 'S3', 'GOOGLE_DRIVE', 'DROPBOX')),
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `backup_history`

**Descrição:** Histórico de backups executados

**Estrutura:**
```sql
CREATE TABLE public.backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  scheduled_export_id UUID REFERENCES public.scheduled_exports(id),
  backup_type TEXT NOT NULL,
  file_size BIGINT,
  file_path TEXT,
  checksum TEXT,
  status TEXT CHECK (status IN ('SUCCESS', 'FAILED')),
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Triggers

### `update_updated_at`

**Descrição:** Atualiza automaticamente `updated_at`

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas as tabelas com updated_at
CREATE TRIGGER update_pacientes_updated_at
BEFORE UPDATE ON public.pacientes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### `activate_all_modules_for_new_clinic`

**Descrição:** Ativa todos os módulos automaticamente para novas clínicas

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION activate_all_modules_for_new_clinic()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
  SELECT NEW.id, id, true
  FROM public.module_catalog;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_clinic_created
AFTER INSERT ON public.clinics
FOR EACH ROW
EXECUTE FUNCTION activate_all_modules_for_new_clinic();
```

---

## Funções Helper

### `get_user_clinic_id()`

```sql
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.profiles WHERE id = _user_id;
$$;
```

### `has_role()`

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
```

### `has_module_access()`

```sql
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id UUID, _module_key TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(_user_id, 'ADMIN')
  OR EXISTS (
    SELECT 1 FROM public.user_module_permissions
    WHERE user_id = _user_id
    AND module_key = _module_key
    AND has_access = true
  );
$$;
```

---

## Boas Práticas

### Queries Performáticas

```typescript
// ✅ CORRETO: Usa índice clinic_id
const { data } = await supabase
  .from('pacientes')
  .select('*')
  .eq('clinic_id', user.clinic_id)
  .order('created_at', { ascending: false })
  .limit(50);

// ❌ ERRADO: Full table scan
const { data } = await supabase
  .from('pacientes')
  .select('*')
  .ilike('nome', '%silva%'); // Sem índice GIN
```

### Transações

```typescript
// Usar Edge Function para transações complexas
const { data, error } = await supabase.functions.invoke('create-patient-with-pep', {
  body: {
    paciente: { nome: 'João', cpf: '123' },
    prontuario: { anamnese: '...' }
  }
});
```

### Real-time Subscriptions

```typescript
// Habilitar realtime na tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

// Subscrever no frontend
const channel = supabase
  .channel('appointments')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'appointments',
      filter: `clinic_id=eq.${user.clinic_id}`
    },
    (payload) => {
      console.log('Novo agendamento:', payload.new);
    }
  )
  .subscribe();
```

---

## Referências

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Guia Técnico: RLS Policies](../GUIAS-TECNICO/05-RLS-POLICIES.md)

---

**Última atualização:** 2025-11-17
