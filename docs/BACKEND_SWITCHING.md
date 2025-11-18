# Backend Switching Guide - Ortho+ V5.2

## Overview

O sistema Ortho+ implementa abstração completa de backend, permitindo alternar dinamicamente entre **Supabase Cloud** e **PostgreSQL (Ubuntu Server Local)** sem reload da aplicação.

## Arquitetura

### Camada de Abstração

```
┌─────────────────────────────────────────┐
│         Frontend Components             │
│  (React Components, Hooks, Pages)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       BackendProvider (Context)         │
│   • useBackend() hook                   │
│   • switchBackend(type)                 │
│   • backendType, isReady                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      IBackendService Interface          │
│   • auth: IAuthService                  │
│   • data: IDataService                  │
│   • storage: IStorageService            │
│   • functions: IFunctionsService        │
└─────────────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌──────────────────┐  ┌────────────────────┐
│ SupabaseBackend  │  │ PostgreSQLBackend  │
│   Service        │  │     Service        │
└──────────────────┘  └────────────────────┘
```

### Componentes Principais

1. **`BackendProvider`** (`src/lib/providers/BackendProvider.tsx`)
   - Context que gerencia o backend ativo
   - Permite switching dinâmico via `switchBackend(type)`
   - Persiste escolha no `localStorage`

2. **`IBackendService`** (`src/infrastructure/backend/IBackendService.ts`)
   - Interface unificada para todos os backends
   - Define contratos para Auth, Data, Storage e Functions

3. **Implementações:**
   - `SupabaseBackendService.ts` - Backend Supabase Cloud
   - `PostgreSQLBackendService.ts` - Backend PostgreSQL local

4. **UI Component:**
   - `BackendSelector` (`src/components/settings/BackendSelector.tsx`)
   - Interface visual para alternar backends
   - Exibe status (online/offline) e latência

## Como Usar

### 1. Envolver App com BackendProvider

```tsx
// src/App.tsx
import { BackendProvider } from '@/lib/providers/BackendProvider';

function App() {
  return (
    <BackendProvider>
      {/* Resto da aplicação */}
    </BackendProvider>
  );
}
```

### 2. Usar Hook useBackend() nos Componentes

```tsx
import { useBackend } from '@/lib/providers/BackendProvider';

function MyComponent() {
  const { backend, backendType, isReady, switchBackend } = useBackend();

  // Usar serviços abstraídos
  const fetchData = async () => {
    const { data, error } = await backend.data.query('patients');
    // ...
  };

  // Trocar backend dinamicamente
  const handleSwitchToLocal = async () => {
    try {
      await switchBackend('ubuntu-server');
      toast.success('Switched to Ubuntu Server successfully!');
    } catch (error) {
      toast.error('Failed to switch backend');
    }
  };

  return (
    <div>
      <p>Current: {backendType} - Ready: {isReady ? 'Yes' : 'No'}</p>
      <Button onClick={handleSwitchToLocal}>Switch to Local</Button>
    </div>
  );
}
```

### 3. Acessar via UI (Configurações)

Navegue para:
```
Configurações → Administração → Seletor de Backend
```

Lá você pode:
- Ver status de conexão (Online/Offline)
- Ver latência de cada backend
- Alternar entre Supabase e Ubuntu Server com um clique

## Configuração

### Variáveis de Ambiente

```env
# Backend padrão (se não houver escolha no localStorage)
VITE_BACKEND_TYPE=supabase  # ou 'ubuntu-server'

# Supabase (Cloud)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# PostgreSQL (Ubuntu Server)
VITE_POSTGRESQL_HOST=192.168.1.100
VITE_POSTGRESQL_PORT=5432
VITE_POSTGRESQL_DATABASE=orthoplus
VITE_POSTGRESQL_USER=orthoplus_user
VITE_POSTGRESQL_PASSWORD=secure_password
```

### Prioridade de Seleção

1. **localStorage** (`selected_backend`) - Escolha do usuário via UI
2. **Variável de ambiente** (`VITE_BACKEND_TYPE`)
3. **Default:** `supabase`

## Benefícios

### 🔒 Segurança e Compliance
- Dados sensíveis podem ficar 100% on-premises (PostgreSQL local)
- Atende requisitos de LGPD e compliance corporativo

### 🚀 Performance
- Backend local reduz latência para operações críticas
- Supabase Cloud oferece escalabilidade global

### 🔄 Flexibilidade
- Switching em tempo real sem downtime
- Testável: desenvolvedores podem usar Supabase, produção pode usar PostgreSQL

### 💾 Backup e Disaster Recovery
- Dual-mode: dados podem ser sincronizados entre backends
- Failover automático (futuro): se Supabase cair, switch para PostgreSQL local

## Limitações Atuais

- Realtime subscriptions são Supabase-only (PostgreSQL usa polling)
- Edge Functions não funcionam em PostgreSQL local (usar API Gateway Node.js)
- Storage público requer configuração adicional em PostgreSQL (MinIO)

## Roadmap

### V5.3 (Próxima versão)
- [ ] Sincronização bidirecional automática
- [ ] Failover automático com health checks
- [ ] Support para múltiplos PostgreSQL backends (multi-region)
- [ ] Interface de migração de dados Supabase → PostgreSQL

### V5.4
- [ ] Suporte para MySQL/MariaDB
- [ ] Backend híbrido (auth no Supabase, data no PostgreSQL)
- [ ] Compression de dados em trânsito para backends remotos

## Troubleshooting

### Backend não está "Ready"

```bash
# Verificar conectividade
ping <POSTGRESQL_HOST>
telnet <POSTGRESQL_HOST> 5432

# Verificar credenciais PostgreSQL
psql -h <HOST> -U <USER> -d <DATABASE>
```

### Latência alta no Ubuntu Server

- Verificar firewall
- Usar conexão de rede local (LAN) ao invés de WAN
- Otimizar queries com índices

### Erros de autenticação

- Supabase: Verificar `SUPABASE_ANON_KEY` em `.env`
- PostgreSQL: Verificar permissões do usuário no banco

## Suporte

Para issues relacionados a backend switching:
1. Verificar logs do navegador (F12 → Console)
2. Procurar por `[BackendProvider]` nos logs
3. Reportar no GitHub com logs completos
