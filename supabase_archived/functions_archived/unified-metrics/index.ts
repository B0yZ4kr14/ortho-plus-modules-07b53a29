import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { logger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnifiedMetrics {
  executive: {
    receita_total: number;
    crescimento_mes: number;
    lucro_liquido: number;
    margem_lucro: number;
  };
  clinical: {
    taxa_ocupacao: number;
    tempo_medio_consulta: number;
    satisfacao_pacientes: number;
    procedimentos_realizados: number;
  };
  financial: {
    ticket_medio: number;
    recorrencia: number;
    inadimplencia: number;
    fluxo_caixa: number;
  };
  commercial: {
    conversao_leads: number;
    custo_aquisicao: number;
    lifetime_value: number;
    roi_marketing: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      logger.error('Authentication failed', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's clinic_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      logger.error('Profile not found', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const clinicId = profile.clinic_id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString();

    logger.info('Generating unified metrics', { clinicId });

    // Executive Metrics
    const { data: currentMonthRevenue } = await supabaseClient
      .from('transactions')
      .select('valor')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'RECEITA')
      .eq('status', 'PAGO')
      .gte('created_at', startOfMonth);

    const receita_total = currentMonthRevenue?.reduce((sum, t) => sum + t.valor, 0) || 0;

    const { data: lastMonthRevenue } = await supabaseClient
      .from('transactions')
      .select('valor')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'RECEITA')
      .eq('status', 'PAGO')
      .gte('created_at', startOfLastMonth)
      .lt('created_at', startOfMonth);

    const receita_mes_anterior = lastMonthRevenue?.reduce((sum, t) => sum + t.valor, 0) || 0;
    const crescimento_mes = receita_mes_anterior > 0 
      ? ((receita_total - receita_mes_anterior) / receita_mes_anterior) * 100 
      : 0;

    const { data: expenses } = await supabaseClient
      .from('transactions')
      .select('valor')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'DESPESA')
      .eq('status', 'PAGO')
      .gte('created_at', startOfMonth);

    const despesas_total = expenses?.reduce((sum, t) => sum + t.valor, 0) || 0;
    const lucro_liquido = receita_total - despesas_total;
    const margem_lucro = receita_total > 0 ? (lucro_liquido / receita_total) * 100 : 0;

    // Clinical Metrics
    const { data: appointments } = await supabaseClient
      .from('appointments')
      .select('start_time, end_time, status')
      .eq('clinic_id', clinicId)
      .gte('start_time', startOfMonth);

    const total_appointments = appointments?.length || 0;
    const completed_appointments = appointments?.filter(a => a.status === 'CONCLUIDO').length || 0;
    const taxa_ocupacao = total_appointments > 0 ? (completed_appointments / total_appointments) * 100 : 0;

    const durations = appointments
      ?.filter(a => a.status === 'CONCLUIDO')
      .map(a => new Date(a.end_time).getTime() - new Date(a.start_time).getTime());
    
    const tempo_medio_consulta = durations?.length 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length / 60000 
      : 0;

    // Financial Metrics
    const { data: patients } = await supabaseClient
      .from('transactions')
      .select('patient_id, valor')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'RECEITA')
      .eq('status', 'PAGO')
      .gte('created_at', startOfMonth);

    const unique_patients = new Set(patients?.map(p => p.patient_id)).size;
    const ticket_medio = unique_patients > 0 ? receita_total / unique_patients : 0;

    const { data: receivables } = await supabaseClient
      .from('transactions')
      .select('valor, data_vencimento')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'RECEITA')
      .eq('status', 'PENDENTE');

    const overdue = receivables?.filter(r => new Date(r.data_vencimento) < new Date()).length || 0;
    const total_receivables = receivables?.length || 0;
    const inadimplencia = total_receivables > 0 ? (overdue / total_receivables) * 100 : 0;

    const fluxo_caixa = lucro_liquido;

    // Commercial Metrics
    const { count: total_leads } = await supabaseClient
      .from('crm_leads')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', startOfMonth);

    const { count: converted_leads } = await supabaseClient
      .from('crm_leads')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status_funil', 'CONVERTIDO')
      .gte('created_at', startOfMonth);

    const conversao_leads = total_leads && converted_leads 
      ? (converted_leads / total_leads) * 100 
      : 0;

    const { data: marketingExpenses } = await supabaseClient
      .from('transactions')
      .select('valor')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'DESPESA')
      .eq('categoria', 'MARKETING')
      .gte('created_at', startOfMonth);

    const custo_marketing = marketingExpenses?.reduce((sum, t) => sum + t.valor, 0) || 0;
    const custo_aquisicao = converted_leads ? custo_marketing / converted_leads : 0;

    const lifetime_value = ticket_medio * 12; // Simplified: assumes 1 visit/month for 1 year
    const roi_marketing = custo_marketing > 0 
      ? ((lifetime_value * (converted_leads || 0) - custo_marketing) / custo_marketing) * 100 
      : 0;

    const metrics: UnifiedMetrics = {
      executive: {
        receita_total,
        crescimento_mes,
        lucro_liquido,
        margem_lucro,
      },
      clinical: {
        taxa_ocupacao,
        tempo_medio_consulta,
        satisfacao_pacientes: 85, // Placeholder - requires feedback system
        procedimentos_realizados: completed_appointments,
      },
      financial: {
        ticket_medio,
        recorrencia: 75, // Placeholder - requires recurring patient analysis
        inadimplencia,
        fluxo_caixa,
      },
      commercial: {
        conversao_leads,
        custo_aquisicao,
        lifetime_value,
        roi_marketing,
      },
    };

    logger.info('Unified metrics generated successfully');

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Error generating unified metrics', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
