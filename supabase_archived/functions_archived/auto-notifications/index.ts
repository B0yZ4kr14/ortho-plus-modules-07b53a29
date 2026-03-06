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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running auto-notifications scheduler...');
    let notificationsCreated = 0;

    // 1. Notificações de consultas próximas (24h antes)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    const { data: upcomingAppointments } = await supabaseClient
      .from('appointments')
      .select('*, patients(*), clinics(*)')
      .gte('start_time', tomorrowStart.toISOString())
      .lte('start_time', tomorrowEnd.toISOString())
      .eq('status', 'agendado');

    if (upcomingAppointments) {
      for (const appointment of upcomingAppointments) {
        await supabaseClient.from('notifications').insert({
          clinic_id: appointment.clinic_id,
          user_id: null, // Notificação para todos da clínica
          tipo: 'CONSULTA',
          titulo: 'Consulta Amanhã',
          mensagem: `Consulta agendada com ${appointment.patients?.full_name || 'paciente'} às ${new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          link_acao: '/agenda',
        });
        notificationsCreated++;
      }
    }

    // 2. Notificações de pagamentos vencidos
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: overduePayments } = await supabaseClient
      .from('contas_receber')
      .select('*, patients(*), clinics(*)')
      .lt('data_vencimento', today.toISOString())
      .in('status', ['PENDENTE', 'ATRASADO']);

    if (overduePayments) {
      for (const payment of overduePayments) {
        await supabaseClient.from('notifications').insert({
          clinic_id: payment.clinic_id,
          user_id: null,
          tipo: 'PAGAMENTO',
          titulo: 'Pagamento Vencido',
          mensagem: `Pagamento de R$ ${payment.valor.toFixed(2)} vencido - Paciente: ${payment.patients?.full_name || 'N/A'}`,
          link_acao: '/financeiro/contas-receber',
        });
        notificationsCreated++;
      }
    }

    // 3. Notificações de estoque baixo
    const { data: lowStockProducts } = await supabaseClient
      .from('estoque_produtos')
      .select('*, clinics(*)')
      .lte('quantidade_atual', 'quantidade_minima');

    if (lowStockProducts) {
      for (const product of lowStockProducts) {
        await supabaseClient.from('notifications').insert({
          clinic_id: product.clinic_id,
          user_id: null,
          tipo: 'ALERTA',
          titulo: 'Estoque Baixo',
          mensagem: `Produto "${product.nome}" com estoque baixo (${product.quantidade_atual} unidades)`,
          link_acao: '/estoque',
        });
        notificationsCreated++;
      }
    }

    // 4. Notificações de aniversariantes do dia
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const { data: birthdayPatients } = await supabaseClient
      .from('prontuarios')
      .select('*, patients(*), clinics(*)')
      .not('data_nascimento', 'is', null);

    if (birthdayPatients) {
      const birthdaysToday = birthdayPatients.filter(p => {
        if (!p.data_nascimento) return false;
        const birthDate = new Date(p.data_nascimento);
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
      });

      for (const patient of birthdaysToday) {
        await supabaseClient.from('notifications').insert({
          clinic_id: patient.clinic_id,
          user_id: null,
          tipo: 'LEMBRETE',
          titulo: '🎂 Aniversariante do Dia',
          mensagem: `Hoje é aniversário de ${patient.patients?.full_name || 'um paciente'}!`,
          link_acao: `/pacientes`,
        });
        notificationsCreated++;
      }
    }

    console.log(`Auto-notifications completed. Created ${notificationsCreated} notifications.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsCreated,
        message: `Created ${notificationsCreated} automatic notifications`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-notifications:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
