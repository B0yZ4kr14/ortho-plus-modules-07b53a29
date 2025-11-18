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
    const patientId = url.pathname.split('/').pop();

    // Buscar eventos de timeline do paciente
    const [appointmentsRes, treatmentsRes, budgetsRes, statusChangesRes] = await Promise.all([
      supabaseClient
        .from('appointments')
        .select('id, title, start_time, status, created_at')
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false })
        .limit(20),
      
      supabaseClient
        .from('pep_tratamentos')
        .select('id, titulo, status, data_inicio, data_conclusao, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20),
      
      supabaseClient
        .from('budgets')
        .select('id, titulo, valor_total, status, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20),
      
      supabaseClient
        .from('patient_status_history')
        .select('id, old_status, new_status, changed_at, changed_by')
        .eq('patient_id', patientId)
        .order('changed_at', { ascending: false })
        .limit(20)
    ]);

    const timeline = [
      ...(appointmentsRes.data || []).map(a => ({
        id: a.id,
        type: 'appointment',
        title: a.title,
        description: `Consulta - ${a.status}`,
        date: a.start_time,
        icon: 'calendar'
      })),
      ...(treatmentsRes.data || []).map(t => ({
        id: t.id,
        type: 'treatment',
        title: t.titulo,
        description: `Tratamento - ${t.status}`,
        date: t.data_inicio || t.created_at,
        icon: 'activity'
      })),
      ...(budgetsRes.data || []).map(b => ({
        id: b.id,
        type: 'budget',
        title: b.titulo,
        description: `Orçamento - R$ ${b.valor_total}`,
        date: b.created_at,
        icon: 'file-text'
      })),
      ...(statusChangesRes.data || []).map(s => ({
        id: s.id,
        type: 'status_change',
        title: 'Mudança de Status',
        description: `${s.old_status} → ${s.new_status}`,
        date: s.changed_at,
        icon: 'refresh-cw'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Response(
      JSON.stringify({ timeline }),
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
