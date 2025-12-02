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
    console.log('[dashboard-overview] Starting request...');
    
    // Use SERVICE_ROLE_KEY para validar JWT e fazer queries privilegiadas
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user and clinic
    console.log('[dashboard-overview] Fetching user...');

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer', '').replace('bearer', '').replace(/\s+/g, ' ').trim().split(' ')[1] || '';

    if (!token) {
      console.error('[dashboard-overview] Missing Authorization token');
      return new Response(JSON.stringify({ error: 'Auth error: missing bearer token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError) {
      console.error('[dashboard-overview] User fetch error:', userError);
      return new Response(JSON.stringify({ error: 'Auth error: ' + userError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!user) {
      console.error('[dashboard-overview] No user found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[dashboard-overview] Fetching profile for user:', user.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[dashboard-overview] Profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Profile error: ' + profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clinicId = profile?.clinic_id;
    if (!clinicId) {
      console.error('[dashboard-overview] No clinic found for user');
      return new Response(JSON.stringify({ error: 'Clinic not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[dashboard-overview] Processing for clinic:', clinicId);

    // Fetch stats with error handling per section
    const stats: DashboardStats = {
      totalPatients: 0,
      todayAppointments: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingTreatments: 0,
      completedTreatments: 0,
    };

    // Total patients
    try {
      console.log('[dashboard-overview] Fetching patients count...');
      const { count: patientsCount, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);
      
      if (patientsError) {
        console.error('[dashboard-overview] Patients count error:', patientsError);
      } else {
        stats.totalPatients = patientsCount || 0;
        console.log('[dashboard-overview] Patients count:', stats.totalPatients);
      }
    } catch (e) {
      console.error('[dashboard-overview] Patients exception:', e);
    }

    // Today's appointments
    try {
      console.log('[dashboard-overview] Fetching today appointments...');
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`);
      
      if (appointmentsError) {
        console.error('[dashboard-overview] Appointments count error:', appointmentsError);
      } else {
        stats.todayAppointments = todayCount || 0;
        console.log('[dashboard-overview] Today appointments:', stats.todayAppointments);
      }
    } catch (e) {
      console.error('[dashboard-overview] Appointments exception:', e);
    }

    // Monthly revenue - fetch from transactions table
    try {
      console.log('[dashboard-overview] Fetching monthly revenue...');
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: revenueData, error: revenueError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('clinic_id', clinicId)
        .eq('type', 'RECEITA')
        .gte('date', firstDayOfMonth);
      
      if (revenueError) {
        console.error('[dashboard-overview] Revenue error:', revenueError);
      } else {
        stats.monthlyRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        console.log('[dashboard-overview] Monthly revenue:', stats.monthlyRevenue);
      }
    } catch (e) {
      console.error('[dashboard-overview] Revenue exception:', e);
    }

    // Occupancy rate - appointments vs total slots
    try {
      console.log('[dashboard-overview] Calculating occupancy rate...');
      const today = new Date().toISOString().split('T')[0];
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`);
      
      // Assuming 8 slots per dentist per day (8am-6pm with 1h each)
      const { count: dentistsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);
      
      const totalSlots = (dentistsCount || 1) * 8;
      stats.occupancyRate = totalSlots > 0 ? ((totalAppointments || 0) / totalSlots) * 100 : 0;
      console.log('[dashboard-overview] Occupancy rate:', stats.occupancyRate);
    } catch (e) {
      console.error('[dashboard-overview] Occupancy exception:', e);
    }

    // Treatments stats
    try {
      console.log('[dashboard-overview] Fetching treatments...');
      const { count: pendingCount } = await supabase
        .from('pep_tratamentos')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'EM_ANDAMENTO');
      
      const { count: completedCount } = await supabase
        .from('pep_tratamentos')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'CONCLUIDO');
      
      stats.pendingTreatments = pendingCount || 0;
      stats.completedTreatments = completedCount || 0;
      console.log('[dashboard-overview] Treatments - pending:', stats.pendingTreatments, 'completed:', stats.completedTreatments);
    } catch (e) {
      console.error('[dashboard-overview] Treatments exception:', e);
    }

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

    console.log('[dashboard-overview] Returning success response');
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
    console.error('[dashboard-overview] FATAL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
