import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'transactionId is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Buscar transação
    const { data: transaction, error: txError } = await supabaseClient
      .from('crypto_transactions')
      .select('*, exchange:crypto_exchange_config(*)')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'CONFIRMADO') {
      return new Response(
        JSON.stringify({ error: 'Transaction must be confirmed before conversion' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (transaction.converted_to_brl_at) {
      return new Response(
        JSON.stringify({ error: 'Transaction already converted' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Converting transaction ${transactionId} - ${transaction.amount_crypto} ${transaction.coin_type} to BRL`);

    // Em produção, chamar API da exchange para converter
    if (transaction.exchange && transaction.exchange.is_active) {
      console.log(`Would convert via ${transaction.exchange.exchange_name}`);
      // Implementar conversão real via API da exchange
      // const conversionResult = await convertViaExchange(transaction.exchange, transaction.amount_crypto, transaction.coin_type);
    }

    // Simular conversão bem-sucedida
    const convertedAt = new Date().toISOString();

    // Atualizar transação
    const { error: updateError } = await supabaseClient
      .from('crypto_transactions')
      .update({
        status: 'CONVERTIDO',
        converted_to_brl_at: convertedAt,
      })
      .eq('id', transactionId);

    if (updateError) throw updateError;

    // Se houver conta a receber vinculada, atualizar como paga
    if (transaction.conta_receber_id) {
      await supabaseClient
        .from('contas_receber')
        .update({
          status: 'PAGO',
          data_pagamento: convertedAt,
          metodo_pagamento: `Crypto (${transaction.coin_type})`,
        })
        .eq('id', transaction.conta_receber_id);
    }

    // Criar transação financeira
    await supabaseClient
      .from('transacoes_pagamento')
      .insert({
        clinic_id: transaction.clinic_id,
        patient_id: transaction.patient_id,
        valor: transaction.amount_brl,
        metodo_pagamento: 'CRYPTO',
        status: 'APROVADO',
        taxa_processamento: transaction.network_fee || 0,
        observacoes: `Conversão de ${transaction.amount_crypto} ${transaction.coin_type}`,
      });

    // Registrar no audit log
    await supabaseClient
      .from('audit_logs')
      .insert({
        clinic_id: transaction.clinic_id,
        action: 'CRYPTO_CONVERTED_TO_BRL',
        details: {
          transaction_id: transactionId,
          coin_type: transaction.coin_type,
          amount_crypto: transaction.amount_crypto,
          amount_brl: transaction.amount_brl,
          exchange_rate: transaction.exchange_rate,
          converted_at: convertedAt,
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        transaction_id: transactionId,
        converted_at: convertedAt,
        amount_brl: transaction.amount_brl,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in convert-crypto-to-brl function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
