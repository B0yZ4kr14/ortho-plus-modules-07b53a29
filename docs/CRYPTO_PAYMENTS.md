# Módulo de Pagamentos em Criptomoedas

## Visão Geral

O módulo de Pagamentos em Criptomoedas permite que clínicas aceitem pagamentos em Bitcoin, Ethereum, USDT e outras criptomoedas populares. O sistema integra com as principais exchanges (Binance, Coinbase, Kraken) e oferece conversão automática para BRL.

## Funcionalidades Principais

### 1. Configuração de Exchanges
- Conecte sua conta em exchanges de criptomoedas
- Configure API keys criptografadas
- Defina moedas suportadas
- Configure conversão automática para BRL
- Defina taxa de processamento personalizável

### 2. Gerenciamento de Carteiras
- Crie múltiplas carteiras para diferentes moedas
- Sincronize saldos automaticamente
- Monitore cotações em tempo real
- Visualize saldo em BTC e BRL

### 3. Processamento de Transações
- Gere QR Codes para pagamentos
- Monitore confirmações de blockchain
- Conversão automática para BRL
- Integração com Contas a Receber

## Estrutura do Banco de Dados

### crypto_exchange_config
Armazena configurações de exchanges conectadas:
- `exchange_name`: Nome da exchange (BINANCE, COINBASE, etc)
- `api_key_encrypted`: API key criptografada
- `supported_coins`: Array de moedas suportadas
- `auto_convert_to_brl`: Conversão automática ativada
- `processing_fee_percentage`: Taxa de processamento (%)

### crypto_wallets
Gerencia carteiras de criptomoedas:
- `wallet_address`: Endereço da carteira
- `coin_type`: Tipo de moeda (BTC, ETH, USDT, etc)
- `balance`: Saldo em cripto
- `balance_brl`: Saldo equivalente em BRL
- `last_sync_at`: Última sincronização

### crypto_transactions
Rastreia todas as transações:
- `transaction_hash`: Hash da transação blockchain
- `amount_crypto`: Valor em criptomoeda
- `amount_brl`: Valor em BRL
- `status`: PENDENTE, CONFIRMADO, CONVERTIDO, FALHOU
- `confirmations`: Número de confirmações
- `processing_fee_brl`: Taxa de processamento em BRL

### crypto_exchange_rates
Cache de cotações:
- `coin_type`: Tipo de moeda
- `brl_rate`: Taxa de câmbio em BRL
- `source`: Fonte da cotação (CoinGecko, Binance)

## Fluxo de Pagamento

### 1. Solicitação de Pagamento
```typescript
// Cliente solicita pagamento em Bitcoin
const paymentRequest = await createPaymentRequest({
  wallet_id: 'uuid-da-carteira',
  amount_crypto: 0.001, // 0.001 BTC
  patient_id: 'uuid-do-paciente',
  conta_receber_id: 'uuid-da-conta'
});
```

### 2. Geração de QR Code
- Sistema gera QR Code com endereço da carteira
- Paciente escaneia com wallet mobile
- Transação é criada com status PENDENTE

### 3. Monitoramento via Webhook
```typescript
// Exchange notifica via webhook quando confirmar
POST /functions/v1/webhook-crypto-transaction
{
  "transaction_hash": "abc123...",
  "confirmations": 3,
  "status": "CONFIRMADO"
}
```

### 4. Conversão Automática (Opcional)
```typescript
// Se auto_convert_to_brl = true
await convertCryptoToBRL(transactionId);
// Atualiza conta_receber para PAGO
// Cria registro em transacoes_pagamento
```

## Configuração de Exchange

### Binance
1. Acesse [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Crie nova API Key com permissões:
   - Leitura (Read)
   - Spot Trading (para conversões)
3. Configure IP whitelist para segurança
4. Cole API Key no formulário do sistema

### Coinbase
1. Acesse [Coinbase Commerce](https://commerce.coinbase.com/)
2. Crie API Key em Settings > API Keys
3. Configure webhook para notificações
4. Cole API Key no sistema

### Mercado Bitcoin (Brasil)
1. Acesse [Mercado Bitcoin](https://www.mercadobitcoin.com.br/)
2. Configure API em Configurações > API
3. Defina permissões de leitura e trading
4. Configure no sistema

## Segurança

### Criptografia de API Keys
- API Keys são criptografadas antes de armazenar
- Nunca são expostas no frontend
- Descriptografia apenas em Edge Functions

### RLS Policies
- Todas as tabelas possuem Row Level Security
- Acesso restrito por `clinic_id`
- Admins têm controle total

### Auditoria
- Todas as ações são registradas em `audit_logs`
- Rastreamento completo de transações
- Logs de sincronização e conversões

## Integração com Contas a Receber

Quando uma transação é convertida para BRL:

1. Status da transação → CONVERTIDO
2. Conta a Receber → PAGO
3. Registro em transacoes_pagamento
4. Notificação ao usuário

## Troubleshooting

### Transação não aparece
- Verifique se webhook está configurado na exchange
- Confirme que carteira está ativa
- Valide que endereço está correto

### Saldo desatualizado
- Use botão "Sincronizar" manualmente
- Verifique conexão com API da exchange
- Confirme que API key tem permissões corretas

### Conversão falhou
- Verifique saldo da carteira
- Confirme cotação atual
- Valide configuração de auto_convert_to_brl

### Taxa de processamento
- Configurável por exchange
- Aplicada automaticamente no cálculo
- `net_amount_brl = amount_brl - processing_fee_brl`

## Métricas e Relatórios

Dashboard exibe:
- Total em BTC acumulado
- Total em BRL equivalente
- Transações pendentes
- Transações confirmadas hoje
- Volume por moeda
- Taxa de conversão

## APIs Utilizadas

### CoinGecko (Cotações)
- Endpoint: `/api/v3/simple/price`
- Atualização: A cada sincronização
- Fallback: Cotações da exchange

### Exchange APIs
- Binance API v3
- Coinbase Commerce API
- Mercado Bitcoin API v4

## Edge Functions

### sync-crypto-wallet
Sincroniza saldo e cotação da carteira:
```bash
curl -X POST https://[project].api/sync-crypto-wallet \
  -H "Authorization: Bearer [token]" \
  -d '{"walletId": "uuid"}'
```

### convert-crypto-to-brl
Converte transação para BRL:
```bash
curl -X POST https://[project].api/convert-crypto-to-brl \
  -H "Authorization: Bearer [token]" \
  -d '{"transactionId": "uuid"}'
```

### webhook-crypto-transaction
Recebe notificações de exchanges:
```bash
curl -X POST https://[project].api/webhook-crypto-transaction \
  -d '{
    "wallet_address": "bc1q...",
    "transaction_hash": "abc123...",
    "amount_crypto": 0.001,
    "coin_type": "BTC",
    "confirmations": 3
  }'
```

## Desenvolvimento Futuro

### Planejado
- [ ] Suporte a Lightning Network (pagamentos instantâneos)
- [ ] Integração com mais exchanges
- [ ] Relatórios fiscais automáticos
- [ ] Staking de criptomoedas
- [ ] Pagamentos recorrentes em cripto

### Em Consideração
- [ ] NFT como método de pagamento
- [ ] DeFi integrations
- [ ] Multi-sig wallets
- [ ] Hardware wallet support

## Suporte

Para dúvidas ou problemas:
- Consulte a documentação da exchange específica
- Verifique os logs de auditoria
- Entre em contato com suporte técnico

---

**Desenvolvido por TSI Telecom**
