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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar dados para badges
    const [appointmentsRes, overdueRes, defaultersRes, recallsRes] = await Promise.all([
      supabaseClient
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .eq('status', 'agendado'),
      
      supabaseClient
        .from('contas_receber')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)
        .eq('status_pagamento', 'pendente')
        .lt('data_vencimento', new Date().toISOString()),
      
      supabaseClient
        .from('inadimplentes')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'ativo'),
      
      supabaseClient
        .from('recall_agendamentos')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'pendente')
    ]);

    const badges = {
      appointments: appointmentsRes.count || 0,
      overdue: overdueRes.count || 0,
      defaulters: defaultersRes.count || 0,
      recalls: recallsRes.count || 0,
      messages: 0 // Placeholder para mensagens não lidas
    };

    return new Response(
      JSON.stringify({ badges }),
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
