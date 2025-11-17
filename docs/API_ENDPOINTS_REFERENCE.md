# 🔌 REFERÊNCIA DE ENDPOINTS DA API - ORTHO+ v2.0

**Base URL**: `http://localhost:3000/api`  
**Autenticação**: JWT Bearer Token (exceto rotas de auth)

---

## 🔐 AUTENTICAÇÃO

### POST /api/auth/register
Registrar novo usuário.

**Body**:
```json
{
  "email": "admin@clinic.com",
  "password": "senha123",
  "fullName": "Dr. João Silva",
  "role": "ADMIN",
  "clinicId": "uuid"
}
```

**Response 201**:
```json
{
  "user": { "id": "uuid", "email": "...", "role": "ADMIN" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login
Fazer login.

**Body**:
```json
{
  "email": "admin@clinic.com",
  "password": "senha123"
}
```

**Response 200**:
```json
{
  "user": { "id": "uuid", "email": "...", "role": "ADMIN" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 PACIENTES

### POST /api/pacientes
Cadastrar novo paciente.

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "nome": "Maria Silva",
  "cpf": "12345678900",
  "dataNascimento": "1990-05-15",
  "telefone": "(11) 98765-4321",
  "email": "maria@email.com",
  "endereco": {
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  }
}
```

**Response 201**:
```json
{
  "patient": {
    "id": "uuid",
    "nome": "Maria Silva",
    "status": "ATIVO",
    "createdAt": "2025-01-17T10:00:00Z"
  }
}
```

### GET /api/pacientes
Listar todos os pacientes da clínica.

**Headers**: `Authorization: Bearer <token>`

**Query Params**:
- `status` (opcional): filtrar por status
- `page` (opcional): página (default: 1)
- `limit` (opcional): itens por página (default: 20)

**Response 200**:
```json
{
  "patients": [
    { "id": "uuid", "nome": "Maria Silva", "status": "ATIVO" },
    { "id": "uuid", "nome": "João Santos", "status": "EM_TRATAMENTO" }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 3
}
```

### GET /api/pacientes/:id
Obter detalhes de um paciente específico.

### PATCH /api/pacientes/:id/status
Alterar status do paciente.

**Body**:
```json
{
  "newStatus": "EM_TRATAMENTO",
  "reason": "Iniciou tratamento ortodôntico"
}
```

---

## 📦 INVENTÁRIO

### POST /api/inventario/produtos
Cadastrar novo produto.

**Body**:
```json
{
  "nome": "Resina Composta A2",
  "codigoBarras": "7891234567890",
  "categoria": "MATERIAL",
  "precoCompra": 85.50,
  "precoVenda": 120.00,
  "quantidadeMinima": 5,
  "quantidadeAtual": 20,
  "unidadeMedida": "UNIDADE"
}
```

### GET /api/inventario/produtos
Listar produtos.

### PATCH /api/inventario/produtos/:id/estoque
Ajustar estoque.

**Body**:
```json
{
  "quantidade": 10,
  "tipo": "ENTRADA",
  "motivo": "Compra de fornecedor"
}
```

---

## 💰 PDV

### POST /api/pdv/vendas
Registrar venda.

**Body**:
```json
{
  "items": [
    { "produtoId": "uuid", "quantidade": 2, "precoUnitario": 50.00 },
    { "produtoId": "uuid", "quantidade": 1, "precoUnitario": 120.00 }
  ],
  "formaPagamento": "CARTAO_CREDITO",
  "vendedorId": "uuid"
}
```

### GET /api/pdv/vendas
Listar vendas.

### POST /api/pdv/fechar-caixa
Fechar caixa do dia.

**Body**:
```json
{
  "valorFechamento": 1250.75,
  "observacoes": "Fechamento dia 17/01"
}
```

---

## 💵 FINANCEIRO

### POST /api/financeiro/transactions
Criar transação financeira.

**Body**:
```json
{
  "type": "RECEITA",
  "amount": 500.00,
  "description": "Consulta ortodôntica",
  "categoryId": "uuid",
  "dueDate": "2025-01-20",
  "paymentMethod": "PIX"
}
```

### GET /api/financeiro/transactions
Listar transações.

**Query Params**:
- `type`: RECEITA ou DESPESA
- `status`: PENDENTE, PAGO, VENCIDO
- `startDate`, `endDate`: período

### GET /api/financeiro/cash-flow
Obter fluxo de caixa.

**Response 200**:
```json
{
  "totalReceitas": 15000.00,
  "totalDespesas": 8000.00,
  "saldo": 7000.00,
  "period": { "start": "2025-01-01", "end": "2025-01-31" }
}
```

### PATCH /api/financeiro/transactions/:id/pay
Marcar transação como paga.

---

## 📄 PEP (Prontuário Eletrônico)

### POST /api/pep/prontuarios
Criar prontuário.

**Body**:
```json
{
  "pacienteId": "uuid",
  "anamnese": {
    "queixaPrincipal": "Dor de dente",
    "historicoMedico": "Hipertensão controlada",
    "alergias": ["Penicilina"]
  }
}
```

### GET /api/pep/prontuarios/:id
Obter prontuário completo.

### POST /api/pep/evolucoes
Adicionar evolução ao prontuário.

**Body**:
```json
{
  "prontuarioId": "uuid",
  "descricao": "Sessão de clareamento realizada",
  "procedimentos": ["Clareamento dental"],
  "proximaConsulta": "2025-02-15"
}
```

### POST /api/pep/assinar
Assinar prontuário digitalmente.

**Body**:
```json
{
  "prontuarioId": "uuid",
  "senha": "senha_assinatura"
}
```

---

## 🧾 FATURAMENTO

### POST /api/faturamento/nfes
Emitir NFe (Nota Fiscal Eletrônica).

**Body**:
```json
{
  "pacienteId": "uuid",
  "items": [
    { "descricao": "Consulta", "valor": 150.00 },
    { "descricao": "Radiografia", "valor": 80.00 }
  ],
  "total": 230.00
}
```

### GET /api/faturamento/nfes/:id
Obter NFe específica.

### POST /api/faturamento/autorizar
Autorizar NFe na SEFAZ.

**Body**:
```json
{
  "nfeId": "uuid"
}
```

### POST /api/faturamento/cancelar
Cancelar NFe autorizada.

**Body**:
```json
{
  "nfeId": "uuid",
  "motivo": "Erro no cadastro"
}
```

---

## ⚙️ CONFIGURAÇÕES

### GET /api/configuracoes/modulos
Listar todos os módulos disponíveis.

**Response 200**:
```json
{
  "modules": [
    {
      "id": 1,
      "module_key": "FINANCEIRO",
      "name": "Módulo Financeiro",
      "category": "Financeiro",
      "is_active": true,
      "dependencies": ["PACIENTES"]
    }
  ]
}
```

### POST /api/configuracoes/modulos/:id/toggle
Ativar ou desativar módulo.

**Response 200**:
```json
{
  "module": { "module_key": "FINANCEIRO", "is_active": false },
  "message": "Módulo desativado com sucesso"
}
```

### GET /api/configuracoes/modulos/dependencies
Obter mapa de dependências entre módulos.

---

## 🗄️ DATABASE_ADMIN (ADMIN ONLY)

### GET /api/database-admin/health
Verificar saúde do banco de dados.

**Response 200**:
```json
{
  "health": {
    "connectionPoolSize": 20,
    "activeConnections": 8,
    "slowQueriesCount": 3,
    "diskUsagePercent": 65
  },
  "isHealthy": true,
  "needsMaintenance": false
}
```

### GET /api/database-admin/slow-queries
Listar queries lentas.

**Response 200**:
```json
{
  "slowQueries": [
    {
      "query": "SELECT * FROM pacientes...",
      "calls": 1250,
      "averageTime": 125.5,
      "totalTime": 156875
    }
  ]
}
```

### POST /api/database-admin/maintenance
Executar manutenção do banco.

**Body**:
```json
{
  "operation": "VACUUM",
  "targetSchema": "pacientes"
}
```

### GET /api/database-admin/connection-pool
Obter estatísticas do pool de conexões.

---

## 💾 BACKUPS (ADMIN ONLY)

### GET /api/backups
Listar todos os backups.

**Response 200**:
```json
{
  "backups": [
    {
      "id": "uuid",
      "type": "FULL",
      "destination": "S3",
      "status": "COMPLETED",
      "sizeBytes": 524288000,
      "completedAt": "2025-01-17T03:00:00Z"
    }
  ]
}
```

### POST /api/backups
Criar novo backup.

**Body**:
```json
{
  "type": "INCREMENTAL",
  "destination": "S3",
  "retentionDays": 30,
  "isEncrypted": true
}
```

### GET /api/backups/statistics
Obter estatísticas de backups.

**Response 200**:
```json
{
  "stats": {
    "totalBackups": 45,
    "successRate": 97.8,
    "averageSizeMB": 350,
    "totalStorageUsedGB": 15.75
  }
}
```

### POST /api/backups/:backupId/verify
Verificar integridade do backup.

---

## 💎 CRYPTO_CONFIG (ADMIN ONLY)

### GET /api/crypto-config/exchanges
Listar exchanges configuradas.

**Response 200**:
```json
{
  "exchanges": [
    {
      "id": "uuid",
      "exchangeType": "BINANCE",
      "isActive": true,
      "lastSyncAt": "2025-01-17T10:00:00Z"
    }
  ]
}
```

### POST /api/crypto-config/exchanges
Conectar nova exchange.

**Body**:
```json
{
  "exchangeType": "BINANCE",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret"
}
```

### GET /api/crypto-config/portfolio
Obter portfolio consolidado.

**Response 200**:
```json
{
  "portfolio": {
    "totalValueUSD": 15250.75,
    "assets": [
      { "symbol": "BTC", "amount": 0.5, "valueUSD": 13000.0 },
      { "symbol": "ETH", "amount": 2.5, "valueUSD": 2000.5 }
    ]
  }
}
```

### GET /api/crypto-config/dca-strategies
Listar estratégias DCA ativas.

---

## 🔧 GITHUB_TOOLS (ADMIN ONLY)

### GET /api/github-tools/repositories
Listar repositórios conectados.

### POST /api/github-tools/repositories
Conectar repositório GitHub.

**Body**:
```json
{
  "repoName": "ortho-plus-main",
  "repoUrl": "https://github.com/clinic/ortho-plus",
  "accessToken": "ghp_xxxxxxxxxxxxx",
  "defaultBranch": "main"
}
```

### GET /api/github-tools/repositories/:repoId/branches
Listar branches do repositório.

### GET /api/github-tools/repositories/:repoId/pull-requests
Listar Pull Requests.

### GET /api/github-tools/repositories/:repoId/workflows
Listar workflows CI/CD.

---

## 💻 TERMINAL (ADMIN ONLY)

### POST /api/terminal/sessions
Criar sessão de terminal.

**Response 201**:
```json
{
  "session": {
    "id": "uuid",
    "status": "ACTIVE",
    "startedAt": "2025-01-17T10:00:00Z"
  }
}
```

### POST /api/terminal/execute
Executar comando.

**Body**:
```json
{
  "sessionId": "uuid",
  "command": "ls -la"
}
```

**Response 200**:
```json
{
  "output": {
    "command": "ls -la",
    "stdout": "total 48\ndrwxr-xr-x ...",
    "exitCode": 0
  }
}
```

**Response 403** (comando não permitido):
```json
{
  "error": "Comando não permitido",
  "allowedCommands": ["ls", "pwd", "cat", "grep", ...]
}
```

### GET /api/terminal/sessions/:sessionId/history
Obter histórico de comandos da sessão.

### DELETE /api/terminal/sessions/:sessionId
Encerrar sessão de terminal.

---

## 📊 OBSERVABILIDADE

### GET /metrics
Obter métricas do Prometheus.

**Response 200** (formato Prometheus):
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/pacientes",status="200"} 1542

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 1200
...
```

---

## ⚠️ CÓDIGOS DE ERRO

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Permissão negada |
| 404 | Not Found - Recurso não encontrado |
| 412 | Precondition Failed - Dependências não atendidas |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro do servidor |

---

**API Ortho+ v2.0** - 13 módulos, 80+ endpoints 🚀
