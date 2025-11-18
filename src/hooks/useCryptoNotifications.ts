import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface CryptoAlert {
  id: string;
  coin_type: string;
  target_rate_brl: number;
  alert_type: 'ABOVE' | 'BELOW';
  current_rate: number;
}

export function useCryptoNotifications() {
  const { clinicId } = useAuth();
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<CryptoAlert[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // TEMPORARIAMENTE DESABILITADO: WebSocket será habilitado quando a Edge Function crypto-realtime-notifications for implementada
    // A funcionalidade de notificações em tempo real está aguardando implementação da Edge Function WebSocket
    
    // if (!clinicId) return;
    // connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [clinicId]);

  const connectWebSocket = () => {
    try {
      // Conectar ao WebSocket da Edge Function
      const ws = new WebSocket(
        `wss://yxpoqjyfgotkytwtifau.supabase.co/functions/v1/crypto-realtime-notifications?clinicId=${clinicId}`
      );

      ws.onopen = () => {
        logger.info('[WebSocket] Conectado às notificações cripto');
        setConnected(true);
        
        // Enviar mensagem de heartbeat a cada 30 segundos
        const heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        // Limpar interval ao fechar
        ws.addEventListener('close', () => {
          clearInterval(heartbeatInterval);
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          logger.debug('[WebSocket] Mensagem recebida', { data });

          switch (data.type) {
            case 'price_alert':
              handlePriceAlert(data.alert);
              break;
            case 'rate_update':
              handleRateUpdate(data.rates);
              break;
            case 'pong':
              logger.debug('[WebSocket] Pong recebido');
              break;
            default:
              logger.warn('[WebSocket] Tipo de mensagem desconhecido', { type: data.type });
          }
        } catch (error) {
          logger.error('[WebSocket] Erro ao processar mensagem', error);
        }
      };

      ws.onerror = (error) => {
        logger.error('[WebSocket] Erro', error);
        setConnected(false);
      };

      ws.onclose = (event) => {
        logger.info('[WebSocket] Conexão fechada', { code: event.code, reason: event.reason });
        setConnected(false);
        
        // Tentar reconectar após 5 segundos
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          logger.info('[WebSocket] Tentando reconectar...');
          connectWebSocket();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (error) {
      logger.error('[WebSocket] Erro ao conectar', error);
      setConnected(false);
    }
  };

  const handlePriceAlert = (alert: CryptoAlert) => {
    logger.info('[Notification] Alerta de preço acionado', { alert });
    
    setAlerts(prev => [...prev, alert]);

    const isAbove = alert.alert_type === 'ABOVE';
    const emoji = isAbove ? '📈' : '📉';
    
    toast.success(
      `${emoji} Alerta de Preço Acionado!`,
      {
        description: `${alert.coin_type} ${isAbove ? 'subiu acima' : 'caiu abaixo'} de R$ ${alert.target_rate_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Taxa atual: R$ ${alert.current_rate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        duration: 10000,
        action: {
          label: 'Ver Alertas',
          onClick: () => {
            // Navegar para aba de alertas
            window.location.hash = '#alerts';
          },
        },
      }
    );

    // Tocar som de notificação
    playNotificationSound();

    // Mostrar notificação do navegador se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Alerta de Preço - ${alert.coin_type}`, {
        body: `${alert.coin_type} ${isAbove ? 'subiu acima' : 'caiu abaixo'} de R$ ${alert.target_rate_brl.toFixed(2)}`,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    }
  };

  const handleRateUpdate = (rates: Record<string, number>) => {
    logger.debug('[Notification] Cotações atualizadas', { rates });
    // Você pode usar isso para atualizar cotações em tempo real na UI
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjaR1/HMeS0FJHbH8N2RQAoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQoUXbPp66hVFApGnt/yvmwhBjaQ1/HMeS0FJHbH8N2RQQo=');
      audio.volume = 0.3;
      audio.play().catch(e => logger.debug('Não foi possível tocar som de notificação', { error: e }));
    } catch (error) {
      logger.debug('Erro ao tocar som', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  return {
    connected,
    alerts,
    requestNotificationPermission,
  };
}
