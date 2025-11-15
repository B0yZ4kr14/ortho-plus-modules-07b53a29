/**
 * Base class for all Domain Events
 * Events are immutable records of things that happened in the domain
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;
  public readonly eventVersion: number = 1;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = crypto.randomUUID();
  }

  abstract get aggregateId(): string;
  abstract get eventName(): string;
}
