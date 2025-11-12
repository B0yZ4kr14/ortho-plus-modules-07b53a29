import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProdutoBaixoEstoque {
  id: string;
  nome: string;
  quantidade_atual: number;
  quantidade_minima: number;
  fornecedor_id: string;
  fornecedor_nome: string;
  api_enabled: boolean;
  api_endpoint: string;
  api_auth_type: string;
  api_username?: string;
  api_password?: string;
  api_token?: string;
  api_key_header?: string;
  api_key_value?: string;
  api_request_format: string;
  auto_order_enabled: boolean;
  quantidade_pedido: number;
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Buscar clinic_id do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      throw new Error('Clinic not found');
    }

    console.log(`[Pedido Auto API] Processando pedidos automáticos para clinic: ${profile.clinic_id}`);

    // Buscar produtos com estoque baixo que têm fornecedor com API habilitada
    const { data: produtosBaixoEstoque, error: produtosError } = await supabase
      .from('estoque_produtos')
      .select(`
        id,
        nome,
        quantidade_atual,
        quantidade_minima,
        fornecedor_id,
        estoque_fornecedores!inner (
          id,
          nome,
          api_enabled,
          api_endpoint,
          api_auth_type,
          api_username,
          api_password,
          api_token,
          api_key_header,
          api_key_value,
          api_request_format,
          auto_order_enabled
        ),
        estoque_pedidos_config!inner (
          quantidade_pedido,
          pedido_automatico
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .eq('ativo', true)
      .filter('estoque_fornecedores.api_enabled', 'eq', true)
      .filter('estoque_fornecedores.auto_order_enabled', 'eq', true)
      .filter('estoque_pedidos_config.pedido_automatico', 'eq', true);

    if (produtosError) {
      console.error('[Pedido Auto API] Erro ao buscar produtos:', produtosError);
      throw produtosError;
    }

    // Filtrar produtos que estão abaixo do mínimo
    const produtosParaPedir = (produtosBaixoEstoque || []).filter(
      (p: any) => p.quantidade_atual <= p.quantidade_minima
    );

    console.log(`[Pedido Auto API] Encontrados ${produtosParaPedir.length} produtos para pedido automático`);

    const pedidosEnviados = [];
    const pedidosFalhos = [];

    // Agrupar por fornecedor
    const produtosPorFornecedor = produtosParaPedir.reduce((acc: any, produto: any) => {
      const fornecedorId = produto.estoque_fornecedores.id;
      if (!acc[fornecedorId]) {
        acc[fornecedorId] = {
          fornecedor: produto.estoque_fornecedores,
          produtos: []
        };
      }
      acc[fornecedorId].produtos.push(produto);
      return acc;
    }, {});

    // Enviar pedidos para cada fornecedor via API
    for (const [fornecedorId, grupo] of Object.entries(produtosPorFornecedor as any)) {
      try {
        const grupoData = grupo as { fornecedor: any; produtos: any[] };
        const { fornecedor, produtos } = grupoData;
        
        console.log(`[Pedido Auto API] Enviando pedido para fornecedor: ${fornecedor.nome} (${produtos.length} produtos)`);

        // Preparar autenticação
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (fornecedor.api_auth_type === 'basic' && fornecedor.api_username && fornecedor.api_password) {
          const credentials = btoa(`${fornecedor.api_username}:${fornecedor.api_password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        } else if (fornecedor.api_auth_type === 'bearer' && fornecedor.api_token) {
          headers['Authorization'] = `Bearer ${fornecedor.api_token}`;
        } else if (fornecedor.api_auth_type === 'api_key' && fornecedor.api_key_header && fornecedor.api_key_value) {
          headers[fornecedor.api_key_header] = fornecedor.api_key_value;
        }

        // Preparar corpo do pedido
        const itens = produtos.map((p: any) => ({
          produto_id: p.id,
          produto_nome: p.nome,
          quantidade: p.estoque_pedidos_config[0]?.quantidade_pedido || (p.quantidade_minima * 2),
          quantidade_atual: p.quantidade_atual,
          quantidade_minima: p.quantidade_minima
        }));

        const numeroPedido = `AUTO-${Date.now()}-${fornecedorId.substring(0, 8)}`;
        const pedidoData = {
          numero_pedido: numeroPedido,
          clinic_id: profile.clinic_id,
          data_pedido: new Date().toISOString(),
          itens: itens
        };

        // Enviar para API do fornecedor
        console.log(`[Pedido Auto API] Enviando para endpoint: ${fornecedor.api_endpoint}`);
        
        const apiResponse = await fetch(fornecedor.api_endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(pedidoData)
        });

        const responseData = await apiResponse.json().catch(() => ({}));
        
        if (!apiResponse.ok) {
          throw new Error(`API retornou status ${apiResponse.status}: ${JSON.stringify(responseData)}`);
        }

        console.log(`[Pedido Auto API] Pedido enviado com sucesso para ${fornecedor.nome}`);

        // Calcular valor total
        const valorTotal = itens.reduce((sum: number, item: any) => sum + (item.quantidade * 10), 0);

        // Registrar pedido no banco
        const { data: pedidoCriado, error: pedidoError } = await supabase
          .from('estoque_pedidos')
          .insert({
            clinic_id: profile.clinic_id,
            fornecedor_id: fornecedor.id,
            numero_pedido: numeroPedido,
            status: 'enviado',
            data_pedido: new Date().toISOString(),
            valor_total: valorTotal,
            user_id: user.id,
            observacoes: 'Pedido automático enviado via API',
            api_response: responseData
          })
          .select()
          .single();

        if (pedidoError) {
          console.error('[Pedido Auto API] Erro ao registrar pedido:', pedidoError);
          throw pedidoError;
        }

        // Inserir itens do pedido
        const itensParaInserir = produtos.map((p: any) => ({
          pedido_id: pedidoCriado.id,
          produto_id: p.id,
          quantidade: p.estoque_pedidos_config[0]?.quantidade_pedido || (p.quantidade_minima * 2),
          preco_unitario: 10.00,
          subtotal: (p.estoque_pedidos_config[0]?.quantidade_pedido || (p.quantidade_minima * 2)) * 10.00
        }));

        await supabase.from('estoque_pedidos_itens').insert(itensParaInserir);

        // Log de auditoria
        await supabase.from('audit_logs').insert({
          clinic_id: profile.clinic_id,
          user_id: user.id,
          action: 'PEDIDO_AUTOMATICO_ENVIADO_API',
          details: {
            pedido_id: pedidoCriado.id,
            fornecedor_id: fornecedor.id,
            fornecedor_nome: fornecedor.nome,
            numero_pedido: numeroPedido,
            quantidade_produtos: produtos.length,
            valor_total: valorTotal,
            api_response: responseData
          }
        });

        pedidosEnviados.push({
          fornecedor: fornecedor.nome,
          numero_pedido: numeroPedido,
          produtos: produtos.length,
          status: 'sucesso'
        });

      } catch (error) {
        console.error(`[Pedido Auto API] Erro ao enviar pedido para fornecedor ${fornecedorId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        pedidosFalhos.push({
          fornecedor_id: fornecedorId,
          erro: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${pedidosEnviados.length} pedidos enviados via API com sucesso`,
        pedidos_enviados: pedidosEnviados,
        pedidos_falhos: pedidosFalhos
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Pedido Auto API] Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
