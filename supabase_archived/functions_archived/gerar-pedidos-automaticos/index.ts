import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProdutoBaixoEstoque {
  id: string;
  nome: string;
  quantidade_atual: number;
  quantidade_minima: number;
  preco_compra: number;
  fornecedor_id: string;
  clinic_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar produtos com estoque abaixo do mínimo que têm configuração de pedido automático
    const { data: produtosBaixos, error: produtosError } = await supabaseClient
      .from('estoque_produtos')
      .select('id, nome, quantidade_atual, quantidade_minima, preco_compra, fornecedor_id, clinic_id')
      .lt('quantidade_atual', 'quantidade_minima');

    if (produtosError) {
      throw produtosError;
    }

    if (!produtosBaixos || produtosBaixos.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum produto com estoque baixo encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Verificar configurações de pedidos automáticos para estes produtos
    const produtosIds = produtosBaixos.map(p => p.id);
    const { data: configs, error: configsError } = await supabaseClient
      .from('estoque_pedidos_config')
      .select('*')
      .in('produto_id', produtosIds)
      .eq('gerar_automaticamente', true);

    if (configsError) {
      throw configsError;
    }

    const pedidosGerados = [];

    // Agrupar produtos por clínica e fornecedor
    const produtosPorClinicaFornecedor: Record<string, ProdutoBaixoEstoque[]> = {};
    
    for (const produto of produtosBaixos as ProdutoBaixoEstoque[]) {
      const config = configs?.find(c => c.produto_id === produto.id);
      
      // Só gerar pedido se houver configuração automática
      if (config) {
        const key = `${produto.clinic_id}_${produto.fornecedor_id}`;
        if (!produtosPorClinicaFornecedor[key]) {
          produtosPorClinicaFornecedor[key] = [];
        }
        produtosPorClinicaFornecedor[key].push(produto);
      }
    }

    // Gerar pedidos agrupados por clínica e fornecedor
    for (const [key, produtos] of Object.entries(produtosPorClinicaFornecedor)) {
      const [clinicId, fornecedorId] = key.split('_');
      
      // Gerar número único do pedido
      const numeroPedido = `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Buscar ID do usuário para created_by (usar primeiro admin da clínica)
      const { data: adminRoles } = await supabaseClient
        .from('user_roles')
        .select('user_id')
        .eq('role', 'ADMIN')
        .limit(1);

      const { data: adminProfile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('clinic_id', clinicId)
        .in('id', adminRoles?.map(r => r.user_id) || [])
        .limit(1)
        .single();

      if (!adminProfile) {
        console.error(`Nenhum admin encontrado para clínica ${clinicId}`);
        continue;
      }

      // Calcular valor total
      let valorTotal = 0;
      const itens = [];

      for (const produto of produtos) {
        const config = configs?.find(c => c.produto_id === produto.id);
        const quantidadeReposicao = config?.quantidade_reposicao || (produto.quantidade_minima * 2);
        const valorItem = produto.preco_compra * quantidadeReposicao;
        valorTotal += valorItem;

        itens.push({
          produto_id: produto.id,
          quantidade: quantidadeReposicao,
          preco_unitario: produto.preco_compra,
          valor_total: valorItem,
          quantidade_recebida: 0,
        });
      }

      // Calcular data prevista de entrega
      const diasEntrega = configs?.find(c => produtos.some(p => p.id === c.produto_id))?.dias_entrega_estimados || 7;
      const dataPrevistaEntrega = new Date();
      dataPrevistaEntrega.setDate(dataPrevistaEntrega.getDate() + diasEntrega);

      // Criar pedido
      const { data: pedido, error: pedidoError } = await supabaseClient
        .from('estoque_pedidos')
        .insert({
          clinic_id: clinicId,
          numero_pedido: numeroPedido,
          fornecedor_id: fornecedorId,
          status: 'PENDENTE',
          tipo: 'AUTOMATICO',
          data_pedido: new Date().toISOString(),
          data_prevista_entrega: dataPrevistaEntrega.toISOString(),
          valor_total: valorTotal,
          observacoes: `Pedido gerado automaticamente pelo sistema devido a produtos com estoque baixo`,
          gerado_automaticamente: true,
          created_by: adminProfile.id,
        })
        .select()
        .single();

      if (pedidoError) {
        console.error('Erro ao criar pedido:', pedidoError);
        continue;
      }

      // Criar itens do pedido
      const itensComPedidoId = itens.map(item => ({
        ...item,
        pedido_id: pedido.id,
      }));

      const { error: itensError } = await supabaseClient
        .from('estoque_pedidos_itens')
        .insert(itensComPedidoId);

      if (itensError) {
        console.error('Erro ao criar itens do pedido:', itensError);
        continue;
      }

      // Registrar no audit log
      await supabaseClient
        .from('audit_logs')
        .insert({
          clinic_id: clinicId,
          user_id: adminProfile.id,
          action: 'PEDIDO_AUTO_GERADO',
          details: {
            pedido_id: pedido.id,
            numero_pedido: numeroPedido,
            fornecedor_id: fornecedorId,
            produtos_count: produtos.length,
            valor_total: valorTotal,
            timestamp: new Date().toISOString(),
          },
        });

      pedidosGerados.push({
        pedido_id: pedido.id,
        numero_pedido: numeroPedido,
        clinic_id: clinicId,
        fornecedor_id: fornecedorId,
        produtos_count: produtos.length,
        valor_total: valorTotal,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        pedidos_gerados: pedidosGerados.length,
        detalhes: pedidosGerados,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Erro na edge function gerar-pedidos-automaticos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});