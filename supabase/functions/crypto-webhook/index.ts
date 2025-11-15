import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, btcpay-sig',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const signature = req.headers.get('btcpay-sig');
    
    console.log('📥 Webhook recebido:', {
      invoiceId: payload.invoiceId,
      status: payload.status,
      timestamp: payload.timestamp,
    });

    // Validar assinatura (opcional mas recomendado)
    const BTCPAY_WEBHOOK_SECRET = Deno.env.get("BTCPAY_WEBHOOK_SECRET");
    if (BTCPAY_WEBHOOK_SECRET && signature) {
      // TODO: Implementar validação HMAC SHA256
      // const isValid = validateWebhookSignature(JSON.stringify(payload), signature, BTCPAY_WEBHOOK_SECRET);
      // if (!isValid) {
      //   return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
      // }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mapear status BTCPay para nosso enum
    const statusMap: Record<string, string> = {
      'New': 'PENDING',
      'Processing': 'PROCESSING',
      'Expired': 'EXPIRED',
      'Invalid': 'FAILED',
      'Settled': 'CONFIRMED',
      'Complete': 'CONFIRMED',
    };

    const newStatus = statusMap[payload.status] || 'PENDING';

    // Buscar pagamento existente
    const { data: payment, error: fetchError } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('invoice_id', payload.invoiceId)
      .single();

    if (fetchError || !payment) {
      console.error('❌ Pagamento não encontrado:', payload.invoiceId);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar status do pagamento
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (payload.btcPaid) {
      updateData.crypto_amount = payload.btcPaid;
    }

    if (newStatus === 'CONFIRMED') {
      updateData.confirmed_at = new Date().toISOString();
      updateData.confirmations = payload.confirmations || 0;
      updateData.transaction_id = payload.transactionId;
    }

    const { error: updateError } = await supabase
      .from('crypto_payments')
      .update(updateData)
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar pagamento:', updateError);
      throw updateError;
    }

    // Se confirmado, atualizar conta a receber
    if (newStatus === 'CONFIRMED' && payment.order_id) {
      const { error: contaError } = await supabase
        .from('contas_receber')
        .update({
          status: 'PAGA',
          data_pagamento: new Date().toISOString(),
          valor_pago: payment.amount_brl,
          forma_pagamento: 'CRYPTO',
          observacoes: `Pago via ${payload.currency} - TX: ${payload.transactionId}`,
        })
        .eq('id', payment.order_id);

      if (contaError) {
        console.error('❌ Erro ao atualizar conta a receber:', contaError);
      }
    }

    // Registrar no audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: payment.clinic_id,
        action: `CRYPTO_PAYMENT_${newStatus}`,
        details: {
          payment_id: payment.id,
          invoice_id: payload.invoiceId,
          old_status: payment.status,
          new_status: newStatus,
          currency: payload.currency,
          amount: payload.amount,
          btc_paid: payload.btcPaid,
          timestamp: payload.timestamp,
        },
      });

    console.log(`✅ Pagamento ${payment.id} atualizado: ${payment.status} → ${newStatus}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        paymentId: payment.id,
        oldStatus: payment.status,
        newStatus,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Webhook processing failed',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
