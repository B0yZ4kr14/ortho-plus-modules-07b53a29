# 📖 REST API Reference - Ortho+

> Documentação completa dos endpoints REST gerados automaticamente pelo Express

---

## 🎯 Base URL

```
https://yxpoqjyfgotkytwtifau.backend.orthoplus.local/rest/v1
```

**Headers obrigatórios**:
```http
Authorization: Bearer <access_token>
apikey: <PostgreSQL_anon_key>
Content-Type: application/json
```

---

## 📋 Índice

1. [Patients (Pacientes)](#patients)
2. [Appointments (Consultas)](#appointments)
3. [Prontuários](#prontuarios)
4. [Budgets (Orçamentos)](#budgets)
5. [Clinic Modules](#clinic-modules)
6. [Audit Logs](#audit-logs)

---

## 👥 Patients

### Listar Pacientes

```http
GET /patients?select=*&order=created_at.desc
```

**Query Parameters**:
- `select`: Campos a retornar (ex: `id,full_name,email`)
- `order`: Ordenação (ex: `created_at.desc`, `full_name.asc`)
- `limit`: Limite de registros (ex: `limit=50`)
- `offset`: Paginação (ex: `offset=50`)

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "clinic_id": "uuid",
    "full_name": "João Silva",
    "email": "joao@email.com",
    "phone": "+5511987654321",
    "cpf": "123.456.789-00",
    "birth_date": "1985-05-15",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

### Buscar Paciente por Nome

```http
GET /patients?full_name=ilike.*silva*&select=*
```

**Operadores disponíveis**:
- `eq`: Igual (ex: `cpf=eq.12345678900`)
- `neq`: Diferente
- `gt`: Maior que
- `gte`: Maior ou igual
- `lt`: Menor que
- `lte`: Menor ou igual
- `like`: LIKE SQL (ex: `full_name=like.%Silva%`)
- `ilike`: LIKE case-insensitive (ex: `full_name=ilike.*silva*`)
- `is`: NULL check (ex: `email=is.null`)
- `in`: IN clause (ex: `id=in.(uuid1,uuid2)`)

---

### Criar Paciente

```http
POST /patients
```

**Request Body**:
```json
{
  "full_name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "+5511912345678",
  "cpf": "987.654.321-00",
  "birth_date": "1990-08-20",
  "gender": "feminino",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01234-567"
}
```

**Response** (201 Created):
```json
{
  "id": "new-uuid",
  "clinic_id": "uuid-da-clinica",
  "full_name": "Maria Santos",
  "email": "maria@email.com",
  "created_at": "2025-01-15T11:00:00Z"
}
```

**Validações**:
- `full_name`: obrigatório, min 3 caracteres
- `cpf`: obrigatório, deve ser válido (validação via trigger)
- `email`: opcional, deve ser email válido
- `phone`: obrigatório

---

### Atualizar Paciente

```http
PATCH /patients?id=eq.uuid
```

**Request Body** (campos a atualizar):
```json
{
  "phone": "+5511999888777",
  "email": "maria.novo@email.com"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "full_name": "Maria Santos",
  "phone": "+5511999888777",
  "email": "maria.novo@email.com",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

---

### Deletar Paciente (Soft Delete)

```http
DELETE /patients?id=eq.uuid
```

**Nota**: Sistema usa **soft delete** (marca `deleted_at`). Paciente permanece no banco para auditoria.

**Response** (204 No Content)

---

## 📅 Appointments

### Listar Consultas

```http
GET /appointments?select=*,patients(full_name,phone),profiles(full_name)&order=start_time.asc
```

**Relacionamentos** (via foreign keys):
- `patients(*)`: Dados do paciente
- `profiles(*)`: Dados do dentista (via `dentist_id`)

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "start_time": "2025-01-20T14:00:00Z",
    "end_time": "2025-01-20T15:00:00Z",
    "title": "Consulta de rotina",
    "status": "agendado",
    "patients": {
      "full_name": "João Silva",
      "phone": "+5511987654321"
    },
    "profiles": {
      "full_name": "Dra. Maria Santos"
    }
  }
]
```

---

### Filtrar por Período

```http
GET /appointments?start_time=gte.2025-01-20T00:00:00Z&start_time=lt.2025-01-27T00:00:00Z
```

**Operadores de data**:
- `gte`: Greater than or equal (>=)
- `lt`: Less than (<)
- `eq`: Igual

---

### Criar Consulta

```http
POST /appointments
```

**Request Body**:
```json
{
  "patient_id": "uuid-do-paciente",
  "dentist_id": "uuid-do-dentista",
  "start_time": "2025-01-25T14:00:00Z",
  "end_time": "2025-01-25T15:00:00Z",
  "title": "Limpeza",
  "description": "Profilaxia de rotina",
  "status": "agendado"
}
```

**Response** (201 Created)

**Validações**:
- Conflito de horário (trigger verifica se dentista já tem consulta no período)
- Horário de trabalho (verifica `dentist_schedules`)

---

### Reagendar Consulta

```http
PATCH /appointments?id=eq.uuid
```

**Request Body**:
```json
{
  "start_time": "2025-01-26T10:00:00Z",
  "end_time": "2025-01-26T11:00:00Z"
}
```

---

### Cancelar Consulta

```http
PATCH /appointments?id=eq.uuid
```

**Request Body**:
```json
{
  "status": "cancelado"
}
```

---

## 📝 Prontuários

### Listar Prontuários do Paciente

```http
GET /prontuarios?patient_id=eq.uuid&select=*,pep_tratamentos(*)
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid-do-paciente",
    "queixa_principal": "Dor no dente 16",
    "historico_medico": {
      "diabetes": true,
      "hipertensao": false,
      "alergias": ["Penicilina"]
    },
    "risk_level": "moderado",
    "risk_score_overall": 45,
    "created_at": "2025-01-15T10:00:00Z",
    "pep_tratamentos": [
      {
        "id": "uuid",
        "procedimento": "Restauração",
        "dente": "16",
        "status": "concluido",
        "created_at": "2025-01-15T14:00:00Z"
      }
    ]
  }
]
```

---

### Criar Prontuário

```http
POST /prontuarios
```

**Request Body**:
```json
{
  "patient_id": "uuid-do-paciente",
  "queixa_principal": "Sensibilidade dentária",
  "has_diabetes": false,
  "has_hypertension": true,
  "hypertension_controlled": true,
  "has_cardiovascular_disease": false,
  "current_medications": ["Losartana 50mg"],
  "has_medication_allergy": false,
  "is_smoker": false,
  "is_pregnant": false
}
```

**Response** (201 Created):
```json
{
  "id": "new-uuid",
  "patient_id": "uuid-do-paciente",
  "risk_level": "baixo",
  "risk_score_overall": 15,
  "risk_score_medical": 15,
  "risk_score_surgical": 15,
  "risk_score_anesthetic": 15,
  "created_at": "2025-01-15T11:00:00Z"
}
```

**Nota**: `risk_score_*` são calculados automaticamente via trigger `calculate_patient_risk_score()`.

---

### Adicionar Tratamento ao Prontuário

```http
POST /pep_tratamentos
```

**Request Body**:
```json
{
  "prontuario_id": "uuid-do-prontuario",
  "procedimento": "Canal",
  "dente": "26",
  "status": "em_andamento",
  "observacoes": "Sessão 1 de 3. Pulpectomia realizada.",
  "valor": 800.00,
  "data_inicio": "2025-01-20"
}
```

---

## 💰 Budgets

### Listar Orçamentos

```http
GET /budgets?select=*,budget_items(*),patients(full_name)&order=created_at.desc
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "numero_orcamento": "ORC-202501-000123",
    "titulo": "Tratamento ortodôntico",
    "valor_total": 5000.00,
    "status": "pendente",
    "validade_dias": 30,
    "data_expiracao": "2025-02-14",
    "patients": {
      "full_name": "João Silva"
    },
    "budget_items": [
      {
        "id": "uuid",
        "descricao": "Aparelho ortodôntico fixo",
        "quantidade": 1,
        "valor_unitario": 3000.00,
        "valor_total": 3000.00
      },
      {
        "id": "uuid",
        "descricao": "Manutenções mensais (24 meses)",
        "quantidade": 24,
        "valor_unitario": 150.00,
        "valor_total": 3600.00
      }
    ]
  }
]
```

---

### Criar Orçamento

```http
POST /budgets
```

**Request Body**:
```json
{
  "patient_id": "uuid-do-paciente",
  "titulo": "Implante dentário",
  "descricao": "Implante unitário dente 36 com coroa metalo-cerâmica",
  "tipo_plano": "particular",
  "validade_dias": 45,
  "valor_subtotal": 4500.00,
  "desconto_valor": 500.00,
  "valor_total": 4000.00
}
```

**Response** (201 Created):
```json
{
  "id": "new-uuid",
  "numero_orcamento": "ORC-202501-000124",
  "status": "pendente",
  "data_expiracao": "2025-03-01",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**Nota**: `numero_orcamento` é gerado automaticamente via trigger.

---

### Adicionar Itens ao Orçamento

```http
POST /budget_items
```

**Request Body**:
```json
{
  "budget_id": "uuid-do-orcamento",
  "descricao": "Implante osseointegrado",
  "quantidade": 1,
  "valor_unitario": 2500.00,
  "valor_total": 2500.00,
  "dente_regiao": "36",
  "ordem": 1
}
```

---

### Aprovar Orçamento

```http
PATCH /budgets?id=eq.uuid
```

**Request Body**:
```json
{
  "status": "aprovado",
  "aprovado_em": "2025-01-20T14:30:00Z",
  "aprovado_por": "uuid-do-dentista"
}
```

**Nota**: Isso cria registro em `budget_approvals` (audit trail).

---

## 🔧 Clinic Modules

### Listar Módulos da Clínica

```http
GET /clinic_modules?select=*,module_catalog(*)&clinic_id=eq.uuid
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "clinic_id": "uuid-da-clinica",
    "module_catalog_id": 5,
    "is_active": true,
    "subscribed_at": "2025-01-01T00:00:00Z",
    "module_catalog": {
      "id": 5,
      "module_key": "FINANCEIRO",
      "name": "Gestão Financeira",
      "category": "Financeiro"
    }
  }
]
```

---

### Ativar/Desativar Módulo

**❌ NÃO use REST API diretamente!**

Use a Edge Function `toggle-module-state` que valida dependências:

```http
POST /functions/v1/toggle-module-state
{
  "module_key": "SPLIT_PAGAMENTO"
}
```

**Veja**: [02-EDGE-FUNCTIONS-API](./02-EDGE-FUNCTIONS-API.md)

---

## 📊 Audit Logs

### Listar Logs de Auditoria

```http
GET /audit_logs?select=*&order=created_at.desc&limit=100
```

**Filtros comuns**:
```http
# Filtrar por usuário
GET /audit_logs?user_id=eq.uuid

# Filtrar por ação
GET /audit_logs?action=ilike.*MODULE_ACTIVATED*

# Filtrar por período
GET /audit_logs?created_at=gte.2025-01-01T00:00:00Z
```

**Response** (200 OK):
```json
[
  {
    "id": 12345,
    "user_id": "uuid-do-usuario",
    "clinic_id": "uuid-da-clinica",
    "action": "MODULE_ACTIVATED",
    "target_module_id": 8,
    "details": {
      "module_key": "SPLIT_PAGAMENTO",
      "activated_at": "2025-01-15T10:30:00Z"
    },
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

## 🔒 Segurança

### Row Level Security (RLS)

**Todas as queries são automaticamente filtradas**:

```sql
-- O que você escreve:
GET /patients

-- O que PostgreSQL executa (com RLS):
SELECT * FROM patients 
WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid());
```

**Tentativa de burlar RLS**:
```http
GET /patients?clinic_id=eq.outro-uuid-qualquer
```

**Response** (403 Forbidden):
```json
{
  "code": "42501",
  "message": "new row violates row-level security policy",
  "details": "Policy \"Isolamento por clínica\" violated"
}
```

---

### Rate Limiting

**Limites por IP**:
- 100 requests / minuto (anônimo)
- 1000 requests / minuto (autenticado)

**Headers de resposta**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1705320000
```

**Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

---

## 📚 Recursos

- [Express Docs](https://postgrest.org/en/stable/)
- [PostgreSQL REST API](https://apiClient.com/docs/guides/api)
- [PostgreSQL Operators](https://www.postgresql.org/docs/current/functions.html)

---

**Próximos Documentos:**  
→ [02-EDGE-FUNCTIONS-API](./02-EDGE-FUNCTIONS-API.md) - Edge Functions documentadas  
→ [03-WEBHOOKS](./03-WEBHOOKS.md) - Webhooks disponíveis  
→ [04-SCHEMAS](./04-SCHEMAS.md) - Schemas TypeScript/Zod
