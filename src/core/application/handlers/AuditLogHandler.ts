import { DomainEvent } from "@/core/domain/events/DomainEvent";
import { IEventHandler } from "@/core/domain/events/EventBus";
import { apiClient } from "@/lib/api/apiClient";

/**
 * Handler that logs all domain events to audit_logs table
 */
export class AuditLogHandler implements IEventHandler<DomainEvent> {
  async handle(event: DomainEvent): Promise<void> {
    try {
      await apiClient.post("/audit_logs", {
        action: event.eventName,
        details: {
          event_id: event.eventId,
          occurred_on: event.occurredOn.toISOString(),
          aggregate_id: event.aggregateId,
          event_name: event.eventName,
        },
      });
    } catch (err) {
      console.error("Failed to log event:", err);
    }
  }
}
