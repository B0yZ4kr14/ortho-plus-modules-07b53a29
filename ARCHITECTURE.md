# 🏗️ Arquitetura do Sistema Ortho+ (Modernizada)

## 📐 Visão Geral da Arquitetura

O **Ortho+** foi refatorado a partir de sua arquitetura baseada em Serverless (Supabase Edge Functions) para uma arquitetura robusta, baseada em instâncias self-hosted. Seguimos os princípios rigorosos de **Clean Architecture**, **Domain-Driven Design (DDD)** e modularidade estrita.

### Desenvolvido por TSI Telecom

**Copyright © 2026 TSI Telecom**

---

## 🎯 Princípios Arquiteturais e Stack Tecnológico

A nova infraestrutura abandona o acoplamento excessivo ao BaaS e assume total controle sobre os dados e lógicas de negócios através de instâncias dedicadas.

### Stack Atual

- **Frontend**: React 18, TypeScript 5, Vite, Tailwind CSS 3, Shadcn/UI.
- **Backend**: Node.js, Express.js.
- **Banco de Dados**: PostgreSQL 15, Prisma ORM.
- **Cache & Filas**: Redis 7.
- **Testes & CI/CD**: Playwright (E2E), Vitest, GitHub Actions.

### 1. Modularidade Descentralizada

Cada contexto de negócio da clínica possui seu diretório contendo toda lógica isolada.

No **Frontend**:

```text
src/modules/[module-name]/
├── components/      # Componentes React de UI locais
├── hooks/           # Encapsulamento de React Query e chamadas REST
├── pages/           # Rotas locais
├── types/           # Tipagens TypeScript e Zod Schemas
└── utils/           # Transformações locais
```

No **Backend**:

```text
backend/src/
├── controllers/     # Handlers Express de requests/responses
├── routes/          # Definição de endpoints REST e SSE
├── infrastructure/  # Integrações de baixo nível (Logger, Storage, Metrics)
├── modules/         # Lógica estrutural de cada domínio
└── utils/           # Singletons (PrismaClient) e Helpers
```

---

## 🔄 Separação de Responsabilidades

### 🖥️ Frontend (React / Vite)

- **Apresentação e UX**: Componentização com Shadcn, temas e responsividade centralizados.
- **Gestão de Estado**:
  - `useState` / `useReducer` para estados locais triviais.
  - `React Query` para server state, invalidando cache baseando-se em mutations.
- **Validação Client-side**: Validação intensa nos formulários via `Zod` pre-request.
- **Segurança de Rota**: `ProtectedRoute` confere `moduleKey` via `AuthContext`, bloqueando se a clínica não tiver a licença requerida.

### ⚙️ Backend (Node.js / Express)

- **API Gateway & Roteamento**: Roteamento por domínio (ex: `/api/rest/orcamentos`, `/api/financeiro`).
- **Realtime Global**: Implementação Nativa via **SSE** (`/api/events/stream`) com reconexão resiliente substituindo pub/subs do Supabase.
- **Camada de Cache**: Requests custosas utilizam *wrapper* no Express baseado em Redis com tempos de TTL dinâmicos (`cacheRoute`).
- **Autenticação (JWT)**: Middleware intercepta Headers, verifica autenticidade, provisão do `clinic_id`, e roles.

### 🗄️ Database (PostgreSQL / Prisma ORM)

- **Multi-tenancy Estrutural**: Utilização agressiva de `clinic_id` como separador lógico em todas as tabelas master.
- **Segurança Nativa (RLS)**: Reforço a nível de Row Level Security direto no banco caso ocorra algum bypass.
- **Auditoria Nativa**: Triggers de log que capturam mutações críticas independentemente de como as rotas foram atingidas.

---

## 🏗️ Grafo de Domínios Clássicos

O sistema cresceu e acomoda mais de **30 Módulos Frontend**, interagindo com controladores independentes.

```mermaid
graph TD
    %% Núcleo Operacional
    PACIENTES[Pacientes]
    AGENDA[Agenda]
    PEP[Prontuário (PEP)]

    %% Monetário
    FINANCEIRO[Financeiro]
    ORCAMENTOS[Orçamentos]
    PDV[PDV]

    %% Clinico
    ODONTOGRAMA[Odontograma]
    IA[IA / Radiografias]
    TELEMEDICINA[Teleodonto]

    %% Relacionamentos Core
    PACIENTES --> AGENDA
    AGENDA --> PEP
    AGENDA --> TELEMEDICINA

    %% Relacionamentos Clinicos
    PEP --> ODONTOGRAMA
    PEP --> IA

    %% Relacionamentos Monetários
    ODONTOGRAMA --> ORCAMENTOS
    ORCAMENTOS --> FINANCEIRO
    PDV --> FINANCEIRO
```

---

## 🚦 Fluxo de Dados End-to-End

### 1. Chamada de Leitura (Query com Cache)

```text
[Usuário acessa /dashboard]
    ↓
Componente React chama useDashboardMetrics (React Query)
    ↓
Request GET `/api/dashboard-v2`
    ↓
🔥 Backend Express Middleware de Cache verifica REDIS
  ├── SE HIT: Retorna payload do Redis (20ms) -> React Query
  └── SE MISS: Controller -> PrismaClient -> PostgreSQL (Query Complexa)
           ↓
      Prisma Retorna Dados
           ↓
      Express seta no Redis (TTL) + Retorna via HTTP -> React Query
```

### 2. Mutação de Escrita & Real-Time Sync

```text
[Usuário aprova Orçamento]
    ↓
React Hook Form Valida Payload (Zod) -> Envia POST `/api/rest/orcamentos`
    ↓
Express Controller -> Verifica JWT Auth / Clinic ID
    ↓
Mutação no PostgreSQL via Prisma
    ↓
Trigger de Database -> Registra Audit no `audit_logs`
    ↓
⚙️ Serviço de Eventos Interno (EventEmitter) do Express ativado
    ↓
📡 Envia payload vivo pro Socket `/api/events/stream`
    ↓
Página das Recepções/Outros Usuários -> Escutam evento via `useSSE()`
    ↓
React Query Invalida a respectiva chave de array
    ↓
Atualização Instantânea sem Full Page Reload
```

---

## 🔐 Segurança em Profundidade (Defense-in-Depth)

As camadas de validação atuam solidamente na forma de cebola para evitar escalonamento de privilégios.

1. **Frontend UI Lock**: `ProtectedRoute` bloqueia links na Navbar caso clínica não tenha a propriedade/modKey vinculada no painel.
2. **Frontend Payload**: `Zod` assegura os tipos antes de inflar o HTTP Body.
3. **Gateway Middleware**: `AuthMiddleware` extrai JWT localmente, comparando sub, exp, role e clinicId criptografado com o secret_key do back-end.
4. **Prisma Hardening**: As queries exigem WHERE paramêtrizado como `{ clinic_id: user.clinic_id }` globalmente via factory/extensions de escopo.
5. **Database RLS Constraints**: As policies exigem que o Role execute na schema apropriada, caindo as exceções no log PostgreSQL.

---

## 📈 Táticas de Desempenho & Infraestrutura (VM200 / VM201)

- **Worker de Fundo**: Express processa heavy-loaders (Geração Múltipla) assincronamente sem bloquear event-loop.
- **Nginx Reverse Proxy**: Balanceamento de gZip, caching estático longo de assets Vite e distribuição HTTPS em VM200.
- **Gerenciamento PM2**: Daemon controlando a alocação dos CPUs threads da API Express (Modo Cluster).
- **PostgreSQL PgBouncer**: Pooler no VM201 previne sufocamento no número de open sockets pela API do Express sob demanda máxima.

---

## 🛠 CI/CD e Garantia de Qualidade

Rodamos GitHub Actions focado em validação severa:

```yaml
stages:
  - Database Services: [ Postgres, Redis ]
  - Backend Boot: Inicializa API (Node/Prisma) no port :8080 em bg ($!)
  - Frontend Build: `npm run build` do Vite testando syntax/tipagens.
  - E2E Playwright: Dispara workers em shards contra o Frontend servido com Backend vivo. Testa regras funcionais de login, crud agenda, pdv e falha ao exceder 30s de interatividade bloqueada.
```

---
*Documentação Técnica | OrthoPlus © 2026*
