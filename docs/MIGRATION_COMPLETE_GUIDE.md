# 🎯 Guia Completo de Migração Frontend → REST API

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura da Solução](#arquitetura-da-solução)
3. [Passo a Passo](#passo-a-passo)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## Visão Geral

### O que está sendo migrado?

**ANTES**: Frontend chama Supabase diretamente
```
Frontend → Supabase Client → Supabase Cloud
```

**DEPOIS**: Frontend chama REST API Node.js
```
Frontend → REST API → Backend Services → PostgreSQL
```

### Por que migrar?

✅ **Controle Total**: Lógica de negócio no backend  
✅ **Performance**: Cache, otimizações, batching  
✅ **Segurança**: Validações server-side, rate limiting  
✅ **Testabilidade**: Testes de integração completos  
✅ **Escalabilidade**: Arquitetura preparada para crescimento  
✅ **Portabilidade**: Menos acoplamento a provedor específico  

### Estratégia: Migração Sem Downtime

❌ **NÃO**: Big Bang (trocar tudo de uma vez)  
✅ **SIM**: Incremental (módulo por módulo)  

**Resultado**: Sistema 100% funcional durante toda a migração

---

## Arquitetura da Solução

### 1. DataSourceProvider

Provider React que controla qual implementação usar:

```typescript
<DataSourceProvider source="supabase"> {/* ou "rest-api" */}
  <App />
</DataSourceProvider>
```

**Benefícios:**
- Troca global instantânea
- Rollback imediato se necessário
- Testes A/B fáceis

### 2. Hooks Unificados

Cada módulo tem um hook que delega para implementação correta:

```typescript
// usePatientsUnified.ts
export function usePatientsUnified() {
  const { useRESTAPI } = useDataSource();
  
  // Delega automaticamente
  return useRESTAPI 
    ? usePatientsAPI()      // → REST API Node.js
    : usePatientsSupabase(); // → Supabase direto
}
```

### 3. Data Adapters (DTOs)

Convertem dados entre formatos:

```typescript
// API retorna: { nome, dataNascimento, telefone }
const apiData = await fetch('/api/pacientes');

// Frontend espera: { full_name, birth_date, phone_primary }
const frontendData = PatientAdapter.toFrontend(apiData);
```

---

## Passo a Passo

### Fase 1: Setup Inicial (✅ COMPLETO)

1. ✅ Backend Node.js rodando
2. ✅ Endpoints REST implementados
3. ✅ DataSourceProvider criado
4. ✅ Hooks unificados criados
5. ✅ Adapters (DTOs) criados

### Fase 2: Migração de Componentes (🔄 ATUAL)

#### Passo 1: Escolher Módulo

Começar por módulos mais simples:
1. **Pacientes** (CRUD básico) ← Próximo
2. **Inventário** (CRUD + ajustes)
3. **Financeiro** (CRUD + cálculos)

#### Passo 2: Atualizar Imports

```typescript
// ANTES (chamada direta ao Supabase)
import { usePatientsSupabase } from '@/modules/pacientes/hooks/usePatientsSupabase';
const { patients, loading } = usePatientsSupabase();

// DEPOIS (hook unificado)
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';
const { patients, loading } = usePatients(); // ← Mesma interface!
```

**IMPORTANTE**: Interface é idêntica! Não precisa mudar o código do componente.

#### Passo 3: Testar com Supabase (Validação)

Antes de testar REST API, validar que nada quebrou:

```typescript
// src/main.tsx
<DataSourceProvider source="supabase"> {/* Mantém Supabase */}
  <App />
</DataSourceProvider>
```

✅ Tudo deve funcionar **exatamente** igual antes.

#### Passo 4: Testar com REST API

Agora sim, ativar REST API:

```typescript
// src/main.tsx
<DataSourceProvider source="rest-api"> {/* Usa REST API */}
  <App />
</DataSourceProvider>
```

✅ Componente deve funcionar **igual** mas agora via REST API.

#### Passo 5: Validação E2E

```bash
npm run test:e2e
```

✅ Todos os testes E2E devem passar.

#### Passo 6: Deploy Staging

Deploy em ambiente de staging com REST API ativado.

✅ Monitorar por 24-48h antes de produção.

---

## Exemplos Práticos

### Exemplo 1: Componente Simples (Listagem)

**ANTES** (`Pacientes.tsx` original):
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Pacientes() {
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await supabase
        .from('patients')
        .select('*');
      return data;
    },
  });

  return (
    <div>
      {patients?.map(p => <div key={p.id}>{p.nome}</div>)}
    </div>
  );
}
```

**DEPOIS** (`Pacientes.tsx` migrado):
```typescript
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';

export default function Pacientes() {
  // ✅ Mesmo interface, implementação delegada
  const { patients, loading } = usePatients();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {patients?.map(p => <div key={p.id}>{p.nome}</div>)}
    </div>
  );
}
```

**Mudanças:**
- ✅ 1 linha alterada (import)
- ✅ Interface idêntica
- ✅ Funcionalidade preservada

### Exemplo 2: Componente com Mutações

**ANTES**:
```typescript
const createPatient = async (data) => {
  const { error } = await supabase
    .from('patients')
    .insert([data]);
  if (error) throw error;
};
```

**DEPOIS**:
```typescript
const { addPatient } = usePatients();

// ✅ Mesma interface, implementação delegada
await addPatient(data);
```

### Exemplo 3: Filtros e Buscas

**ANTES**:
```typescript
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('status', 'ativo')
  .ilike('nome', `%${search}%`);
```

**DEPOIS**:
```typescript
// Hook faz filtro no backend
const { patients } = usePatients({ 
  status: 'ativo', 
  search 
});
```

---

## Troubleshooting

### ❌ Erro: "Cannot read property 'patients' of undefined"

**Causa**: Hook ainda não carregou dados

**Solução**: Verificar loading state:
```typescript
const { patients, loading } = usePatients();
if (loading) return <LoadingSpinner />;
```

### ❌ Erro: CORS Policy

**Causa**: Backend não configurou CORS

**Solução**: Verificar `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

### ❌ Erro: 404 Not Found

**Causa**: Backend não está rodando ou rota incorreta

**Solução**:
```bash
# Iniciar backend
cd backend
npm run dev

# Testar endpoint
curl http://localhost:3000/api/pacientes
```

### ❌ Dados não aparecem

**Causa**: Campos com nomes diferentes (API vs Frontend)

**Solução**: Usar adapter:
```typescript
const frontendData = PatientAdapter.toFrontend(apiData);
```

---

## FAQ

### Q: Preciso alterar todos os componentes de uma vez?

**A**: Não! Use hooks unificados e migre módulo por módulo.

### Q: Como faço rollback se algo der errado?

**A**: Basta trocar `source` no DataSourceProvider:
```typescript
<DataSourceProvider source="supabase"> {/* Rollback */}
```

### Q: O que acontece se eu esquecer de trocar um import?

**A**: Componente continua funcionando com Supabase diretamente. Só não terá os benefícios da REST API.

### Q: Preciso mudar código dos componentes?

**A**: Na maioria dos casos, **não**. Só trocar o import do hook. A interface é idêntica.

### Q: Como testar localmente?

**A**:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Configurar DataSourceProvider para "rest-api"
```

### Q: Quando posso remover código Supabase antigo?

**A**: Após todos os módulos migrados e validados em produção por 1-2 semanas.

---

## 📊 Progresso Atual

| Fase | Status | Progresso |
|------|--------|-----------|
| Setup Inicial | ✅ Completo | 100% |
| Infraestrutura | ✅ Completo | 100% |
| Pacientes | 🔄 Em Progresso | 10% |
| Inventário | ⏳ Aguardando | 0% |
| Financeiro | ⏳ Aguardando | 0% |
| Outros Módulos | ⏳ Aguardando | 0% |

**Total: 95% da infraestrutura pronta, 5% da migração de componentes completa**

---

## 🚀 Próximos Passos

1. ✅ Infraestrutura completa
2. 🔄 Migrar componente `Pacientes.tsx` (próximo)
3. ⏳ Migrar `PatientDetail.tsx`
4. ⏳ Migrar `PatientForm.tsx`
5. ⏳ Testes E2E módulo Pacientes
6. ⏳ Deploy staging Pacientes
7. ⏳ Repetir para outros módulos

---

## 📚 Recursos

- `docs/MIGRATION_STRATEGY.md` - Estratégia geral
- `docs/MIGRATION_CHECKLIST.md` - Checklist detalhado
- `docs/FRONTEND_MIGRATION_GUIDE.md` - Guia técnico completo
- `src/pages/Pacientes.migrated.example.tsx` - Exemplo prático

---

**Última Atualização**: Infraestrutura 100% completa, iniciando migração de componentes (Pacientes primeiro).
