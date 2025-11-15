import { DomainEvent } from './events/DomainEvent';

/**
 * Base class for Aggregate Roots
 * Aggregates maintain consistency boundaries and raise domain events
 */
export abstract class AggregateRoot<T> {
  protected props: T;
  private domainEvents: DomainEvent[] = [];

  constructor(props: T) {
    this.props = props;
  }

  /**
   * Add a domain event to be published
   */
  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Get all domain events and clear them
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  /**
   * Check if there are pending events
   */
  public hasDomainEvents(): boolean {
    return this.domainEvents.length > 0;
  }

  /**
   * Get domain events without clearing
   */
  public getDomainEvents(): ReadonlyArray<DomainEvent> {
    return [...this.domainEvents];
  }

  /**
   * Abstract methods that must be implemented
   */
  abstract get id(): string;
}
