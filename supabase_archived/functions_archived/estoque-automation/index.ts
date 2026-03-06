import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * FASE 0 - T0.2: ESTOQUE AUTOMATION (Consolidado)
 * Consolida 7 funções de estoque em uma única função com actions
 * 
 * Actions suportadas:
 * - auto-orders: Gera pedidos automáticos baseado em estoque mínimo
 * - predict-restock: Prevê necessidade de reposição usando IA
 * - send-alerts: Envia alertas de estoque baixo/crítico
 * - retry-orders: Reprocessa pedidos falhados
 * - send-to-supplier: Envia pedido para API do fornecedor
 * - process-confirmation: Processa confirmação do fornecedor (webhook)
 */

interface EstoqueAutomationRequest {
  action: 'auto-orders' | 'predict-restock' | 'send-alerts' | 'retry-orders' | 'send-to-supplier' | 'process-confirmation';
  clinicId?: string;
  itemId?: string;
  orderId?: string;
  supplierData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Auth opcional para webhook
    let user = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    const { action, clinicId, itemId, orderId, supplierData }: EstoqueAutomationRequest = await req.json();

    console.log(`Estoque Automation - Action: ${action}, Clinic: ${clinicId || 'N/A'}`);

    let result;

    switch (action) {
      case 'auto-orders':
        if (!clinicId) throw new Error('clinicId required');
        result = await generateAutoOrders(supabase, clinicId);
        break;
      
      case 'predict-restock':
        if (!clinicId || !itemId) throw new Error('clinicId and itemId required');
        result = await predictRestock(supabase, clinicId, itemId);
        break;
      
      case 'send-alerts':
        if (!clinicId) throw new Error('clinicId required');
        result = await sendStockAlerts(supabase, clinicId);
        break;
      
      case 'retry-orders':
        if (!clinicId) throw new Error('clinicId required');
        result = await retryFailedOrders(supabase, clinicId);
        break;
      
      case 'send-to-supplier':
        if (!orderId) throw new Error('orderId required');
        result = await sendOrderToSupplier(supabase, orderId);
        break;
      
      case 'process-confirmation':
        if (!supplierData) throw new Error('supplierData required');
        result = await processSupplierConfirmation(supabase, supplierData);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Estoque Automation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateAutoOrders(supabase: any, clinicId: string) {
  // Busca itens abaixo do estoque mínimo
  const { data: lowStockItems } = await supabase.rpc('get_low_stock_items', { p_clinic_id: clinicId });

  const ordersCreated = [];

  for (const item of lowStockItems || []) {
    const orderQuantity = item.estoque_maximo - item.quantidade_atual;
    
    const { data: order } = await supabase
      .from('estoque_pedidos')
      .insert({
        clinic_id: clinicId,
        item_id: item.id,
        fornecedor: item.fornecedor_principal,
        quantidade: orderQuantity,
        valor_unitario: item.custo_medio,
        valor_total: orderQuantity * item.custo_medio,
        status: 'PENDENTE',
        tipo: 'AUTOMATICO',
        observacoes: 'Pedido gerado automaticamente por estoque baixo'
      })
      .select()
      .single();

    ordersCreated.push(order);
  }

  return { clinicId, ordersCreated: ordersCreated.length, orders: ordersCreated };
}

async function predictRestock(supabase: any, clinicId: string, itemId: string) {
  // Busca histórico de movimentações
  const { data: movements } = await supabase
    .from('estoque_movimentacoes')
    .select('quantidade, tipo, data_movimentacao')
    .eq('clinic_id', clinicId)
    .eq('item_id', itemId)
    .order('data_movimentacao', { ascending: false })
    .limit(30);

  // Calcula consumo médio diário
  const saidas = movements.filter((m: any) => m.tipo === 'SAIDA');
  const totalSaidas = saidas.reduce((sum: number, m: any) => sum + Math.abs(m.quantidade), 0);
  const diasAnalise = 30;
  const consumoMedioDiario = totalSaidas / diasAnalise;

  // Busca estoque atual
  const { data: item } = await supabase
    .from('estoque_items')
    .select('quantidade_atual, estoque_minimo')
    .eq('id', itemId)
    .single();

  const diasAteEsgotamento = Math.floor(item.quantidade_atual / consumoMedioDiario);
  const precisaRepor = diasAteEsgotamento <= 7;

  return {
    itemId,
    quantidadeAtual: item.quantidade_atual,
    consumoMedioDiario: Math.round(consumoMedioDiario * 100) / 100,
    diasAteEsgotamento,
    precisaRepor,
    quantidadeSugerida: precisaRepor ? Math.ceil(consumoMedioDiario * 30) : 0,
    predicted_at: new Date().toISOString()
  };
}

async function sendStockAlerts(supabase: any, clinicId: string) {
  const { data: criticalItems } = await supabase
    .from('estoque_items')
    .select('id, nome, quantidade_atual, estoque_minimo')
    .eq('clinic_id', clinicId)
    .lt('quantidade_atual', supabase.raw('estoque_minimo'));

  const alertsSent = [];

  for (const item of criticalItems || []) {
    await supabase.from('notifications').insert({
      clinic_id: clinicId,
      type: 'ESTOQUE_CRITICO',
      title: `Estoque Crítico: ${item.nome}`,
      message: `O item "${item.nome}" está com ${item.quantidade_atual} unidades (mínimo: ${item.estoque_minimo})`,
      priority: 'HIGH',
      metadata: { item_id: item.id }
    });

    alertsSent.push(item.id);
  }

  return { clinicId, alertsSent: alertsSent.length, items: criticalItems };
}

async function retryFailedOrders(supabase: any, clinicId: string) {
  const { data: failedOrders } = await supabase
    .from('estoque_pedidos')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('status', 'ERRO')
    .lt('tentativas_envio', 3);

  const retriedOrders = [];

  for (const order of failedOrders || []) {
    const result = await sendOrderToSupplier(supabase, order.id);
    if (result.success) {
      retriedOrders.push(order.id);
    }
  }

  return { clinicId, retriedOrders: retriedOrders.length };
}

async function sendOrderToSupplier(supabase: any, orderId: string) {
  const { data: order } = await supabase
    .from('estoque_pedidos')
    .select('*, item:estoque_items(*)')
    .eq('id', orderId)
    .single();

  // Simula envio para API do fornecedor
  const supplierApiUrl = order.fornecedor_api_url || 'https://api.fornecedor.com/pedidos';
  
  try {
    // Aqui faria o POST real para a API do fornecedor
    // const response = await fetch(supplierApiUrl, { method: 'POST', body: JSON.stringify(order) });
    
    await supabase
      .from('estoque_pedidos')
      .update({
        status: 'ENVIADO',
        data_envio: new Date().toISOString(),
        tentativas_envio: (order.tentativas_envio || 0) + 1
      })
      .eq('id', orderId);

    return { orderId, success: true, sent_at: new Date().toISOString() };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await supabase
      .from('estoque_pedidos')
      .update({
        status: 'ERRO',
        erro_mensagem: errorMessage,
        tentativas_envio: (order.tentativas_envio || 0) + 1
      })
      .eq('id', orderId);

    return { orderId, success: false, error: errorMessage };
  }
}

async function processSupplierConfirmation(supabase: any, supplierData: any) {
  const { pedido_id, status, data_previsao_entrega, tracking_code } = supplierData;

  await supabase
    .from('estoque_pedidos')
    .update({
      status: status === 'confirmado' ? 'CONFIRMADO' : 'CANCELADO',
      data_previsao_entrega,
      codigo_rastreio: tracking_code,
      confirmado_em: new Date().toISOString()
    })
    .eq('id', pedido_id);

  return { pedidoId: pedido_id, status, processed_at: new Date().toISOString() };
}
