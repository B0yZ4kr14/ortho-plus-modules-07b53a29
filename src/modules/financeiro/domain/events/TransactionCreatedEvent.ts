import { DomainEvent } from '@/core/domain/events/DomainEvent';

export interface TransactionCreatedEventData {
  transactionId: string;
  clinicId: string;
  amount: number;
  type: 'RECEITA' | 'DESPESA';
  categoryId?: string;
  createdBy: string;
}

export class TransactionCreatedEvent extends DomainEvent {
  constructor(public readonly data: TransactionCreatedEventData) {
    super();
  }

  get aggregateId(): string {
    return this.data.transactionId;
  }

  get eventName(): string {
    return 'TransactionCreated';
  }
}
