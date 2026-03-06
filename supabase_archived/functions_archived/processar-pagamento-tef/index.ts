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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      clinic_id,
      venda_id,
      tipo_operacao,
      valor,
      num_parcelas = 1,
      provedor = 'SITEF'
    } = await req.json();

    console.log('[TEF] Processando pagamento:', { clinic_id, venda_id, tipo_operacao, valor });

    // Buscar configuração TEF da clínica
    const { data: config, error: configError } = await supabase
      .from('tef_config')
      .select('*')
      .eq('clinic_id', clinic_id)
      .eq('provedor', provedor)
      .eq('ativo', true)
      .single();

    if (configError || !config) {
      throw new Error('Configuração TEF não encontrada ou inativa');
    }

    // Simular integração com provedor TEF
    // Em produção, aqui seria feita a chamada real à API do provedor (SiTef, Rede, Stone, etc)
    const isProducao = config.ambiente === 'PRODUCAO';
    
    let transacaoAprovada = false;
    let nsu_sitef = '';
    let nsu_host = '';
    let codigo_autorizacao = '';
    let mensagem_erro = '';
    let comprovante_cliente = '';
    let comprovante_estabelecimento = '';

    if (!isProducao) {
      // Modo HOMOLOGAÇÃO - Simular aprovação automática
      transacaoAprovada = true;
      nsu_sitef = `NSU${Date.now().toString().slice(-6)}`;
      nsu_host = `HOST${Date.now().toString().slice(-6)}`;
      codigo_autorizacao = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      comprovante_cliente = `
===================================
     COMPROVANTE - VIA CLIENTE
===================================
Estabelecimento: ${config.codigo_loja}
Terminal: ${config.terminal_id}
-----------------------------------
Valor: R$ ${parseFloat(valor).toFixed(2)}
Tipo: ${tipo_operacao}
Parcelas: ${num_parcelas}x
-----------------------------------
NSU: ${nsu_sitef}
Autorização: ${codigo_autorizacao}
Data/Hora: ${new Date().toLocaleString('pt-BR')}
-----------------------------------
      TRANSAÇÃO APROVADA
===================================
      `;

      comprovante_estabelecimento = comprovante_cliente.replace('VIA CLIENTE', 'VIA ESTABELECIMENTO');
    } else {
      // Modo PRODUÇÃO - Aqui integraria com API real
      // Exemplo pseudo-código:
      // const response = await fetch(config.endpoint_api, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${config.api_key}` },
      //   body: JSON.stringify({ valor, tipo_operacao, num_parcelas, terminal_id: config.terminal_id })
      // });
      // const data = await response.json();
      // transacaoAprovada = data.aprovado;
      // nsu_sitef = data.nsu_sitef;
      // codigo_autorizacao = data.codigo_autorizacao;
      // comprovante_cliente = data.comprovante_cliente;
      
      mensagem_erro = 'Integração TEF em produção requer implementação específica do provedor';
      transacaoAprovada = false;
    }

    // Registrar transação TEF
    const { data: transacao, error: transacaoError } = await supabase
      .from('tef_transacoes')
      .insert({
        clinic_id,
        venda_id,
        tipo_operacao,
        valor,
        num_parcelas,
        nsu_sitef,
        nsu_host,
        codigo_autorizacao,
        bandeira: tipo_operacao.includes('CREDITO') ? 'VISA' : 'MASTER',
        status: transacaoAprovada ? 'APROVADA' : 'NEGADA',
        mensagem_erro,
        comprovante_cliente,
        comprovante_estabelecimento
      })
      .select()
      .single();

    if (transacaoError) throw transacaoError;

    // Atualizar venda se aprovada
    if (transacaoAprovada && venda_id) {
      await supabase
        .from('pdv_vendas')
        .update({ status: 'FINALIZADA' })
        .eq('id', venda_id);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      clinic_id,
      action: 'TEF_TRANSACAO',
      details: {
        transacao_id: transacao.id,
        tipo_operacao,
        valor,
        status: transacao.status,
        nsu_sitef
      }
    });

    console.log('[TEF] Transação processada:', transacao.status);

    return new Response(
      JSON.stringify({
        success: transacaoAprovada,
        transacao,
        comprovante_cliente: transacaoAprovada ? comprovante_cliente : null,
        comprovante_estabelecimento: transacaoAprovada ? comprovante_estabelecimento : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('[TEF] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});