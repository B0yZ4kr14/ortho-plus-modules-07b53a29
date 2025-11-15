# 🚀 FASE 3: PRÓXIMOS MÓDULOS - PLANO DE EXECUÇÃO

## Módulos Prioritários (Execução Imediata)

### 1. TELEODONTO (Teleodontologia) - 8h
**Entidades:**
- `TeleOdontoSession` (já criada)
  - Status: `AGENDADA | EM_ANDAMENTO | CONCLUIDA | CANCELADA`
  - Provider: `JITSI | GOOGLE_MEET | ZOOM`

**Use Cases:**
- `CreateTeleOdontoSessionUseCase` ✅
- `StartTeleOdontoSessionUseCase` ✅
- `EndTeleOdontoSessionUseCase`
- `GenerateJitsiLinkUseCase`

**Repositório:**
- `SupabaseTeleOdontoRepository` (pausado - aguardando types)

**External Services:**
- Jitsi Meet SDK integration
- Gravação de sessões (Storage)
- Compliance LGPD (consentimento)

---

### 2. IA (Análise de Radiografias) - 10h
**Entidades:**
- `RadiografiAnalise` (já criada)
  - Status: `PENDENTE | PROCESSANDO | CONCLUIDA | ERRO`
  - AI Models: Lovable AI (Gemini 2.5)

**Use Cases:**
- `AnalyzeRadiografiaWithAIUseCase` ✅
- `ValidateAIResultUseCase`
- `CreateRadiografiaFeedbackUseCase`

**Repositório:**
- `SupabaseRadiografiaRepository` (pausado - aguardando types)

**External Services:**
- Lovable AI (Gemini 2.5 Pro/Flash)
- Image processing (resize, compression)
- Storage de imagens radiográficas

---

### 3. CRYPTO (Pagamentos Descentralizados) - 12h
**Entidades:**
- `CryptoPayment` (já criada)
  - Status: `PENDING | PROCESSING | CONFIRMED | EXPIRED | FAILED`
  - Coins: `BTC | USDT | ETH | LTC | DAI`

**Use Cases:**
- `CreateCryptoInvoiceUseCase` ✅
- `ProcessWebhookUseCase` ✅
- `CheckPaymentStatusUseCase`
- `RefundCryptoPaymentUseCase`

**Repositório:**
- `SupabaseCryptoRepository` (pausado - aguardando types)

**External Services:**
- BTCPay Server API integration
- Webhook handling (Edge Function)
- QR Code generation

---

### 4. SPLIT_PAGAMENTO (Split Tributário) - 6h
**Entidades:**
- `SplitConfig`
  - Regras de split por dentista
  - Cálculo de impostos (PJ vs CLT)
  - Otimização tributária

**Use Cases:**
- `CalculateSplitUseCase`
- `ApplySplitToPaymentUseCase`
- `GenerateSplitReportUseCase`

**Repositório:**
- `SupabaseSplitConfigRepository`

**Integração:**
- Depende de: `FINANCEIRO` + `CRYPTO`
- Lógica de cálculo tributário

---

### 5. INADIMPLENCIA (Controle de Inadimplência) - 6h
**Entidades:**
- `OverdueAccount`
  - Status: `PENDENTE | PRIMEIRA_COBRANCA | SEGUNDA_COBRANCA | TERCEIRA_COBRANCA | NEGATIVADO | PAGO`

**Use Cases:**
- `DetectOverdueAccountsUseCase`
- `SendCollectionReminderUseCase`
- `AutomateCollectionFlowUseCase`

**Repositório:**
- `SupabaseOverdueRepository`

**Integração:**
- Depende de: `FINANCEIRO`
- Automação via Edge Functions (cron)

---

### 6. BI (Business Intelligence) - 8h
**Entidades:**
- `Dashboard`
- `Widget`
- `Metric`

**Use Cases:**
- `GenerateDashboardUseCase`
- `CalculateKPIsUseCase`
- `ExportReportUseCase`

**Repositório:**
- `SupabaseBIRepository`

**Integração:**
- Agregação de dados de todos os módulos
- Caching inteligente

---

### 7. LGPD (Conformidade) - 6h
**Entidades:**
- `DataRequest`
  - Tipo: `ACCESS | DELETION | PORTABILITY | RECTIFICATION`
  - Status: `PENDING | IN_PROGRESS | COMPLETED | REJECTED`

**Use Cases:**
- `CreateDataRequestUseCase`
- `ProcessDataDeletionUseCase`
- `GenerateDataPortabilityReportUseCase`

**Repositório:**
- `SupabaseLGPDRepository`

**Compliance:**
- Audit logs completos
- Data anonymization
- Consent management

---

### 8. TISS (Faturamento de Convênios) - 10h
**Entidades:**
- `TISSGuide`
  - Tipo: `CONSULTA | SP_SADT | INTERNACAO | ODONTO`
  - Status: `RASCUNHO | ENVIADO | APROVADO | GLOSADO`

**Use Cases:**
- `GenerateTISSXMLUseCase`
- `ValidateTISSDataUseCase`
- `SendTISSToOperatorUseCase`

**Repositório:**
- `SupabaseTISSRepository`

**Integração:**
- Geração de XML TISS 4.0
- Validação de schemas

---

## Ordem de Implementação Recomendada

### Batch 1: Core Business (Imediato)
1. ✅ **CRM** (Concluído)
2. 🔄 **TELEODONTO** (Em andamento - 70%)
3. 🔄 **IA** (Em andamento - 70%)
4. 🔄 **CRYPTO** (Em andamento - 70%)

### Batch 2: Financial Optimization (Após types regenerarem)
5. ⏳ **SPLIT_PAGAMENTO**
6. ⏳ **INADIMPLENCIA**

### Batch 3: Analytics & Compliance
7. ⏳ **BI**
8. ⏳ **LGPD**

### Batch 4: Integration
9. ⏳ **TISS**

---

## Bloqueios Atuais

### 🚨 Critical: Supabase Types
- **Problema:** `src/integrations/supabase/types.ts` não regenerou após migration
- **Impacto:** Repositórios de TELEODONTO, IA, CRYPTO pausados
- **Solução:** Aguardar regeneração automática (~2-5 min)

### ✅ Resolvidos
- ❌ Build errors no CRM (corrigidos)
- ❌ Interface/Implementation mismatch (corrigidos)
- ❌ Type inconsistencies (corrigidos)

---

## Métricas de Progresso

| Módulo | Domain | Use Cases | Repository | UI | Status |
|--------|---------|-----------|------------|-----|---------|
| CRM | ✅ 100% | ✅ 100% | ✅ 100% | ⏳ 0% | **DONE** |
| TELEODONTO | ✅ 100% | ✅ 100% | ⏳ 70% | ⏳ 0% | **BLOCKED** |
| IA | ✅ 100% | ✅ 100% | ⏳ 70% | ⏳ 0% | **BLOCKED** |
| CRYPTO | ✅ 100% | ✅ 100% | ⏳ 70% | ⏳ 0% | **BLOCKED** |
| SPLIT | ⏳ 0% | ⏳ 0% | ⏳ 0% | ⏳ 0% | **PENDING** |
| INADIMPLENCIA | ⏳ 0% | ⏳ 0% | ⏳ 0% | ⏳ 0% | **PENDING** |
| BI | ⏳ 0% | ⏳ 0% | ⏳ 0% | ⏳ 0% | **PENDING** |
| LGPD | ⏳ 0% | ⏳ 0% | ⏳ 0% | ⏳ 0% | **PENDING** |
| TISS | ⏳ 0% | ⏳ 0% | ⏳ 0% | ⏳ 0% | **PENDING** |

---

## Próxima Ação

**Enquanto aguardamos types:**
1. Implementar External Services (Jitsi, Lovable AI)
2. Criar Edge Functions (webhooks, cron jobs)
3. Implementar UI Components do CRM
4. Preparar DI Container setup

**Após regeneração:**
1. Recriar repositórios pausados
2. Continuar com Batch 2 (SPLIT, INADIMPLENCIA)
3. Seguir para Batch 3 e 4

**Estimativa Total:** 66h restantes (66% do plano original de 120h)
