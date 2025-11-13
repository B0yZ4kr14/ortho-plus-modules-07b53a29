// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CryptoRate {
  BTC: number;
  ETH: number;
  USDT: number;
  BNB: number;
  USDC: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(req.url);
  const clinicId = url.searchParams.get('clinicId');

  if (!clinicId) {
    return new Response("Missing clinicId parameter", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log(`[WebSocket] Cliente conectado - Clinic: ${clinicId}`);
    
    // Iniciar monitoramento de preços
    startPriceMonitoring(socket, clinicId);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WebSocket] Mensagem recebida:', data);

      if (data.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (error) {
      console.error('[WebSocket] Erro ao processar mensagem:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('[WebSocket] Erro:', error);
  };

  socket.onclose = () => {
    console.log(`[WebSocket] Cliente desconectado - Clinic: ${clinicId}`);
  };

  return response;
});

async function startPriceMonitoring(socket: WebSocket, clinicId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let previousRates: CryptoRate | null = null;

  // Verificar alertas a cada 60 segundos
  const checkInterval = setInterval(async () => {
    try {
      if (socket.readyState !== WebSocket.OPEN) {
        console.log('[Monitor] Socket fechado, parando monitoramento');
        clearInterval(checkInterval);
        return;
      }

      // Buscar cotações atuais da CoinGecko
      const rates = await fetchCryptoRates();
      
      // Enviar atualização de cotações
      socket.send(JSON.stringify({
        type: 'rate_update',
        rates,
        timestamp: new Date().toISOString(),
      }));

      // Buscar alertas ativos da clínica
      const { data: alerts, error } = await supabase
        .from('crypto_price_alerts')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (error) {
        console.error('[Monitor] Erro ao buscar alertas:', error);
        return;
      }

      if (!alerts || alerts.length === 0) {
        console.log('[Monitor] Nenhum alerta ativo');
        return;
      }

      console.log(`[Monitor] Verificando ${alerts.length} alertas`);

      // Verificar cada alerta
      for (const alert of alerts) {
        const currentRate = rates[alert.coin_type as keyof CryptoRate];
        
        if (!currentRate) {
          console.log(`[Monitor] Taxa não encontrada para ${alert.coin_type}`);
          continue;
        }

        let shouldTrigger = false;

        if (alert.alert_type === 'ABOVE' && currentRate >= alert.target_rate_brl) {
          shouldTrigger = true;
        } else if (alert.alert_type === 'BELOW' && currentRate <= alert.target_rate_brl) {
          shouldTrigger = true;
        }

        if (shouldTrigger) {
          console.log(`[Monitor] Alerta acionado! ${alert.coin_type} ${alert.alert_type} ${alert.target_rate_brl}`);
          
          // Enviar notificação via WebSocket
          socket.send(JSON.stringify({
            type: 'price_alert',
            alert: {
              id: alert.id,
              coin_type: alert.coin_type,
              target_rate_brl: alert.target_rate_brl,
              alert_type: alert.alert_type,
              current_rate: currentRate,
            },
            timestamp: new Date().toISOString(),
          }));

          // Atualizar last_triggered_at no banco
          await supabase
            .from('crypto_price_alerts')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', alert.id);

          // Se auto_convert_on_trigger estiver habilitado, executar conversão
          if (alert.auto_convert_on_trigger && alert.conversion_percentage > 0) {
            console.log(`[Monitor] Executando conversão automática para alerta ${alert.id}`);
            await executeAutoConversion(alert, currentRate);
          }

          // Criar notificação no banco
          await supabase
            .from('notifications')
            .insert({
              clinic_id: clinicId,
              user_id: alert.created_by,
              tipo: 'ALERTA_PRECO_CRIPTO',
              titulo: `Alerta de Preço - ${alert.coin_type}`,
              mensagem: `${alert.coin_type} ${alert.alert_type === 'ABOVE' ? 'subiu acima' : 'caiu abaixo'} de R$ ${alert.target_rate_brl.toFixed(2)}. Taxa atual: R$ ${currentRate.toFixed(2)}`,
              link_acao: '/financeiro/crypto#alerts',
            });
        }
      }

      previousRates = rates;
    } catch (error) {
      console.error('[Monitor] Erro no ciclo de verificação:', error);
    }
  }, 60000); // Verificar a cada 60 segundos

  // Fazer primeira verificação imediatamente
  setTimeout(async () => {
    try {
      const rates = await fetchCryptoRates();
      socket.send(JSON.stringify({
        type: 'rate_update',
        rates,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('[Monitor] Erro na verificação inicial:', error);
    }
  }, 1000);
}

async function fetchCryptoRates(): Promise<CryptoRate> {
  try {
    const coins = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'usd-coin'];
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=brl`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      BTC: data.bitcoin?.brl || 350000,
      ETH: data.ethereum?.brl || 18000,
      USDT: data.tether?.brl || 5.5,
      BNB: data.binancecoin?.brl || 1500,
      USDC: data['usd-coin']?.brl || 5.5,
    };
  } catch (error) {
    console.error('[CoinGecko] Erro ao buscar cotações:', error);
    
    // Fallback para valores simulados
    return {
      BTC: 350000,
      ETH: 18000,
      USDT: 5.5,
      BNB: 1500,
      USDC: 5.5,
    };
  }
}

async function executeAutoConversion(alert: any, currentRate: number) {
  try {
    console.log(`[AutoConvert] Iniciando conversão automática para alerta ${alert.id}`);
    
    // Aqui você chamaria a função de conversão
    // Por enquanto, apenas logamos a intenção
    console.log(`[AutoConvert] Converter ${alert.conversion_percentage}% de ${alert.coin_type} a R$ ${currentRate}`);
    
    // TODO: Implementar lógica de conversão automática
    // await supabase.functions.invoke('convert-crypto-to-brl', {
    //   body: {
    //     alertId: alert.id,
    //     percentage: alert.conversion_percentage,
    //     rate: currentRate,
    //   }
    // });
  } catch (error) {
    console.error('[AutoConvert] Erro na conversão automática:', error);
  }
}
