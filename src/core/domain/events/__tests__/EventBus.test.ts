import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus, IEventHandler } from '../EventBus';
import { DomainEvent } from '../DomainEvent';

class TestEvent extends DomainEvent {
  constructor(public readonly data: { id: string; value: string }) {
    super();
  }
  get aggregateId(): string { return this.data.id; }
  get eventName(): string { return 'TestEvent'; }
}

class TestHandler implements IEventHandler<TestEvent> {
  public handleCalled = false;
  public receivedEvent: TestEvent | null = null;

  async handle(event: TestEvent): Promise<void> {
    this.handleCalled = true;
    this.receivedEvent = event;
  }
}

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Get a fresh instance for each test
    eventBus = EventBus.getInstance();
    eventBus.clearEventLog();
  });

  describe('subscribe and publish', () => {
    it('should call handler when event is published', async () => {
      const handler = new TestHandler();
      eventBus.subscribe('TestEvent', handler);

      const event = new TestEvent({ id: '123', value: 'test' });
      await eventBus.publish(event);

      expect(handler.handleCalled).toBe(true);
      expect(handler.receivedEvent).toBe(event);
    });

    it('should call multiple handlers for same event', async () => {
      const handler1 = new TestHandler();
      const handler2 = new TestHandler();

      eventBus.subscribe('TestEvent', handler1);
      eventBus.subscribe('TestEvent', handler2);

      const event = new TestEvent({ id: '123', value: 'test' });
      await eventBus.publish(event);

      expect(handler1.handleCalled).toBe(true);
      expect(handler2.handleCalled).toBe(true);
    });

    it('should not call unsubscribed handler', async () => {
      const handler = new TestHandler();
      eventBus.subscribe('TestEvent', handler);
      eventBus.unsubscribe('TestEvent', handler);

      const event = new TestEvent({ id: '123', value: 'test' });
      await eventBus.publish(event);

      expect(handler.handleCalled).toBe(false);
    });
  });

  describe('publishAll', () => {
    it('should publish multiple events in order', async () => {
      const callOrder: string[] = [];
      
      const handler1 = {
        async handle(event: TestEvent) {
          callOrder.push('handler1-' + event.data.id);
        }
      };

      eventBus.subscribe('TestEvent', handler1);

      const events = [
        new TestEvent({ id: '1', value: 'first' }),
        new TestEvent({ id: '2', value: 'second' }),
        new TestEvent({ id: '3', value: 'third' }),
      ];

      await eventBus.publishAll(events);

      expect(callOrder).toEqual(['handler1-1', 'handler1-2', 'handler1-3']);
    });
  });

  describe('event log', () => {
    it('should log published events', async () => {
      const event = new TestEvent({ id: '123', value: 'test' });
      await eventBus.publish(event);

      const log = eventBus.getEventLog();
      expect(log.length).toBe(1);
      expect(log[0]).toBe(event);
    });

    it('should clear event log', async () => {
      const event = new TestEvent({ id: '123', value: 'test' });
      await eventBus.publish(event);

      eventBus.clearEventLog();

      const log = eventBus.getEventLog();
      expect(log.length).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should throw error if handler fails', async () => {
      const failingHandler = {
        async handle() {
          throw new Error('Handler failed');
        }
      };

      eventBus.subscribe('TestEvent', failingHandler);

      const event = new TestEvent({ id: '123', value: 'test' });
      
      await expect(eventBus.publish(event)).rejects.toThrow('Handler failed');
    });
  });
});
