# Arquitetura V5.2 - Ortho+ SaaS Multitenant

## Visão Geral

O Ortho+ é um SaaS B2B multitenant modular para clínicas odontológicas, implementando **Domain-Driven Design (DDD)** com arquitetura **plug-and-play descentralizada**.

## Princípios Arquiteturais

### 1. Modularização Total
- Sistema dividido em **25+ módulos** independentes
- Cada módulo pode ser **ativado/desativado** dinamicamente por clínica
- Zero acoplamento entre módulos (comunicação via Event Bus)

### 2. Multi-Tenancy
- Isolamento completo de dados por `clinic_id`
- Row Level Security (RLS) em todas as tabelas Supabase
- Usuários ADMIN podem gerenciar múltiplas clínicas

### 3. Backend Agnóstico
- Abstração completa: **Supabase Cloud** ↔ **PostgreSQL Local**
- Switching dinâmico sem reload
- Interface unificada via `IBackendService`

### 4. DDD e CQRS
- Entidades de domínio com business logic
- Separação Command/Query (em progresso)
- Event Sourcing para auditoria (LGPD)

## Estrutura de Diretórios

```
orthoplus-v5.2/
├── src/
│   ├── modules/                    # Módulos descentralizados (25+)
│   │   ├── pacientes/
│   │   │   ├── application/        # Use Cases
│   │   │   ├── domain/             # Entidades, Value Objects
│   │   │   ├── infrastructure/     # Repos, APIs externas
│   │   │   └── ui/                 # Components, Pages
│   │   ├── agenda/
│   │   ├── financeiro/
│   │   ├── pep/                    # Prontuário Eletrônico
│   │   ├── crypto/                 # Pagamentos Cripto
│   │   └── .../
│   │
│   ├── infrastructure/             # Infraestrutura compartilhada
│   │   ├── backend/                # Abstração Supabase/PostgreSQL
│   │   │   ├── IBackendService.ts
│   │   │   ├── SupabaseBackendService.ts
│   │   │   └── PostgreSQLBackendService.ts
│   │   ├── di/                     # Dependency Injection
│   │   └── external/               # APIs externas (Blockchain, etc)
│   │
│   ├── lib/
│   │   ├── logger.ts               # Logger profissional
│   │   ├── events/                 # Event Bus (frontend + backend)
│   │   └── providers/              # React Contexts
│   │       ├── BackendProvider.tsx # Backend switching
│   │       └── DataSourceProvider.tsx
│   │
│   ├── core/                       # Core application (DDD)
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   │
│   ├── components/                 # Shared UI Components
│   │   ├── shared/
│   │   ├── settings/
│   │   └── ui/                     # shadcn/ui
│   │
│   ├── pages/                      # Páginas principais (routing)
│   ├── hooks/                      # Custom React Hooks
│   └── types/                      # TypeScript types centralizados
│
├── backend/                        # Node.js Backend (opcional)
│   └── src/
│       ├── modules/                # Módulos backend (mirror do front)
│       ├── infrastructure/
│       └── index.ts                # API Gateway
│
├── docs/                           # Documentação técnica
│   ├── ARCHITECTURE_V5.2.md        # Este arquivo
│   ├── BACKEND_SWITCHING.md
│   ├── TESTING_GUIDE.md
│   └── API_REFERENCE.md
│
└── tests/                          # Testes E2E (Playwright)
    └── e2e/
```

## Camadas da Aplicação

### Frontend (React + Vite)

```
┌─────────────────────────────────────────┐
│           UI Layer (Pages)              │
│   React Components, Forms, Tables       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Application Layer (Hooks)          │
│   Custom Hooks, State Management        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Infrastructure Layer (Backend API)    │
│   BackendProvider, IBackendService       │
└─────────────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌──────────────────┐  ┌────────────────────┐
│   Supabase       │  │   PostgreSQL       │
│   (Cloud)        │  │   (Ubuntu Server)  │
└──────────────────┘  └────────────────────┘
```

### Backend (DDD Layers)

```
┌─────────────────────────────────────────┐
│      Presentation Layer (API)           │
│   Controllers, REST Endpoints           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Application Layer (Use Cases)      │
│   Business Logic, Orchestration         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Domain Layer (Entities)          │
│   Domain Models, Value Objects          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Infrastructure Layer (Persistence)    │
│   Repositories, Database Access         │
└─────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Usuário Interage com UI
```
User → Page Component → Hook (usePatients) → BackendProvider
```

### 2. BackendProvider Decide Rota
```
BackendProvider → IBackendService → SupabaseBackend | PostgreSQLBackend
```

### 3. Dados Retornam
```
Backend → IBackendService → Hook → Component → UI Update
```

### 4. Eventos de Domínio (Opcional)
```
Backend → Event Bus → Subscribed Modules → Side Effects
```

## Módulos Principais

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **PEP** | Prontuário Eletrônico do Paciente | ✅ Completo |
| **Agenda** | Agendamento inteligente com WhatsApp | ✅ Completo |
| **Financeiro** | Fluxo de caixa, contas a receber/pagar | ✅ Completo |
| **Crypto** | Pagamentos Bitcoin, USDT, ETH | ✅ Completo |
| **PDV** | Ponto de venda + NFCe | ✅ Completo |
| **Estoque** | Controle de inventário | ✅ Completo |
| **CRM** | Funil de vendas | ✅ Completo |
| **BI** | Business Intelligence + Dashboards | ⚙️ Em Progresso |
| **Teleodonto** | Teleconsultas com Jitsi | ✅ Completo |
| **LGPD** | Compliance e auditoria | ✅ Completo |

## Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **shadcn/ui** (componentes)
- **TanStack Query** (data fetching)
- **React Router** (routing)

### Backend
- **Supabase** (BaaS: Auth, DB, Storage, Edge Functions)
- **Node.js** (API Gateway opcional)
- **PostgreSQL** (database local)

### DevOps
- **Docker Swarm** (orquestração)
- **GitHub Actions** (CI/CD)
- **Playwright** (E2E tests)

## Segurança

### Autenticação
- JWT tokens via Supabase Auth
- Custom claims para `clinic_id` e `app_role`
- Refresh tokens com rotação

### Autorização
- **RBAC**: Roles `ADMIN`, `MEMBER`, `PATIENT`
- **Permissões Granulares**: Por módulo e por usuário
- **RLS**: Row Level Security em todas as tabelas

### Compliance
- **LGPD**: Audit trail completo
- **Criptografia**: AES-256 para backups
- **Anonimização**: Dados sensíveis mascarados

## Performance

### Otimizações Implementadas
- ✅ Code Splitting (lazy loading de módulos)
- ✅ Memoização (React.memo, useMemo)
- ✅ Virtualização de listas (react-window)
- ✅ Cache agressivo (crypto rates, módulos)

### Métricas Alvo (V5.2)
- **Bundle inicial**: <200KB gzipped
- **Lighthouse Score**: >90
- **Time to Interactive**: <2s
- **First Contentful Paint**: <1s

## Escalabilidade

### Multi-Tenancy
- Isolamento via `clinic_id` (shared database)
- Futuro: Schema-per-tenant para grandes clínicas

### Load Balancing
- Supabase: Gerenciado automaticamente
- PostgreSQL: Docker Swarm com múltiplas réplicas

### Caching
- **Client**: React Query (5min stale time)
- **Server**: Redis (futuro)
- **CDN**: Cloudflare para assets estáticos

## Roadmap

### V5.3 (Q2 2025)
- [ ] CQRS completo (Command/Query separation)
- [ ] Event Sourcing para auditoria
- [ ] Backend híbrido (auth Supabase, data PostgreSQL)

### V5.4 (Q3 2025)
- [ ] Micro-frontends (Module Federation)
- [ ] GraphQL API opcional
- [ ] Kubernetes deployment

### V6.0 (Q4 2025)
- [ ] Multi-database (MySQL, MongoDB)
- [ ] Serverless functions (Cloudflare Workers)
- [ ] Realtime collaboration (CRDT)

## Referências

- [DDD: Domain-Driven Design - Eric Evans](https://domainlanguage.com/ddd/)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Supabase Docs](https://supabase.com/docs)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
