import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Não autorizado');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('Perfil não encontrado');
    }

    // Buscar pacientes com dados de marketing
    const { data: patients } = await supabaseClient
      .from('patients')
      .select('id, marketing_campaign, marketing_source, created_at, status')
      .eq('clinic_id', profile.clinic_id)
      .not('marketing_campaign', 'is', null);

    // Buscar campanhas de marketing
    const { data: campaigns } = await supabaseClient
      .from('marketing_campaigns')
      .select('id, name, budget, target_audience, status, created_at')
      .eq('clinic_id', profile.clinic_id);

    // Calcular métricas
    const totalPatients = patients?.length || 0;
    const convertedPatients = patients?.filter(p => 
      p.status === 'TRATAMENTO' || p.status === 'CONCLUIDO'
    ).length || 0;

    const totalBudget = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
    const cac = totalPatients > 0 ? totalBudget / totalPatients : 0;
    const conversionRate = totalPatients > 0 ? (convertedPatients / totalPatients) * 100 : 0;

    // ROI por campanha
    const campaignROI = campaigns?.map(campaign => {
      const campaignPatients = patients?.filter(p => 
        p.marketing_campaign === campaign.name
      ) || [];
      
      const converted = campaignPatients.filter(p => 
        p.status === 'TRATAMENTO' || p.status === 'CONCLUIDO'
      ).length;

      return {
        campaign: campaign.name,
        budget: campaign.budget || 0,
        patients: campaignPatients.length,
        converted,
        conversionRate: campaignPatients.length > 0 
          ? (converted / campaignPatients.length) * 100 
          : 0,
        cac: campaignPatients.length > 0 
          ? (campaign.budget || 0) / campaignPatients.length 
          : 0
      };
    }) || [];

    // Performance por origem
    const sourcePerformance = Object.entries(
      patients?.reduce((acc, p) => {
        const source = p.marketing_source || 'Não especificado';
        if (!acc[source]) {
          acc[source] = { total: 0, converted: 0 };
        }
        acc[source].total++;
        if (p.status === 'TRATAMENTO' || p.status === 'CONCLUIDO') {
          acc[source].converted++;
        }
        return acc;
      }, {} as Record<string, { total: number; converted: number }>) || {}
    ).map(([source, data]) => ({
      source,
      total: data.total,
      converted: data.converted,
      conversionRate: (data.converted / data.total) * 100
    }));

    const metrics = {
      totalBudget,
      cac,
      totalPatients,
      convertedPatients,
      conversionRate,
      roi: 0, // Calculado baseado em receita vs investimento
      campaignROI,
      sourcePerformance
    };

    return new Response(
      JSON.stringify({ metrics }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
