import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking crypto price alerts...');

    // Buscar alertas ativos
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('crypto_price_alerts')
      .select('*, clinics(name), profiles!crypto_price_alerts_created_by_fkey(full_name)')
      .eq('is_active', true);

    if (alertsError) throw alertsError;

    if (!alerts || alerts.length === 0) {
      console.log('No active alerts found');
      return new Response(
        JSON.stringify({ message: 'No active alerts to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let alertsTriggered = 0;
    let alertsSent = 0;

    // Processar cada alerta
    for (const alert of alerts) {
      // Se alerta faz parte de cascata, verificar se alertas anteriores já foram disparados
      if (alert.cascade_enabled && alert.cascade_order > 1) {
        const { data: previousAlerts } = await supabaseClient
          .from('crypto_price_alerts')
          .select('last_triggered_at')
          .eq('cascade_group_id', alert.cascade_group_id)
          .lt('cascade_order', alert.cascade_order)
          .is('last_triggered_at', null);

        if (previousAlerts && previousAlerts.length > 0) {
          console.log(`⏸️ Cascade alert ${alert.id} waiting for previous alerts in group`);
          continue;
        }
      }

      // Buscar taxa atual
      const { data: latestRate } = await supabaseClient
        .from('crypto_exchange_rates')
        .select('*')
        .eq('coin_type', alert.coin_type)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (!latestRate) {
        console.log(`No rate found for ${alert.coin_type}`);
        continue;
      }

      const currentRate = latestRate.rate_brl;
      let shouldTrigger = false;

      // Verificar condição do alerta
      if (alert.alert_type === 'ABOVE' && currentRate >= alert.target_rate_brl) {
        shouldTrigger = true;
      } else if (alert.alert_type === 'BELOW' && currentRate <= alert.target_rate_brl) {
        shouldTrigger = true;
      }

      if (!shouldTrigger) {
        console.log(`Alert ${alert.id} not triggered: ${currentRate} vs ${alert.target_rate_brl}`);
        continue;
      }

      // Verificar se já foi disparado recentemente (últimas 24h)
      if (alert.last_triggered_at) {
        const hoursSinceLastTrigger = (Date.now() - new Date(alert.last_triggered_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastTrigger < 24) {
          console.log(`Alert ${alert.id} already triggered in the last 24h`);
          continue;
        }
      }

      alertsTriggered++;

      // Execute auto-conversion if stop-loss is enabled
      if (alert.stop_loss_enabled && alert.auto_convert_on_trigger) {
        await executeAutoConversion(supabaseClient, alert, currentRate);
      }

      // Buscar email do criador do alerta
      const { data: creator } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', alert.created_by)
        .single();

      if (creator) {
        const { data: user } = await supabaseClient.auth.admin.getUserById(creator.id);
        
        if (user && user.user && user.user.email) {
          const email = user.user.email;

          const alertTypeLabel = alert.stop_loss_enabled ? '🛑 Stop-Loss Acionado' : '🔔 Alerta de Taxa';
          let extraMessage = '';
          
          if (alert.stop_loss_enabled && alert.auto_convert_on_trigger) {
            extraMessage = `<p style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
              <strong>⚠️ Conversão Automática Iniciada</strong><br>
              ${alert.conversion_percentage}% do saldo da carteira será convertido automaticamente para BRL.
            </p>`;
          }

          // Enviar email
          if (alert.notification_method.includes('EMAIL')) {
            try {
              await resend.emails.send({
                from: 'Ortho+ <onboarding@resend.dev>',
                to: [email],
                subject: `${alertTypeLabel} ${alert.coin_type}`,
                html: `
                  <h2>${alertTypeLabel}</h2>
                  <p>Olá,</p>
                  <p>A taxa de câmbio do <strong>${alert.coin_type}</strong> atingiu o valor configurado no alerta.</p>
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Moeda:</strong> ${alert.coin_type}</p>
                    <p><strong>Taxa Atual:</strong> R$ ${currentRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p><strong>Taxa Alvo:</strong> R$ ${alert.target_rate_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p><strong>Condição:</strong> ${alert.alert_type === 'ABOVE' ? 'Acima de' : 'Abaixo de'}</p>
                  </div>
                  ${extraMessage}
                  <p>Acesse o sistema Ortho+ para visualizar os detalhes.</p>
                  <br>
                  <p>Atenciosamente,<br><strong>Equipe Ortho+</strong></p>
                `,
              });

              alertsSent++;
              console.log(`Email alert sent for ${alert.coin_type} to ${email}`);
            } catch (emailError) {
              console.error(`Error sending email alert:`, emailError);
            }
          }

          // Atualizar last_triggered_at
          await supabaseClient
            .from('crypto_price_alerts')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', alert.id);

          // Criar notificação in-app
          const notificationMessage = alert.stop_loss_enabled && alert.auto_convert_on_trigger
            ? `Stop-Loss acionado! ${alert.conversion_percentage}% do saldo está sendo convertido automaticamente. Taxa: R$ ${currentRate.toFixed(2)}`
            : `A taxa de câmbio do ${alert.coin_type} atingiu R$ ${currentRate.toFixed(2)} (${alert.alert_type === 'ABOVE' ? 'acima' : 'abaixo'} de R$ ${alert.target_rate_brl.toFixed(2)}). Momento ideal para converter!`;

          await supabaseClient
            .from('notifications')
            .insert({
              clinic_id: alert.clinic_id,
              user_id: alert.created_by,
              tipo: alert.stop_loss_enabled ? 'CRYPTO_STOP_LOSS' : 'CRYPTO_ALERT',
              titulo: alert.stop_loss_enabled ? `🛑 Stop-Loss ${alert.coin_type}` : `Taxa ${alert.coin_type} Atingida!`,
              mensagem: notificationMessage,
              link_acao: '/financeiro/crypto-pagamentos',
            });
        }
      }
    }

    console.log(`Alerts processed: ${alertsTriggered} triggered, ${alertsSent} sent`);

    return new Response(
      JSON.stringify({ 
        success: true,
        alertsTriggered,
        alertsSent,
        message: `Processed ${alerts.length} alerts, ${alertsTriggered} triggered, ${alertsSent} sent`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in send-crypto-price-alerts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function executeAutoConversion(supabaseClient: any, alert: any, currentRate: number) {
  console.log(`🔄 Executing auto-conversion for alert ${alert.id}`);
  
  try {
    // Get wallet for this coin type
    const { data: wallet, error: walletError } = await supabaseClient
      .from('crypto_wallets')
      .select('*')
      .eq('clinic_id', alert.clinic_id)
      .eq('coin_type', alert.coin_type)
      .eq('is_active', true)
      .single();

    if (walletError || !wallet) {
      console.error('❌ Wallet not found for auto-conversion:', walletError);
      return;
    }

    if (wallet.balance <= 0) {
      console.log('⚠️ Wallet balance is zero, skipping conversion');
      return;
    }

    // Calculate amount to convert
    const amountToConvert = (wallet.balance * alert.conversion_percentage) / 100;
    const convertedBRL = amountToConvert * currentRate;

    console.log(`💰 Converting ${amountToConvert} ${alert.coin_type} → R$ ${convertedBRL.toFixed(2)}`);

    // Call convert-crypto-to-brl edge function
    const { error: conversionError } = await supabaseClient.functions.invoke(
      'convert-crypto-to-brl',
      {
        body: {
          wallet_id: wallet.id,
          amount_crypto: amountToConvert,
          rate_brl: currentRate,
          auto_conversion: true,
          stop_loss_alert_id: alert.id,
        },
      }
    );

    if (conversionError) {
      console.error('❌ Error executing auto-conversion:', conversionError);
      return;
    }

    console.log(`✅ Auto-conversion successful: ${amountToConvert} ${alert.coin_type} → R$ ${convertedBRL.toFixed(2)}`);
    
    // Log audit
    await supabaseClient.from('audit_logs').insert({
      clinic_id: alert.clinic_id,
      user_id: alert.created_by,
      action: 'AUTO_CONVERSION_STOP_LOSS',
      details: {
        alert_id: alert.id,
        coin_type: alert.coin_type,
        amount_crypto: amountToConvert,
        rate_brl: currentRate,
        converted_brl: convertedBRL,
        conversion_percentage: alert.conversion_percentage,
      },
    });

  } catch (error) {
    console.error('💥 Exception during auto-conversion:', error);
  }
}
