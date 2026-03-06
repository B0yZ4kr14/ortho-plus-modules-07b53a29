import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar teleconsultas agendadas para as próximas 24 horas
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    const { data: teleconsultas, error: teleconsultasError } = await supabaseClient
      .from('teleconsultas')
      .select(`
        *,
        patient:patients(id, nome, email, telefone, whatsapp),
        dentist:profiles(full_name)
      `)
      .eq('status', 'AGENDADA')
      .gte('data_agendada', new Date().toISOString())
      .lte('data_agendada', tomorrow.toISOString());

    if (teleconsultasError) {
      throw teleconsultasError;
    }

    console.log(`Found ${teleconsultas?.length || 0} teleconsultas scheduled for next 24 hours`);

    const notifications = [];

    for (const teleconsulta of teleconsultas || []) {
      const patient = teleconsulta.patient;
      const triageLink = `${Deno.env.get('SUPABASE_URL')}/triagem/${teleconsulta.id}`;
      const accessLink = `${Deno.env.get('SUPABASE_URL')}/teleconsulta/${teleconsulta.id}`;

      // Preparar mensagem
      const message = `
Olá ${patient.nome}!

Você tem uma teleconsulta agendada para ${new Date(teleconsulta.data_agendada).toLocaleString('pt-BR')}.

📋 **Triagem Pré-Consulta**
Para agilizar seu atendimento, preencha a triagem antes da consulta:
${triageLink}

🔗 **Acesso à Consulta**
No horário agendado, acesse:
${accessLink}

📝 **Instruções de Acesso:**
1. Certifique-se de ter boa conexão com internet
2. Use fones de ouvido para melhor qualidade de áudio
3. Esteja em um ambiente silencioso e bem iluminado
4. Tenha em mãos seus exames e documentos médicos

Tipo de consulta: ${teleconsulta.tipo === 'VIDEO' ? 'Videochamada' : teleconsulta.tipo === 'AUDIO' ? 'Áudio' : 'Chat'}
Dentista: ${teleconsulta.dentist?.full_name || 'N/A'}

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe Ortho+
      `.trim();

      // Enviar email se disponível
      if (patient.email) {
        try {
          // Simulação de envio de email (Resend será implementado com API key real)
          console.log(`Sending email to ${patient.email} for teleconsulta ${teleconsulta.id}`);
          
          notifications.push({
            type: 'email',
            patient_id: patient.id,
            teleconsulta_id: teleconsulta.id,
            status: 'sent',
            sent_at: new Date().toISOString()
          });
        } catch (error: any) {
          console.error(`Failed to send email to ${patient.email}:`, error);
          notifications.push({
            type: 'email',
            patient_id: patient.id,
            teleconsulta_id: teleconsulta.id,
            status: 'failed',
            error: error?.message || 'Unknown error'
          });
        }
      }

      // Enviar WhatsApp se disponível
      if (patient.whatsapp) {
        try {
          // Simulação de envio de WhatsApp (será implementado com API real)
          console.log(`Sending WhatsApp to ${patient.whatsapp} for teleconsulta ${teleconsulta.id}`);
          
          notifications.push({
            type: 'whatsapp',
            patient_id: patient.id,
            teleconsulta_id: teleconsulta.id,
            status: 'sent',
            sent_at: new Date().toISOString()
          });
        } catch (error: any) {
          console.error(`Failed to send WhatsApp to ${patient.whatsapp}:`, error);
          notifications.push({
            type: 'whatsapp',
            patient_id: patient.id,
            teleconsulta_id: teleconsulta.id,
            status: 'failed',
            error: error?.message || 'Unknown error'
          });
        }
      }

      // Registrar notificação no banco
      const { error: notificationError } = await supabaseClient
        .from('patient_notifications')
        .insert({
          patient_id: patient.id,
          tipo: 'TELECONSULTA_LEMBRETE',
          titulo: 'Lembrete de Teleconsulta',
          mensagem: message,
          link_acao: accessLink
        });

      if (notificationError) {
        console.error(`Failed to save notification for patient ${patient.id}:`, notificationError);
      }

      // Registrar no audit log
      const { error: auditError } = await supabaseClient
        .from('audit_logs')
        .insert({
          clinic_id: teleconsulta.clinic_id,
          action: 'TELECONSULTA_NOTIFICATION_SENT',
          details: {
            teleconsulta_id: teleconsulta.id,
            patient_id: patient.id,
            notification_types: notifications
              .filter(n => n.teleconsulta_id === teleconsulta.id)
              .map(n => n.type),
            scheduled_date: teleconsulta.data_agendada
          }
        });

      if (auditError) {
        console.error(`Failed to save audit log for teleconsulta ${teleconsulta.id}:`, auditError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        teleconsultas_notified: teleconsultas?.length || 0,
        notifications 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in schedule-appointments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
