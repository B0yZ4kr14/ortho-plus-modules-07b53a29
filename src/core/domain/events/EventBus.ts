import { DomainEvent } from './DomainEvent';

/**
 * Event Handler interface
 */
export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void> | void;
}

/**
 * Event Bus - Publish/Subscribe pattern for Domain Events
 * Singleton implementation
 */
export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, IEventHandler<any>[]> = new Map();
  private eventLog: DomainEvent[] = [];
  private readonly maxLogSize = 1000;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Register an event handler for a specific event type
   */
  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  /**
   * Unregister an event handler
   */
  unsubscribe<T extends DomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Publish an event to all registered handlers
   */
  async publish(event: DomainEvent): Promise<void> {
    // Add to event log
    this.logEvent(event);

    // Get handlers for this event
    const handlers = this.handlers.get(event.eventName) || [];

    // Execute all handlers (could be parallel or sequential)
    const promises = handlers.map(handler => 
      Promise.resolve(handler.handle(event))
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error handling event ${event.eventName}:`, error);
      throw error;
    }
  }

  /**
   * Publish multiple events in order
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Get event log (for debugging/auditing)
   */
  getEventLog(): ReadonlyArray<DomainEvent> {
    return [...this.eventLog];
  }

  /**
   * Clear event log
   */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Log event (with size limit)
   */
  private logEvent(event: DomainEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
