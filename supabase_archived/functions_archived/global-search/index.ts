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

    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Buscar em múltiplas tabelas
    const [patientsRes, budgetsRes, appointmentsRes] = await Promise.all([
      supabaseClient
        .from('patients')
        .select('id, full_name, cpf, phone, email')
        .or(`full_name.ilike.%${query}%,cpf.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5),
      
      supabaseClient
        .from('budgets')
        .select('id, titulo, numero_orcamento, valor_total, status')
        .or(`titulo.ilike.%${query}%,numero_orcamento.ilike.%${query}%`)
        .limit(5),
      
      supabaseClient
        .from('appointments')
        .select('id, title, start_time, status')
        .ilike('title', `%${query}%`)
        .limit(5)
    ]);

    const results = {
      patients: (patientsRes.data || []).map(p => ({
        id: p.id,
        type: 'patient',
        title: p.full_name,
        subtitle: p.cpf || p.phone,
        url: `/pacientes/${p.id}`
      })),
      budgets: (budgetsRes.data || []).map(b => ({
        id: b.id,
        type: 'budget',
        title: b.titulo,
        subtitle: `${b.numero_orcamento} - R$ ${b.valor_total}`,
        url: `/orcamentos/${b.id}`
      })),
      appointments: (appointmentsRes.data || []).map(a => ({
        id: a.id,
        type: 'appointment',
        title: a.title,
        subtitle: new Date(a.start_time).toLocaleDateString('pt-BR'),
        url: `/agenda?appointment=${a.id}`
      }))
    };

    return new Response(
      JSON.stringify({ results }),
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
