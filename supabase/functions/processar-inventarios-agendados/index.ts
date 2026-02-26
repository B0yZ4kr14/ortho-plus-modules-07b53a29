import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing scheduled inventories...');

    // Buscar agendamentos ativos que devem ser executados
    const now = new Date().toISOString();
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('inventario_agendamentos')
      .select('*')
      .eq('ativo', true)
      .lte('proxima_execucao', now);

    if (agendamentosError) {
      throw agendamentosError;
    }

    console.log(`Found ${agendamentos?.length || 0} scheduled inventories to process`);

    let processedCount = 0;
    let notificationsCount = 0;

    for (const agendamento of agendamentos || []) {
      try {
        // Gerar número único do inventário
        const numeroInventario = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        // Criar novo inventário
        const { data: inventario, error: inventarioError } = await supabase
          .from('inventarios')
          .insert({
            clinic_id: agendamento.clinic_id,
            numero: numeroInventario,
            data: new Date().toISOString().split('T')[0],
            tipo: agendamento.tipo_inventario,
            status: 'PLANEJADO',
            responsavel: agendamento.responsavel,
            observacoes: `Inventário gerado automaticamente pelo agendamento: ${agendamento.nome}`,
            created_by: agendamento.created_by,
          })
          .select()
          .single();

        if (inventarioError) {
          console.error(`Error creating inventory for schedule ${agendamento.id}:`, inventarioError);
          continue;
        }

        console.log(`Created inventory ${inventario.numero} for schedule ${agendamento.nome}`);

        // Buscar produtos das categorias especificadas (se houver)
        let produtosQuery = supabase
          .from('estoque_produtos')
          .select('*')
          .eq('clinic_id', agendamento.clinic_id)
          .eq('ativo', true);

        if (agendamento.categorias_ids && agendamento.categorias_ids.length > 0) {
          produtosQuery = produtosQuery.in('categoria_id', agendamento.categorias_ids);
        }

        const { data: produtos, error: produtosError } = await produtosQuery;

        if (produtosError) {
          console.error(`Error fetching products:`, produtosError);
          continue;
        }

        // Criar itens do inventário
        if (produtos && produtos.length > 0) {
          const inventarioItens = produtos.map(produto => ({
            inventario_id: inventario.id,
            produto_id: produto.id,
            produto_nome: produto.nome,
            quantidade_sistema: produto.quantidade_atual,
            valor_unitario: produto.preco_compra,
            lote: produto.lote,
          }));

          const { error: itensError } = await supabase
            .from('inventario_itens')
            .insert(inventarioItens);

          if (itensError) {
            console.error(`Error creating inventory items:`, itensError);
            continue;
          }

          // Atualizar total de itens no inventário
          await supabase
            .from('inventarios')
            .update({ total_itens: produtos.length })
            .eq('id', inventario.id);
        }

        // Enviar notificação se configurado
        if (agendamento.notificar_responsavel) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              clinic_id: agendamento.clinic_id,
              tipo: 'INVENTARIO_AGENDADO',
              titulo: 'Inventário Agendado Criado',
              mensagem: `O inventário ${inventario.numero} foi criado automaticamente. Responsável: ${agendamento.responsavel}`,
              link_acao: `/estoque/inventario?id=${inventario.id}`,
            });

          if (!notificationError) {
            notificationsCount++;
          }
        }

        // Calcular próxima execução
        const proximaExecucao = calcularProximaExecucao(agendamento);

        // Atualizar agendamento
        await supabase
          .from('inventario_agendamentos')
          .update({
            ultima_execucao: now,
            proxima_execucao: proximaExecucao.toISOString(),
          })
          .eq('id', agendamento.id);

        processedCount++;
      } catch (error) {
        console.error(`Error processing schedule ${agendamento.id}:`, error);
      }
    }

    console.log(`Processed ${processedCount} inventories, sent ${notificationsCount} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        notifications: notificationsCount,
        message: `Processed ${processedCount} scheduled inventories`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing scheduled inventories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function calcularProximaExecucao(agendamento: any): Date {
  const now = new Date();
  const proxima = new Date();

  switch (agendamento.periodicidade) {
    case 'SEMANAL': {
      // Próxima execução no mesmo dia da semana
      const diasAteProximaSemana = ((agendamento.dia_semana - now.getDay() + 7) % 7) || 7;
      proxima.setDate(now.getDate() + diasAteProximaSemana);
      break;
    }

    case 'MENSAL':
      // Próximo mês no mesmo dia
      proxima.setMonth(now.getMonth() + 1);
      proxima.setDate(agendamento.dia_execucao);
      break;

    case 'TRIMESTRAL':
      proxima.setMonth(now.getMonth() + 3);
      proxima.setDate(agendamento.dia_execucao);
      break;

    case 'SEMESTRAL':
      proxima.setMonth(now.getMonth() + 6);
      proxima.setDate(agendamento.dia_execucao);
      break;

    case 'ANUAL':
      proxima.setFullYear(now.getFullYear() + 1);
      proxima.setDate(agendamento.dia_execucao);
      break;
  }

  // Ajustar hora para 8h da manhã
  proxima.setHours(8, 0, 0, 0);

  return proxima;
}
