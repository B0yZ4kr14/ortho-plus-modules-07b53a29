import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { amountBRL, orderId, patientEmail, metadata } = await req.json();
    
    if (!amountBRL || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: amountBRL, orderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Clínica não encontrada' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configurações BTCPay
    const BTCPAY_URL = Deno.env.get("BTCPAY_SERVER_URL") || "https://btcpay.example.com";
    const BTCPAY_STORE_ID = Deno.env.get("BTCPAY_STORE_ID");
    const BTCPAY_API_KEY = Deno.env.get("BTCPAY_API_KEY");

    if (!BTCPAY_STORE_ID || !BTCPAY_API_KEY) {
      console.warn('⚠️ BTCPay não configurado, usando mock');
      
      // Mock para desenvolvimento
      const mockInvoiceId = crypto.randomUUID();
      const { data: payment, error: insertError } = await supabase
        .from('crypto_payments')
        .insert({
          clinic_id: profile.clinic_id,
          order_id: orderId,
          invoice_id: mockInvoiceId,
          amount_brl: amountBRL,
          currency: 'BRL',
          status: 'PENDING',
          checkout_link: `${BTCPAY_URL}/invoice/${mockInvoiceId}`,
          qr_code_data: `bitcoin:mock_address?amount=0.001`,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          paymentId: payment.id,
          invoiceId: mockInvoiceId,
          checkoutLink: payment.checkout_link,
          qrCodeData: payment.qr_code_data,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          status: 'PENDING',
          mock: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar invoice no BTCPay Server
    const webhookUrl = `${supabaseUrl}/functions/v1/crypto-webhook`;
    const redirectUrl = metadata?.redirectUrl || `${supabaseUrl}/payment/success`;

    const btcpayResponse = await fetch(`${BTCPAY_URL}/api/v1/stores/${BTCPAY_STORE_ID}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${BTCPAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: amountBRL.toString(),
        currency: 'BRL',
        checkout: {
          redirectURL: redirectUrl,
          paymentMethods: ['BTC', 'BTC-LightningNetwork', 'ETH', 'USDT', 'LTC', 'DAI'],
        },
        metadata: {
          orderId,
          clinicId: profile.clinic_id,
          buyerEmail: patientEmail,
          ...metadata,
        },
        additionalNotificationUrl: webhookUrl,
      }),
    });

    if (!btcpayResponse.ok) {
      const errorText = await btcpayResponse.text();
      console.error('❌ BTCPay API Error:', btcpayResponse.status, errorText);
      throw new Error(`BTCPay API Error: ${btcpayResponse.statusText}`);
    }

    const btcpayData = await btcpayResponse.json();

    // Salvar pagamento no banco
    const { data: payment, error: insertError } = await supabase
      .from('crypto_payments')
      .insert({
        clinic_id: profile.clinic_id,
        order_id: orderId,
        invoice_id: btcpayData.id,
        amount_brl: amountBRL,
        currency: 'BRL',
        status: 'PENDING',
        checkout_link: btcpayData.checkoutLink,
        expires_at: btcpayData.expirationTime,
        created_by: user.id,
        metadata: {
          btcpay_data: btcpayData,
          patient_email: patientEmail,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao salvar pagamento:', insertError);
      throw insertError;
    }

    // Registrar no audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        action: 'CRYPTO_INVOICE_CREATED',
        details: {
          payment_id: payment.id,
          invoice_id: btcpayData.id,
          amount_brl: amountBRL,
          order_id: orderId,
        },
      });

    console.log(`✅ Invoice criada: ${btcpayData.id} - R$ ${amountBRL}`);

    return new Response(
      JSON.stringify({
        paymentId: payment.id,
        invoiceId: btcpayData.id,
        checkoutLink: btcpayData.checkoutLink,
        qrCodeData: btcpayData.invoiceLink + '/qr',
        expiresAt: btcpayData.expirationTime,
        status: 'PENDING',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao criar invoice:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create invoice',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
