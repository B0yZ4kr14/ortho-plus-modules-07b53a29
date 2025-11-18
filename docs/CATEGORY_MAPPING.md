# Mapeamento de Categorias: Banco ↔ Sidebar ↔ Bounded Context

**Versão:** V5.5 COHERENCE  
**Última Atualização:** 2025-11-18  
**Status:** ✅ 100% Sincronizado

---

## 📊 Tabela de Correspondência Completa

| DB Category (module_catalog) | Sidebar Group | Bounded Context | Descrição | Qtd Módulos |
|------------------------------|---------------|-----------------|-----------|-------------|
| DASHBOARD | VISÃO GERAL | DASHBOARD | Dashboard executivo unificado | 1 |
| ATENDIMENTO CLÍNICO | ATENDIMENTO CLÍNICO | CLINICA | Agenda, Pacientes, PEP, Odontograma, Tratamentos | 7 |
| GESTÃO FINANCEIRA | GESTÃO FINANCEIRA | FINANCEIRO | Fluxo de caixa, recebimentos, crypto, PDV, split | 6 |
| OPERAÇÕES | OPERAÇÕES | OPERACOES | Estoque, inventário, scanner mobile, fornecedores | 5 |
| MARKETING & RELACIONAMENTO | MARKETING & RELACIONAMENTO | CRESCIMENTO | CRM, fidelidade, campanhas, recall, portal | 5 |
| ANÁLISES & RELATÓRIOS | ANÁLISES & RELATÓRIOS | BI | Business Intelligence, dashboards, métricas | 3 |
| CONFORMIDADE & LEGAL | CONFORMIDADE & LEGAL | COMPLIANCE | LGPD, ICP, TISS, teleodonto | 4 |
| INOVAÇÃO & TECNOLOGIA | INOVAÇÃO & TECNOLOGIA | INOVACAO | IA, fluxo digital, integrations | 3 |
| ADMINISTRAÇÃO & DEVOPS | ADMINISTRAÇÃO & DEVOPS | ADMIN | Database, Backups, GitHub, Terminal, Crypto Config | 5 |

**TOTAL:** 9 categorias | 39+ módulos

---

## 🎯 Princípios de Categorização

### 1. Nomenclatura Padronizada
- **Banco de Dados**: SEMPRE em MAIÚSCULAS
- **Sidebar**: SEMPRE em MAIÚSCULAS (match exato com DB)
- **Bounded Context**: MAIÚSCULAS (pode ter variação semântica)

```sql
-- ✅ CORRETO
UPDATE module_catalog SET category = 'GESTÃO FINANCEIRA';

-- ❌ INCORRETO
UPDATE module_catalog SET category = 'gestão financeira';
UPDATE module_catalog SET category = 'Gestão Financeira';
```

### 2. Consistência Absoluta
- Cada categoria DB tem **EXATAMENTE** 1 grupo Sidebar correspondente
- Nome **IDÊNTICO** (case-sensitive) entre DB e Sidebar
- Agrupamento lógico: módulos relacionados na mesma categoria

### 3. Hierarquia Clara
```
Categoria (DB + Sidebar)
  └── Módulos (module_catalog)
        └── Páginas (rotas)
              └── Componentes (UI)
```

---

## 🔍 Validação de Sincronização

### Query SQL: Verificar Categorias no Banco
```sql
-- Retorna todas as categorias e contagem de módulos
SELECT 
  category, 
  COUNT(*) as module_count,
  STRING_AGG(module_key, ', ') as modules
FROM module_catalog 
GROUP BY category 
ORDER BY category;
```

**Resultado Esperado:** 9 categorias (DASHBOARD + 8 grupos)

### Teste E2E: Sidebar vs Banco
```typescript
// tests/e2e/sidebar-categories.spec.ts
test('Database categories match sidebar groups', async ({ page }) => {
  const { data: dbCategories } = await supabase
    .from('module_catalog')
    .select('category')
    .distinct();

  await page.goto('/');
  const sidebarGroups = await page
    .locator('[data-testid="sidebar-group-label"]')
    .allTextContents();

  // Validar match 1:1
  expect(sidebarGroups.sort()).toEqual(
    dbCategories.map(c => c.category).sort()
  );
});
```

---

## 📋 Detalhamento por Categoria

### 1. DASHBOARD
**Propósito:** Visão executiva consolidada  
**Módulos:**
- `DASHBOARD` - Dashboard Executivo Unificado

### 2. ATENDIMENTO CLÍNICO
**Propósito:** Gestão do atendimento e prontuário  
**Módulos:**
- `AGENDA` - Agenda Inteligente
- `PACIENTES` - Cadastro e Gestão de Pacientes
- `PEP` - Prontuário Eletrônico do Paciente
- `ODONTOGRAMA` - Odontograma 2D/3D
- `TRATAMENTOS` - Planos de Tratamento
- `DENTISTAS` - Gestão de Dentistas
- `PROCEDIMENTOS` - Catálogo de Procedimentos

### 3. GESTÃO FINANCEIRA
**Propósito:** Controle financeiro completo  
**Módulos:**
- `FINANCEIRO` - Fluxo de Caixa
- `CRYPTO_PAYMENTS` - Pagamentos em Criptomoedas
- `PDV` - Ponto de Venda
- `SPLIT_PAGAMENTO` - Split de Pagamento
- `INADIMPLENCIA` - Controle de Inadimplência
- `COBRANCA` - Gestão de Cobranças

### 4. OPERAÇÕES
**Propósito:** Gestão operacional e estoque  
**Módulos:**
- `ESTOQUE` - Controle de Estoque Avançado
- `INVENTARIO` - Inventário Periódico
- `SCANNER_MOBILE` - Scanner Mobile para Inventário
- `FORNECEDORES` - Gestão de Fornecedores
- `ORCAMENTOS` - Orçamentos e Contratos Digitais

### 5. MARKETING & RELACIONAMENTO
**Propósito:** CRM e captação de pacientes  
**Módulos:**
- `CRM` - CRM e Funil de Vendas
- `FIDELIDADE` - Programa de Fidelidade
- `MARKETING_AUTO` - Automação de Marketing
- `RECALL` - Sistema de Recall
- `PORTAL_PACIENTE` - Portal do Paciente

### 6. ANÁLISES & RELATÓRIOS
**Propósito:** Business Intelligence  
**Módulos:**
- `BI` - Business Intelligence
- `DASHBOARDS` - Dashboards Customizados
- `RELATORIOS` - Relatórios Gerenciais

### 7. CONFORMIDADE & LEGAL
**Propósito:** Compliance e regulamentação  
**Módulos:**
- `LGPD` - Segurança e Conformidade LGPD
- `ASSINATURA_ICP` - Assinatura Digital ICP-Brasil
- `TISS` - Faturamento de Convênios (TISS)
- `TELEODONTO` - Teleodontologia

### 8. INOVAÇÃO & TECNOLOGIA
**Propósito:** Tecnologias avançadas  
**Módulos:**
- `IA` - Inteligência Artificial
- `FLUXO_DIGITAL` - Integração Fluxo Digital (Scanners/Labs)
- `INTEGRATIONS` - Integrações de Terceiros

### 9. ADMINISTRAÇÃO & DEVOPS
**Propósito:** Gestão técnica e infraestrutura  
**Módulos:**
- `DATABASE_ADMIN` - Administração de Banco de Dados
- `BACKUPS` - Backups Avançados
- `CRYPTO_CONFIG` - Configuração de Criptomoedas
- `GITHUB_TOOLS` - Ferramentas GitHub
- `TERMINAL` - Terminal Web Seguro

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: Categoria não aparece no Sidebar
**Causa:** Nome no DB diferente do nome no `sidebar.config.ts`

**Solução:**
```sql
-- Verificar nome exato no banco
SELECT DISTINCT category FROM module_catalog;

-- Corrigir se necessário
UPDATE module_catalog 
SET category = 'NOME_CORRETO_MAIÚSCULAS'
WHERE category = 'nome_incorreto';
```

### Problema 2: Módulo não aparece no grupo correto
**Causa:** `moduleKey` no `sidebar.config.ts` não bate com `module_key` no banco

**Solução:**
```sql
-- Verificar module_key no banco
SELECT module_key, name, category 
FROM module_catalog 
WHERE module_key = 'SEU_MODULO';
```

Depois atualizar `sidebar.config.ts`:
```typescript
{ 
  title: 'Nome do Módulo',
  url: '/rota',
  icon: IconeCorreto,
  moduleKey: 'MODULE_KEY_EXATO_DO_BANCO' // ← deve bater exatamente
}
```

### Problema 3: Categoria nova não aparece
**Causa:** Faltou adicionar grupo no `sidebar.config.ts`

**Solução:**
```typescript
// Adicionar novo grupo em menuGroups
export const menuGroups: MenuGroup[] = [
  // ... grupos existentes ...
  {
    label: 'NOVA_CATEGORIA', // ← MAIÚSCULAS, match com DB
    boundedContext: 'CONTEXTO',
    items: [
      { title: 'Módulo 1', url: '/url1', icon: Icon1, moduleKey: 'MODULE1' },
      // ...
    ]
  }
];
```

---

## 📦 Estrutura de Arquivos Relacionados

```
src/
├── core/
│   ├── layout/
│   │   └── Sidebar/
│   │       └── sidebar.config.ts        # Configuração da sidebar
│   └── config/
│       └── modules.config.ts            # Configuração de módulos
├── modules/                              # Módulos por categoria
│   ├── pacientes/
│   ├── agenda/
│   ├── financeiro/
│   └── ...
└── ...

supabase/
└── migrations/
    └── *_unify_module_categories.sql     # Migration de categorias

docs/
├── CATEGORY_MAPPING.md                   # Este documento
├── SIDEBAR_ARCHITECTURE.md               # Arquitetura da sidebar
└── MODULES_CATALOG.md                    # Catálogo completo de módulos
```

---

## 🔄 Processo de Adição de Nova Categoria

### 1. Criar categoria no banco
```sql
-- Migration SQL
UPDATE module_catalog 
SET category = 'NOVA_CATEGORIA'
WHERE module_key IN ('MOD1', 'MOD2', 'MOD3');
```

### 2. Adicionar grupo no Sidebar
```typescript
// src/core/layout/Sidebar/sidebar.config.ts
{
  label: 'NOVA_CATEGORIA',
  boundedContext: 'BOUNDED_CONTEXT',
  items: [
    { title: 'Módulo 1', url: '/url1', icon: Icon1, moduleKey: 'MOD1' },
    { title: 'Módulo 2', url: '/url2', icon: Icon2, moduleKey: 'MOD2' },
    { title: 'Módulo 3', url: '/url3', icon: Icon3, moduleKey: 'MOD3' }
  ]
}
```

### 3. Atualizar documentação
- Adicionar linha na tabela de correspondência
- Adicionar detalhamento da categoria
- Atualizar contadores (Qtd Módulos, TOTAL)

### 4. Validar sincronização
```bash
# Rodar testes E2E
npm run test:e2e -- sidebar-categories
```

---

## 📚 Referências

- [Sidebar Architecture](./SIDEBAR_ARCHITECTURE.md)
- [Modules Catalog](./MODULES_CATALOG.md)
- [V5.5 Completion Report](./V5.5_COMPLETION_REPORT.md)
- [Supabase module_catalog Table](../supabase/migrations/)

---

**Última Validação:** 2025-11-18 ✅  
**Status:** SINCRONIZADO (9 categorias, 39+ módulos)
