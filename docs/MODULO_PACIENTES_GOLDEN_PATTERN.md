# Módulo PACIENTES - Golden Pattern DDD

## 📋 Visão Geral

O **Módulo PACIENTES** é o primeiro bounded context implementado seguindo rigorosamente os princípios de Domain-Driven Design (DDD). Ele serve como **padrão validado** (golden pattern) para replicação nos demais módulos do sistema (Inventário, PDV, Financeiro, PEP, Faturamento, Configurações).

## 🏗️ Arquitetura Clean + DDD

```
modules/pacientes/
├── domain/                          # Camada de Domínio (Núcleo)
│   ├── entities/
│   │   └── Patient.ts              # Aggregate Root
│   ├── value-objects/
│   │   ├── PatientStatus.ts        # 15 estados canônicos
│   │   └── DadosComerciaisVO.ts    # Dados CRM
│   └── repositories/
│       └── IPatientRepository.ts   # Interface (contrato)
│
├── application/                     # Camada de Aplicação (Use Cases)
│   └── use-cases/
│       ├── CadastrarPacienteUseCase.ts
│       └── AlterarStatusPacienteUseCase.ts
│
├── infrastructure/                  # Camada de Infraestrutura
│   └── repositories/
│       └── PatientRepositoryPostgres.ts  # Implementação PostgreSQL
│
└── api/                            # Camada de Apresentação (API REST)
    ├── PacientesController.ts      # HTTP Controller
    └── router.ts                   # Express Router
```

## 🎯 Funcionalidades Implementadas

### 1. Cadastro de Pacientes
- **Endpoint**: `POST /api/pacientes`
- **Use Case**: `CadastrarPacienteUseCase`
- **Validações**:
  - Nome completo obrigatório (min 3 caracteres)
  - CPF único por clínica (com validação de dígitos)
  - Email único e válido
  - Status inicial padrão: `PROSPECT`
- **Eventos Emitidos**:
  - `Pacientes.PacienteCadastrado`

### 2. Alteração de Status
- **Endpoint**: `PATCH /api/pacientes/:id/status`
- **Use Case**: `AlterarStatusPacienteUseCase`
- **Regras de Negócio**:
  - Transições inválidas bloqueadas (ex: CONCLUIDO → PROSPECT)
  - Histórico completo de mudanças em `patient_status_history`
  - Auditoria automática (who, when, why)
- **Eventos Emitidos**:
  - `Pacientes.StatusAlterado`

### 3. Listagem com Filtros
- **Endpoint**: `GET /api/pacientes`
- **Filtros**:
  - `statusCode`: Filtrar por status
  - `searchTerm`: Busca por nome, CPF ou email
  - `origemId`, `promotorId`, `campanhaId`: Filtros CRM
  - `isActive`: Apenas ativos
- **Paginação**: `page`, `limit`, `sortBy`, `sortOrder`

### 4. Detalhes do Paciente
- **Endpoint**: `GET /api/pacientes/:id`
- **Inclui**:
  - Dados completos do paciente
  - Histórico de status (`patient_status_history`)
  - Dados comerciais/CRM

### 5. Estatísticas por Status
- **Endpoint**: `GET /api/pacientes/stats/by-status`
- **Retorna**: Contagem de pacientes por cada status

## 📊 Modelo de Dados

### Schema PostgreSQL: `pacientes`

```sql
-- Tabela principal
CREATE TABLE pacientes.patients (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  
  -- Dados pessoais
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  email VARCHAR(255),
  birth_date DATE,
  gender VARCHAR(20),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  
  -- Endereço completo
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zipcode VARCHAR(10),
  
  -- Status (FK)
  status_code VARCHAR(50) NOT NULL DEFAULT 'PROSPECT',
  
  -- Dados comerciais/CRM
  campanha_origem_id UUID,
  origem_id UUID,
  promotor_id UUID,
  evento_id UUID,
  telemarketing_agent VARCHAR(100),
  escolaridade VARCHAR(50),
  estado_civil VARCHAR(50),
  profissao VARCHAR(100),
  empresa VARCHAR(200),
  renda_mensal DECIMAL(10,2),
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Histórico de status
CREATE TABLE pacientes.patient_status_history (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID NOT NULL,
  metadata JSONB
);

-- Tabelas de referência CRM
CREATE TABLE pacientes.campanhas (...);
CREATE TABLE pacientes.origens (...);
CREATE TABLE pacientes.promotores (...);
CREATE TABLE pacientes.eventos (...);
```

## 🔐 Status Canônicos (15 Estados)

```typescript
'ABANDONO'                // Abandonou tratamento
'AFASTAMENTO_TEMPORARIO'  // Afastado temporariamente
'A_PROTESTAR'             // Pendências financeiras
'CANCELADO'               // Tratamento cancelado
'CONTENCAO'               // Fase de contenção
'CONCLUIDO'               // Tratamento concluído
'ERUPCAO'                 // Aguardando erupção
'INATIVO'                 // Paciente inativo
'MIGRADO'                 // Migrado de outro sistema
'PROSPECT'                // Lead potencial
'PROTESTO'                // Protestado juridicamente
'RESPONSAVEL'             // Responsável de outro paciente
'TRATAMENTO'              // Em tratamento ativo
'TRANSFERENCIA'           // Em transferência
```

## 🎭 Eventos de Domínio

### `Pacientes.PacienteCadastrado`
```json
{
  "eventId": "uuid",
  "eventType": "Pacientes.PacienteCadastrado",
  "aggregateId": "patient-uuid",
  "aggregateType": "Patient",
  "payload": {
    "patientId": "uuid",
    "patientName": "Nome Completo",
    "statusCode": "PROSPECT",
    "clinicId": "clinic-uuid"
  },
  "metadata": {
    "userId": "user-uuid",
    "clinicId": "clinic-uuid",
    "timestamp": "2025-01-17T10:00:00Z"
  }
}
```

### `Pacientes.StatusAlterado`
```json
{
  "eventType": "Pacientes.StatusAlterado",
  "payload": {
    "patientId": "uuid",
    "patientName": "Nome Completo",
    "fromStatus": "PROSPECT",
    "toStatus": "TRATAMENTO",
    "reason": "Iniciou tratamento ortodôntico"
  }
}
```

## 🧪 Exemplos de Uso da API

### Cadastrar Paciente

```bash
POST /api/pacientes
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "fullName": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com",
  "phone": "(11) 98765-4321",
  "birthDate": "1990-05-15",
  "gender": "masculino",
  
  "addressStreet": "Rua das Flores",
  "addressNumber": "123",
  "addressCity": "São Paulo",
  "addressState": "SP",
  "addressZipcode": "01234-567",
  
  "statusCode": "PROSPECT",
  
  "campanhaOrigemId": "uuid-campanha",
  "origemId": "uuid-origem",
  "promotorId": "uuid-promotor",
  "escolaridade": "superior",
  "estadoCivil": "solteiro",
  "profissao": "Engenheiro",
  "empresa": "Tech Corp",
  "rendaMensal": 8500.00,
  
  "notes": "Indicado pelo Dr. Pedro"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "patientId": "uuid-gerado"
  }
}
```

### Alterar Status

```bash
PATCH /api/pacientes/:id/status
Authorization: Bearer <jwt-token>

{
  "novoStatusCode": "TRATAMENTO",
  "reason": "Iniciou tratamento ortodôntico",
  "metadata": {
    "dentistId": "uuid-dentista",
    "treatmentType": "ortodontia"
  }
}
```

### Listar com Filtros

```bash
GET /api/pacientes?statusCode=TRATAMENTO&page=1&limit=20&sortBy=full_name&sortOrder=asc
Authorization: Bearer <jwt-token>
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## 🔄 Integração com EventBus

Outros módulos podem reagir aos eventos do módulo PACIENTES:

```typescript
// Módulo FINANCEIRO reage ao cadastro de paciente
eventBus.subscribe('Pacientes.PacienteCadastrado', async (event) => {
  // Criar conta de cadastro (taxa)
  await financeiroService.criarContaCadastro({
    patientId: event.payload.patientId,
    valor: 50.00,
  });
});

// Módulo CRM reage à mudança de status
eventBus.subscribe('Pacientes.StatusAlterado', async (event) => {
  if (event.payload.toStatus === 'CONCLUIDO') {
    // Enviar pesquisa de satisfação
    await crmService.enviarPesquisaSatisfacao(event.payload.patientId);
  }
});
```

## 📦 Descentralização de Dados

- **Database dedicado**: `db_pacientes` (PostgreSQL)
- **Schema isolado**: `pacientes`
- **Nenhum acesso direto**: Outros módulos só acessam via API REST (`/api/pacientes/*`) ou eventos
- **Configuração**:
  ```env
  DB_PACIENTES_HOST=db_pacientes
  DB_PACIENTES_NAME=pacientes
  DB_PACIENTES_PASSWORD=<secret>
  ```

## ✅ Padrão Validado para Replicação

Este módulo estabelece o **golden pattern** que deve ser replicado nos demais módulos:

1. **Domain Layer**:
   - Aggregate Root com business logic
   - Value Objects imutáveis
   - Eventos de domínio
   - Repository interface

2. **Application Layer**:
   - Use Cases com single responsibility
   - DTOs explícitos
   - Orquestração + validações

3. **Infrastructure Layer**:
   - Repository PostgreSQL
   - Mapper (DB row → Domain entity)

4. **API Layer**:
   - Controller com injeção de dependências
   - Router Express
   - Autenticação JWT via middleware

5. **Database Isolation**:
   - Schema PostgreSQL dedicado
   - Migrations versionadas
   - RLS policies

6. **Event-Driven**:
   - EventBus in-memory
   - Comunicação assíncrona entre módulos

## 🚀 Próximos Passos

1. **Testes**: Criar testes unitários (domain) e integração (repositories, use cases)
2. **Frontend**: Implementar componentes React para cadastro de pacientes com STATUS + CRM
3. **Replicar Pattern**: Aplicar mesma estrutura aos módulos INVENTÁRIO, PDV, FINANCEIRO, PEP, FATURAMENTO, CONFIGURAÇÕES
4. **Monitoramento**: Adicionar métricas de eventos e performance
