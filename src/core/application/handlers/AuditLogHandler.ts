import { IEventHandler } from '@/core/domain/events/EventBus';
import { DomainEvent } from '@/core/domain/events/DomainEvent';
import { supabase } from '@/integrations/supabase/client';

/**
 * Handler that logs all domain events to audit_logs table
 */
export class AuditLogHandler implements IEventHandler<DomainEvent> {
  async handle(event: DomainEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          action: event.eventName,
          details: {
            event_id: event.eventId,
            occurred_on: event.occurredOn.toISOString(),
            aggregate_id: event.aggregateId,
            event_name: event.eventName,
          },
        }]);

      if (error) {
        console.error('Error logging event to audit_logs:', error);
      }
    } catch (err) {
      console.error('Failed to log event:', err);
    }
  }
}
