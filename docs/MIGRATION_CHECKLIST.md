# ✅ Checklist de Migração REST API

## 📋 Checklist por Componente

Use este checklist para cada componente migrado.

### Antes de Começar

- [ ] Backend REST API está rodando (`npm run dev` no backend)
- [ ] Hooks unificados criados para o módulo
- [ ] Adapters (DTOs) criados e testados
- [ ] Feature flag configurada (se aplicável)

---

## 🔄 Processo de Migração

### 1️⃣ Preparação

- [ ] Identificar todos os componentes que usam Supabase diretamente
- [ ] Listar hooks do Supabase usados (`usePatientsSupabase`, etc)
- [ ] Verificar queries customizadas que precisam de endpoints REST

### 2️⃣ Código

- [ ] Trocar import de hook Supabase para hook unificado
  ```typescript
  // ANTES
  import { usePatientsSupabase } from '@/modules/pacientes/hooks/usePatientsSupabase';
  
  // DEPOIS
  import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';
  ```

- [ ] Verificar se interface retornada é compatível
- [ ] Adaptar campos se necessário (ex: `full_name` → `nome`)
- [ ] Remover imports diretos do `supabase` client

### 3️⃣ Testes com Supabase (Validação)

Primeiro, testar com Supabase para garantir que nada quebrou:

```typescript
// src/main.tsx
<DataSourceProvider source="supabase">
  <App />
</DataSourceProvider>
```

- [ ] Componente renderiza sem erros
- [ ] Listagem funciona
- [ ] Criação funciona
- [ ] Atualização funciona
- [ ] Exclusão funciona
- [ ] Filtros/buscas funcionam
- [ ] Loading states corretos
- [ ] Sem erros no console

### 4️⃣ Testes com REST API (Migração)

Agora, alternar para REST API:

```typescript
// src/main.tsx
<DataSourceProvider source="rest-api">
  <App />
</DataSourceProvider>
```

- [ ] Backend REST API está acessível
- [ ] Componente renderiza sem erros
- [ ] Listagem funciona (mesmos dados)
- [ ] Criação funciona
- [ ] Atualização funciona
- [ ] Exclusão funciona
- [ ] Filtros/buscas funcionam
- [ ] Loading states corretos
- [ ] Mensagens de erro apropriadas
- [ ] Sem erros no console
- [ ] Performance igual ou melhor

### 5️⃣ Testes E2E

- [ ] Executar suite E2E Playwright
  ```bash
  npm run test:e2e
  ```
- [ ] Todos os testes passam
- [ ] Nenhum teste flaky (rodar 3x)

### 6️⃣ Monitoramento (24-48h)

- [ ] Deploy em staging com REST API
- [ ] Monitorar logs de erro
- [ ] Coletar métricas de performance
- [ ] Feedback de usuários beta (se aplicável)

### 7️⃣ Finalização

- [ ] Documentar peculiaridades da migração
- [ ] Atualizar docs do módulo
- [ ] Marcar como ✅ no tracking de migração
- [ ] Comunicar ao time

---

## 📊 Tracking de Progresso

### Módulo: Pacientes

| Componente | Migrado | Testado Supabase | Testado REST | E2E Pass | Status |
|------------|---------|------------------|--------------|----------|--------|
| `Pacientes.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | 🔄 Em Progresso |
| `PatientDetail.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |
| `PatientForm.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |
| `PatientHistory.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |

**Status:**
- ✅ Completo
- 🔄 Em Progresso
- ⏳ Pendente
- ⚠️ Com Issues
- ❌ Bloqueado

### Módulo: Inventário

| Componente | Migrado | Testado Supabase | Testado REST | E2E Pass | Status |
|------------|---------|------------------|--------------|----------|--------|
| `Produtos.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |
| `ProductForm.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |
| `StockAdjust.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |

### Módulo: Financeiro

| Componente | Migrado | Testado Supabase | Testado REST | E2E Pass | Status |
|------------|---------|------------------|--------------|----------|--------|
| `Transacoes.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |
| `ContasReceber.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |
| `ContasPagar.tsx` | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ Pendente |

---

## 🚨 Issues Comuns

### Problema: Dados não aparecem após trocar para REST API

**Causa:** Backend não está rodando ou endpoint incorreto

**Solução:**
```bash
# Terminal 1: Iniciar backend
cd backend
npm run dev

# Terminal 2: Verificar se API responde
curl http://localhost:3000/api/pacientes
```

### Problema: Tipos incompatíveis

**Causa:** API retorna campos diferentes do Supabase

**Solução:** Usar adapters (DTOs) para converter:
```typescript
const frontendData = PatientAdapter.toFrontend(apiData);
```

### Problema: Loading infinito

**Causa:** Hook não está retornando `loading: false`

**Solução:** Verificar se hook está capturando erros corretamente:
```typescript
try {
  // ... fetch
} catch (error) {
  // ... error handling
} finally {
  setLoading(false); // ← CRÍTICO
}
```

### Problema: CORS errors

**Causa:** Backend não configurou CORS para frontend

**Solução:** Verificar `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

## 📞 Suporte

**Problemas persistentes?**
1. Consultar `docs/MIGRATION_STRATEGY.md`
2. Revisar exemplo em `src/pages/Pacientes.migrated.example.tsx`
3. Verificar logs do backend (`npm run dev`)
4. Testar endpoint isoladamente (Postman/curl)

---

**Última Atualização**: Infraestrutura completa, iniciando migração de componentes.
