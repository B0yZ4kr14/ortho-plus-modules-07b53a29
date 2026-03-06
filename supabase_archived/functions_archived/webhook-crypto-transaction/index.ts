import { serve } from 'https://deno.land/std@0.220.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

interface WebhookPayload {
  exchange: 'BINANCE' | 'COINBASE' | 'KRAKEN' | 'BYBIT' | 'MERCADO_BITCOIN';
  transaction_hash: string;
  wallet_address: string;
  coin_type: string;
  amount: number;
  confirmations: number;
  status: 'PENDING' | 'CONFIRMED';
  timestamp: string;
  from_address?: string;
  network_fee?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = await req.json();
    console.log('Webhook received:', payload);

    // Validar assinatura do webhook (em produção, cada exchange tem seu método)
    const webhookSignature = req.headers.get('x-webhook-signature');
    if (!webhookSignature) {
      console.warn('Webhook without signature - validation skipped for development');
    }

    // Buscar carteira pelo endereço
    const { data: wallet, error: walletError } = await supabase
      .from('crypto_wallets')
      .select('*, crypto_exchange_config:exchange_config_id(*)')
      .eq('wallet_address', payload.wallet_address)
      .eq('coin_type', payload.coin_type)
      .single();

    if (walletError || !wallet) {
      console.error('Wallet not found:', payload.wallet_address);
      return new Response(
        JSON.stringify({ error: 'Wallet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se transação já existe
    const { data: existingTx } = await supabase
      .from('crypto_transactions')
      .select('id, status, confirmations')
      .eq('transaction_hash', payload.transaction_hash)
      .single();

    const exchangeRate = await fetchExchangeRate(payload.coin_type);
    const amountBrl = payload.amount * exchangeRate;

    // Buscar taxa de processamento da exchange
    const { data: exchangeConfig } = await supabase
      .from('crypto_exchange_config')
      .select('processing_fee_percentage')
      .eq('id', wallet.exchange_config_id)
      .single();

    const processingFeePercentage = exchangeConfig?.processing_fee_percentage || 0;
    const processingFeeBrl = (amountBrl * processingFeePercentage) / 100;
    const netAmountBrl = amountBrl - processingFeeBrl;

    if (existingTx) {
      // Atualizar transação existente com novas confirmações
      const newStatus = payload.confirmations >= 3 ? 'CONFIRMADO' : 'PENDENTE';
      
      const { error: updateError } = await supabase
        .from('crypto_transactions')
        .update({
          confirmations: payload.confirmations,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingTx.id);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        throw updateError;
      }

      // Se transação foi confirmada (3+ confirmações) e ainda não havia sido confirmada
      if (newStatus === 'CONFIRMADO' && existingTx.status !== 'CONFIRMADO') {
        // Atualizar saldo da carteira
        await supabase
          .from('crypto_wallets')
          .update({
            balance: wallet.balance + payload.amount,
            balance_brl: wallet.balance_brl + amountBrl,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', wallet.id);

        // Se houver conta a receber vinculada, atualizar status
        const { data: transaction } = await supabase
          .from('crypto_transactions')
          .select('conta_receber_id')
          .eq('id', existingTx.id)
          .single();

        if (transaction?.conta_receber_id) {
          await supabase
            .from('contas_receber')
            .update({
              status: 'PAGO',
              data_pagamento: new Date().toISOString(),
            })
            .eq('id', transaction.conta_receber_id);
        }

        console.log('Transaction confirmed and balance updated');
      }

      console.log('Transaction updated:', existingTx.id);
    } else {
      // Criar nova transação
      const { data: newTx, error: createError } = await supabase
        .from('crypto_transactions')
        .insert({
          clinic_id: wallet.clinic_id,
          exchange_config_id: wallet.exchange_config_id,
          wallet_id: wallet.id,
          transaction_hash: payload.transaction_hash,
          coin_type: payload.coin_type,
          amount_crypto: payload.amount,
          amount_brl: amountBrl,
          exchange_rate: exchangeRate,
          processing_fee_brl: processingFeeBrl,
          net_amount_brl: netAmountBrl,
          tipo: 'RECEBIMENTO',
          status: payload.confirmations >= 3 ? 'CONFIRMADO' : 'PENDENTE',
          confirmations: payload.confirmations,
          required_confirmations: 3,
          from_address: payload.from_address,
          to_address: payload.wallet_address,
          network_fee: payload.network_fee,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating transaction:', createError);
        throw createError;
      }

      // Se transação já vem confirmada, atualizar saldo
      if (payload.confirmations >= 3) {
        await supabase
          .from('crypto_wallets')
          .update({
            balance: wallet.balance + payload.amount,
            balance_brl: wallet.balance_brl + amountBrl,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', wallet.id);
      }

      console.log('New transaction created:', newTx.id);
    }

    // Registrar no audit log
    await supabase.from('audit_logs').insert({
      clinic_id: wallet.clinic_id,
      action: 'CRYPTO_TRANSACTION_WEBHOOK',
      details: {
        transaction_hash: payload.transaction_hash,
        coin_type: payload.coin_type,
        amount: payload.amount,
        confirmations: payload.confirmations,
        exchange: payload.exchange,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        confirmations: payload.confirmations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchExchangeRate(coinType: string): Promise<number> {
  try {
    // Em produção, usar API real como CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(coinType)}&vs_currencies=brl`
    );
    const data = await response.json();
    const coinId = getCoinGeckoId(coinType);
    return data[coinId]?.brl || 0;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback para taxas simuladas
    const rates: Record<string, number> = {
      BTC: 350000,
      ETH: 18000,
      USDT: 5.2,
      BNB: 2200,
      USDC: 5.2,
    };
    return rates[coinType] || 0;
  }
}

function getCoinGeckoId(coinType: string): string {
  const mapping: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BNB: 'binancecoin',
    USDC: 'usd-coin',
  };
  return mapping[coinType] || coinType.toLowerCase();
}
