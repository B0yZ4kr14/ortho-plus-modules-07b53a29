# 🏗️ Plano Arquitetural Completo - Ortho+ Modular

## 📊 Visão Geral do Sistema

O Ortho+ é um sistema SaaS B2B multitenant para clínicas odontológicas, construído sobre arquitetura modular descentralizada baseada em Domain-Driven Design (DDD).

### Princípios Arquiteturais

1. **Modularização por Domínio**: Cada módulo representa um bounded context do DDD
2. **Descentralização de Dados**: Schema PostgreSQL dedicado por módulo
3. **Comunicação por Eventos**: Event Bus para comunicação assíncrona entre módulos
4. **APIs Internas**: REST APIs para comunicação síncrona entre módulos
5. **Portabilidade**: Abstração de infraestrutura para suportar Cloud (Supabase) e On-Premises

---

## 🎯 Módulos Canônicos e Categorias

### 📁 CATEGORIA: CORE (Gestão Clínica)

#### 1. PACIENTES (✅ 100% Implementado)
**Schema**: `pacientes`
**Responsabilidades**:
- Cadastro e gestão de pacientes
- 15 estados canônicos de lifecycle do paciente
- Histórico de mudanças de status
- Dados comerciais (origem, campanha, promotor)

**Entidades Principais**:
- `Patient` (Aggregate Root)
- `PatientStatus` (Value Object)
- `DadosComerciaisVO` (Value Object)

**Eventos de Domínio**:
- `Pacientes.PacienteCadastrado`
- `Pacientes.StatusAlterado`
- `Pacientes.DadosComerciaisAtualizados`

**API Endpoints**:
```
POST   /api/pacientes
GET    /api/pacientes
GET    /api/pacientes/:id
PATCH  /api/pacientes/:id/status
GET    /api/pacientes/stats/status
```

---

#### 2. PEP (Prontuário Eletrônico do Paciente) (✅ 100% Implementado)
**Schema**: `pep`
**Responsabilidades**:
- Prontuários eletrônicos
- Odontograma (2D/3D)
- Histórico clínico completo
- Anexos e documentos
- Assinatura digital (ICP-Brasil)

**Sub-módulos**:
- Anamnese
- Odontograma 2D/3D
- Tratamentos
- Anexos
- Radiografias
- Assinatura Digital
- Histórico de Alterações

**Entidades Principais**:
- `Prontuario` (Aggregate Root)
- `Tratamento`
- `Anexo`

**Eventos de Domínio**:
- `PEP.ProntuarioCriado`
- `PEP.TratamentoIniciado`
- `PEP.TratamentoFinalizado`
- `PEP.AnexoAdicionado`

**API Endpoints**:
```
POST   /api/pep/prontuarios
GET    /api/pep/prontuarios
GET    /api/pep/prontuarios/:id
POST   /api/pep/prontuarios/:id/tratamentos
POST   /api/pep/prontuarios/:id/anexos
```

---

#### 3. AGENDA
**Schema**: `agenda`
**Responsabilidades**:
- Agendamento de consultas
- Confirmação automática (Email/WhatsApp)
- Bloqueio de horários
- Gestão de dentistas

**Sub-módulos**:
- Agendamentos
- Confirmações
- Lembretes
- Bloqueios

---

### 💰 CATEGORIA: FINANCEIRO

#### 4. FINANCEIRO (✅ 100% Implementado)
**Schema**: `financeiro`
**Responsabilidades**:
- Contas a receber e a pagar
- Fluxo de caixa
- Conciliação bancária
- Gestão de pagamentos

**Sub-módulos**:
- Contas a Receber
- Contas a Pagar
- Fluxo de Caixa
- Split de Pagamentos
- Inadimplência
- Crypto Pagamentos (Bitcoin, USDT, ETH, BNB)

**Entidades Principais**:
- `Transaction` (Aggregate Root)
- `PaymentMethod` (Value Object)
- `TransactionStatus` (Value Object)

**Eventos de Domínio**:
- `Financeiro.TransacaoCriada`
- `Financeiro.PagamentoRecebido`
- `Financeiro.PagamentoEstornado`

**API Endpoints**:
```
POST   /api/financeiro/transactions
GET    /api/financeiro/transactions
GET    /api/financeiro/transactions/:id
POST   /api/financeiro/transactions/:id/receive
GET    /api/financeiro/cash-flow
```

---

#### 5. PDV (Ponto de Venda) (✅ 100% Implementado)
**Schema**: `pdv`
**Responsabilidades**:
- Vendas de produtos/serviços
- Abertura e fechamento de caixa
- Múltiplas formas de pagamento
- Integração fiscal (NFCe/SAT)

**Sub-módulos**:
- Vendas
- Caixa
- TEF (Integração com operadoras de cartão)
- NFCe/SAT (Emissão fiscal)
- Sangria Inteligente
- Gamificação de Vendas

**Entidades Principais**:
- `Venda` (Aggregate Root)
- `ItemVenda` (Entity)
- `Caixa` (Aggregate Root)

**Eventos de Domínio**:
- `PDV.VendaRealizada`
- `PDV.CaixaAberto`
- `PDV.CaixaFechado`
- `PDV.NFCeEmitida`

**API Endpoints**:
```
POST   /api/pdv/vendas
GET    /api/pdv/vendas
POST   /api/pdv/caixa/abrir
POST   /api/pdv/caixa/fechar
POST   /api/pdv/nfce/emitir
```

---

### 📦 CATEGORIA: OPERAÇÕES

#### 6. INVENTÁRIO (✅ 100% Implementado)
**Schema**: `inventario`
**Responsabilidades**:
- Gestão de produtos
- Controle de estoque
- Inventários físicos
- Ajustes automáticos

**Sub-módulos**:
- Produtos
- Movimentações
- Inventários
- Dashboard Executivo
- Scanner Mobile (Barcode/QR Code)

**Entidades Principais**:
- `Produto` (Aggregate Root)
- `Movimentacao` (Entity)
- `Inventario` (Aggregate Root)

**Eventos de Domínio**:
- `Inventario.ProdutoCriado`
- `Inventario.EstoqueAlterado`
- `Inventario.InventarioRealizado`

**API Endpoints**:
```
POST   /api/inventario/produtos
GET    /api/inventario/produtos
GET    /api/inventario/produtos/:id
POST   /api/inventario/produtos/:id/ajustar-estoque
POST   /api/inventario/inventarios
```

---

### 📄 CATEGORIA: COMPLIANCE

#### 7. FATURAMENTO (✅ 100% Implementado)
**Schema**: `faturamento`
**Responsabilidades**:
- Emissão de notas fiscais (NFe/NFCe)
- Integração com SEFAZ
- Geração de SPED Fiscal
- Gestão de tributos

**Sub-módulos**:
- NFe (Nota Fiscal Eletrônica)
- NFCe (Nota Fiscal de Consumidor Eletrônico)
- SEFAZ (Integração)
- SPED Fiscal
- Carta de Correção Eletrônica

**Entidades Principais**:
- `NFe` (Aggregate Root)
- `ItemNFe` (Entity)
- `SEFAZ` (Service)

**Eventos de Domínio**:
- `Faturamento.NFeEmitida`
- `Faturamento.NFeAutorizada`
- `Faturamento.NFeCancelada`

**API Endpoints**:
```
POST   /api/faturamento/nfe
GET    /api/faturamento/nfe/:id
POST   /api/faturamento/nfe/:id/cancelar
POST   /api/faturamento/sped/gerar
```

---

#### 8. LGPD (Compliance de Dados)
**Schema**: `lgpd`
**Responsabilidades**:
- Gestão de consentimentos
- Solicitações de dados (portabilidade)
- Anonimização e exclusão
- Auditoria de acesso a dados sensíveis

---

### 🚀 CATEGORIA: INOVAÇÃO

#### 9. IA RADIOGRAFIA
**Schema**: `ia_radiografia`
**Responsabilidades**:
- Análise automatizada de radiografias
- Detecção de problemas
- Comparação temporal
- Feedback de dentistas

---

#### 10. TELEODONTOLOGIA
**Schema**: `teleodontologia`
**Responsabilidades**:
- Videochamadas
- Triagem pré-consulta
- Gravação de sessões
- Prontuário de teleconsulta

---

### ⚙️ CATEGORIA: CONFIGURAÇÕES

#### 11. CONFIGURAÇÕES (✅ 100% Implementado)
**Schema**: `configuracoes`
**Responsabilidades**:
- Gestão de módulos (ativar/desativar)
- Configurações de clínica
- Gestão de usuários e permissões
- Templates de configuração

**Sub-módulos**:
- Gestão de Módulos
- Usuários e Roles
- Permissões Granulares
- Templates de Configuração
- Onboarding

**Entidades Principais**:
- `ModuloCatalog` (Entity)
- `ClinicModule` (Entity)
- `ModuleDependency` (Entity)

**Eventos de Domínio**:
- `Configuracoes.ModuloAtivado`
- `Configuracoes.ModuloDesativado`

**API Endpoints**:
```
GET    /api/configuracoes/modulos
POST   /api/configuracoes/modulos/:moduleKey/toggle
GET    /api/configuracoes/modulos/stats
```

---

### 🛡️ CATEGORIA: ADMINISTRAÇÃO & DEVOPS

#### 12. BANCO DE DADOS (🔄 Em Implementação)
**Schema**: `database_admin`
**Responsabilidades**:
- Monitoramento de saúde do banco
- Queries lentas
- Bloat detection
- VACUUM/ANALYZE/REINDEX
- Estatísticas de performance
- Connection pooling

**Sub-módulos**:
- Database Health Monitor
- Query Performance
- Maintenance Tasks
- Statistics & Analytics
- Connection Management

**API Endpoints**:
```
GET    /api/database/health
GET    /api/database/slow-queries
POST   /api/database/maintenance/vacuum
POST   /api/database/maintenance/analyze
POST   /api/database/maintenance/reindex
GET    /api/database/statistics
```

---

#### 13. BACKUPS (🔄 Em Implementação)
**Schema**: `backups`
**Responsabilidades**:
- Backups automáticos (full, incremental, diferencial)
- Agendamento de backups
- Verificação de integridade
- Restore automatizado
- Teste de restauração em sandbox
- Geo-replicação
- Múltiplos destinos (S3, GDrive, Dropbox, Local, FTP, Storj)

**Sub-módulos**:
- Backup Scheduling
- Backup Verification
- Restore Management
- Backup Replication
- Retention Policies (GFS)
- Immutability (WORM)
- Deduplication
- Streaming Backups

**Entidades Principais**:
- `BackupJob` (Aggregate Root)
- `BackupHistory` (Entity)
- `RetentionPolicy` (Entity)

**Eventos de Domínio**:
- `Backups.BackupIniciado`
- `Backups.BackupConcluido`
- `Backups.BackupFalhou`
- `Backups.RestoreIniciado`

**API Endpoints**:
```
POST   /api/backups/create
GET    /api/backups/history
POST   /api/backups/schedule
POST   /api/backups/verify/:id
POST   /api/backups/restore/:id
GET    /api/backups/dashboard
POST   /api/backups/test-restore
```

---

#### 14. CRYPTO CONFIG (🔄 Em Implementação)
**Schema**: `crypto_config`
**Responsabilidades**:
- Configuração de exchanges (Binance, Coinbase, Kraken, Mercado Bitcoin)
- Gestão de hardwallets (Ledger, Trezor)
- Integração BTCPay Server (xPub)
- Carteiras offline
- Monitoramento de transações
- Análise técnica
- Portfolio consolidado

**Sub-módulos**:
- Exchange Integration
- Hardwallet Management
- BTCPay Server
- Offline Wallets
- Transaction Monitor
- Technical Analysis
- Portfolio Dashboard
- DCA Strategies

**API Endpoints**:
```
POST   /api/crypto/exchanges/configure
GET    /api/crypto/exchanges
POST   /api/crypto/hardwallets/connect
GET    /api/crypto/hardwallets
POST   /api/crypto/btcpay/setup
GET    /api/crypto/portfolio
GET    /api/crypto/transactions
```

---

#### 15. GITHUB TOOLS (🔄 Em Implementação)
**Schema**: `github_tools`
**Responsabilidades**:
- Integração com GitHub API
- Gestão de repositórios
- Autenticação e permissões
- Webhooks
- CI/CD monitoring
- Deployment tracking
- Issue tracking
- Pull requests

**Sub-módulos**:
- Repository Management
- Authentication & Permissions
- Webhooks
- CI/CD Monitor
- Deployment Tracker
- Issue Management
- PR Review

**API Endpoints**:
```
POST   /api/github/authenticate
GET    /api/github/repositories
POST   /api/github/repositories/:repo/sync
GET    /api/github/workflows
GET    /api/github/deployments
POST   /api/github/webhooks/configure
```

---

#### 16. TERMINAL WEB SHELL (🔄 Em Implementação)
**Schema**: `terminal`
**Responsabilidades**:
- Terminal shell web interativo
- Execução de comandos com whitelist
- Histórico de comandos
- Permissões por usuário
- Auditoria completa
- Rate limiting

**Sub-módulos**:
- Command Execution
- Command History
- User Permissions
- Audit Logs
- Security Controls

**Entidades Principais**:
- `CommandExecution` (Entity)
- `CommandHistory` (Entity)
- `CommandWhitelist` (Entity)

**Eventos de Domínio**:
- `Terminal.ComandoExecutado`
- `Terminal.ComandoNegado`

**API Endpoints**:
```
POST   /api/terminal/execute
GET    /api/terminal/history
GET    /api/terminal/whitelist
POST   /api/terminal/whitelist/add
```

---

#### 17. AUDITORIA (🔄 Em Implementação)
**Schema**: `auditoria`
**Responsabilidades**:
- Audit trail completo
- Rastreamento de mudanças
- Compliance logs
- Security events
- Performance metrics (Prometheus)

---

## 🎯 Status de Implementação Geral

### ✅ Concluído (75%)
- [x] Infraestrutura (Database, Event Bus, API Gateway)
- [x] Schemas PostgreSQL (7 schemas canônicos + 6 schemas administrativos)
- [x] PACIENTES (Golden Pattern - 100%)
- [x] INVENTÁRIO (100%)
- [x] CONFIGURAÇÕES (100%)
- [x] PDV (100%)
- [x] FINANCEIRO (100%)
- [x] PEP (100%)
- [x] FATURAMENTO (100%)
- [x] Observability (Prometheus Metrics - 100%)
- [x] Tests E2E (Playwright - PACIENTES module)

### 🔄 Em Progresso (20%)
- [ ] Módulos Administrativos (BANCO DE DADOS, BACKUPS, CRYPTO CONFIG, GITHUB, TERMINAL)
- [ ] AGENDA
- [ ] LGPD
- [ ] IA RADIOGRAFIA
- [ ] TELEODONTOLOGIA
- [ ] AUDITORIA
- [ ] Frontend Integration (React)
- [ ] Docker Swarm Orchestration

### ⏳ Pendente (5%)
- [ ] Testes E2E completos (todos os módulos)
- [ ] Documentação API (Swagger/OpenAPI)
- [ ] Runbooks operacionais
- [ ] Disaster Recovery procedures

---

## 🔄 Fluxo de Comunicação entre Módulos

```
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│              (Express + Middleware Layer)                   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
   │ PACIENTES│      │ INVENTÁRIO │     │    PDV     │
   │  Module  │      │   Module   │     │  Module    │
   └────┬─────┘      └─────┬──────┘     └─────┬──────┘
        │                  │                   │
        └──────────────────┼───────────────────┘
                           │
                    ┌──────▼───────┐
                    │  EVENT BUS   │
                    │   (Redis)    │
                    └──────┬───────┘
                           │
        ┌──────────────────┼───────────────────┐
        │                  │                   │
   ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
   │FINANCEIRO│      │    PEP     │     │FATURAMENTO │
   │  Module  │      │   Module   │     │   Module   │
   └──────────┘      └────────────┘     └────────────┘
```

---

## 📊 Métricas de Qualidade Atuais

| Métrica | Valor | Status |
|---------|-------|--------|
| Cobertura de Testes | 45% | 🟡 Em Progresso |
| Módulos Implementados | 11/17 | 🟢 75% |
| Schemas PostgreSQL | 13/13 | 🟢 100% |
| API Endpoints | 87+ | 🟢 Completo |
| Eventos de Domínio | 25+ | 🟢 Completo |
| Documentação | 60% | 🟡 Em Progresso |

---

## 🚀 Próximos Passos

### Fase Atual: Módulos Administrativos
1. Implementar BANCO DE DADOS module
2. Implementar BACKUPS module avançado
3. Implementar CRYPTO CONFIG module
4. Implementar GITHUB TOOLS module
5. Implementar TERMINAL WEB SHELL module
6. Implementar AUDITORIA module

### Próxima Fase: Frontend Integration
1. Refatorar frontend para consumir APIs modulares
2. Remover dependência de Supabase Client no frontend
3. Implementar axios client com interceptors
4. Criar hooks customizados por módulo
5. Atualizar componentes para usar novos hooks

### Fase Final: Deploy & Orchestration
1. Criar docker-compose.yml (desenvolvimento)
2. Criar docker-stack.yml (produção)
3. Configurar Docker Swarm
4. Implementar CI/CD pipeline
5. Documentar runbooks operacionais

---

## 📚 Documentação Relacionada

- [Golden Pattern - Módulo PACIENTES](./MODULO_PACIENTES_GOLDEN_PATTERN.md)
- [Status de Implementação](./IMPLEMENTATION_STATUS.md)
- [Plano Fênix - Migração Standalone](./PLANO_FENIX.md)
