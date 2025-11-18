# API Reference - Ortho+ V5.2

## Visão Geral

Esta documentação descreve todas as APIs REST disponíveis no backend Node.js do Ortho+ V5.2, organizadas por módulo seguindo Domain-Driven Design (DDD).

## Índice

1. [Autenticação](#autenticação)
2. [Módulo Pacientes](#módulo-pacientes)
3. [Módulo PEP](#módulo-pep)
4. [Módulo Financeiro](#módulo-financeiro)
5. [Módulo PDV](#módulo-pdv)
6. [Módulo Inventário](#módulo-inventário)
7. [Módulo Faturamento](#módulo-faturamento)
8. [Módulo Configurações](#módulo-configurações)
9. [Erros Comuns](#erros-comuns)

---

## Autenticação

Todas as requisições (exceto login) requerem JWT token no header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### POST `/api/auth/login`

Autentica usuário e retorna JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "role": "ADMIN"
  }
}
```

### POST `/api/auth/logout`

Invalida token JWT.

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## Módulo Pacientes

Base URL: `/api/pacientes`

### GET `/api/pacientes`

Lista todos os pacientes da clínica.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Itens por página (default: 20)
- `search` (string): Busca por nome/CPF
- `status` (string): Filtro por status

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Maria Santos",
      "cpf": "123.456.789-00",
      "email": "maria@example.com",
      "phone": "(11) 99999-9999",
      "birthDate": "1990-05-15",
      "status": "ATIVO",
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### POST `/api/pacientes`

Cadastra novo paciente.

**Request:**
```json
{
  "name": "João Silva",
  "cpf": "987.654.321-00",
  "email": "joao@example.com",
  "phone": "(11) 88888-8888",
  "birthDate": "1985-03-20",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apt 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "cpf": "987.654.321-00",
  "status": "ATIVO",
  "createdAt": "2025-01-18T14:30:00Z"
}
```

### GET `/api/pacientes/:id`

Retorna detalhes de um paciente específico.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "cpf": "987.654.321-00",
  "email": "joao@example.com",
  "phone": "(11) 88888-8888",
  "birthDate": "1985-03-20",
  "status": "ATIVO",
  "dadosComerciaisVO": {
    "leadSource": "INDICACAO",
    "firstContactDate": "2025-01-15",
    "conversionDate": "2025-01-16"
  }
}
```

### PUT `/api/pacientes/:id`

Atualiza dados de um paciente.

**Request:**
```json
{
  "phone": "(11) 77777-7777",
  "email": "novo.email@example.com"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "phone": "(11) 77777-7777",
  "email": "novo.email@example.com",
  "updatedAt": "2025-01-18T15:00:00Z"
}
```

### DELETE `/api/pacientes/:id`

Remove um paciente (soft delete).

**Response (200):**
```json
{
  "message": "Paciente removido com sucesso"
}
```

---

## Módulo PEP

Base URL: `/api/pep`

### GET `/api/pep/prontuarios`

Lista prontuários eletrônicos.

**Query Parameters:**
- `patientId` (uuid): Filtrar por paciente
- `page` (number): Página
- `limit` (number): Itens por página

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "patientName": "Maria Santos",
      "createdAt": "2025-01-10T09:00:00Z",
      "lastUpdated": "2025-01-15T14:30:00Z",
      "status": "EM_ANDAMENTO"
    }
  ]
}
```

### POST `/api/pep/prontuarios`

Cria novo prontuário eletrônico.

**Request:**
```json
{
  "patientId": "uuid",
  "anamnese": {
    "queixaPrincipal": "Dor no dente 16",
    "historiaDoenca": "Dor há 3 dias...",
    "alergias": ["Penicilina"],
    "medicamentosUso": ["Ibuprofeno 600mg"]
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "createdAt": "2025-01-18T16:00:00Z"
}
```

### POST `/api/pep/odontograma`

Registra procedimento no odontograma.

**Request:**
```json
{
  "prontuarioId": "uuid",
  "dente": "16",
  "face": "OCLUSAL",
  "procedimento": "RESTAURACAO",
  "material": "RESINA_COMPOSTA",
  "observacoes": "Cavidade classe I"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "prontuarioId": "uuid",
  "dente": "16",
  "createdAt": "2025-01-18T16:15:00Z"
}
```

---

## Módulo Financeiro

Base URL: `/api/financeiro`

### GET `/api/financeiro/transacoes`

Lista transações financeiras.

**Query Parameters:**
- `startDate` (date): Data inicial
- `endDate` (date): Data final
- `type` (string): RECEITA | DESPESA
- `status` (string): PAGO | PENDENTE | ATRASADO

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "RECEITA",
      "description": "Consulta - Maria Santos",
      "amount": 250.00,
      "dueDate": "2025-01-20",
      "status": "PENDENTE",
      "category": "CONSULTA"
    }
  ],
  "summary": {
    "totalReceitas": 15000.00,
    "totalDespesas": 5000.00,
    "saldo": 10000.00
  }
}
```

### POST `/api/financeiro/transacoes`

Cria nova transação financeira.

**Request:**
```json
{
  "type": "RECEITA",
  "description": "Tratamento ortodôntico - João Silva",
  "amount": 5000.00,
  "dueDate": "2025-02-01",
  "category": "TRATAMENTO",
  "patientId": "uuid",
  "installments": 10
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "type": "RECEITA",
  "amount": 5000.00,
  "installments": [
    {
      "number": 1,
      "amount": 500.00,
      "dueDate": "2025-02-01",
      "status": "PENDENTE"
    }
  ]
}
```

### POST `/api/financeiro/pagamentos`

Registra pagamento de transação.

**Request:**
```json
{
  "transactionId": "uuid",
  "amount": 250.00,
  "paymentMethod": "CARTAO_CREDITO",
  "paidAt": "2025-01-18T17:00:00Z",
  "notes": "Pagamento via TEF"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "transactionId": "uuid",
  "amount": 250.00,
  "status": "PAGO",
  "paidAt": "2025-01-18T17:00:00Z"
}
```

---

## Módulo PDV

Base URL: `/api/pdv`

### POST `/api/pdv/caixa/abrir`

Abre caixa para operação.

**Request:**
```json
{
  "userId": "uuid",
  "valorInicial": 200.00
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "abertoEm": "2025-01-18T08:00:00Z",
  "valorInicial": 200.00,
  "status": "ABERTO"
}
```

### POST `/api/pdv/vendas`

Registra venda no PDV.

**Request:**
```json
{
  "caixaId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 50.00
    }
  ],
  "paymentMethod": "PIX",
  "customerId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "total": 100.00,
  "paymentMethod": "PIX",
  "nfceNumber": "000001",
  "createdAt": "2025-01-18T10:30:00Z"
}
```

### POST `/api/pdv/caixa/fechar`

Fecha caixa e gera relatório.

**Request:**
```json
{
  "caixaId": "uuid",
  "valorFinal": 1450.00,
  "observacoes": "Tudo OK"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "fechadoEm": "2025-01-18T18:00:00Z",
  "valorInicial": 200.00,
  "valorFinal": 1450.00,
  "diferenca": 0.00,
  "totalVendas": 1250.00
}
```

---

## Módulo Inventário

Base URL: `/api/inventario`

### GET `/api/inventario/produtos`

Lista produtos do estoque.

**Query Parameters:**
- `category` (string): Filtro por categoria
- `lowStock` (boolean): Apenas produtos com estoque baixo

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Luva de Procedimento",
      "sku": "LUV-001",
      "category": "EPI",
      "quantity": 500,
      "minStock": 100,
      "unitPrice": 2.50,
      "supplier": "Fornecedor ABC"
    }
  ]
}
```

### POST `/api/inventario/produtos`

Cadastra novo produto.

**Request:**
```json
{
  "name": "Máscara Cirúrgica",
  "sku": "MSC-001",
  "category": "EPI",
  "quantity": 1000,
  "minStock": 200,
  "unitPrice": 1.50,
  "supplier": "Fornecedor XYZ"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Máscara Cirúrgica",
  "sku": "MSC-001",
  "createdAt": "2025-01-18T19:00:00Z"
}
```

### POST `/api/inventario/movimentacoes`

Registra movimentação de estoque.

**Request:**
```json
{
  "productId": "uuid",
  "type": "SAIDA",
  "quantity": 50,
  "reason": "USO_CLINICO",
  "userId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "type": "SAIDA",
  "quantity": 50,
  "newStock": 450,
  "createdAt": "2025-01-18T19:15:00Z"
}
```

---

## Módulo Faturamento

Base URL: `/api/faturamento`

### POST `/api/faturamento/nfe`

Emite Nota Fiscal Eletrônica.

**Request:**
```json
{
  "customerId": "uuid",
  "items": [
    {
      "description": "Consulta Odontológica",
      "quantity": 1,
      "unitPrice": 250.00,
      "taxCode": "01012345"
    }
  ],
  "paymentMethod": "CARTAO_CREDITO"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "number": "000123",
  "serie": "1",
  "accessKey": "35250112345678901234567890123456789012345678",
  "xml": "<?xml version...",
  "status": "AUTORIZADA",
  "protocolNumber": "135250000000123",
  "issuedAt": "2025-01-18T20:00:00Z"
}
```

### GET `/api/faturamento/nfe/:id`

Consulta status de NFe.

**Response (200):**
```json
{
  "id": "uuid",
  "number": "000123",
  "status": "AUTORIZADA",
  "accessKey": "35250112345678901234567890123456789012345678",
  "pdfUrl": "https://storage.../nfe-000123.pdf",
  "xmlUrl": "https://storage.../nfe-000123.xml"
}
```

---

## Módulo Configurações

Base URL: `/api/configuracoes`

### GET `/api/configuracoes/modulos`

Lista módulos disponíveis e status de ativação.

**Response (200):**
```json
{
  "data": [
    {
      "moduleKey": "PEP",
      "name": "Prontuário Eletrônico do Paciente",
      "category": "CLINICA",
      "isActive": true,
      "canActivate": true,
      "canDeactivate": false,
      "dependsOn": []
    },
    {
      "moduleKey": "FINANCEIRO",
      "name": "Gestão Financeira",
      "category": "FINANCEIRO",
      "isActive": true,
      "canActivate": true,
      "canDeactivate": true,
      "dependsOn": []
    }
  ]
}
```

### POST `/api/configuracoes/modulos/:moduleKey/toggle`

Ativa ou desativa um módulo.

**Response (200):**
```json
{
  "moduleKey": "INVENTARIO",
  "isActive": true,
  "message": "Módulo ativado com sucesso"
}
```

**Error (412 - Precondition Failed):**
```json
{
  "error": "Falha ao ativar. Requer o módulo 'PEP'.",
  "missingDependencies": ["PEP"]
}
```

---

## Erros Comuns

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Token inválido ou expirado"
}
```

### 403 Forbidden

```json
{
  "error": "Sem permissão para acessar este recurso"
}
```

### 404 Not Found

```json
{
  "error": "Recurso não encontrado"
}
```

### 500 Internal Server Error

```json
{
  "error": "Erro interno do servidor",
  "message": "Entre em contato com o suporte"
}
```

---

## Rate Limiting

- Limite: 1000 requisições/hora por IP
- Header de resposta: `X-RateLimit-Remaining`

---

## Versionamento

A API segue semantic versioning: `v5.2`

Base URL: `https://api.orthoplus.com/v5.2`

---

**Para dúvidas:** Consulte a documentação completa em `/docs`
