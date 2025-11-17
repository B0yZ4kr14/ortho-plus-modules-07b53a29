# Guia do Usuário: Integrações com Terceiros

**Módulo:** Configurações → Integrações  
**Roles permitidas:** ADMIN  
**Versão:** 4.0.0

---

## Visão Geral

O Ortho+ pode se integrar com diversos sistemas e serviços externos para ampliar suas funcionalidades. Este guia cobre as principais integrações disponíveis.

---

## Integrações Disponíveis

### 1. Contabilidade

**Sistemas suportados:**
- TOTVS Protheus
- SAP Business One
- Conta Azul
- Omie
- Bling

**Dados sincronizados:**
- NFe/NFCe emitidas
- SPED Fiscal
- Contas a pagar/receber
- Fluxo de caixa

**Como configurar:** [Ver Tutorial](../TUTORIAIS/07-INTEGRAR-CONTABILIDADE.md)

---

### 2. Sistemas de Pagamento

#### PIX (Integração Bancária)

**Bancos suportados:**
- Banco do Brasil
- Itaú
- Bradesco
- Santander
- Nubank

**Funcionalidades:**
- Geração de QR Code PIX
- Confirmação automática de pagamentos
- Conciliação bancária via Open Banking

#### Gateways de Pagamento

- **Mercado Pago**
- **PagSeguro**
- **Stripe** (internacional)
- **Asaas**

**Funcionalidades:**
- Checkout online
- Split de pagamentos
- Parcelamento
- Boletos

#### Criptomoedas

**Exchanges suportadas:**
- Binance
- Coinbase
- Mercado Bitcoin
- Kraken

**Moedas aceitas:**
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (Tether)
- BNB (Binance Coin)

---

### 3. Comunicação

#### WhatsApp Business API

**Funcionalidades:**
- Lembretes de consulta
- Confirmações de agendamento
- Recall de pacientes
- Marketing automatizado

**Requisitos:**
- WhatsApp Business API oficial (via Meta)
- Número verificado
- Template de mensagens aprovado

#### Email (Resend)

**Funcionalidades:**
- Notificações transacionais
- Campanhas de marketing
- Lembretes automáticos
- Receitas digitais

**Configuração:**
- Já integrado (nenhuma configuração adicional)

#### SMS

**Provedores suportados:**
- Twilio
- Zenvia
- Total Voice

---

### 4. Scanners e Laboratórios (Fluxo Digital)

**Scanners intraorais suportados:**
- 3Shape TRIOS
- iTero (Align Technology)
- Medit i500
- Carestream CS 3600

**Laboratórios integrados:**
- LabDent Digital
- DentalSpeed
- OdontoPrev Labs

**Funcionalidades:**
- Importação automática de scans 3D
- Envio de casos para laboratório
- Rastreamento de status
- Recebimento de trabalhos finalizados

---

### 5. Softwares de Diagnóstico por IA

#### Integrações Nativas

O Ortho+ já possui IA integrada (via Lovable AI / Gemini), mas você pode conectar outros serviços:

**Provedores suportados:**
- **Dentomo** (análise de radiografias)
- **Pearl AI** (detecção de patologias)
- **Overjet** (análise ortodôntica)

**Funcionalidades:**
- Segunda opinião automatizada
- Comparação de diagnósticos
- Relatórios consolidados

---

### 6. SEFAZ (Emissão Fiscal)

**Estados suportados:**
- São Paulo (SP)
- Rio de Janeiro (RJ)
- Minas Gerais (MG)
- Rio Grande do Sul (RS)
- Paraná (PR)
- [Todos os 27 estados]

**Funcionalidades:**
- Emissão de NFe
- Emissão de NFCe (PDV)
- Consulta de status
- Carta de Correção
- Cancelamento
- Inutilização

**Requisitos:**
- Certificado Digital A1 (ICP-Brasil)
- Inscrição Estadual ativa

---

### 7. CRM Externo

**Sistemas suportados:**
- Salesforce
- HubSpot
- RD Station
- Pipedrive

**Dados sincronizados:**
- Leads de novos pacientes
- Oportunidades de tratamento
- Histórico de interações
- Pipeline de vendas

---

### 8. ERP Clínico

**Sistemas suportados:**
- Dental Office
- Clinux
- SimplesClinic

**Funcionalidades:**
- Migração de dados (importação)
- Sincronização bidirecional
- Backup cruzado

---

## Como Ativar Integrações

### Passo Geral

1. Acesse **Configurações → Integrações**
2. Encontre a integração desejada
3. Clique em **"Conectar"**
4. Siga o wizard de configuração:
   - Autenticação (OAuth ou API key)
   - Mapeamento de dados
   - Testes de conexão
   - Ativação
5. Configure sincronização (manual ou automática)

### Exemplo: Integrar WhatsApp

1. **Configurações → Integrações → WhatsApp Business**
2. Clique em **"Conectar WhatsApp"**
3. Preencha:
   ```
   Número de Telefone: +55 11 98765-4321
   ID do WhatsApp Business: 123456789012345
   Token de Acesso: EAAxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Clique em **"Validar Número"**
5. Código de verificação enviado por SMS
6. Digite código: `123456`
7. Clique em **"Ativar Integração"**
8. ✅ **Conectado com sucesso!**

---

## Webhooks

### O Que São?

Webhooks permitem que o Ortho+ **notifique outros sistemas em tempo real** quando eventos importantes acontecem.

### Eventos Disponíveis

- `patient.created` - Novo paciente cadastrado
- `appointment.created` - Agendamento criado
- `appointment.confirmed` - Consulta confirmada
- `payment.received` - Pagamento recebido
- `invoice.paid` - Fatura paga
- `module.activated` - Módulo ativado
- `backup.completed` - Backup concluído

### Configurar Webhook

1. **Configurações → Integrações → Webhooks**
2. Clique em **"+ Novo Webhook"**
3. Preencha:
   ```
   URL de Destino: https://seu-sistema.com/webhook/ortho
   Eventos:
     ☑️ patient.created
     ☑️ payment.received
   Autenticação:
     Tipo: Bearer Token
     Token: your_secret_token_here
   ```
4. Clique em **"Criar Webhook"**
5. Sistema gera **chave secreta** para validação
6. ✅ Webhook ativo

**Testar webhook:**
```bash
curl -X POST https://seu-sistema.com/webhook/ortho \
  -H "Content-Type: application/json" \
  -H "X-Ortho-Signature: sha256=abc123..." \
  -d '{"event":"patient.created","data":{"id":"uuid","name":"João Silva"}}'
```

---

## Sincronização de Dados

### Modos de Sincronização

| Modo | Descrição | Frequência | Uso |
|------|-----------|------------|-----|
| **Manual** | Sincronizar sob demanda | Quando clicar em "Sincronizar" | Controle total |
| **Agendada** | Sincronização automática em horários definidos | Ex: Todo dia às 2am | Backups noturnos |
| **Real-time** | Sincronização instantânea | Ao salvar/atualizar dados | CRM, Pagamentos |
| **Batch** | Processa múltiplos registros de uma vez | A cada X horas | ERP, Contabilidade |

### Configurar Sincronização

1. Após conectar integração
2. Clique em **"Configurar Sincronização"**
3. Escolha modo: Real-time / Agendada / Manual
4. Se agendada, defina horário: `02:00` (2am)
5. Escolha direção:
   - **Unidirecional:** Ortho+ → Sistema Externo
   - **Bidirecional:** Ambos os lados (cuidado com conflitos)
6. Clique em **"Salvar"**

---

## Segurança de Integrações

### Boas Práticas

✅ **Use tokens de API secretos**, nunca compartilhe  
✅ **Rotacione credenciais** a cada 90 dias  
✅ **Valide webhooks** com assinaturas HMAC  
✅ **Use HTTPS** sempre  
✅ **Limite permissões** ao mínimo necessário  
✅ **Monitore logs** de integrações regularmente  

### Validação de Webhooks

```javascript
// Exemplo em Node.js
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = `sha256=${hmac.digest('hex')}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Troubleshooting

### ❌ Integração mostra "Erro de autenticação"

**Solução:**
1. Verificar se API key/token está correto
2. Verificar se token não expirou
3. Testar credenciais diretamente na API do provedor
4. Se necessário, gerar novas credenciais

### ❌ Sincronização não está funcionando

**Solução:**
1. Verificar se integração está ativa
2. Ver logs: **Integrações → [Nome] → Logs**
3. Identificar erro específico
4. Testar sincronização manual
5. Se persistir, entrar em contato com suporte

### ❌ Webhook não está sendo recebido

**Solução:**
1. Verificar URL do webhook (deve ser HTTPS)
2. Verificar se servidor de destino está online
3. Ver logs de envio: **Webhooks → [Nome] → Histórico**
4. Testar com ferramenta: [webhook.site](https://webhook.site)
5. Verificar firewall do servidor de destino

---

## Logs e Monitoramento

### Ver Logs de Integração

1. **Configurações → Integrações → [Nome da Integração]**
2. Clique em **"Ver Logs"**
3. Logs exibem:
   ```
   [2025-11-17 14:30:15] ✅ Sincronização bem-sucedida
   - Registros enviados: 25
   - Registros recebidos: 12
   - Duração: 3.2s
   
   [2025-11-17 02:00:03] ❌ Erro de autenticação
   - Erro: Token expirado
   - Ação: Renovar token na configuração
   ```

### Alertas

Configure alertas para falhas:
1. **Integrações → [Nome] → Alertas**
2. Marque:
   ```
   ☑️ Notificar por email em caso de falha
   ☑️ Notificar após 3 falhas consecutivas
   Email: admin@clinica.com.br
   ```

---

## Próximos Passos

- [Tutorial: Como Integrar Contabilidade](../TUTORIAIS/07-INTEGRAR-CONTABILIDADE.md)
- [API Reference: Webhooks](../API-REFERENCE/04-WEBHOOKS.md)
- [Guia: Gestão Financeira](05-GESTAO-FINANCEIRA.md)

---

**Dúvidas?** Acesse o [FAQ para Clínicas](13-FAQ-CLINICA.md)
