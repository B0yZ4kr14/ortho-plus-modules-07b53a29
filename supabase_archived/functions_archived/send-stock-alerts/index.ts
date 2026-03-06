import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockAlert {
  produto_nome: string;
  quantidade_atual: number;
  quantidade_minima: number;
  tipo_alerta: 'minimo' | 'critico';
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

    // Buscar produtos com estoque baixo ou crítico
    const { data: produtos, error: produtosError } = await supabaseClient
      .from('estoque_produtos')
      .select('id, nome, quantidade_atual, quantidade_minima, clinic_id')
      .lte('quantidade_atual', 'quantidade_minima');

    if (produtosError) {
      throw produtosError;
    }

    if (!produtos || produtos.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum alerta de estoque encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Agrupar produtos por clínica
    const produtosPorClinica = produtos.reduce((acc, produto) => {
      const clinicId = produto.clinic_id;
      if (!acc[clinicId]) {
        acc[clinicId] = [];
      }
      acc[clinicId].push(produto);
      return acc;
    }, {} as Record<string, typeof produtos>);

    const alertasEnviados = [];

    // Para cada clínica, buscar administradores e enviar alertas
    for (const [clinicId, produtosClinica] of Object.entries(produtosPorClinica)) {
      // Buscar IDs de usuários ADMIN
      const { data: adminRoles, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('user_id')
        .eq('role', 'ADMIN');

      if (rolesError) {
        console.error('Erro ao buscar roles:', rolesError);
        continue;
      }

      const adminIds = adminRoles?.map(r => r.user_id) || [];

      // Buscar perfis dos admins da clínica
      const { data: admins, error: adminsError } = await supabaseClient
        .from('profiles')
        .select('id, full_name')
        .eq('clinic_id', clinicId)
        .in('id', adminIds);

      if (adminsError) {
        console.error('Erro ao buscar admins:', adminsError);
        continue;
      }

      // Criar alertas no banco de dados
      for (const produto of produtosClinica) {
        const tipoAlerta = produto.quantidade_atual === 0 ? 'ESTOQUE_CRITICO' : 'ESTOQUE_MINIMO';
        const mensagem = produto.quantidade_atual === 0
          ? `CRÍTICO: Produto ${produto.nome} está sem estoque!`
          : `Produto ${produto.nome} atingiu o estoque mínimo (${produto.quantidade_minima} unidades)`;

        const { error: alertaError } = await supabaseClient
          .from('estoque_alertas')
          .insert({
            produto_id: produto.id,
            tipo: tipoAlerta,
            mensagem,
            quantidade_atual: produto.quantidade_atual,
            quantidade_sugerida: produto.quantidade_minima * 2,
            lido: false,
          });

        if (alertaError) {
          console.error('Erro ao criar alerta:', alertaError);
        } else {
          alertasEnviados.push({
            produto: produto.nome,
            clinic_id: clinicId,
            tipo: tipoAlerta,
          });
        }
      }

      // TODO: Enviar email via Resend para administradores (configurar RESEND_API_KEY)
      console.log(`Alertas criados para ${admins?.length || 0} administradores da clínica ${clinicId}`);
      
      console.log(`Alertas criados para clínica ${clinicId}:`, produtosClinica.length);
    }

    // Registrar no audit log
    for (const alerta of alertasEnviados) {
      await supabaseClient
        .from('audit_logs')
        .insert({
          clinic_id: alerta.clinic_id,
          action: 'STOCK_ALERT_SENT',
          details: {
            produto: alerta.produto,
            tipo_alerta: alerta.tipo,
            timestamp: new Date().toISOString(),
          },
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertas_enviados: alertasEnviados.length,
        detalhes: alertasEnviados,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Erro na edge function send-stock-alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
