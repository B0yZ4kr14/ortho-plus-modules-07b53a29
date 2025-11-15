import { eventBus } from '@/core/domain/events/EventBus';
import { NotificationHandler } from '@/core/application/handlers/NotificationHandler';
import { AuditLogHandler } from '@/core/application/handlers/AuditLogHandler';
import { EmailNotificationHandler } from '@/core/application/handlers/EmailNotificationHandler';

/**
 * Bootstrap Event Bus with all handlers
 * Call this once at application startup
 */
export function bootstrapEventBus(): void {
  // Global handlers (listen to all events)
  const notificationHandler = new NotificationHandler();
  const auditLogHandler = new AuditLogHandler();
  const emailHandler = new EmailNotificationHandler();

  // Subscribe to specific events
  eventBus.subscribe('TransactionCreated', notificationHandler);
  eventBus.subscribe('TransactionPaid', notificationHandler);
  eventBus.subscribe('ProdutoEstoqueBaixo', notificationHandler);
  eventBus.subscribe('LeadConverted', notificationHandler);
  eventBus.subscribe('AppointmentScheduled', notificationHandler);

  // Audit all events
  eventBus.subscribe('TransactionCreated', auditLogHandler);
  eventBus.subscribe('TransactionPaid', auditLogHandler);
  eventBus.subscribe('ProdutoEstoqueBaixo', auditLogHandler);
  eventBus.subscribe('LeadConverted', auditLogHandler);
  eventBus.subscribe('AppointmentScheduled', auditLogHandler);

  // Email notifications for specific events
  eventBus.subscribe('AppointmentScheduled', emailHandler);
  eventBus.subscribe('LeadConverted', emailHandler);

  console.log('[EventBus] Bootstrapped successfully');
}
