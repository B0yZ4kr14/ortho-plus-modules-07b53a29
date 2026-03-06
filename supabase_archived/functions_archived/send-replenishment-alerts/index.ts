import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Previsao {
  produto: string;
  status: "CRITICO" | "ALERTA" | "NORMAL" | "EXCESSO";
  diasAteEstoqueMinimo: number;
  diasAteEstoqueZero: number;
  dataEstimadaReposicao: string;
  quantidadeSugerida: number;
  tendencia: string;
  sazonalidade: string;
  confianca: number;
  justificativa: string;
  recomendacao: string;
}

interface EventoFuturo {
  tipo: string;
  dataInicio: string;
  dataFim: string;
  impactoEstimado: number;
  descricao: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const { previsoes, resumo, eventosFuturos }: {
      previsoes: Previsao[], 
      resumo: any,
      eventosFuturos?: EventoFuturo[]
    } = await req.json();

    if (!previsoes || previsoes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma previsão fornecida' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Enviando alertas para ${previsoes.length} produtos`);

    // Buscar usuário atual e clínica
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Unauthorized');
    }

    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not found');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Buscar todos os administradores da clínica para enviar emails
    const { data: admins } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('clinic_id', profile.clinic_id);

    if (!admins || admins.length === 0) {
      throw new Error('No administrators found');
    }

    const adminIds = admins.map(a => a.id);
    const { data: adminUsers } = await supabaseClient.auth.admin.listUsers();
    const adminEmails = adminUsers?.users
      ?.filter(u => adminIds.includes(u.id))
      .map(u => u.email)
      .filter(Boolean) as string[];

    if (adminEmails.length === 0) {
      throw new Error('No admin emails found');
    }

    // Filtrar produtos críticos e em alerta
    const produtosCriticos = previsoes.filter(p => p.status === "CRITICO");
    const produtosAlerta = previsoes.filter(p => p.status === "ALERTA");

    // Construir HTML do email
    const eventosHtml = eventosFuturos && eventosFuturos.length > 0 ? `
      <div style="margin: 30px 0; padding: 20px; background: #FFF9E5; border-left: 4px solid #F59E0B; border-radius: 4px;">
        <h3 style="color: #92400E; margin: 0 0 15px 0;">⚡ Eventos Futuros Considerados</h3>
        <p style="color: #78350F; margin: 0 0 10px 0; font-size: 14px;">
          As previsões abaixo consideram os seguintes eventos futuros que impactarão o consumo:
        </p>
        ${eventosFuturos.map(evento => `
          <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 4px;">
            <strong style="color: #92400E;">${evento.tipo}</strong>
            <span style="color: #78350F; font-size: 13px;"> • ${new Date(evento.dataInicio).toLocaleDateString()} a ${new Date(evento.dataFim).toLocaleDateString()}</span>
            <br>
            <span style="color: #78350F; font-size: 13px;">Impacto estimado: ${evento.impactoEstimado > 0 ? '+' : ''}${evento.impactoEstimado}%</span>
            <br>
            <span style="color: #78350F; font-size: 13px;">${evento.descricao}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🤖 Alerta de Reposição de Estoque (IA)</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Previsões Inteligentes Baseadas em Machine Learning</p>
        </div>
        
        ${eventosHtml}
        
        <div style="padding: 30px; background: white;">
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">📊 Resumo Executivo</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">Produtos Críticos</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #DC2626;">${resumo?.produtosCriticos || produtosCriticos.length}</p>
              </div>
              <div>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">Produtos em Alerta</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #F59E0B;">${resumo?.produtosAlerta || produtosAlerta.length}</p>
              </div>
            </div>
            ${resumo?.observacoes ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #D1D5DB;">
                <p style="margin: 0; color: #6B7280; font-size: 14px; font-style: italic;">${resumo.observacoes}</p>
              </div>
            ` : ''}
          </div>
          
          ${produtosCriticos.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #DC2626; margin: 0 0 15px 0;">🚨 Produtos Críticos (Ação Imediata Necessária)</h3>
              ${produtosCriticos.map(p => `
                <div style="border: 2px solid #DC2626; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #FEF2F2;">
                  <h4 style="margin: 0 0 10px 0; color: #991B1B;">${p.produto}</h4>
                  <p style="margin: 0 0 15px 0; color: #7F1D1D; font-size: 14px;">${p.justificativa}</p>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
                    <div>
                      <p style="margin: 0; color: #7F1D1D; font-size: 12px;">Dias até estoque zero</p>
                      <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #DC2626;">${p.diasAteEstoqueZero} dias</p>
                    </div>
                    <div>
                      <p style="margin: 0; color: #7F1D1D; font-size: 12px;">Quantidade sugerida</p>
                      <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #DC2626;">${p.quantidadeSugerida} un</p>
                    </div>
                    <div>
                      <p style="margin: 0; color: #7F1D1D; font-size: 12px;">Confiança IA</p>
                      <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #DC2626;">${(p.confianca * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <div style="background: white; padding: 12px; border-radius: 4px;">
                    <p style="margin: 0; color: #7F1D1D; font-size: 13px; font-weight: 600;">💡 Recomendação:</p>
                    <p style="margin: 5px 0 0 0; color: #7F1D1D; font-size: 13px;">${p.recomendacao}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${produtosAlerta.length > 0 ? `
            <div>
              <h3 style="color: #F59E0B; margin: 0 0 15px 0;">⚠️ Produtos em Alerta (Monitorar de Perto)</h3>
              ${produtosAlerta.map(p => `
                <div style="border: 2px solid #F59E0B; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #FFFBEB;">
                  <h4 style="margin: 0 0 10px 0; color: #92400E;">${p.produto}</h4>
                  <p style="margin: 0 0 15px 0; color: #78350F; font-size: 14px;">${p.justificativa}</p>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
                    <div>
                      <p style="margin: 0; color: #78350F; font-size: 12px;">Dias até estoque zero</p>
                      <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #F59E0B;">${p.diasAteEstoqueZero} dias</p>
                    </div>
                    <div>
                      <p style="margin: 0; color: #78350F; font-size: 12px;">Quantidade sugerida</p>
                      <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #F59E0B;">${p.quantidadeSugerida} un</p>
                    </div>
                    <div>
                      <p style="margin: 0; color: #78350F; font-size: 12px;">Confiança IA</p>
                      <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #F59E0B;">${(p.confianca * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <div style="background: white; padding: 12px; border-radius: 4px;">
                    <p style="margin: 0; color: #78350F; font-size: 13px; font-weight: 600;">💡 Recomendação:</p>
                    <p style="margin: 5px 0 0 0; color: #78350F; font-size: 13px;">${p.recomendacao}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div style="background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; color: #6B7280; font-size: 12px;">
            Este alerta foi gerado automaticamente pelo sistema de Inteligência Artificial do Ortho+
          </p>
          <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
            As previsões consideram padrões históricos de consumo, sazonalidade, tendências e eventos futuros configurados
          </p>
        </div>
      </div>
    `;

    // Enviar email para todos os administradores
    const emailPromises = adminEmails.map(email => 
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Ortho+ Estoque <onboarding@resend.dev>',
          to: email,
          subject: `🤖 Alerta de Reposição IA: ${produtosCriticos.length} Crítico${produtosCriticos.length !== 1 ? 's' : ''}, ${produtosAlerta.length} Alerta${produtosAlerta.length !== 1 ? 's' : ''}`,
          html: emailHtml,
        }),
      })
    );

    await Promise.all(emailPromises);

    // Registrar no audit log
    await supabaseClient
      .from('audit_logs')
      .insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        action: 'ALERTAS_REPOSICAO_ENVIADOS',
        details: {
          total_produtos: previsoes.length,
          produtos_criticos: produtosCriticos.length,
          produtos_alerta: produtosAlerta.length,
          destinatarios: adminEmails.length,
          eventos_futuros: eventosFuturos?.length || 0,
          timestamp: new Date().toISOString(),
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Alertas enviados para ${adminEmails.length} gestor(es)`,
        destinatarios: adminEmails.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro ao enviar alertas:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao enviar alertas de reposição',
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
