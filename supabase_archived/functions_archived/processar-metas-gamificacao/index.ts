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

    console.log('[Gamificação] Iniciando processamento de metas e rankings');

    // Buscar todas as clínicas ativas
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id');

    if (clinicsError) throw clinicsError;

    for (const clinic of clinics) {
      console.log(`[Gamificação] Processando clínica: ${clinic.id}`);

      // Buscar metas ativas da clínica
      const { data: metas, error: metasError } = await supabase
        .from('vendedor_metas')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('status', 'EM_ANDAMENTO')
        .lte('periodo_inicio', new Date().toISOString())
        .gte('periodo_fim', new Date().toISOString());

      if (metasError) {
        console.error(`[Gamificação] Erro ao buscar metas: ${metasError.message}`);
        continue;
      }

      // Atualizar progresso de cada meta
      for (const meta of metas) {
        const { data: vendas, error: vendasError } = await supabase
          .from('pdv_vendas')
          .select('valor_total')
          .eq('clinic_id', clinic.id)
          .eq('created_by', meta.vendedor_id)
          .eq('status', 'FINALIZADA')
          .gte('created_at', meta.periodo_inicio)
          .lte('created_at', meta.periodo_fim);

        if (vendasError) {
          console.error(`[Gamificação] Erro ao buscar vendas: ${vendasError.message}`);
          continue;
        }

        const valor_atingido = vendas.reduce((sum, v) => sum + parseFloat(v.valor_total || 0), 0);
        const quantidade_atingida = vendas.length;
        const percentual_atingido = (valor_atingido / meta.meta_valor) * 100;

        let status = 'EM_ANDAMENTO';
        if (new Date() > new Date(meta.periodo_fim)) {
          if (percentual_atingido >= 100) {
            status = percentual_atingido >= 120 ? 'SUPERADA' : 'ATINGIDA';
          } else {
            status = 'NAO_ATINGIDA';
          }
        }

        // Atualizar meta
        const { error: updateError } = await supabase
          .from('vendedor_metas')
          .update({
            valor_atingido,
            quantidade_atingida,
            percentual_atingido: percentual_atingido.toFixed(2),
            status
          })
          .eq('id', meta.id);

        if (updateError) {
          console.error(`[Gamificação] Erro ao atualizar meta: ${updateError.message}`);
        }

        // Se meta foi atingida, verificar premiação
        if ((status === 'ATINGIDA' || status === 'SUPERADA') && !meta.premiacao_paga) {
          const { data: premiacao } = await supabase
            .from('vendedor_premiacoes')
            .select('*')
            .eq('clinic_id', clinic.id)
            .eq('ativo', true)
            .lte('percentual_meta_minimo', percentual_atingido)
            .order('percentual_meta_minimo', { ascending: false })
            .limit(1)
            .single();

          if (premiacao) {
            await supabase
              .from('vendedor_metas')
              .update({
                premiacao_id: premiacao.id,
                premiacao_paga: false
              })
              .eq('id', meta.id);

            // Registrar no audit log
            await supabase.from('audit_logs').insert({
              clinic_id: clinic.id,
              user_id: meta.vendedor_id,
              action: 'META_ATINGIDA',
              details: {
                meta_id: meta.id,
                premiacao_id: premiacao.id,
                percentual_atingido,
                tipo_premiacao: premiacao.tipo
              }
            });

            console.log(`[Gamificação] Meta atingida! Vendedor: ${meta.vendedor_id}, Premiação: ${premiacao.nome}`);
          }
        }
      }

      // Atualizar Rankings (Dia, Semana, Mês)
      const hoje = new Date();
      const periodos = [
        { nome: 'DIA', data: hoje.toISOString().split('T')[0] },
        { nome: 'SEMANA', data: hoje.toISOString().split('T')[0] },
        { nome: 'MES', data: hoje.toISOString().split('T')[0] }
      ];

      for (const periodo of periodos) {
        // Buscar vendas do período
        let dataInicio = new Date(hoje);
        if (periodo.nome === 'DIA') {
          dataInicio.setHours(0, 0, 0, 0);
        } else if (periodo.nome === 'SEMANA') {
          dataInicio.setDate(hoje.getDate() - 7);
        } else if (periodo.nome === 'MES') {
          dataInicio.setMonth(hoje.getMonth() - 1);
        }

        const { data: vendasPeriodo, error: vendasError } = await supabase
          .from('pdv_vendas')
          .select('created_by, valor_total')
          .eq('clinic_id', clinic.id)
          .eq('status', 'FINALIZADA')
          .gte('created_at', dataInicio.toISOString());

        if (vendasError) continue;

        // Agrupar por vendedor
        const vendedoresMap = new Map();
        vendasPeriodo.forEach(venda => {
          if (!vendedoresMap.has(venda.created_by)) {
            vendedoresMap.set(venda.created_by, {
              total_vendas: 0,
              quantidade_vendas: 0
            });
          }
          const v = vendedoresMap.get(venda.created_by);
          v.total_vendas += parseFloat(venda.valor_total || 0);
          v.quantidade_vendas += 1;
        });

        // Ordenar por total de vendas
        const ranking = Array.from(vendedoresMap.entries())
          .map(([vendedor_id, stats]) => ({
            vendedor_id,
            total_vendas: stats.total_vendas,
            quantidade_vendas: stats.quantidade_vendas,
            ticket_medio: stats.total_vendas / stats.quantidade_vendas
          }))
          .sort((a, b) => b.total_vendas - a.total_vendas);

        // Atualizar ranking no banco
        for (let i = 0; i < ranking.length; i++) {
          const vendedor = ranking[i];
          const posicao = i + 1;
          let badge = null;
          if (posicao === 1) badge = 'OURO';
          else if (posicao === 2) badge = 'PRATA';
          else if (posicao === 3) badge = 'BRONZE';

          const pontos = Math.floor(vendedor.total_vendas / 10) + (vendedor.quantidade_vendas * 5);

          await supabase.from('vendedor_ranking').upsert({
            clinic_id: clinic.id,
            vendedor_id: vendedor.vendedor_id,
            periodo: periodo.nome,
            data_referencia: periodo.data,
            posicao,
            pontos,
            total_vendas: vendedor.total_vendas,
            quantidade_vendas: vendedor.quantidade_vendas,
            ticket_medio: vendedor.ticket_medio,
            badge
          }, {
            onConflict: 'clinic_id,vendedor_id,periodo,data_referencia'
          });
        }

        console.log(`[Gamificação] Ranking ${periodo.nome} atualizado para clínica ${clinic.id}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Processamento de metas e gamificação concluído'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('[Gamificação] Erro:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});