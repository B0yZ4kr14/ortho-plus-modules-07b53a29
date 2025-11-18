/**
 * FRONTEND EVENT BUS - Real-time Updates via WebSocket
 * Permite comunicação assíncrona entre componentes e sincronização em tempo real
 */

import { logger } from '@/lib/logger';

export interface FrontendEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  payload: any;
  source?: string;
}

type EventHandler = (event: FrontendEvent) => void | Promise<void>;

export class FrontendEventBus {
  private static instance: FrontendEventBus;
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventHistory: FrontendEvent[] = [];
  private readonly maxHistorySize = 100;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  private constructor() {
    this.connectWebSocket();
  }

  static getInstance(): FrontendEventBus {
    if (!FrontendEventBus.instance) {
      FrontendEventBus.instance = new FrontendEventBus();
    }
    return FrontendEventBus.instance;
  }

  /**
   * Conecta ao WebSocket do backend para eventos em tempo real
   */
  private connectWebSocket(): void {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        logger.info('[FrontendEventBus] WebSocket conectado');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (message) => {
        try {
          const event: FrontendEvent = JSON.parse(message.data);
          this.publish(event);
        } catch (error) {
          logger.error('[FrontendEventBus] Erro ao processar mensagem', error);
        }
      };

      this.ws.onerror = (error) => {
        logger.error('[FrontendEventBus] Erro no WebSocket', error);
      };

      this.ws.onclose = () => {
        logger.warn('[FrontendEventBus] WebSocket desconectado');
        this.attemptReconnect();
      };
    } catch (error) {
      logger.error('[FrontendEventBus] Erro ao conectar WebSocket', error);
      this.attemptReconnect();
    }
  }

  /**
   * Tenta reconectar ao WebSocket com backoff exponencial
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('[FrontendEventBus] Máximo de tentativas de reconexão atingido');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    logger.info(`[FrontendEventBus] Reconectando em ${delay}ms (tentativa ${this.reconnectAttempts})`);
    setTimeout(() => this.connectWebSocket(), delay);
  }

  /**
   * Registra um handler para um tipo de evento
   */
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    // Retorna função de unsubscribe
    return () => this.unsubscribe(eventType, handler);
  }

  /**
   * Remove um handler específico
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Publica um evento para todos os handlers registrados
   */
  async publish(event: FrontendEvent): Promise<void> {
    // Armazenar no histórico
    this.addToHistory(event);

    // Executar handlers locais
    const handlers = this.handlers.get(event.eventType) || [];
    
    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[FrontendEventBus] Erro ao processar evento ${event.eventType}:`, error);
        }
      })
    );

    // Propagar via WebSocket se conectado
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(event));
      } catch (error) {
        console.error('[FrontendEventBus] Erro ao enviar evento via WebSocket:', error);
      }
    }
  }

  /**
   * Publica evento local (não propaga via WebSocket)
   */
  async publishLocal(event: FrontendEvent): Promise<void> {
    this.addToHistory(event);
    const handlers = this.handlers.get(event.eventType) || [];
    
    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[FrontendEventBus] Erro ao processar evento ${event.eventType}:`, error);
        }
      })
    );
  }

  /**
   * Retorna o histórico de eventos
   */
  getHistory(eventType?: string): FrontendEvent[] {
    if (eventType) {
      return this.eventHistory.filter(e => e.eventType === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Limpa o histórico de eventos
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Limpa todos os handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Fecha a conexão WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private addToHistory(event: FrontendEvent): void {
    this.eventHistory.push(event);
    
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// Export singleton instance
export const frontendEventBus = FrontendEventBus.getInstance();

// Export helper hook para React components
export function useFrontendEvent(eventType: string, handler: EventHandler) {
  const eventBus = FrontendEventBus.getInstance();
  
  // Auto-subscribe/unsubscribe no mount/unmount
  if (typeof window !== 'undefined') {
    const unsubscribe = eventBus.subscribe(eventType, handler);
    return unsubscribe;
  }
  
  return () => {};
}
