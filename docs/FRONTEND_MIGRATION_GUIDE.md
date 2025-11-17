# 🔄 GUIA DE MIGRAÇÃO DO FRONTEND - Supabase → Node.js REST API

**Objetivo**: Migrar chamadas do frontend de Supabase Edge Functions para REST API Node.js

---

## 📋 CHECKLIST DE MIGRAÇÃO

### ✅ FASE 1: Infraestrutura Base (COMPLETO)

- [x] Cliente HTTP (axios) configurado com interceptors
- [x] Tratamento global de erros
- [x] Gestão automática de JWT tokens
- [x] Base URL configurável via env vars

**Arquivo**: `src/lib/api/apiClient.ts`

---

### ✅ FASE 2: Hooks de Autenticação (COMPLETO)

- [x] `useAuth` - login, register, logout
- [x] Integração com localStorage para persistência de token
- [x] Redirecionamento automático em caso de token expirado

**Arquivo**: `src/hooks/api/useAuth.ts`

---

### ✅ FASE 3: Hooks dos Módulos Core (COMPLETO)

#### 3.1 Pacientes
- [x] `usePacientes` - CRUD completo
- [x] Listar, criar, atualizar status
- [x] Query individual `usePatient(id)`

**Arquivo**: `src/hooks/api/usePacientes.ts`

#### 3.2 Inventário
- [x] `useInventario` - Gestão de produtos
- [x] Criar produtos, ajustar estoque
- [x] Filtro de produtos com estoque baixo

**Arquivo**: `src/hooks/api/useInventario.ts`

#### 3.3 Financeiro
- [x] `useFinanceiro` - Transações financeiras
- [x] Criar transações, marcar como paga
- [x] `useCashFlow` - Fluxo de caixa por período
- [x] Filtros de transações pendentes/vencidas

**Arquivo**: `src/hooks/api/useFinanceiro.ts`

#### 3.4 Módulos (Configurações)
- [x] `useModulos` - Gestão de módulos do sistema
- [x] Listar, ativar/desativar módulos
- [x] Verificação de dependências
- [x] Helpers: `isModuleActive`, `getModulesByCategory`

**Arquivo**: `src/hooks/api/useModulos.ts`

---

### ✅ FASE 4: Hooks Administrativos (COMPLETO)

#### 4.1 Database Admin
- [x] `useDatabaseAdmin` - Monitoramento do banco
- [x] Saúde do banco, queries lentas, pool de conexões
- [x] Executar manutenção (VACUUM, ANALYZE, REINDEX)

**Arquivo**: `src/hooks/api/useDatabaseAdmin.ts`

#### 4.2 Backups
- [x] `useBackups` - Gestão de backups
- [x] Listar, criar, verificar integridade
- [x] Estatísticas de backups

**Arquivo**: `src/hooks/api/useBackups.ts`

---

### ⏳ FASE 5: Hooks Restantes (PENDENTE)

#### 5.1 PDV
- [ ] `usePDV` - Vendas e fechamento de caixa
- [ ] Registrar vendas, listar vendas
- [ ] Fechar caixa do dia

**Arquivo a criar**: `src/hooks/api/usePDV.ts`

#### 5.2 PEP (Prontuário Eletrônico)
- [ ] `usePEP` - Prontuários e evoluções
- [ ] Criar prontuário, adicionar evoluções
- [ ] Assinatura digital

**Arquivo a criar**: `src/hooks/api/usePEP.ts`

#### 5.3 Faturamento
- [ ] `useFaturamento` - Emissão de NFe
- [ ] Emitir, autorizar, cancelar NFe
- [ ] Consultar status SEFAZ

**Arquivo a criar**: `src/hooks/api/useFaturamento.ts`

#### 5.4 Crypto Config
- [ ] `useCryptoConfig` - Exchanges e portfolio
- [ ] Conectar exchanges, portfolio consolidado
- [ ] Estratégias DCA

**Arquivo a criar**: `src/hooks/api/useCryptoConfig.ts`

#### 5.5 GitHub Tools
- [ ] `useGitHubTools` - Gestão de repos
- [ ] Listar repos, branches, PRs, workflows

**Arquivo a criar**: `src/hooks/api/useGitHubTools.ts`

#### 5.6 Terminal
- [ ] `useTerminal` - Web shell
- [ ] Criar sessões, executar comandos
- [ ] Histórico de comandos

**Arquivo a criar**: `src/hooks/api/useTerminal.ts`

---

### ⏳ FASE 6: Atualizar Context Providers (PENDENTE)

#### 6.1 AuthContext
- [ ] Substituir `supabase.auth` por `useAuth`
- [ ] Atualizar `login`, `logout`, `register`
- [ ] Manter compatibilidade com componentes existentes

**Arquivo a modificar**: `src/contexts/AuthContext.tsx`

#### 6.2 ModulesContext (Novo)
- [ ] Criar context para gestão de módulos
- [ ] Integrar com `useModulos`
- [ ] Provider global com lista de módulos ativos

**Arquivo a criar**: `src/contexts/ModulesContext.tsx`

---

### ⏳ FASE 7: Atualizar Componentes (PENDENTE)

#### 7.1 Componentes de Pacientes
- [ ] `PatientsList.tsx` - usar `usePacientes`
- [ ] `PatientForm.tsx` - usar `createPatient`
- [ ] `PatientDetails.tsx` - usar `usePatient(id)`

#### 7.2 Componentes de Inventário
- [ ] `ProdutosList.tsx` - usar `useInventario`
- [ ] `ProdutoForm.tsx` - usar `createProduto`
- [ ] `EstoqueAjusteDialog.tsx` - usar `adjustStock`

#### 7.3 Componentes Financeiros
- [ ] `TransactionsList.tsx` - usar `useFinanceiro`
- [ ] `TransactionForm.tsx` - usar `createTransaction`
- [ ] `CashFlowDashboard.tsx` - usar `useCashFlow`

#### 7.4 Componentes de Configuração
- [ ] `ModulesAdmin.tsx` - usar `useModulos`
- [ ] `ModuleCard.tsx` - usar `toggleModule`

#### 7.5 Componentes Administrativos
- [ ] `DatabaseHealthDashboard.tsx` - usar `useDatabaseAdmin`
- [ ] `BackupManagement.tsx` - usar `useBackups`

---

## 🔄 PADRÃO DE MIGRAÇÃO

### ANTES (Supabase):
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('pacientes')
  .select('*')
  .eq('clinic_id', clinicId);
```

### DEPOIS (REST API):
```typescript
import { usePacientes } from '@/hooks/api/usePacientes';

const { patients, isLoading, createPatient } = usePacientes();
```

---

## 🛠️ VARIÁVEIS DE AMBIENTE

Adicione ao `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Produção**:
```env
VITE_API_BASE_URL=https://api.orthoplus.com.br/api
```

---

## 📊 PROGRESSO DA MIGRAÇÃO

| Categoria | Progresso | Status |
|-----------|-----------|--------|
| Infraestrutura (apiClient) | 100% | ✅ |
| Hook useAuth | 100% | ✅ |
| Hook usePacientes | 100% | ✅ |
| Hook useInventario | 100% | ✅ |
| Hook useFinanceiro | 100% | ✅ |
| Hook useModulos | 100% | ✅ |
| Hook useDatabaseAdmin | 100% | ✅ |
| Hook useBackups | 100% | ✅ |
| Hooks restantes (6 módulos) | 0% | ⏳ |
| Contexts (Auth, Modules) | 0% | ⏳ |
| Componentes | 0% | ⏳ |

**PROGRESSO TOTAL: 40%**

---

## 🚨 BREAKING CHANGES

1. **Autenticação**: Trocar `supabase.auth` por `useAuth()`
2. **Queries**: Trocar `supabase.from()` por hooks específicos
3. **Realtime**: Remover subscriptions Supabase (será implementado via WebSockets)
4. **Storage**: Trocar `supabase.storage` por endpoint `/api/storage` (a implementar)

---

## 📚 PRÓXIMOS PASSOS

1. Criar hooks restantes (PDV, PEP, Faturamento, Crypto, GitHub, Terminal)
2. Atualizar AuthContext e criar ModulesContext
3. Migrar componentes página por página
4. Testar fluxos completos end-to-end
5. Remover dependências do `@supabase/supabase-js`

---

**Frontend Migration** - 40% Completo 🔄
