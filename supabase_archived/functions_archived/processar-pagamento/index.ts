import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  conta_receber_id: string;
  valor: number;
  metodo_pagamento: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO';
  dados_pagamento?: {
    pix_key?: string;
    card_number?: string;
    card_holder?: string;
    card_expiry?: string;
    card_cvv?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Autenticar usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Não autenticado');
    }

    // Obter clinic_id do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Perfil não encontrado');
    }

    const { conta_receber_id, valor, metodo_pagamento, dados_pagamento }: PaymentRequest = await req.json();

    // Buscar conta a receber
    const { data: conta, error: contaError } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('id', conta_receber_id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (contaError || !conta) {
      throw new Error('Conta não encontrada');
    }

    // Simular processamento de pagamento
    let pagamentoAprovado = false;
    let transacao_id = `TRX-${Date.now()}`;

    if (metodo_pagamento === 'PIX') {
      // Integração PIX (simulação)
      console.log('Processando pagamento PIX:', dados_pagamento?.pix_key);
      pagamentoAprovado = true;
      transacao_id = `PIX-${Date.now()}`;
    } else if (metodo_pagamento === 'CARTAO_CREDITO' || metodo_pagamento === 'CARTAO_DEBITO') {
      // Integração Gateway de Cartão (simulação)
      console.log('Processando pagamento cartão:', dados_pagamento?.card_number?.slice(-4));
      pagamentoAprovado = true;
      transacao_id = `CARD-${Date.now()}`;
    }

    if (!pagamentoAprovado) {
      throw new Error('Pagamento não aprovado');
    }

    // Atualizar conta a receber
    const valor_pago_atual = conta.valor_pago || 0;
    const novo_valor_pago = valor_pago_atual + valor;
    const valor_restante = conta.valor - novo_valor_pago;

    let novo_status = 'pendente';
    if (valor_restante <= 0) {
      novo_status = 'pago';
    } else if (novo_valor_pago > 0) {
      novo_status = 'parcial';
    }

    const { error: updateError } = await supabase
      .from('contas_receber')
      .update({
        valor_pago: novo_valor_pago,
        status: novo_status,
        data_pagamento: novo_status === 'pago' ? new Date().toISOString() : conta.data_pagamento,
        forma_pagamento: metodo_pagamento,
      })
      .eq('id', conta_receber_id);

    if (updateError) {
      throw updateError;
    }

    // Registrar transação de pagamento
    const { error: transacaoError } = await supabase
      .from('transacoes_pagamento')
      .insert({
        conta_receber_id,
        clinic_id: profile.clinic_id,
        valor,
        metodo_pagamento,
        transacao_id,
        status: 'aprovado',
        created_by: user.id,
      });

    if (transacaoError) {
      console.error('Erro ao registrar transação:', transacaoError);
    }

    // Registrar log de auditoria
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        action: 'PAGAMENTO_PROCESSADO',
        details: {
          conta_receber_id,
          valor,
          metodo_pagamento,
          transacao_id,
          novo_status,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        transacao_id,
        valor_pago: novo_valor_pago,
        valor_restante: Math.max(0, valor_restante),
        status: novo_status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar pagamento' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
