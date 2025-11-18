# Arquitetura da Sidebar - Ortho+ V5.1

## Visão Geral

A sidebar do Ortho+ foi projetada com base em **Domain-Driven Design (DDD)** e organizada em **6 Bounded Contexts** principais, refletindo a arquitetura modular do sistema.

## Estrutura de Bounded Contexts

### 1. VISÃO GERAL
**Propósito:** Acesso rápido aos principais dashboards consolidados
**Módulos:**
- Dashboard Unificado (`/`)
- BI & Analytics (`/bi`)

### 2. ATENDIMENTO CLÍNICO
**Propósito:** Gestão de pacientes, agendamentos e prontuários
**Módulos:**
- Pacientes (`/pacientes`)
- Agenda (`/agenda`)
- PEP - Prontuário Eletrônico (`/pep`)
- Recall (`/recall`)
- Teleodontologia (`/teleodontologia`)
- IA Radiográfica (`/ia-radiografia`)

### 3. FINANCEIRO & FISCAL
**Propósito:** Gestão financeira, transações e compliance fiscal
**Módulos:**
- Financeiro (`/financeiro`)
  - Transações
  - Contas a Receber
  - Contas a Pagar
  - **Pagamentos em Criptomoedas** (`/financeiro/crypto`) ✨ V5.1
- PDV - Ponto de Venda (`/pdv`)
- Fiscal (`/fiscal`)
  - Notas Fiscais (`/financeiro/notas-fiscais`)
  - TISS (`/tiss`)
- Orçamentos (`/orcamentos`)

### 4. OPERAÇÕES
**Propósito:** Gestão operacional e recursos da clínica
**Módulos:**
- Estoque (`/estoque`)
  - Produtos
  - Inventários
  - Histórico
- Procedimentos (`/procedimentos`)
- Dentistas (`/dentistas`)
- Funcionários (`/funcionarios`)

### 5. CAPTAÇÃO & FIDELIZAÇÃO
**Propósito:** CRM, marketing e gestão de relacionamento
**Módulos:**
- CRM (`/crm`)
- Marketing Automatizado (`/marketing-auto`)
- Campanhas (`/campanhas`)
- Programa de Fidelidade (`/fidelidade`)

### 6. CONFIGURAÇÕES
**Propósito:** Administração do sistema e módulos
**Módulos:**
- Usuários (`/usuarios`)
- Configurações Gerais (`/configuracoes`)
- Módulos (`/configuracoes/modulos`)
- Segurança (`/seguranca`)

## Princípios de Design

### 1. **Hierarquia Clara**
```
Contexto → Módulo → Funcionalidade
```

### 2. **Badges Dinâmicos**
Exibem contadores em tempo real para itens críticos:
- 📅 Agendamentos do dia
- ⚠️ Contas em atraso
- 🔔 Recalls pendentes
- 💬 Mensagens não lidas

### 3. **Navegação Contextual**
- Links ativos destacados com `bg-sidebar-accent`
- Sub-itens colapsáveis para módulos com múltiplas funcionalidades
- Ícones intuitivos usando `lucide-react`

### 4. **Modularidade e Extensibilidade**
- Cada item do menu é mapeado para um módulo no `module_catalog`
- Fácil adição de novos módulos via `sidebar.config.ts`
- Suporte a permissões granulares por módulo

## Implementação Técnica

### Arquivo Principal
```typescript
src/core/layout/Sidebar/sidebar.config.ts
```

### Interface de MenuItem
```typescript
export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  subItems?: MenuItem[];
  badge?: string | number;
  moduleKey?: string; // Para controle de acesso granular
}
```

### Interface de MenuGroup
```typescript
export interface MenuGroup {
  label: string;
  boundedContext: string;
  items: MenuItem[];
}
```

## Fluxo de Renderização

1. **Carregamento:** `SidebarNav.tsx` consome `menuGroups` de `sidebar.config.ts`
2. **Badges Dinâmicos:** `useSidebarBadges` atualiza contadores via Edge Function
3. **Renderização:** Shadcn `SidebarGroup` e `SidebarMenuItem` renderizam a estrutura
4. **Controle de Acesso:** `AuthContext.hasModuleAccess()` valida permissões

## Integração com Backend

### Edge Function: `sidebar-badges`
**Endpoint:** `/functions/v1/sidebar-badges`
**Propósito:** Fornecer contadores em tempo real
**Retorno:**
```json
{
  "appointments": 12,
  "overdue": 5,
  "recalls": 8,
  "messages": 3
}
```

### Tabelas do Database
- `module_catalog`: Catálogo mestre de módulos
- `clinic_modules`: Módulos contratados por clínica
- `user_module_permissions`: Permissões granulares por usuário

## Manutenção e Evolução

### Adicionar Novo Módulo
1. Adicionar entrada em `module_catalog` (via migration SQL)
2. Adicionar `MenuItem` em `sidebar.config.ts` no grupo apropriado
3. Criar página/componente correspondente
4. Adicionar rota em `App.tsx`

### Remover Módulo
1. Marcar como `is_active = false` em `clinic_modules`
2. **Não deletar** de `sidebar.config.ts` (para histórico)
3. Adicionar validação condicional no `SidebarNav.tsx`

## Controle de Acesso e Permissões (V5.3)

### Verificação Granular de Permissões

A partir da V5.3, a sidebar implementa controle de acesso granular por módulo:

**`SidebarMenuItem.tsx`:**
```typescript
const hasAccess = !item.moduleKey || hasModuleAccess(item.moduleKey);
if (!hasAccess) return null; // Item não renderizado
```

**`SidebarGroup.tsx`:**
```typescript
const visibleItems = group.items.filter(item => 
  !item.moduleKey || hasModuleAccess(item.moduleKey)
);
if (visibleItems.length === 0) return null; // Grupo não renderizado
```

### Proteção de Rotas

Rotas protegidas por módulo usando `ProtectedRoute`:
```typescript
<Route 
  path="/contratos" 
  element={
    <ProtectedRoute moduleKey="CONTRATOS">
      <ContratosPage />
    </ProtectedRoute>
  } 
/>
```

Se o usuário não tiver permissão para o módulo, será redirecionado para `/403 Forbidden`.

### Fluxo de Autorização

1. Usuário faz login → `AuthContext` carrega `userPermissions` e `activeModules`
2. `hasModuleAccess(moduleKey)` verifica:
   - Se role = 'ADMIN' → retorna `true` (acesso total)
   - Se role = 'MEMBER' → verifica se `moduleKey` está em `userPermissions` ou `activeModules`
3. Sidebar renderiza apenas itens autorizados
4. Rotas bloqueiam acesso direto via URL se sem permissão

## Conformidade Arquitetural

✅ **100% Alinhado com DDD:** Cada grupo representa um Bounded Context  
✅ **Sem Redundâncias:** V5.1 eliminou dashboards de categoria duplicados  
✅ **Categorização Correta:** Migration SQL alinha `module_catalog` com UX  
✅ **Modularidade:** Novos módulos podem ser adicionados sem refatoração  
✅ **Permissões Granulares (V5.3):** Controle fino por módulo e usuário  
✅ **Backend Agnóstico (V5.3):** Alternância Supabase ↔ Ubuntu Server  

---

**Última Atualização:** V5.3 COHERENCE (2024)  
**Responsável:** Arquitetura de Front-End Ortho+
