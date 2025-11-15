import { DomainEvent } from '@/core/domain/events/DomainEvent';

export interface LeadConvertedEventData {
  leadId: string;
  leadNome: string;
  clinicId: string;
  patientId: string;
  valorEstimado?: number;
  convertedBy: string;
}

export class LeadConvertedEvent extends DomainEvent {
  constructor(public readonly data: LeadConvertedEventData) {
    super();
  }

  get aggregateId(): string {
    return this.data.leadId;
  }

  get eventName(): string {
    return 'LeadConverted';
  }
}
