/**
 * FASE 1: EVENT BUS
 * Sistema de eventos assíncrono para comunicação entre módulos
 */

import { DomainEvent } from '@/domain/events/DomainEvent';

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventHistory: DomainEvent[] = [];
  private readonly maxHistorySize = 1000;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Registra um handler para um tipo de evento
   */
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
  }

  /**
   * Remove um handler específico
   */
  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Publica um evento para todos os handlers registrados
   */
  async publish(event: DomainEvent): Promise<void> {
    // Armazenar no histórico
    this.addToHistory(event);

    // Executar handlers
    const handlers = this.handlers.get(event.eventType) || [];
    
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Erro ao processar evento ${event.eventType}:`, error);
          // Continua executando outros handlers mesmo se um falhar
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
   * Limpa todos os handlers registrados
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Retorna o histórico de eventos
   */
  getHistory(eventType?: string): DomainEvent[] {
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

  private addToHistory(event: DomainEvent): void {
    this.eventHistory.push(event);
    
    // Manter apenas os últimos N eventos
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
