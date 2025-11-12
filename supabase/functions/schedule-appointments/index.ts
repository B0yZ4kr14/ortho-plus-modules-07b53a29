import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { treatments, patientId, dentistId } = await req.json();

    if (!treatments || !Array.isArray(treatments) || treatments.length === 0) {
      throw new Error('Tratamentos são obrigatórios');
    }

    if (!patientId || !dentistId) {
      throw new Error('pacienteId e dentistaId são obrigatórios');
    }

    // Buscar informações do paciente
    const { data: patient, error: patientError } = await supabase
      .from('profiles')
      .select('full_name, clinic_id')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error('Paciente não encontrado');
    }

    // Criar agendamentos para cada tratamento
    const appointments = [];
    const currentDate = new Date();
    
    // Ordenar tratamentos por prioridade
    const priorityOrder = { alta: 1, media: 2, baixa: 3 };
    const sortedTreatments = [...treatments].sort((a, b) => 
      priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    );

    for (let i = 0; i < sortedTreatments.length; i++) {
      const treatment = sortedTreatments[i];
      
      // Calcular data sugerida (próximos dias úteis, espaçando os tratamentos)
      const daysToAdd = (i + 1) * 7; // Espaçar uma semana entre cada tratamento
      const appointmentDate = new Date(currentDate);
      appointmentDate.setDate(appointmentDate.getDate() + daysToAdd);
      
      // Ajustar para dia útil se cair em fim de semana
      const dayOfWeek = appointmentDate.getDay();
      if (dayOfWeek === 0) { // Domingo
        appointmentDate.setDate(appointmentDate.getDate() + 1);
      } else if (dayOfWeek === 6) { // Sábado
        appointmentDate.setDate(appointmentDate.getDate() + 2);
      }

      // Determinar horário baseado na prioridade
      let startTime = '09:00';
      if (treatment.priority === 'alta') {
        startTime = '08:00'; // Prioridade alta: primeira hora da manhã
      } else if (treatment.priority === 'media') {
        startTime = '10:00';
      } else {
        startTime = '14:00';
      }

      // Calcular horário de término (1 hora de duração padrão)
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const endHour = startHour + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;

      const appointment = {
        clinic_id: patient.clinic_id,
        patient_id: patientId,
        dentist_id: dentistId,
        title: treatment.procedure,
        description: `${treatment.clinical_notes || ''}\n\nPrioridade: ${treatment.priority}\nValor estimado: R$ ${treatment.estimated_cost.toFixed(2)}`,
        start_time: `${appointmentDate.toISOString().split('T')[0]}T${startTime}:00`,
        end_time: `${appointmentDate.toISOString().split('T')[0]}T${endTime}:00`,
        status: 'agendado',
        created_by: user.id,
        treatment_id: treatment.treatment_id || null,
      };

      appointments.push(appointment);
    }

    // Inserir todos os agendamentos
    const { data: createdAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (appointmentsError) {
      console.error('Erro ao criar agendamentos:', appointmentsError);
      throw new Error('Erro ao criar agendamentos: ' + appointmentsError.message);
    }

    // Registrar no audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: patient.clinic_id,
        user_id: user.id,
        action: 'AUTO_SCHEDULE_APPOINTMENTS',
        details: {
          patient_id: patientId,
          dentist_id: dentistId,
          appointments_count: createdAppointments?.length || 0,
          treatments: sortedTreatments.map(t => ({
            procedure: t.procedure,
            priority: t.priority
          })),
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        appointments: createdAppointments,
        message: `${createdAppointments?.length || 0} consulta(s) agendada(s) automaticamente`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em schedule-appointments:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
