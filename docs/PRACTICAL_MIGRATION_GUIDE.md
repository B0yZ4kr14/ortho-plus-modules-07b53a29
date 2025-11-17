# 🔧 Guia Prático de Migração - Componentes Reais

## 📊 Componentes Identificados para Migração

### Módulo Pacientes (3 componentes)

1. **`src/pages/Pacientes.tsx`**
   - Uso: Query direta do Supabase (`useQuery` + `supabase.from()`)
   - Complexidade: Média
   - Prioridade: ⭐⭐⭐ ALTA

2. **`src/components/shared/PatientSelector.tsx`**
   - Uso: `usePatientsSupabase()`
   - Complexidade: Baixa
   - Prioridade: ⭐⭐ MÉDIA

3. **`src/pages/AgendaClinica.tsx`**
   - Uso: `usePatientsSupabase()` 
   - Complexidade: Baixa
   - Prioridade: ⭐⭐ MÉDIA

---

## 🎯 Estratégia de Migração

### Fase 1: Pacientes.tsx (Query Direta)

#### ANTES (Query direta ao Supabase):

```typescript
// src/pages/Pacientes.tsx - ANTES
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Pacientes() {
  const { clinicId } = useAuth();
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['patients', clinicId],
    queryFn: async () => {
      const query = supabase
        .from('patients' as any)
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Patient[];
    },
    enabled: !!clinicId
  });

  // ... resto do componente
}
```

#### DEPOIS (Hook Unificado):

```typescript
// src/pages/Pacientes.tsx - DEPOIS
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';

export default function Pacientes() {
  // ✅ Hook unificado substitui query direta
  const { patients, loading: isLoading } = usePatients();

  // ✅ Resto do código permanece IDÊNTICO
  const filteredPatients = patients?.filter(patient => {
    // ... mesma lógica de filtro
  });

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div>
      {/* ... mesma UI */}
    </div>
  );
}
```

**Mudanças:**
1. ✅ Remover imports: `useQuery`, `supabase`
2. ✅ Adicionar import: `usePatients`
3. ✅ Substituir `useQuery` por `usePatients()`
4. ✅ Ajustar: `isLoading` → `loading` (ou criar alias)
5. ✅ ZERO mudanças no JSX/UI

---

### Fase 2: PatientSelector.tsx (Hook Supabase)

#### ANTES:

```typescript
// src/components/shared/PatientSelector.tsx - ANTES
import { usePatientsSupabase } from '@/modules/pacientes/hooks/usePatientsSupabase';

export function PatientSelector({ onSelect, selectedPatient }: Props) {
  const { patients, loading } = usePatientsSupabase();
  
  // ... resto do componente
}
```

#### DEPOIS:

```typescript
// src/components/shared/PatientSelector.tsx - DEPOIS
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';

export function PatientSelector({ onSelect, selectedPatient }: Props) {
  // ✅ Hook unificado substitui hook Supabase
  const { patients, loading } = usePatients();
  
  // ✅ Resto do código permanece IDÊNTICO
}
```

**Mudanças:**
1. ✅ Trocar import: `usePatientsSupabase` → `usePatients`
2. ✅ ZERO mudanças no restante do código

---

### Fase 3: AgendaClinica.tsx (Hook Supabase)

#### ANTES:

```typescript
// src/pages/AgendaClinica.tsx - ANTES
import { usePatientsSupabase } from '@/modules/pacientes/hooks/usePatientsSupabase';

export default function AgendaClinica() {
  const { patients } = usePatientsSupabase();
  
  // ... resto do componente
}
```

#### DEPOIS:

```typescript
// src/pages/AgendaClinica.tsx - DEPOIS
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';

export default function AgendaClinica() {
  // ✅ Hook unificado substitui hook Supabase
  const { patients } = usePatients();
  
  // ✅ Resto do código permanece IDÊNTICO
}
```

---

## 📋 Checklist de Migração por Componente

### ✅ PatientSelector.tsx

- [ ] **Backup**: Commit atual antes de começar
- [ ] **Import**: Trocar `usePatientsSupabase` → `usePatients`
- [ ] **Teste Supabase**: Verificar funcionamento com `source="supabase"`
- [ ] **Teste REST API**: Verificar com `source="rest-api"`
- [ ] **Validação**: Interface idêntica, sem erros
- [ ] **Commit**: "feat: migrate PatientSelector to unified hook"

### ✅ AgendaClinica.tsx

- [ ] **Backup**: Commit atual
- [ ] **Import**: Trocar `usePatientsSupabase` → `usePatients`
- [ ] **Teste Supabase**: Funcionamento com `source="supabase"`
- [ ] **Teste REST API**: Funcionamento com `source="rest-api"`
- [ ] **Validação**: Agenda carrega pacientes corretamente
- [ ] **Commit**: "feat: migrate AgendaClinica to unified hook"

### ✅ Pacientes.tsx (Principal)

- [ ] **Backup**: Commit atual
- [ ] **Remover**: Imports `useQuery` e `supabase`
- [ ] **Adicionar**: Import `usePatients`
- [ ] **Substituir**: `useQuery` → `usePatients()`
- [ ] **Ajustar**: `isLoading` → `loading`
- [ ] **Teste Supabase**: Listagem, filtros, stats funcionam
- [ ] **Teste REST API**: Mesma funcionalidade
- [ ] **Validação**: UI idêntica, performance igual/melhor
- [ ] **Commit**: "feat: migrate Pacientes page to unified hook"

---

## 🧪 Processo de Teste

### 1. Teste Local com Supabase

```bash
# Garantir que sistema funciona com Supabase
# src/main.tsx → const DATA_SOURCE = 'supabase';

npm run dev

# Testar:
# ✅ Listagem de pacientes carrega
# ✅ Busca funciona
# ✅ Filtros funcionam
# ✅ Stats calculam corretamente
# ✅ PatientSelector carrega pacientes
# ✅ Agenda carrega pacientes
```

### 2. Teste Local com REST API

```bash
# Terminal 1: Iniciar backend
cd backend
npm run dev

# Terminal 2: Frontend com REST API
# src/main.tsx → const DATA_SOURCE = 'rest-api';
npm run dev

# Testar mesmas funcionalidades:
# ✅ Listagem de pacientes carrega (via API)
# ✅ Busca funciona
# ✅ Filtros funcionam
# ✅ Stats calculam corretamente
# ✅ PatientSelector carrega pacientes
# ✅ Agenda carrega pacientes
```

### 3. Testes E2E

```bash
# Executar suite E2E
npm run test:e2e -- e2e/pacientes.spec.ts

# Verificar:
# ✅ Todos os testes passam
# ✅ Sem falhas intermitentes
# ✅ Performance aceitável
```

---

## 🚨 Troubleshooting

### Problema: "patients is undefined"

**Causa**: Hook ainda carregando ou erro na API

**Solução**:
```typescript
// Verificar loading state
const { patients, loading } = usePatients();

if (loading) return <LoadingSpinner />;
if (!patients) return <ErrorState />;

// Usar optional chaining
patients?.map(...)
```

### Problema: Filtros não funcionam

**Causa**: Estrutura de dados diferente (API vs Supabase)

**Solução**: Verificar adapter está convertendo corretamente
```typescript
// PatientAdapter deve mapear:
// API: { nome, cpf, telefone }
// Frontend: { full_name, cpf, phone_primary }
```

### Problema: Performance pior

**Causa**: Backend pode estar sem otimização

**Solução**: Verificar:
1. Backend tem índices no PostgreSQL?
2. Cache Redis configurado?
3. Query está eficiente?

---

## 📊 Progresso Esperado

| Componente | Tempo Estimado | Complexidade | Status |
|------------|----------------|--------------|--------|
| **PatientSelector.tsx** | 5 min | ⭐ Baixa | ⏳ Pendente |
| **AgendaClinica.tsx** | 5 min | ⭐ Baixa | ⏳ Pendente |
| **Pacientes.tsx** | 15 min | ⭐⭐ Média | ⏳ Pendente |

**Total Estimado**: ~25 minutos de trabalho

**Resultado**: 3 componentes migrados, sistema 100% funcional com ambas implementações

---

## 🎯 Próximos Módulos (Após Pacientes)

### Inventário
- `src/pages/estoque/Produtos.tsx`
- Hook: `useInventory` (já criado)
- Complexidade: Média

### Financeiro
- `src/pages/financeiro/Transacoes.tsx`
- `src/pages/financeiro/ContasReceber.tsx`
- Hook: `useTransactions` (já criado)
- Complexidade: Média

### Orçamentos
- `src/pages/Orcamentos.tsx`
- Hook: A criar (`useOrcamentosUnified`)
- Adapter: `OrcamentoAdapter` (já criado)
- Complexidade: Alta

---

## 🎉 Resultado Final

Após migrar estes 3 componentes:

✅ **Módulo Pacientes 100% migrado**  
✅ **Sistema funciona com Supabase E REST API**  
✅ **Rollback instantâneo disponível**  
✅ **Zero downtime durante migração**  
✅ **Base sólida para outros módulos**  

**Progresso Global**: 95% → 98% (infraestrutura + primeiros componentes)

---

**Próximo Passo**: Executar migração dos 3 componentes (25 min de trabalho)
