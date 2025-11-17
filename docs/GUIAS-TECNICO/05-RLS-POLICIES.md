# Guia Técnico: Row Level Security (RLS) Policies

**Audiência:** Desenvolvedores, DevOps  
**Nível:** Avançado  
**Versão:** 4.0.0

---

## Visão Geral

O Ortho+ implementa **Row Level Security (RLS)** em 100% das tabelas do PostgreSQL para garantir isolamento completo de dados entre clínicas (multi-tenancy) e controle de acesso granular baseado em roles.

---

## Conceitos Fundamentais

### O que é RLS?

Row Level Security é um recurso nativo do PostgreSQL que permite definir políticas de acesso a nível de **linha** ao invés de apenas tabela.

**Sem RLS:**
```sql
-- Usuário vê TODAS as linhas da tabela
SELECT * FROM pacientes;
-- Retorna: Pacientes de TODAS as clínicas ❌
```

**Com RLS:**
```sql
-- Usuário vê APENAS linhas da sua clínica
SELECT * FROM pacientes;
-- Retorna: Apenas pacientes da clinic_id do token JWT ✅
```

---

## Arquitetura de RLS no Ortho+

### Hierarquia de Acesso

```
┌─────────────────────────────────────┐
│   JWT Token (Supabase Auth)         │
│   - user_id                          │
│   - clinic_id (custom claim)        │
│   - app_role (ADMIN | MEMBER)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   RLS Policy Evaluation              │
│   - Verifica clinic_id               │
│   - Verifica app_role                │
│   - Verifica permissões granulares   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Acesso aos Dados                   │
│   - Apenas dados autorizados         │
│   - Isolamento multi-tenant          │
└─────────────────────────────────────┘
```

---

## Estrutura de Tabelas e Policies

### Tabelas Core com RLS

Todas as tabelas críticas possuem coluna `clinic_id`:

```sql
-- Exemplo: Tabela de Pacientes
CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  nome TEXT NOT NULL,
  cpf TEXT,
  -- ... outros campos
);

-- Habilitar RLS
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
```

---

## Políticas RLS por Caso de Uso

### 1. Isolamento por Clínica (Multi-Tenancy)

**Policy mais comum: Acesso apenas à própria clínica**

```sql
CREATE POLICY "Usuários veem apenas dados da própria clínica"
ON public.pacientes
FOR SELECT
USING (
  clinic_id = (
    SELECT clinic_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);
```

**Como funciona:**
1. `auth.uid()` retorna o ID do usuário logado (do token JWT)
2. Busca `clinic_id` do usuário na tabela `profiles`
3. Filtra apenas linhas onde `pacientes.clinic_id` = `clinic_id` do usuário

---

### 2. Controle de Acesso por Role

**ADMIN pode tudo, MEMBER apenas leitura:**

```sql
-- Policy para SELECT (ADMIN e MEMBER)
CREATE POLICY "Todos podem visualizar dados da clínica"
ON public.pacientes
FOR SELECT
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
);

-- Policy para INSERT (apenas ADMIN)
CREATE POLICY "Apenas ADMIN pode criar pacientes"
ON public.pacientes
FOR INSERT
WITH CHECK (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'ADMIN'
  )
);

-- Policy para UPDATE (apenas ADMIN)
CREATE POLICY "Apenas ADMIN pode editar pacientes"
ON public.pacientes
FOR UPDATE
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'ADMIN'
  )
);

-- Policy para DELETE (apenas ADMIN)
CREATE POLICY "Apenas ADMIN pode deletar pacientes"
ON public.pacientes
FOR DELETE
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'ADMIN'
  )
);
```

---

### 3. Permissões Granulares por Módulo

**MEMBER só acessa se tiver permissão específica:**

```sql
CREATE POLICY "MEMBER acessa PEP se tiver permissão"
ON public.prontuarios
FOR SELECT
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND
  (
    -- ADMIN sempre tem acesso
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
    OR
    -- MEMBER precisa ter permissão específica
    EXISTS (
      SELECT 1 FROM public.user_module_permissions
      WHERE user_id = auth.uid()
      AND module_key = 'PEP'
      AND has_access = true
    )
  )
);
```

---

### 4. Acesso ao Próprio Perfil

**Usuário pode editar apenas seu próprio perfil:**

```sql
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Usuários podem editar seu próprio perfil"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());
```

---

### 5. Dados Públicos (Sem Restrição)

**Tabelas de referência acessíveis a todos:**

```sql
-- Catálogo de módulos é público
CREATE POLICY "Catálogo de módulos é público"
ON public.module_catalog
FOR SELECT
USING (true);

-- Usuários autenticados podem ler
CREATE POLICY "Usuários autenticados veem catálogo"
ON public.module_catalog
FOR SELECT
TO authenticated
USING (true);
```

---

## Security Definer Functions

### Problema: Infinite Recursion

**❌ ERRADO:**
```sql
CREATE POLICY "Check role" ON profiles
USING (
  -- Causa recursão infinita! ⚠️
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
);
```

**✅ CORRETO:**
```sql
-- 1. Criar função SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  );
$$;

-- 2. Usar na policy
CREATE POLICY "Apenas ADMIN pode gerenciar módulos"
ON public.clinic_modules
FOR ALL
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND public.has_role(auth.uid(), 'ADMIN')
);
```

**Vantagens:**
- Evita recursão infinita
- Performance otimizada (função cacheável)
- Reutilizável em múltiplas policies

---

## Funções Helper Comuns

### 1. Obter Clinic ID do Usuário

```sql
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id
  FROM public.profiles
  WHERE id = _user_id;
$$;
```

### 2. Verificar Permissão de Módulo

```sql
CREATE OR REPLACE FUNCTION public.has_module_access(
  _user_id UUID,
  _module_key TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- ADMIN sempre tem acesso
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'ADMIN'
  ) OR EXISTS (
    -- MEMBER precisa ter permissão
    SELECT 1 FROM public.user_module_permissions
    WHERE user_id = _user_id
    AND module_key = _module_key
    AND has_access = true
  );
$$;
```

### 3. Verificar se Usuário É Dono do Recurso

```sql
CREATE OR REPLACE FUNCTION public.is_owner(
  _user_id UUID,
  _resource_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = _resource_user_id;
$$;
```

---

## Boas Práticas

### ✅ DO's

1. **Sempre habilite RLS em tabelas de dados:**
   ```sql
   ALTER TABLE public.minha_tabela ENABLE ROW LEVEL SECURITY;
   ```

2. **Use SECURITY DEFINER functions para lógica complexa:**
   - Evita recursão
   - Melhora performance
   - Facilita manutenção

3. **Teste policies com múltiplos roles:**
   ```sql
   -- Teste como ADMIN
   SET LOCAL role TO authenticated;
   SET LOCAL request.jwt.claims TO '{"sub": "admin-user-id"}';
   SELECT * FROM pacientes; -- Deve ver tudo

   -- Teste como MEMBER
   SET LOCAL request.jwt.claims TO '{"sub": "member-user-id"}';
   SELECT * FROM pacientes; -- Deve ver apenas da clínica
   ```

4. **Documente policies complexas:**
   ```sql
   COMMENT ON POLICY "Complex policy" ON table_name IS
   'Esta policy permite X quando Y, exceto Z. Ver ADR-123.';
   ```

5. **Use `WITH CHECK` para INSERT/UPDATE:**
   ```sql
   CREATE POLICY "Insert apenas na própria clínica"
   ON pacientes
   FOR INSERT
   WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));
   ```

---

### ❌ DON'Ts

1. **Não desabilite RLS em produção:**
   ```sql
   ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY; -- ❌ NUNCA!
   ```

2. **Não use subqueries diretas em policies (causa recursão):**
   ```sql
   -- ❌ ERRADO
   USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
   
   -- ✅ CERTO
   USING (has_role(auth.uid(), 'ADMIN'))
   ```

3. **Não confie apenas em lógica frontend:**
   ```sql
   -- ❌ Frontend: if (user.role === 'ADMIN') showButton();
   -- ✅ Backend: RLS policy bloqueia mesmo se frontend falhar
   ```

4. **Não exponha `auth.users` diretamente:**
   - Sempre use `profiles` table no `public` schema
   - `auth.users` não pode ser consultado via RLS

---

## Debugging de RLS

### 1. Verificar se RLS Está Ativo

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### 2. Listar Policies de uma Tabela

```sql
SELECT *
FROM pg_policies
WHERE tablename = 'pacientes';
```

### 3. Explicar Query com RLS

```sql
EXPLAIN (ANALYZE, VERBOSE, BUFFERS)
SELECT * FROM pacientes WHERE clinic_id = 'xxx';
```

Procure por:
- `Filter: (clinic_id = ...)`
- Tempo de execução da policy

### 4. Testar Policy Manualmente

```sql
-- Simular usuário específico
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid-aqui"}';

-- Executar query
SELECT * FROM pacientes;

-- Resetar
RESET role;
RESET request.jwt.claims;
```

---

## Casos de Uso Avançados

### 1. Acesso Temporário (Time-Based)

```sql
CREATE POLICY "Acesso temporário a dados arquivados"
ON public.pacientes_arquivados
FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid())
  AND (
    has_role(auth.uid(), 'ADMIN')
    OR
    -- Acesso expira em 30 dias
    archived_at > (NOW() - INTERVAL '30 days')
  )
);
```

### 2. Compartilhamento Entre Clínicas

```sql
CREATE POLICY "Acesso compartilhado entre clínicas parceiras"
ON public.pacientes
FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid())
  OR
  -- Permite acesso se clínicas são parceiras
  EXISTS (
    SELECT 1 FROM public.clinic_partnerships
    WHERE (clinic_a_id = clinic_id AND clinic_b_id = get_user_clinic_id(auth.uid()))
    OR (clinic_b_id = clinic_id AND clinic_a_id = get_user_clinic_id(auth.uid()))
  )
);
```

### 3. Logs de Auditoria (Append-Only)

```sql
CREATE POLICY "Todos podem inserir logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  clinic_id = get_user_clinic_id(auth.uid())
  AND user_id = auth.uid()
);

CREATE POLICY "Apenas ADMIN pode ler logs"
ON public.audit_logs
FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid())
  AND has_role(auth.uid(), 'ADMIN')
);

-- Ninguém pode UPDATE ou DELETE
-- (policies omitidas = negado por padrão)
```

---

## Performance de RLS

### Indexação Crítica

**Sempre crie índice em `clinic_id`:**
```sql
CREATE INDEX idx_pacientes_clinic_id ON public.pacientes(clinic_id);
CREATE INDEX idx_prontuarios_clinic_id ON public.prontuarios(clinic_id);
```

### Otimização de Functions

**Use `STABLE` ou `IMMUTABLE` quando possível:**
```sql
-- STABLE: Resultado não muda durante transação
CREATE FUNCTION get_user_clinic_id() ... STABLE;

-- IMMUTABLE: Resultado sempre igual (para inputs iguais)
CREATE FUNCTION hash_cpf() ... IMMUTABLE;
```

### Monitoramento

```sql
-- Queries lentas causadas por RLS
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%clinic_id%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Checklist de Segurança

- [ ] Todas as tabelas têm RLS habilitado
- [ ] Policies cobrem SELECT, INSERT, UPDATE, DELETE
- [ ] Functions helper usam `SECURITY DEFINER` + `SET search_path`
- [ ] Índices criados em colunas usadas em policies (`clinic_id`)
- [ ] Policies testadas com ADMIN e MEMBER
- [ ] Documentação atualizada para policies complexas
- [ ] Logs de auditoria registram tentativas de acesso negado

---

## Referências

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [ADR-001: Multi-Tenancy Architecture](../architecture/decisions/ADR-001-multi-tenancy.md)

---

**Próximos Passos:**
- [Guia: Autenticação e JWT](04-AUTENTICACAO-RLS.md)
- [Guia: Edge Functions Security](03-EDGE-FUNCTIONS.md)
- [Tutorial: Como Auditar RLS](../TUTORIAIS/07-AUDITORIA-RLS.md)
