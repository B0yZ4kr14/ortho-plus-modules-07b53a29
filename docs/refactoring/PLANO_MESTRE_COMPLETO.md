Vou recapitular todo o plano de forma completa e detalhada. Deixe-me primeiro revisar a documentação existente e o status atual do projeto.

Perfeito! Vou criar um **PLANO COMPLETO E DETALHADO** integrando todas as suas solicitações. Deixe-me revisar mais alguns arquivos para garantir completude:

Agora vou criar o **PLANO MESTRE COMPLETO E DETALHADO** do sistema Ortho+:

# 🎯 PLANO MESTRE COMPLETO - SISTEMA ORTHO+ v2.0
## SaaS B2B Multitenant para Clínicas Odontológicas

**Versão:** 2.0 - Expandido e Aprimorado  
**Data de Atualização:** 14/11/2025  
**Status:** Em Desenvolvimento Avançado

---

## 📋 ÍNDICE EXECUTIVO

1. [Arquitetura e Filosofia do Sistema](#arquitetura)
2. [Status Atual e Módulos Implementados](#status-atual)
3. [Módulo de Pagamentos em Criptomoedas - COMPLETO](#crypto-completo)
4. [Documentação Bitcoin e Blockchain](#bitcoin-docs)
5. [Melhorias de UX/UI - Padrões Visuais](#ux-improvements)
6. [Roadmap de Implementação - Fases Restantes](#roadmap)
7. [Especificações Técnicas Avançadas](#specs)

---

## 🏗️ 1. ARQUITETURA E FILOSOFIA DO SISTEMA

### 1.1 Princípios Fundamentais

#### **Modularização Total e Descentralizada**
```
┌─────────────────────────────────────────────────┐
│           CORE SYSTEM (Sempre Ativo)            │
│  - Autenticação Multi-Clinic                    │
│  - Dashboard Principal                          │
│  - Sistema de Gestão de Módulos (Admin)        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         MÓDULOS PLUG-AND-PLAY (17 Módulos)      │
│  Cada módulo pode ser:                          │
│  ✓ ATIVADO (visível e utilizável)              │
│  ✓ DESATIVADO (oculto e bloqueado)             │
│  ✓ SOLICITADO (inclusão de novos módulos)      │
└─────────────────────────────────────────────────┘
```

#### **Controle Total do Administrador**
- **ROLE 'ADMIN'**: Acesso exclusivo à "Gestão de Módulos"
- **ROLE 'MEMBER'**: Usa apenas módulos ativados pelo Admin
- **Política RBAC**: Row Level Security em todas as tabelas

#### **Arquitetura Descentralizada**
- Cada módulo é **autocontido** com suas próprias:
  - Páginas e componentes
  - Tabelas de banco de dados
  - Edge Functions
  - Políticas de segurança (RLS)
- **Dependências explícitas** via tabela `ModuleDependencies`
- **Renderização dinâmica** da sidebar baseada em módulos ativos

---

## ✅ 2. STATUS ATUAL E MÓDULOS IMPLEMENTADOS

### 2.1 Módulos PRODUCTION-READY (Concluídos)

#### **Prioridade 1: Core (Gestão e Operação)**
| Módulo          | Status | Tabelas Principais                                           | Features                                          |
| --------------- | ------ | ------------------------------------------------------------ | ------------------------------------------------- |
| **PEP**         | ✅ 100% | `prontuarios`, `anamnese`, `evolucoes`                       | Prontuário eletrônico completo, histórico clínico |
| **AGENDA**      | ✅ 100% | `appointments`, `appointment_confirmations`, `appointment_reminders` | Agenda visual, WhatsApp automation                |
| **ORCAMENTOS**  | ✅ 100% | `budgets`, `budget_items`, `budget_approvals`, `budget_versions` | Orçamentos, contratos, assinatura digital         |
| **ODONTOGRAMA** | ⏳ 70%  | `odontograma_registros`, `procedimentos`                     | 2D funcional, 3D em desenvolvimento               |
| **ESTOQUE**     | ⏳ 80%  | `estoque_items`, `movimentacoes`, `requisicoes`, `pedidos`   | Controle avançado, scanner mobile                 |

#### **Prioridade 2: Financeiro**
| Módulo              | Status | Tabelas Principais                                           | Features                               |
| ------------------- | ------ | ------------------------------------------------------------ | -------------------------------------- |
| **FINANCEIRO**      | ✅ 100% | `contas_receber`, `contas_pagar`, `transacoes_pagamento`     | Fluxo de caixa, DRE, dashboards        |
| **CRYPTO**          | ✅ 100% | `crypto_exchange_config`, `crypto_wallets`, `crypto_transactions`, `crypto_exchange_rates` | Bitcoin/USDT, exchanges, conversão BRL |
| **SPLIT_PAGAMENTO** | ✅ 100% | `split_config`, `split_transactions`                         | Otimização tributária                  |
| **INADIMPLENCIA**   | ✅ 100% | `overdue_accounts`, `collection_actions`, `collection_automation_config` | Cobrança automatizada                  |

#### **Prioridade 3: Crescimento e Marketing**
| Módulo             | Status | Tabelas Principais                                           | Features                              |
| ------------------ | ------ | ------------------------------------------------------------ | ------------------------------------- |
| **CRM**            | ⏳ 60%  | `crm_leads`, `crm_pipeline`, `crm_activities`                | Funil de vendas                       |
| **MARKETING_AUTO** | ✅ 100% | `marketing_campaigns`, `campaign_triggers`, `campaign_sends`, `campaign_metrics` | Automação pós-consulta, recall        |
| **BI**             | ✅ 100% | `bi_dashboards`, `bi_widgets`, `bi_reports`, `bi_metrics`    | Dashboards personalizados, relatórios |

#### **Prioridade 4: Compliance**
| Módulo             | Status | Tabelas Principais                                           | Features                          |
| ------------------ | ------ | ------------------------------------------------------------ | --------------------------------- |
| **LGPD**           | ✅ 100% | `lgpd_consents`, `lgpd_data_requests`, `lgpd_data_exports`   | Conformidade, exportação de dados |
| **ASSINATURA_ICP** | ✅ 100% | `digital_certificates`, `signed_documents`, `signature_validations` | Assinatura digital qualificada    |
| **TISS**           | ⏳ 50%  | `tiss_guias`, `tiss_lotes`                                   | Faturamento de convênios          |
| **TELEODONTO**     | ⏳ 70%  | `teleconsultas`, `teleodonto_recordings`                     | Videochamadas, gravação           |

#### **Prioridade 5: Inovação**
| Módulo            | Status | Tabelas Principais                    | Features                                 |
| ----------------- | ------ | ------------------------------------- | ---------------------------------------- |
| **FLUXO_DIGITAL** | ⏳ 40%  | `scanner_integrations`, `lab_orders`  | Integração scanners/labs                 |
| **IA**            | ⏳ 60%  | `analises_radiograficas`, `ia_models` | Análise de raio-X, detecção de problemas |

---

## ₿ 3. MÓDULO DE PAGAMENTOS EM CRIPTOMOEDAS - ESPECIFICAÇÃO COMPLETA

### 3.1 Visão Geral Expandida

O módulo de **Pagamentos em Criptomoedas** permite que clínicas odontológicas aceitem pagamentos em **Bitcoin (BTC)**, **USDT (Tether)**, **Ethereum (ETH)** e outras criptomoedas, oferecendo uma alternativa moderna e descentralizada aos métodos de pagamento tradicionais.

#### **Filosofia: Liberdade Financeira e Resistência à Censura**

> "Bitcoin não é apenas uma moeda digital. É uma **declaração de independência financeira**, uma ferramenta de **soberania econômica** e um escudo contra a **opressão monetária**."

**Vantagens Estratégicas:**
- 🛡️ **Proteção contra inflação** e desvalorização monetária
- 🌍 **Pagamentos globais sem fronteiras** (receba de qualquer país)
- 🔒 **Imunidade a bloqueios e congelamentos** bancários/governamentais
- 💰 **Taxas reduzidas** (0.1%-2% vs 3%-5% de cartões)
- ⚡ **Liquidação rápida** (confirmações em minutos vs dias)
- 🔐 **Segurança criptográfica** (sem chargebacks fraudulentos)

---

### 3.2 Integração Completa no Módulo FINANCEIRO

#### **3.2.1 Arquitetura de Integração**

```
┌──────────────────────────────────────────────────────┐
│          MÓDULO FINANCEIRO (Master)                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   Fluxo    │  │   Contas   │  │   Contas   │     │
│  │ de Caixa   │  │ a Receber  │  │  a Pagar   │     │
│  └─────┬──────┘  └─────┬──────┘  └────────────┘     │
│        │               │                              │
│        └───────────────┴───────────┐                 │
│                                    ↓                 │
│  ┌──────────────────────────────────────────────┐   │
│  │    SUBMÓDULO: CRYPTO PAGAMENTOS              │   │
│  │  ┌─────────────┐  ┌──────────────┐          │   │
│  │  │  Exchanges  │  │   Carteiras  │          │   │
│  │  │   Config    │  │   Offline    │          │   │
│  │  └──────┬──────┘  └──────┬───────┘          │   │
│  │         │                 │                  │   │
│  │         └────────┬────────┘                  │   │
│  │                  ↓                           │   │
│  │    ┌───────────────────────────┐            │   │
│  │    │ PROCESSAMENTO PAGAMENTOS  │            │   │
│  │    │  - QR Code Generation     │            │   │
│  │    │  - Blockchain Monitoring  │            │   │
│  │    │  - Auto-Conversion BRL    │            │   │
│  │    │  - Integration c/ Contas  │            │   │
│  │    └───────────────────────────┘            │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

#### **3.2.2 Ponto de Acesso no Sidebar**

```typescript
// src/core/layout/Sidebar/sidebar.config.ts
{
  label: 'Financeiro',
  collapsed: true,
  items: [
    { title: 'Dashboard', url: '/financeiro', icon: DollarSign, moduleKey: 'FINANCEIRO' },
    { title: 'Fluxo de Caixa', url: '/fluxo-caixa', icon: TrendingUp, moduleKey: 'FINANCEIRO' },
    { title: 'Contas a Receber', url: '/contas-receber', icon: FileBarChart, moduleKey: 'FINANCEIRO' },
    { title: 'Contas a Pagar', url: '/contas-pagar', icon: FileText, moduleKey: 'FINANCEIRO' },
    { title: 'PDV', url: '/pdv', icon: ShoppingCart, moduleKey: 'FINANCEIRO' },
    // 🆕 NOVO: Submenu Crypto
    {
      title: 'Pagamentos Crypto',
      icon: Bitcoin,
      moduleKey: 'FINANCEIRO',
      collapsed: true,
      subItems: [
        { title: 'Dashboard Crypto', url: '/financeiro/crypto', icon: Bitcoin },
        { title: 'Exchanges', url: '/financeiro/crypto/exchanges', icon: Wallet },
        { title: 'Carteiras', url: '/financeiro/crypto/wallets', icon: Wallet },
        { title: 'Transações', url: '/financeiro/crypto/transactions', icon: ArrowRightLeft },
        { title: 'Análise de Mercado', url: '/financeiro/crypto/analysis', icon: TrendingUp },
      ]
    },
    { title: 'Split de Pagamento', url: '/split-pagamento', icon: CreditCard, moduleKey: 'SPLIT_PAGAMENTO' },
    { title: 'Inadimplência', url: '/inadimplencia', icon: Shield, moduleKey: 'INADIMPLENCIA' }
  ]
}
```

#### **3.2.3 Integração com PDV (Ponto de Venda)**

**Fluxo no PDV:**
1. Cliente seleciona produto/serviço
2. No checkout, aparecem as opções de pagamento:
   - 💳 Cartão Crédito/Débito
   - 💵 Dinheiro
   - 📱 PIX
   - **₿ Bitcoin/Cripto** (NOVO)
3. Se escolher Crypto:
   - Sistema mostra QR Code da carteira
   - Cliente escaneia com wallet mobile
   - Aguarda confirmação (1-3 confirmações)
   - Sistema converte automaticamente para BRL
   - Registra em `contas_receber` como PAGO

**Código de Integração:**
```typescript
// src/pages/PDV.tsx - Adicionar opção crypto
const paymentMethods = [
  { id: 'card', name: 'Cartão', icon: CreditCard },
  { id: 'cash', name: 'Dinheiro', icon: Banknote },
  { id: 'pix', name: 'PIX', icon: Smartphone },
  { id: 'crypto', name: 'Criptomoeda', icon: Bitcoin }, // NOVO
];

const handleCryptoPayment = async (amount: number) => {
  // 1. Selecionar carteira ativa
  const wallet = await selectActiveWallet('BTC');

  // 2. Gerar QR Code
  const qrCode = await generatePaymentQR({
    wallet_id: wallet.id,
    amount_brl: amount,
    patient_id: currentPatient.id,
  });

  // 3. Mostrar QR Code para cliente
  setQRCodeDialog(qrCode);

  // 4. Monitorar blockchain via webhook
  // (Webhook automaticamente atualiza quando confirmar)
};
```

---

### 3.3 Estrutura do Banco de Dados (Crypto)

#### **Tabela: crypto_exchange_config**
Armazena configurações de exchanges conectadas.

```sql
CREATE TABLE crypto_exchange_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  exchange_name TEXT NOT NULL, -- 'BINANCE', 'COINBASE', 'MERCADO_BITCOIN', 'OFFLINE'
  api_key_encrypted TEXT, -- NULL se for carteira offline
  api_secret_encrypted TEXT, -- NULL se for carteira offline
  supported_coins TEXT[] NOT NULL DEFAULT '{}', -- ['BTC', 'ETH', 'USDT']
  auto_convert_to_brl BOOLEAN NOT NULL DEFAULT true,
  processing_fee_percentage NUMERIC(5,2) CHECK (processing_fee_percentage BETWEEN 0 AND 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_offline_wallet BOOLEAN NOT NULL DEFAULT false, -- 🆕 NOVO: Identifica carteira offline
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enum para exchanges suportadas
CREATE TYPE exchange_type AS ENUM (
  'BINANCE',
  'COINBASE', 
  'KRAKEN',
  'MERCADO_BITCOIN',
  'FOXBIT',
  'OFFLINE_COLD_WALLET', -- 🆕 Carteira fria (hardware wallet)
  'OFFLINE_HOT_WALLET'   -- 🆕 Carteira quente (software wallet)
);
```

#### **Tabela: crypto_wallets**
Gerencia carteiras da clínica (online e offline).

```sql
CREATE TABLE crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  exchange_id UUID REFERENCES crypto_exchange_config(id), -- NULL se offline
  wallet_name TEXT NOT NULL,
  wallet_address TEXT NOT NULL, -- Endereço público da carteira
  coin_type TEXT NOT NULL, -- 'BTC', 'ETH', 'USDT', 'USDC', 'LTC'
  wallet_type TEXT NOT NULL DEFAULT 'ONLINE', -- 'ONLINE', 'COLD', 'HOT', 'HARDWARE'
  balance NUMERIC(18,8) DEFAULT 0,
  balance_brl NUMERIC(12,2) DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- 🆕 CAMPOS PARA CARTEIRAS OFFLINE
  private_key_encrypted TEXT, -- Chave privada criptografada (APENAS se gerenciado internamente)
  mnemonic_phrase_encrypted TEXT, -- Seed phrase criptografada (backup)
  derivation_path TEXT, -- Ex: m/44'/0'/0'/0/0 (BIP44)
  hardware_device_type TEXT, -- 'LEDGER', 'TREZOR', 'COLDCARD', NULL

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(clinic_id, wallet_address)
);

-- Índices
CREATE INDEX idx_wallets_clinic ON crypto_wallets(clinic_id);
CREATE INDEX idx_wallets_coin ON crypto_wallets(coin_type);
CREATE INDEX idx_wallets_active ON crypto_wallets(is_active) WHERE is_active = true;
```

#### **Tabela: crypto_transactions**
Rastreia todas as transações de recebimento.

```sql
CREATE TABLE crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  wallet_id UUID NOT NULL REFERENCES crypto_wallets(id),
  exchange_id UUID REFERENCES crypto_exchange_config(id),
  patient_id UUID REFERENCES prontuarios(patient_id),
  conta_receber_id UUID REFERENCES contas_receber(id),

  transaction_hash TEXT NOT NULL, -- Hash da transação na blockchain
  block_number BIGINT, -- Número do bloco (quando confirmado)

  amount_crypto NUMERIC(18,8) NOT NULL,
  coin_type TEXT NOT NULL,
  amount_brl NUMERIC(12,2) NOT NULL,
  exchange_rate_brl NUMERIC(12,2) NOT NULL, -- Cotação no momento

  status TEXT NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'CONFIRMANDO', 'CONFIRMADO', 'CONVERTIDO', 'FALHOU'
  confirmations INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 3, -- Varia por moeda (BTC=3, ETH=12)

  processing_fee_brl NUMERIC(12,2) DEFAULT 0,
  net_amount_brl NUMERIC(12,2), -- amount_brl - processing_fee_brl

  tipo TEXT NOT NULL DEFAULT 'RECEBIMENTO', -- 'RECEBIMENTO', 'REEMBOLSO'

  confirmed_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  blockchain_url TEXT, -- Link para explorador (ex: blockchain.com)
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_tx_clinic ON crypto_transactions(clinic_id);
CREATE INDEX idx_tx_wallet ON crypto_transactions(wallet_id);
CREATE INDEX idx_tx_status ON crypto_transactions(status);
CREATE INDEX idx_tx_hash ON crypto_transactions(transaction_hash);
CREATE INDEX idx_tx_patient ON crypto_transactions(patient_id);
```

#### **Tabela: crypto_exchange_rates**
Cache de cotações em tempo real.

```sql
CREATE TABLE crypto_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_type TEXT NOT NULL,
  brl_rate NUMERIC(12,2) NOT NULL,
  usd_rate NUMERIC(12,2),
  source TEXT NOT NULL, -- 'COINGECKO', 'BINANCE', 'MERCADO_BITCOIN'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Dados técnicos (para análise)
  market_cap_usd NUMERIC(20,2),
  volume_24h_usd NUMERIC(20,2),
  change_24h_percent NUMERIC(10,4),

  UNIQUE(coin_type, source, timestamp)
);

-- Índice para busca rápida da cotação mais recente
CREATE INDEX idx_rates_latest ON crypto_exchange_rates(coin_type, timestamp DESC);
```

---

### 3.4 Edge Functions (Backend Logic)

#### **Edge Function 1: sync-crypto-wallet**
Sincroniza saldo e cotação de uma carteira.

```typescript
// supabase/functions/sync-crypto-wallet/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { walletId } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Buscar carteira
  const { data: wallet } = await supabase
    .from('crypto_wallets')
    .select('*, exchange:crypto_exchange_config(*)')
    .eq('id', walletId)
    .single();

  if (!wallet) return new Response('Wallet not found', { status: 404 });

  // 2. Sincronizar saldo
  let balance = 0;

  if (wallet.wallet_type === 'ONLINE' && wallet.exchange) {
    // Consultar API da exchange (Binance, Coinbase, etc)
    balance = await getBalanceFromExchange(wallet);
  } else {
    // Carteira offline: consultar blockchain explorer (blockchain.com, etherscan.io)
    balance = await getBalanceFromBlockchain(wallet);
  }

  // 3. Buscar cotação atual
  const rate = await getCoinRate(wallet.coin_type);

  // 4. Atualizar banco
  await supabase
    .from('crypto_wallets')
    .update({
      balance: balance,
      balance_brl: balance * rate.brl_rate,
      last_sync_at: new Date().toISOString()
    })
    .eq('id', walletId);

  return new Response(JSON.stringify({ balance, rate }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Helper: Consultar blockchain (para carteiras offline)
async function getBalanceFromBlockchain(wallet: any) {
  if (wallet.coin_type === 'BTC') {
    // Bitcoin: usar blockchain.com API
    const res = await fetch(
      `https://blockchain.info/q/addressbalance/${wallet.wallet_address}`
    );
    const satoshis = await res.text();
    return parseFloat(satoshis) / 100000000; // Converter satoshis para BTC
  } else if (wallet.coin_type === 'ETH') {
    // Ethereum: usar Etherscan API
    const apiKey = Deno.env.get('ETHERSCAN_API_KEY');
    const res = await fetch(
      `https://api.etherscan.io/api?module=account&action=balance&address=${wallet.wallet_address}&tag=latest&apikey=${apiKey}`
    );
    const data = await res.json();
    return parseFloat(data.result) / 1e18; // Wei para ETH
  }
  // Adicionar suporte para outras moedas...
  return 0;
}
```

#### **Edge Function 2: webhook-crypto-transaction**
Recebe notificações de exchanges quando uma transação é confirmada.

```typescript
// supabase/functions/webhook-crypto-transaction/index.ts
serve(async (req) => {
  const payload = await req.json();
  const supabase = createClient(/*...*/);

  // Validar webhook signature (segurança)
  if (!validateWebhookSignature(payload, req.headers)) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Buscar transação pelo hash
  const { data: tx } = await supabase
    .from('crypto_transactions')
    .select('*')
    .eq('transaction_hash', payload.transaction_hash)
    .single();

  if (!tx) {
    // Nova transação detectada (webhook da exchange)
    await supabase.from('crypto_transactions').insert({
      clinic_id: payload.clinic_id,
      wallet_id: payload.wallet_id,
      transaction_hash: payload.transaction_hash,
      amount_crypto: payload.amount,
      coin_type: payload.coin,
      amount_brl: payload.amount * payload.rate,
      exchange_rate_brl: payload.rate,
      status: 'CONFIRMANDO',
      confirmations: payload.confirmations,
    });
  } else {
    // Atualizar confirmações
    const newStatus = payload.confirmations >= tx.required_confirmations
      ? 'CONFIRMADO'
      : 'CONFIRMANDO';

    await supabase
      .from('crypto_transactions')
      .update({
        confirmations: payload.confirmations,
        status: newStatus,
        confirmed_at: newStatus === 'CONFIRMADO' ? new Date().toISOString() : null,
      })
      .eq('id', tx.id);

    // Se confirmado e auto-conversão ativada, converter para BRL
    if (newStatus === 'CONFIRMADO') {
      await convertCryptoToBRL(tx.id);
    }
  }

  return new Response('OK', { status: 200 });
});
```

#### **Edge Function 3: convert-crypto-to-brl**
Converte transação confirmada para BRL e atualiza Contas a Receber.

```typescript
// supabase/functions/convert-crypto-to-brl/index.ts
serve(async (req) => {
  const { transactionId } = await req.json();
  const supabase = createClient(/*...*/);

  // Buscar transação
  const { data: tx } = await supabase
    .from('crypto_transactions')
    .select('*, exchange:crypto_exchange_config(*)')
    .eq('id', transactionId)
    .single();

  if (tx.status !== 'CONFIRMADO') {
    return new Response('Transaction not confirmed', { status: 400 });
  }

  // Simular conversão na exchange (ou usar API real)
  const processingFee = tx.amount_brl * (tx.exchange.processing_fee_percentage / 100);
  const netAmount = tx.amount_brl - processingFee;

  // Atualizar transação
  await supabase
    .from('crypto_transactions')
    .update({
      status: 'CONVERTIDO',
      processing_fee_brl: processingFee,
      net_amount_brl: netAmount,
      converted_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  // Atualizar Conta a Receber (se vinculada)
  if (tx.conta_receber_id) {
    await supabase
      .from('contas_receber')
      .update({
        status: 'PAGO',
        valor_pago: netAmount,
        data_pagamento: new Date().toISOString(),
      })
      .eq('id', tx.conta_receber_id);

    // Criar registro de pagamento
    await supabase.from('transacoes_pagamento').insert({
      clinic_id: tx.clinic_id,
      conta_receber_id: tx.conta_receber_id,
      valor: netAmount,
      forma_pagamento: `CRIPTO_${tx.coin_type}`,
      data_pagamento: new Date().toISOString(),
      observacoes: `Pagamento em ${tx.coin_type} - Hash: ${tx.transaction_hash}`,
    });
  }

  // Log de auditoria
  await supabase.from('audit_logs').insert({
    clinic_id: tx.clinic_id,
    action: 'CRYPTO_CONVERTED',
    details: { transaction_id: transactionId, net_amount_brl: netAmount },
  });

  return new Response(JSON.stringify({ success: true, netAmount }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

### 3.5 Frontend: Página Principal de Crypto

**Arquivo:** `src/pages/financeiro/CryptoPagamentos.tsx` (Já implementado, melhorias abaixo)

#### **Melhorias a Implementar:**

1. **Seção: Carteiras Offline**
```tsx

      Carteiras Offline (Cold Storage)

        Carteiras offline (cold wallets) são a forma mais segura de armazenar criptomoedas.
        Suas chaves privadas nunca tocam a internet.

    {/* Lista de carteiras offline */}
    {offlineWallets.map(wallet => (

          {wallet.wallet_name}

            {wallet.wallet_address.slice(0, 10)}...{wallet.wallet_address.slice(-8)}

          {wallet.hardware_device_type && (
            {wallet.hardware_device_type}
          )}

          {wallet.balance} {wallet.coin_type}

            R$ {wallet.balance_brl.toLocaleString('pt-BR')}

    ))}

     setOfflineWalletDialog(true)} className="w-full mt-4">

      Adicionar Carteira Offline

```

2. **Formulário: Adicionar Carteira Offline**
```tsx

      Adicionar Carteira Offline

          Bitcoin (BTC)
          Ethereum (ETH)
          Tether (USDT)

          Cold Wallet (Completamente offline)
          Hot Wallet (Software como Electrum, Exodus)
          Hardware Wallet (Ledger, Trezor)

      {walletType === 'HARDWARE' && (

            Ledger Nano S/X
            Trezor One/Model T
            Coldcard

      )}

          IMPORTANTE: Nunca insira suas chaves privadas ou seed phrase aqui.
          O sistema apenas monitora o endereço público para recebimento de pagamentos.

      Adicionar Carteira

```

---

## 📚 4. DOCUMENTAÇÃO: BITCOIN, BLOCKCHAIN E DESCENTRALIZAÇÃO

### 4.1 O Que é Bitcoin?

**Criar arquivo:** `docs/BITCOIN_FUNDAMENTALS.md`

```markdown
# 🌍 Bitcoin e Blockchain: Uma Revolução Financeira

## O Que é Bitcoin?

**Bitcoin** é:
- 💰 Uma **moeda digital descentralizada** criada em 2009 por Satoshi Nakamoto
- 🔗 A primeira aplicação prática da tecnologia **Blockchain**
- 🌐 Uma rede **peer-to-peer** (P2P) sem intermediários
- 📖 Um **livro-razão público e imutável** de todas as transações

### Como Funciona?

1. **Transação Iniciada**: Alice quer enviar 0.01 BTC para Bob
2. **Broadcast na Rede**: Transação é transmitida para milhares de nós (computadores)
3. **Validação**: Mineradores verificam se Alice tem saldo suficiente
4. **Mineração**: Mineradores competem para incluir a transação em um bloco
5. **Confirmação**: Bloco é adicionado à blockchain (1 confirmação)
6. **Segurança**: Após 3-6 confirmações, transação é irreversível

### Por Que é Revolucionário?

#### **1. Descentralização**
- Nenhum governo, banco ou empresa controla o Bitcoin
- Rede distribuída em ~15.000 nós pelo mundo
- Impossível censurar, bloquear ou confiscar (com custódia própria)

#### **2. Transparência**
- Todas as transações são públicas (blockchain explorer)
- Auditável por qualquer pessoa em tempo real
- Oferta limitada: 21 milhões de BTC (escassez matemática)

#### **3. Segurança Criptográfica**
- Chaves privadas de 256 bits (2^256 combinações)
- Mais seguro que sistemas bancários tradicionais
- Sem chargebacks (sem fraudes de estorno)

#### **4. Soberania Financeira**
- Você é seu próprio banco
- Sem necessidade de permissão para usar
- Sem risco de bloqueio de conta

---

## Blockchain: A Tecnologia Por Trás

### O Que é Blockchain?

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Bloco #100  │───→│  Bloco #101  │───→│  Bloco #102  │
│              │    │              │    │              │
│ Hash Anterior│    │ Hash Anterior│    │ Hash Anterior│
│ Transações   │    │ Transações   │    │ Transações   │
│ Timestamp    │    │ Timestamp    │    │ Timestamp    │
│ Nonce        │    │ Nonce        │    │ Nonce        │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Blockchain** é:
- Uma **cadeia de blocos criptograficamente ligados**
- Cada bloco contém um **hash** do bloco anterior
- Alterar um bloco antigo quebraria toda a cadeia (impossível)

### Mineração: Como Novos Bitcoins São Criados

- **Proof of Work (PoW)**: Mineradores resolvem problemas matemáticos complexos
- **Recompensa de Bloco**: Atualmente 6.25 BTC por bloco (~10 minutos)
- **Halving**: Recompensa reduz pela metade a cada 4 anos (2024, 2028...)
- **Último Bitcoin**: Será minerado em ~2140

---

## Vantagens do Bitcoin para Clínicas Odontológicas

### 1. **Proteção Contra Inflação**
- **Problema**: Real brasileiro perdeu 90% do valor desde o Plano Real (1994)
- **Solução**: Bitcoin tem oferta fixa (21M BTC), não pode ser inflacionado
- **Resultado**: Reserva de valor de longo prazo

### 2. **Pagamentos Internacionais Sem Fricção**
- **Problema**: Receber de paciente no exterior custa 5%-10% + demora dias
- **Solução**: Bitcoin atravessa fronteiras instantaneamente
- **Resultado**: Receba de qualquer país em minutos

### 3. **Taxas Reduzidas**
- **Problema**: Cartões cobram 3%-5% por transação
- **Solução**: Bitcoin cobra 0.1%-2% (dependendo da urgência)
- **Resultado**: Economia de milhares de reais por mês

### 4. **Imunidade a Bloqueios e Censura**
- **Problema**: Governos podem congelar contas bancárias sem aviso
- **Solução**: Bitcoin é resistente à censura (chaves privadas = controle total)
- **Resultado**: Segurança financeira em tempos de instabilidade política

### 5. **Sem Chargebacks Fraudulentos**
- **Problema**: Cliente pode fazer chargeback falso em cartão
- **Solução**: Transações Bitcoin são irreversíveis (após confirmações)
- **Resultado**: Zero fraudes pós-pagamento

### 6. **Privacidade Financeira**
- **Problema**: Bancos rastreiam cada centavo que você gasta
- **Solução**: Bitcoin oferece pseudonimato (endereços não ligados a identidade)
- **Resultado**: Liberdade financeira

---

## Como Usar Bitcoin na Prática

### Para Receber Pagamentos:

1. **Configurar Carteira**
   - Criar carteira Bitcoin (Electrum, Ledger, Trezor)
   - Gerar endereço de recebimento

2. **Gerar QR Code**
   - Sistema Ortho+ gera QR Code automaticamente
   - Cliente escaneia com wallet mobile (BlueWallet, Muun, Strike)

3. **Aguardar Confirmações**
   - 1 confirmação: ~10 minutos (já seguro para pequenos valores)
   - 3 confirmações: ~30 minutos (recomendado)
   - 6 confirmações: ~60 minutos (máxima segurança)

4. **Conversão Automática (Opcional)**
   - Sistema converte BTC → BRL automaticamente
   - Deposita em conta bancária da clínica
   - Integra com Contas a Receber

### Carteiras Recomendadas:

#### **Para Iniciantes (Hot Wallets):**
- 📱 **BlueWallet** (iOS/Android) - Gratuito, simples
- 📱 **Muun Wallet** (iOS/Android) - Lightning Network integrado
- 💻 **Electrum** (Desktop) - Open-source, avançado

#### **Para Valores Altos (Cold Wallets):**
- 🔒 **Ledger Nano X** (~R$ 600) - Hardware wallet, Bluetooth
- 🔒 **Trezor Model T** (~R$ 800) - Touchscreen, open-source
- 🔒 **Coldcard** (~R$ 700) - Máxima segurança, air-gapped

---

## Bitcoin vs Sistema Bancário Tradicional

| Aspecto | Bitcoin | Banco Tradicional |
|---------|---------|-------------------|
| **Controle** | Você (chaves privadas) | Banco (pode bloquear) |
| **Horário** | 24/7/365 | Dias úteis, horário comercial |
| **Taxas** | 0.1%-2% | 3%-5% (cartões) |
| **Velocidade** | 10-60 minutos | 1-5 dias úteis |
| **Internacional** | Sem fronteiras | Caro, burocrático |
| **Privacidade** | Pseudônimo | Rastreado, reportado ao governo |
| **Censura** | Resistente | Vulnerável a bloqueios |
| **Inflação** | Oferta fixa (21M) | Impressão ilimitada |

---

## Resistência à Opressão Governamental

### Casos Reais de Uso do Bitcoin:

#### **1. Venezuela (2016-presente)**
- **Situação**: Hiperinflação de 1.000.000% ao ano
- **Bitcoin**: Permite que cidadãos preservem valor
- **Resultado**: Bitcoin é mais usado que o bolivar em algumas regiões

#### **2. Canadá - Bloqueio de Contas (2022)**
- **Situação**: Governo congelou contas bancárias de manifestantes
- **Bitcoin**: Doações em BTC não puderam ser bloqueadas
- **Resultado**: Demonstrou resistência à censura

#### **3. Nigéria - Proibição Bancária (2021)**
- **Situação**: Governo proibiu bancos de processar cripto
- **Bitcoin**: Cidadãos continuaram usando P2P
- **Resultado**: Bitcoin não pode ser "desligado"

#### **4. Rússia - Sanções Internacionais (2022)**
- **Situação**: SWIFT desconectado, impossível transferências internacionais
- **Bitcoin**: Russos usam BTC para receber pagamentos do exterior
- **Resultado**: Moeda global sem dependência de sistemas ocidentais

### Por Que Bitcoin é Imune à Censura?

1. **Descentralização**: Nenhum ponto único de falha
2. **Código Open-Source**: Qualquer um pode auditar e rodar
3. **Rede P2P**: Milhares de nós espalhados pelo mundo
4. **Mineração Distribuída**: Impossível controlar 51% da rede
5. **Chaves Criptográficas**: Sem senha = sem acesso (nem governo)

---

## Conclusão: Por Que Adotar Bitcoin?

> "Bitcoin é a separação entre dinheiro e Estado, assim como houve a separação entre Igreja e Estado."  
> — **Andreas Antonopoulos**, autor de "Mastering Bitcoin"

**Bitcoin não é apenas uma tecnologia. É:**
- 🛡️ Um escudo contra tirania monetária
- 🌍 Uma ponte para economia global
- 🔐 Uma forma de soberania individual
- 💡 O futuro do dinheiro

**Para clínicas odontológicas**, significa:
- Mais métodos de pagamento
- Menos custos operacionais
- Proteção contra inflação
- Independência financeira

---

## Recursos para Aprofundamento

### Livros Recomendados:
- 📖 **"The Bitcoin Standard"** - Saifedean Ammous
- 📖 **"Mastering Bitcoin"** - Andreas Antonopoulos
- 📖 **"The Little Bitcoin Book"** - Bitcoin Collective

### Sites e Ferramentas:
- 🌐 **bitcoin.org** - Site oficial
- 📊 **mempool.space** - Explorador de blockchain
- 📈 **coinmarketcap.com** - Cotações em tempo real
- 🎓 **lopp.net/bitcoin.html** - Recursos educacionais

### Vídeos e Podcasts:
- 🎥 **"Banking on Bitcoin"** (Documentário Netflix)
- 🎙️ **"What Bitcoin Did"** - Peter McCormack
- 🎥 **Canal do Andreas Antonopoulos** (YouTube)
```

---

## 🎨 5. MELHORIAS DE UX/UI - PADRÕES VISUAIS PARA CLÍNICAS

### 5.1 Auto-Foco em Formulários (Tab Automático)

**Objetivo:** Ao preencher um campo, pular automaticamente para o próximo quando o campo atingir o tamanho máximo (CPF, telefone, CEP, etc).

#### **Implementação:**

**Criar componente:** `src/components/forms/AutoFocusInput.tsx`

```tsx
import { Input } from '@/components/ui/input';
import { useRef, useEffect, KeyboardEvent } from 'react';

interface AutoFocusInputProps {
  maxLength: number;
  nextInputRef?: React.RefObject;
  previousInputRef?: React.RefObject;
  value: string;
  onChange: (value: string) => void;
  mask?: 'cpf' | 'phone' | 'cep' | 'date';
  [key: string]: any;
}

export function AutoFocusInput({
  maxLength,
  nextInputRef,
  previousInputRef,
  value,
  onChange,
  mask,
  ...props
}: AutoFocusInputProps) {
  const inputRef = useRef(null);

  // Auto-focus no próximo campo quando atingir maxLength
  useEffect(() => {
    if (value.length === maxLength && nextInputRef?.current) {
      nextInputRef.current.focus();
    }
  }, [value, maxLength, nextInputRef]);

  // Voltar para campo anterior ao pressionar Backspace em campo vazio
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Backspace' && value.length === 0 && previousInputRef?.current) {
      previousInputRef.current.focus();
    }
  };

  // Aplicar máscara
  const applyMask = (rawValue: string): string => {
    const numbers = rawValue.replace(/\D/g, '');

    switch (mask) {
      case 'cpf':
        return numbers
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      case 'phone':
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2');

      case 'cep':
        return numbers.replace(/(\d{5})(\d)/, '$1-$2');

      case 'date':
        return numbers
          .replace(/(\d{2})(\d)/, '$1/$2')
          .replace(/(\d{2})(\d)/, '$1/$2');

      default:
        return rawValue;
    }
  };

  return (
     onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      maxLength={maxLength}
      {...props}
    />
  );
}
```

#### **Exemplo de Uso: Formulário de Paciente**

```tsx
// src/pages/PatientForm.tsx
import { AutoFocusInput } from '@/components/forms/AutoFocusInput';

export function PatientForm() {
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');

  const cpfRef = useRef(null);
  const phoneRef = useRef(null);
  const cepRef = useRef(null);

  return (

  );
}
```

---

### 5.2 Tooltips Informativos (Hover sobre Módulos/Funções)

**Objetivo:** Ao passar o mouse sobre um módulo, função ou campo, exibir informações contextuais.

#### **Implementação:**

**Já existe:** `src/components/shared/OdontoTooltipSimple.tsx` (para tooltips simples)

**Expandir para:** `src/components/shared/ModuleTooltip.tsx`

```tsx
import { HelpCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ModuleTooltipProps {
  moduleKey: string;
  children?: React.ReactNode;
  variant?: 'icon' | 'inline';
}

interface ModuleInfo {
  name: string;
  category: string;
  description: string;
  dependencies?: string[];
  benefits: string[];
}

const MODULE_DATA: Record = {
  PEP: {
    name: 'Prontuário Eletrônico do Paciente',
    category: 'Gestão e Operação',
    description: 'Sistema completo de gestão de prontuários digitais com histórico clínico, anamnese, evoluções e anexos.',
    dependencies: [],
    benefits: [
      'Acesso rápido ao histórico do paciente',
      'Conformidade com CFO e LGPD',
      'Backup automático na nuvem',
      'Integração com outros módulos'
    ]
  },
  FINANCEIRO: {
    name: 'Gestão Financeira',
    category: 'Financeiro',
    description: 'Controle completo de fluxo de caixa, contas a pagar e receber, DRE e relatórios financeiros.',
    dependencies: [],
    benefits: [
      'Visão 360° das finanças da clínica',
      'Previsão de fluxo de caixa',
      'Relatórios gerenciais',
      'Integração com pagamentos (PIX, Cartão, Cripto)'
    ]
  },
  CRYPTO: {
    name: 'Pagamentos em Criptomoedas',
    category: 'Financeiro',
    description: 'Aceite Bitcoin, USDT e outras criptomoedas. Conversão automática para BRL e integração com exchanges.',
    dependencies: ['FINANCEIRO'],
    benefits: [
      'Taxas reduzidas (0.1%-2%)',
      'Pagamentos globais sem fronteiras',
      'Proteção contra inflação',
      'Resistência à censura governamental'
    ]
  },
  MARKETING_AUTO: {
    name: 'Automação de Marketing',
    category: 'Crescimento e Marketing',
    description: 'Campanhas automatizadas de recall, pós-consulta, aniversário e segmentação de pacientes.',
    dependencies: [],
    benefits: [
      'Aumento da retenção de pacientes',
      'Recall automático de consultas',
      'Segmentação inteligente',
      'ROI mensurável'
    ]
  },
  // Adicionar todos os outros módulos...
};

export function ModuleTooltip({ moduleKey, children, variant = 'icon' }: ModuleTooltipProps) {
  const data = MODULE_DATA[moduleKey];
  if (!data) return children || ;

  return (

          {variant === 'icon' ? (

          ) : (
            children
          )}

              {data.name}
              {data.category}

            {data.description}

            {data.dependencies && data.dependencies.length > 0 && (

                Depende de:

                  {data.dependencies.map(dep => (

                      {dep}

                  ))}

            )}

              Benefícios:

                {data.benefits.map((benefit, i) => (

                    ✓
                    {benefit}

                ))}

  );
}
```

#### **Integração na Sidebar:**

```tsx
// src/core/layout/Sidebar/SidebarMenu.tsx
import { ModuleTooltip } from '@/components/shared/ModuleTooltip';

    {item.title}

  {item.moduleKey && }

```

---

### 5.3 Tema Visual para Clínicas Odontológicas

**Objetivo:** Criar paleta de cores e elementos visuais que transmitam **confiança, higiene, profissionalismo e modernidade**.

#### **Paleta de Cores:**

```css
/* src/index.css - Adicionar à seção :root */
:root {
  /* Cores Primárias - Azul Odontológico (confiança, higiene) */
  --dental-primary: 195 100% 45%; /* #0099CC - Azul dental */
  --dental-primary-hover: 195 100% 40%;
  --dental-primary-light: 195 100% 95%;

  /* Cores Secundárias - Verde Saúde (vitalidade) */
  --dental-secondary: 160 60% 50%; /* #4DB8B8 - Verde-água */
  --dental-secondary-hover: 160 60% 45%;

  /* Cores de Alerta - Vermelho Suave (menos agressivo) */
  --dental-alert: 0 65% 55%; /* #D14545 - Vermelho suave */

  /* Backgrounds - Branco cirúrgico */
  --dental-bg: 0 0% 100%; /* Branco puro */
  --dental-card: 210 20% 98%; /* Branco azulado */

  /* Textos */
  --dental-text: 220 20% 15%; /* Cinza escuro azulado */
  --dental-text-muted: 220 10% 50%;

  /* Sucesso - Verde menta */
  --dental-success: 150 70% 45%;

  /* Aviso - Amarelo dental */
  --dental-warning: 45 100% 55%;
}

/* Tema Dental (aplicar ao body ou root) */
.dental-theme {
  --primary: var(--dental-primary);
  --primary-foreground: 0 0% 100%;
  --secondary: var(--dental-secondary);
  --background: var(--dental-bg);
  --card: var(--dental-card);
  --destructive: var(--dental-alert);
  --success: var(--dental-success);
}
```

#### **Componentes Customizados:**

**1. Card de Paciente (Estilo Clínico)**
```tsx
// src/components/dental/PatientCard.tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function PatientCard({ patient }) {
  return (

      {/* Ribbon de Status */}
      {patient.status === 'Ativo' && (

          Ativo

      )}

            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}

          {patient.name}
          Última consulta: {patient.lastVisit}

              {patient.age} anos

            {patient.hasAlerts && (

                ⚠ Atenção

            )}

  );
}
```

**2. Header de Módulo (Visual Profissional)**
```tsx
// src/components/dental/ModuleHeader.tsx
export function ModuleHeader({ title, description, icon: Icon, actions }) {
  return (

            {title}
            {description}

          {actions}

  );
}
```

**3. Ícones Customizados (Dental)**
```tsx
// src/components/icons/DentalIcons.tsx
export const ToothIcon = () => (

);

export const DentalChairIcon = () => (

    {/* SVG da cadeira odontológica */}

);
```

---

### 5.4 Animações e Microinterações

**Objetivo:** Adicionar feedback visual suave para melhorar a experiência.

#### **Implementação:**

```tsx
// src/lib/animations/dental-animations.ts
export const dentalAnimations = {
  // Card hover
  cardHover: {
    scale: 1.02,
    boxShadow: "0 10px 30px -15px rgba(0, 153, 204, 0.3)",
    transition: { duration: 0.2 }
  },

  // Button press
  buttonTap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },

  // Fade in
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },

  // Slide from right (sidebar)
  slideFromRight: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 },
    transition: { type: "spring", damping: 25 }
  }
};

// Uso com Framer Motion
import { motion } from 'framer-motion';
import { dentalAnimations } from '@/lib/animations/dental-animations';

  ...

```

---

## 🛣️ 6. ROADMAP DE IMPLEMENTAÇÃO - FASES RESTANTES

### FASE 6: Finalização de Módulos Core (15-20 dias)

#### **T6.1: Módulo CRM (Completo)**
- Funil de vendas visual (Kanban)
- Gestão de leads e oportunidades
- Pipeline de conversão
- Integração com WhatsApp/Email

**Tabelas:**
- `crm_leads`
- `crm_pipeline_stages`
- `crm_opportunities`
- `crm_activities`
- `crm_tasks`

#### **T6.2: Módulo TISS (Faturamento de Convênios)**
- Geração de guias TISS (XML)
- Validação de lotes
- Integração com operadoras
- Rastreamento de reembolsos

**Tabelas:**
- `tiss_guias`
- `tiss_lotes`
- `tiss_operadoras`
- `tiss_procedimentos`

#### **T6.3: Módulo FLUXO_DIGITAL**
- Integração com scanners intraorais
- Envio para laboratórios CAD/CAM
- Rastreamento de pedidos
- Galeria de casos clínicos

**Tabelas:**
- `scanner_integrations`
- `lab_orders`
- `case_gallery`

#### **T6.4: Refatoração Odontograma (2D/3D)**
- Odontograma 2D interativo (Canvas)
- Odontograma 3D (Three.js)
- Marcação de procedimentos
- Histórico visual

---

### FASE 7: Automações e Edge Functions (10-15 dias)

#### **T7.1: WhatsApp Automation**
```typescript
// supabase/functions/send-whatsapp-confirmation/index.ts
// - Confirmação de agendamento
// - Recall de consultas
// - Lembretes automáticos
// - Pesquisa de satisfação
```

#### **T7.2: Email Automation**
```typescript
// supabase/functions/send-email-campaign/index.ts
// - Campanhas de marketing
// - Relatórios financeiros
// - Alertas de inadimplência
// - Boletins informativos
```

#### **T7.3: Relatórios Agendados**
```typescript
// supabase/functions/generate-scheduled-report/index.ts
// - DRE mensal automático
// - Relatório de produção dentistas
// - Relatório de estoque crítico
// - Dashboard executivo PDF
```

---

### FASE 8: Testes E2E e Validação Final (5-7 dias)

#### **T8.1: Testes E2E com Playwright**
- Fluxo completo de agendamento
- Fluxo de pagamento (PIX, Cartão, Crypto)
- Fluxo de criação de orçamento → contrato
- Fluxo de prontuário completo

#### **T8.2: Testes de Carga**
- 1000 usuários simultâneos
- 10.000 pacientes no banco
- 100.000 transações

#### **T8.3: Validação de Segurança**
- Auditoria de RLS Policies
- Penetration testing
- Validação LGPD/CFO

---

### FASE 9: Documentação e Onboarding (3-5 dias)

#### **T9.1: Documentação Completa**
- Manual do Usuário (PDF interativo)
- Guia de Administrador
- FAQ e Troubleshooting
- Vídeos tutoriais

#### **T9.2: Tour Guiado Interativo**
- Tour inicial para novos usuários
- Tooltips contextuais
- Passo a passo por módulo
- Gamificação (checkpoints)

**Implementação:**
```tsx
// Usar biblioteca react-joyride (já instalada)
import Joyride from 'react-joyride';

const steps = [
  {
    target: '.dashboard-stats',
    content: 'Aqui você vê as estatísticas principais da sua clínica.',
    disableBeacon: true,
  },
  {
    target: '.sidebar-nav',
    content: 'Use a barra lateral para navegar entre os módulos.',
  },
  // ... mais steps
];

```

---

## 🔧 7. ESPECIFICAÇÕES TÉCNICAS AVANÇADAS

### 7.1 Arquitetura de Multi-Tenancy

```
┌─────────────────────────────────────────────┐
│              APLICAÇÃO (React)              │
└───────────────────┬─────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│         SUPABASE (Auth + Database)          │
│  ┌───────────────────────────────────────┐  │
│  │  RLS Policy: clinic_id Filter         │  │
│  │  WHERE clinic_id = get_user_clinic_id()│ │
│  └───────────────────────────────────────┘  │
└───────────────────┬─────────────────────────┘
                    │
         ┌──────────┼──────────┐
         ↓          ↓          ↓
    ┌────────┐ ┌────────┐ ┌────────┐
    │Clinic A│ │Clinic B│ │Clinic C│
    │ (data) │ │ (data) │ │ (data) │
    └────────┘ └────────┘ └────────┘
```

**Função de isolamento:**
```sql
CREATE OR REPLACE FUNCTION get_user_clinic_id(user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
  SELECT clinic_id FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;
```

---

### 7.2 Sistema de Permissões (RBAC)

```sql
-- Enum de roles
CREATE TYPE app_role AS ENUM ('ADMIN', 'MEMBER');

-- Função de verificação de role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND app_role = required_role
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Uso em RLS Policy
CREATE POLICY "Only admins can manage modules"
ON clinic_modules
FOR ALL
USING (
  clinic_id = get_user_clinic_id(auth.uid())
  AND has_role(auth.uid(), 'ADMIN')
);
```

---

### 7.3 Sistema de Auditoria (Compliance LGPD)

**Todas as ações críticas são logadas:**

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'MODULE_ACTIVATED', 'PATIENT_VIEWED', etc
  target_module_id INT REFERENCES module_catalog(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger automático para logar mudanças
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (clinic_id, user_id, action, details)
  VALUES (
    NEW.clinic_id,
    auth.uid(),
    TG_OP || '_' || TG_TABLE_NAME,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar a tabelas sensíveis
CREATE TRIGGER audit_patient_changes
AFTER INSERT OR UPDATE OR DELETE ON prontuarios
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
```

---

### 7.4 Backup e Disaster Recovery

**Estratégia 3-2-1:**
- **3** cópias dos dados
- **2** tipos diferentes de mídia
- **1** cópia offsite

**Implementação:**
1. **Primário**: Supabase Postgres (replicação automática)
2. **Secundário**: Cloud Storage (S3/GCS) - backups diários
3. **Terciário**: Download local mensal (clínica baixa backup)

**Política de Retenção:**
- Diários: 7 dias
- Semanais: 4 semanas
- Mensais: 12 meses
- Anuais: 7 anos (conformidade CFO)

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica                   | Objetivo              |
| ------------------------- | --------------------- |
| **Tempo de Carregamento** | < 2s (Lighthouse 90+) |
| **Uptime**                | > 99.9%               |
| **Tempo de Resposta API** | < 300ms (p95)         |
| **Cobertura de Testes**   | > 80%                 |
| **Satisfação do Usuário** | > 4.5/5 (NPS > 50)    |
| **Bugs Críticos**         | 0 em produção         |

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Implementar Auto-Focus em todos os formulários** (1-2 dias)
2. **Adicionar ModuleTooltip na sidebar** (1 dia)
3. **Aplicar tema dental (cores e componentes)** (2-3 dias)
4. **Expandir integração crypto no PDV** (2 dias)
5. **Criar documentação Bitcoin/Blockchain** (1 dia)
6. **Implementar carteiras offline no módulo crypto** (3-4 dias)

Este é o **PLANO MESTRE COMPLETO** do sistema Ortho+. Ele inclui:

✅ **Todas as fases já implementadas** (recapitulação completa)  
✅ **Integração completa de crypto no módulo financeiro/PDV**  
✅ **Documentação detalhada sobre Bitcoin, Blockchain e descentralização**  
✅ **Melhorias de UX** (auto-foco em formulários, tooltips informativos)  
✅ **Padrões visuais profissionais para clínicas odontológicas**  
✅ **Manutenção da arquitetura modular e descentralizada**  
✅ **Roadmap completo das fases restantes**

Implementar o plano completo