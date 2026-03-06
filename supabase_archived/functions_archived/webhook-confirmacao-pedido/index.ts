import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  numero_pedido: string;
  fornecedor_id: string;
  status: 'confirmado' | 'em_transito' | 'entregue' | 'cancelado';
  data_previsao_entrega?: string;
  data_entrega?: string;
  itens?: Array<{
    produto_id: string;
    quantidade_entregue: number;
    lote?: string;
    data_validade?: string;
  }>;
  observacoes?: string;
  tracking_code?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse payload do webhook
    const payload: WebhookPayload = await req.json();
    
    console.log('[Webhook] Recebida confirmação de pedido:', payload);

    // Validar payload
    if (!payload.numero_pedido || !payload.status) {
      throw new Error('Payload inválido: numero_pedido e status são obrigatórios');
    }

    // Buscar pedido pelo número
    const { data: pedido, error: pedidoError } = await supabase
      .from('estoque_pedidos')
      .select(`
        *,
        estoque_fornecedores!inner (
          id,
          nome
        )
      `)
      .eq('numero_pedido', payload.numero_pedido)
      .single();

    if (pedidoError || !pedido) {
      console.error('[Webhook] Pedido não encontrado:', payload.numero_pedido);
      throw new Error(`Pedido ${payload.numero_pedido} não encontrado`);
    }

    console.log(`[Webhook] Pedido encontrado: ${pedido.id} - Status atual: ${pedido.status}`);

    // Preparar dados de atualização
    const updateData: any = {
      status: payload.status === 'confirmado' ? 'confirmado' : 
              payload.status === 'em_transito' ? 'enviado' :
              payload.status === 'entregue' ? 'confirmado' :
              'cancelado',
      updated_at: new Date().toISOString(),
    };

    if (payload.data_previsao_entrega) {
      updateData.data_prevista_entrega = payload.data_previsao_entrega;
    }

    if (payload.data_entrega) {
      updateData.data_recebimento = payload.data_entrega;
    }

    if (payload.observacoes) {
      updateData.observacoes = payload.observacoes;
    }

    // Atualizar status do pedido
    const { error: updateError } = await supabase
      .from('estoque_pedidos')
      .update(updateData)
      .eq('id', pedido.id);

    if (updateError) {
      console.error('[Webhook] Erro ao atualizar pedido:', updateError);
      throw updateError;
    }

    console.log(`[Webhook] Pedido ${pedido.numero_pedido} atualizado para status: ${payload.status}`);

    // Se o pedido foi entregue, criar movimentações de entrada no estoque
    if (payload.status === 'entregue' && payload.itens && payload.itens.length > 0) {
      console.log(`[Webhook] Processando ${payload.itens.length} itens entregues`);

      for (const item of payload.itens) {
        try {
          // Atualizar quantidade do produto
          const { data: produto, error: produtoError } = await supabase
            .from('estoque_produtos')
            .select('quantidade_atual')
            .eq('id', item.produto_id)
            .single();

          if (produtoError || !produto) {
            console.error(`[Webhook] Produto ${item.produto_id} não encontrado`);
            continue;
          }

          const novaQuantidade = Number(produto.quantidade_atual) + Number(item.quantidade_entregue);

          // Atualizar estoque do produto
          await supabase
            .from('estoque_produtos')
            .update({ 
              quantidade_atual: novaQuantidade,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.produto_id);

          // Criar movimentação de entrada
          await supabase
            .from('estoque_movimentacoes')
            .insert({
              clinic_id: pedido.clinic_id,
              produto_id: item.produto_id,
              tipo: 'entrada',
              quantidade: item.quantidade_entregue,
              lote: item.lote,
              data_validade: item.data_validade,
              user_id: pedido.created_by,
              motivo: `Recebimento automático - Pedido ${payload.numero_pedido}`,
              observacoes: `Entrada automática via webhook. Tracking: ${payload.tracking_code || 'N/A'}`
            });

          // Atualizar item do pedido com quantidade recebida
          await supabase
            .from('estoque_pedidos_itens')
            .update({ quantidade_recebida: item.quantidade_entregue })
            .eq('pedido_id', pedido.id)
            .eq('produto_id', item.produto_id);

          console.log(`[Webhook] Produto ${item.produto_id} atualizado: +${item.quantidade_entregue} unidades`);

        } catch (itemError) {
          console.error(`[Webhook] Erro ao processar item ${item.produto_id}:`, itemError);
        }
      }

      console.log('[Webhook] Todas as movimentações de entrada criadas com sucesso');
    }

    // Registrar no audit log
    await supabase.from('audit_logs').insert({
      clinic_id: pedido.clinic_id,
      user_id: pedido.created_by,
      action: 'WEBHOOK_CONFIRMACAO_PEDIDO',
      details: {
        pedido_id: pedido.id,
        numero_pedido: payload.numero_pedido,
        fornecedor_nome: pedido.estoque_fornecedores?.nome,
        status_anterior: pedido.status,
        status_novo: payload.status,
        data_entrega: payload.data_entrega,
        tracking_code: payload.tracking_code,
        itens_entregues: payload.itens?.length || 0
      }
    });

    console.log('[Webhook] Processamento concluído com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Pedido ${payload.numero_pedido} atualizado para ${payload.status}`,
        pedido_id: pedido.id,
        itens_processados: payload.itens?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Webhook] Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
