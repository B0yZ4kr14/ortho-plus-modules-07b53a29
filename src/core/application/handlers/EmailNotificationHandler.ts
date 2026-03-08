import { IEventHandler } from '@/core/domain/events/EventBus';
import { AppointmentScheduledEvent } from '@/modules/agenda/domain/events/AppointmentScheduledEvent';
import { LeadConvertedEvent } from '@/modules/crm/domain/events/LeadConvertedEvent';

/**
 * Handler for sending email notifications based on events
 * This would integrate with an email service (Resend, SendGrid, etc.)
 */
export class EmailNotificationHandler 
  implements IEventHandler<AppointmentScheduledEvent | LeadConvertedEvent> {
  
  async handle(event: AppointmentScheduledEvent | LeadConvertedEvent): Promise<void> {
    // TODO: Integrate with email service

    if (event instanceof AppointmentScheduledEvent) {
      await this.sendAppointmentConfirmation(event);
    } else if (event instanceof LeadConvertedEvent) {
      await this.sendWelcomeEmail(event);
    }
  }

  private async sendAppointmentConfirmation(event: AppointmentScheduledEvent): Promise<void> {
    // Integration with email service would go here  }

  private async sendWelcomeEmail(event: LeadConvertedEvent): Promise<void> {
    // Integration with email service would go here  }
}
