import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingTreatments: number;
  completedTreatments: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user and clinic
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    const clinicId = profile?.clinic_id;
    if (!clinicId) {
      return new Response(JSON.stringify({ error: 'Clinic not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch stats
    const stats: DashboardStats = {
      totalPatients: 0,
      todayAppointments: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingTreatments: 0,
      completedTreatments: 0,
    };

    // Total patients
    const { count: patientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);
    stats.totalPatients = patientsCount || 0;

    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('start_time', `${today}T00:00:00`)
      .lt('start_time', `${today}T23:59:59`);
    stats.todayAppointments = todayCount || 0;

    // Monthly revenue (mock for now)
    stats.monthlyRevenue = 0;

    // Occupancy rate (mock for now)
    stats.occupancyRate = 0;

    // Pending treatments (mock for now)
    stats.pendingTreatments = 0;

    // Completed treatments (mock for now)
    stats.completedTreatments = 0;

    // Mock chart data
    const appointmentsData = [
      { name: 'Seg', agendadas: 12, realizadas: 10 },
      { name: 'Ter', agendadas: 15, realizadas: 13 },
      { name: 'Qua', agendadas: 18, realizadas: 16 },
      { name: 'Qui', agendadas: 14, realizadas: 12 },
      { name: 'Sex', agendadas: 16, realizadas: 15 },
      { name: 'Sáb', agendadas: 8, realizadas: 7 },
    ];

    const revenueData = [
      { name: 'Jan', receita: 45000, despesas: 28000 },
      { name: 'Fev', receita: 52000, despesas: 30000 },
      { name: 'Mar', receita: 48000, despesas: 29000 },
      { name: 'Abr', receita: 61000, despesas: 32000 },
      { name: 'Mai', receita: 55000, despesas: 31000 },
      { name: 'Jun', receita: 67000, despesas: 33000 },
    ];

    const treatmentsByStatus = [
      { name: 'Concluído', value: 45 },
      { name: 'Em Andamento', value: 32 },
      { name: 'Pendente', value: 18 },
      { name: 'Cancelado', value: 5 },
    ];

    return new Response(
      JSON.stringify({
        stats,
        appointmentsData,
        revenueData,
        treatmentsByStatus,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
