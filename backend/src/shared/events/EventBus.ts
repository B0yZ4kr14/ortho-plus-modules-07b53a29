/**
 * EventBus In-Memory - Sistema de eventos de domínio
 * 
 * Permite comunicação assíncrona entre módulos via eventos.
 * Futuramente pode ser migrado para Redis Pub/Sub ou RabbitMQ.
 */

import { logger } from '@/infrastructure/logger';

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, any>;
  metadata: {
    userId?: string;
    clinicId?: string;
    timestamp: string;
    correlationId?: string;
  };
}

type EventHandler = (event: DomainEvent) => Promise<void> | void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventHistory: DomainEvent[] = [];
  private readonly maxHistorySize = 1000;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
      logger.info('EventBus instance created');
    }
    return EventBus.instance;
  }

  /**
   * Registra handler para tipo de evento
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    logger.debug('Event handler subscribed', { eventType });
  }

  /**
   * Remove handler específico
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        logger.debug('Event handler unsubscribed', { eventType });
      }
    }
  }

  /**
   * Publica evento para todos os handlers registrados
   */
  async publish(event: DomainEvent): Promise<void> {
    // Adicionar ao histórico
    this.addToHistory(event);

    // Log do evento
    logger.info('Domain event published', {
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      clinicId: event.metadata.clinicId,
    });

    // Executar handlers
    const handlers = this.handlers.get(event.eventType) || [];

    if (handlers.length === 0) {
      logger.warn('No handlers registered for event', { eventType: event.eventType });
      return;
    }

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
          logger.debug('Event handler executed successfully', {
            eventType: event.eventType,
          });
        } catch (error) {
          logger.error('Event handler execution failed', {
            eventType: event.eventType,
            error,
          });
          // Não propaga erro para não bloquear outros handlers
        }
      })
    );
  }

  /**
   * Publica múltiplos eventos em sequência
   */
  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Limpa todos os handlers (útil para testes)
   */
  clear(): void {
    this.handlers.clear();
    logger.debug('EventBus handlers cleared');
  }

  /**
   * Retorna histórico de eventos
   */
  getHistory(eventType?: string): DomainEvent[] {
    if (eventType) {
      return this.eventHistory.filter((e) => e.eventType === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Limpa histórico de eventos
   */
  clearHistory(): void {
    this.eventHistory = [];
    logger.debug('EventBus history cleared');
  }

  /**
   * Obtém estatísticas de eventos
   */
  getStats(): {
    totalHandlers: number;
    eventTypes: string[];
    historySize: number;
  } {
    return {
      totalHandlers: Array.from(this.handlers.values()).reduce(
        (sum, handlers) => sum + handlers.length,
        0
      ),
      eventTypes: Array.from(this.handlers.keys()),
      historySize: this.eventHistory.length,
    };
  }

  private addToHistory(event: DomainEvent): void {
    this.eventHistory.push(event);

    // Manter apenas os últimos N eventos
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// Export singleton
export const eventBus = EventBus.getInstance();
