import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Recall {
  id: string;
  clinic_id: string;
  patient_id: string;
  tipo_recall: string;
  data_prevista: string;
  status: string;
  notificacao_enviada: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando processamento de recalls...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Data de referência: 7 dias a partir de hoje
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    console.log(`📅 Buscando recalls entre ${today.toISOString()} e ${sevenDaysFromNow.toISOString()}`);

    // Buscar recalls pendentes com data prevista nos próximos 7 dias e que ainda não foram notificados
    const { data: recalls, error: recallsError } = await supabase
      .from('recalls')
      .select('*')
      .eq('status', 'PENDENTE')
      .eq('notificacao_enviada', false)
      .gte('data_prevista', today.toISOString().split('T')[0])
      .lte('data_prevista', sevenDaysFromNow.toISOString().split('T')[0]);

    if (recallsError) {
      console.error('❌ Erro ao buscar recalls:', recallsError);
      throw recallsError;
    }

    console.log(`✅ Encontrados ${recalls?.length || 0} recalls para processar`);

    if (!recalls || recalls.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum recall para processar',
          processed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Processar cada recall
    for (const recall of recalls as Recall[]) {
      try {
        console.log(`📧 Processando recall ${recall.id} - Tipo: ${recall.tipo_recall}`);

        // Buscar informações do paciente
        const { data: prontuario, error: prontuarioError } = await supabase
          .from('prontuarios')
          .select('patient_name, clinic_id')
          .eq('patient_id', recall.patient_id)
          .eq('clinic_id', recall.clinic_id)
          .single();

        if (prontuarioError || !prontuario) {
          console.error(`⚠️ Paciente não encontrado para recall ${recall.id}`);
          errors.push(`Recall ${recall.id}: Paciente não encontrado`);
          errorCount++;
          continue;
        }

        // Simular envio de notificação (aqui você integraria com Twilio, WhatsApp, etc.)
        const notificationMessage = generateNotificationMessage(
          prontuario.patient_name,
          recall.tipo_recall,
          recall.data_prevista
        );

        console.log(`📨 Mensagem: ${notificationMessage}`);

        // TODO: Integração real com serviço de mensagens
        // await sendWhatsAppMessage(phoneNumber, notificationMessage);
        // await sendSMS(phoneNumber, notificationMessage);
        // await sendEmail(email, subject, notificationMessage);

        // Atualizar recall como notificado
        const { error: updateError } = await supabase
          .from('recalls')
          .update({
            notificacao_enviada: true,
            metodo_notificacao: 'WHATSAPP', // Ou o método real usado
          })
          .eq('id', recall.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar recall ${recall.id}:`, updateError);
          errors.push(`Recall ${recall.id}: Erro ao atualizar - ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Recall ${recall.id} processado com sucesso`);
          processedCount++;
        }

        // Log de auditoria
        await supabase.from('audit_logs').insert({
          clinic_id: recall.clinic_id,
          action: 'RECALL_NOTIFICATION_SENT',
          details: {
            recall_id: recall.id,
            patient_id: recall.patient_id,
            tipo_recall: recall.tipo_recall,
            data_prevista: recall.data_prevista,
            timestamp: new Date().toISOString(),
          },
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Erro ao processar recall ${recall.id}:`, error);
        errors.push(`Recall ${recall.id}: ${errorMessage}`);
        errorCount++;
      }
    }

    console.log(`✅ Processamento concluído: ${processedCount} sucessos, ${errorCount} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processados ${processedCount} recalls com ${errorCount} erros`,
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Erro fatal no processamento de recalls:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        stack: errorStack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateNotificationMessage(
  patientName: string,
  tipoRecall: string,
  dataPrevista: string
): string {
  const tipo = tipoRecall.replace('_', ' ').toLowerCase();
  const data = new Date(dataPrevista);
  const dataFormatada = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `Olá ${patientName}! 😊\n\n` +
    `Lembrete: Está na hora de agendar sua ${tipo}!\n` +
    `Data prevista: ${dataFormatada}\n\n` +
    `Entre em contato conosco para agendar seu horário.\n\n` +
    `Equipe de Odontologia`;
}
