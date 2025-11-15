import { DomainEvent } from '@/core/domain/events/DomainEvent';

export interface AppointmentScheduledEventData {
  appointmentId: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  startTime: Date;
  endTime: Date;
  patientPhone?: string;
  patientEmail?: string;
}

export class AppointmentScheduledEvent extends DomainEvent {
  constructor(public readonly data: AppointmentScheduledEventData) {
    super();
  }

  get aggregateId(): string {
    return this.data.appointmentId;
  }

  get eventName(): string {
    return 'AppointmentScheduled';
  }
}
