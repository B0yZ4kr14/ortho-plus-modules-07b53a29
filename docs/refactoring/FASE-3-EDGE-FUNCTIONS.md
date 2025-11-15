# ✅ FASE 3: EDGE FUNCTIONS - COMPLETO

**Data:** 15/Nov/2025  
**Status:** ✅ 100% CONCLUÍDO

## Edge Functions Implementadas

### 1. `analyze-radiografia` ✅
**Propósito:** Análise de radiografias odontológicas com IA (Lovable AI - Gemini 2.5 Pro)

**Fluxo:**
1. Recebe imagem base64 + tipo de radiografia + patient_id
2. Gera prompt especializado por tipo (PERIAPICAL, BITE_WING, PANORAMICA, OCLUSAL)
3. Chama Lovable AI Gateway com visão multimodal
4. Faz upload da imagem para Storage (`radiografias` bucket)
5. Salva análise na tabela `analises_radiograficas`
6. Retorna resultado estruturado com confidence score

**Autenticação:** `verify_jwt = true`

**Integrações:**
- ✅ Lovable AI (Gemini 2.5 Pro)
- ✅ Supabase Storage (upload de imagens)
- ✅ Audit Logs

**Resposta:**
```json
{
  "analiseId": "uuid",
  "resultadoIA": {
    "problemas_detectados": [...],
    "observacoes_gerais": "...",
    "dentes_avaliados": [11, 12, 13],
    "qualidade_imagem": "boa",
    "requer_avaliacao_especialista": false
  },
  "confidence": 0.85,
  "processingTimeMs": 3420,
  "imagemUrl": "https://...",
  "requerAvaliacaoEspecialista": false
}
```

---

### 2. `crypto-webhook` ✅
**Propósito:** Processa webhooks do BTCPay Server (atualizações de status de pagamento)

**Fluxo:**
1. Recebe webhook do BTCPay (validação opcional de assinatura HMAC)
2. Mapeia status BTCPay → enum interno
3. Atualiza registro em `crypto_payments`
4. Se confirmado, atualiza `contas_receber` automaticamente
5. Registra no `audit_logs`

**Autenticação:** `verify_jwt = false` (webhook externo)

**Status Mapping:**
- `New` → `PENDING`
- `Processing` → `PROCESSING`
- `Expired` → `EXPIRED`
- `Invalid` → `FAILED`
- `Settled` / `Complete` → `CONFIRMED`

**Segurança:**
- Header `btcpay-sig` para validação HMAC
- Service Role Key para operações privilegiadas

---

### 3. `create-crypto-invoice` ✅
**Propósito:** Cria invoice no BTCPay Server para pagamento em crypto

**Fluxo:**
1. Recebe `amountBRL`, `orderId`, `patientEmail`
2. Valida autenticação e clinic_id
3. Chama API do BTCPay Server para criar invoice
4. Salva em `crypto_payments` com status `PENDING`
5. Retorna checkout link + QR code
6. Registra no `audit_logs`

**Autenticação:** `verify_jwt = true`

**Modo Desenvolvimento:**
- Se `BTCPAY_API_KEY` não configurada, retorna mock
- Mock permite testar fluxo sem BTCPay real

**Moedas Suportadas:**
- BTC (Bitcoin)
- BTC-LightningNetwork
- ETH (Ethereum)
- USDT (Tether)
- LTC (Litecoin)
- DAI (DAI Stablecoin)

**Resposta:**
```json
{
  "paymentId": "uuid",
  "invoiceId": "btcpay_invoice_id",
  "checkoutLink": "https://btcpay.../invoice/...",
  "qrCodeData": "bitcoin:address?amount=0.001",
  "expiresAt": "2025-11-15T12:30:00Z",
  "status": "PENDING",
  "mock": false
}
```

---

## Secrets Necessários

### Lovable AI (Auto-provisionado) ✅
- `LOVABLE_API_KEY` - Chave gerada automaticamente pelo Lovable

### BTCPay Server (Opcional - Mock se ausente)
- `BTCPAY_SERVER_URL` - URL do BTCPay Server
- `BTCPAY_STORE_ID` - ID da loja no BTCPay
- `BTCPAY_API_KEY` - API Key do BTCPay
- `BTCPAY_WEBHOOK_SECRET` - Secret para validar webhooks

---

## Tratamento de Erros

### Rate Limits (429)
```json
{
  "error": "Rate limit excedido. Tente novamente em alguns minutos."
}
```

### Créditos Insuficientes (402)
```json
{
  "error": "Créditos insuficientes. Adicione créditos ao workspace Lovable."
}
```

### Erro de Processamento (500)
```json
{
  "error": "Erro ao processar análise",
  "details": "stack trace"
}
```

---

## Logs e Monitoring

Todas as Edge Functions incluem logging detalhado:
- ✅ Request params (sem dados sensíveis)
- ✅ Processing time
- ✅ Confidence scores (IA)
- ✅ Status transitions (Crypto)
- ✅ Error stack traces

Formato de log:
```
✅ Análise concluída em 3420ms - Confiança: 85.0%
✅ Invoice criada: btc_xxx - R$ 150.00
✅ Pagamento abc123 atualizado: PENDING → CONFIRMED
```

---

## Próximas Edge Functions (FASE 3 continuação)

### Batch 2: Split & Inadimplência
- [ ] `calculate-split-payment` - Calcular split tributário
- [ ] `process-collection-automation` - Automação de cobrança

### Batch 3: BI & LGPD
- [ ] `generate-bi-report` - Gerar relatórios BI
- [ ] `process-data-request` - Processar requisições LGPD

### Batch 4: TISS
- [ ] `generate-tiss-xml` - Gerar XML TISS
- [ ] `validate-tiss-data` - Validar dados TISS

---

## Configuração de Storage

**Bucket necessário:** `radiografias`
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('radiografias', 'radiografias', false);

-- RLS Policies
CREATE POLICY "Users can view own clinic radiografias" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'radiografias' AND auth.uid() IN (
  SELECT id FROM profiles WHERE clinic_id = (storage.foldername(name))[1]::uuid
));

CREATE POLICY "Users can upload own clinic radiografias" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'radiografias' AND auth.uid() IN (
  SELECT id FROM profiles WHERE clinic_id = (storage.foldername(name))[1]::uuid
));
```

---

## Status Geral

| Edge Function | Status | Auth | Integração | Logs |
|---------------|--------|------|------------|------|
| analyze-radiografia | ✅ | JWT | Lovable AI + Storage | ✅ |
| crypto-webhook | ✅ | Public | BTCPay Server | ✅ |
| create-crypto-invoice | ✅ | JWT | BTCPay Server | ✅ |

**Total:** 3/3 Edge Functions implementadas e documentadas.
