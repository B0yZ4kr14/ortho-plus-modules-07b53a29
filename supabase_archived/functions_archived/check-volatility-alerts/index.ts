import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CryptoRateHistory {
  timestamp: number;
  rate: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking volatility alerts...');

    // Buscar todos os alertas de volatilidade ativos
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('crypto_price_alerts')
      .select('*')
      .eq('alert_type', 'VOLATILITY')
      .eq('is_active', true);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      console.log('No active volatility alerts found');
      return new Response(JSON.stringify({ message: 'No active alerts' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${alerts.length} active volatility alerts`);

    // Buscar cotações atuais para todas as moedas únicas
    const uniqueCoins = [...new Set(alerts.map(a => a.coin_type))];
    const coinIds: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'USDC': 'usd-coin',
    };

    const triggeredAlerts = [];

    for (const alert of alerts) {
      const coinId = coinIds[alert.coin_type];
      if (!coinId) continue;

      const timeframeMinutes = alert.volatility_timeframe_minutes || 60;
      const thresholdPercentage = alert.volatility_threshold_percentage || 5;
      const direction = alert.volatility_direction || 'both';

      // Buscar histórico de preços do CoinGecko
      const toTimestamp = Math.floor(Date.now() / 1000);
      const fromTimestamp = toTimestamp - (timeframeMinutes * 60);

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=brl&from=${fromTimestamp}&to=${toTimestamp}`
        );

        if (!response.ok) {
          console.error(`Error fetching price data for ${alert.coin_type}`);
          continue;
        }

        const data = await response.json();
        const prices = data.prices as [number, number][];

        if (!prices || prices.length < 2) {
          console.log(`Insufficient price data for ${alert.coin_type}`);
          continue;
        }

        // Calcular variação percentual
        const firstPrice = prices[0][1];
        const lastPrice = prices[prices.length - 1][1];
        const changePercentage = ((lastPrice - firstPrice) / firstPrice) * 100;

        console.log(`${alert.coin_type}: ${changePercentage.toFixed(2)}% change in ${timeframeMinutes}min`);

        // Verificar se o alerta deve ser disparado
        let shouldTrigger = false;

        if (direction === 'up' && changePercentage >= thresholdPercentage) {
          shouldTrigger = true;
        } else if (direction === 'down' && changePercentage <= -thresholdPercentage) {
          shouldTrigger = true;
        } else if (direction === 'both' && Math.abs(changePercentage) >= thresholdPercentage) {
          shouldTrigger = true;
        }

        if (shouldTrigger) {
          console.log(`Alert triggered for ${alert.coin_type}: ${changePercentage.toFixed(2)}%`);

          // Atualizar last_triggered_at
          await supabaseClient
            .from('crypto_price_alerts')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', alert.id);

          // Criar notificação
          await supabaseClient.from('notifications').insert({
            clinic_id: alert.clinic_id,
            tipo: 'CRIPTO_VOLATILIDADE',
            titulo: `Alerta de Volatilidade: ${alert.coin_type}`,
            mensagem: `${alert.coin_type} variou ${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(2)}% em ${timeframeMinutes} minutos. Preço atual: R$ ${lastPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            link_acao: '/financeiro/crypto-pagamentos',
          });

          triggeredAlerts.push({
            coin: alert.coin_type,
            change: changePercentage,
            timeframe: timeframeMinutes,
          });
        }
      } catch (error) {
        console.error(`Error processing alert for ${alert.coin_type}:`, error);
        continue;
      }
    }

    console.log(`Triggered ${triggeredAlerts.length} alerts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        triggeredAlerts,
        message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length}` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
