import { DomainEvent } from '@/core/domain/events/DomainEvent';

export interface TransactionPaidEventData {
  transactionId: string;
  clinicId: string;
  amount: number;
  paidDate: Date;
  paymentMethod?: string;
}

export class TransactionPaidEvent extends DomainEvent {
  constructor(public readonly data: TransactionPaidEventData) {
    super();
  }

  get aggregateId(): string {
    return this.data.transactionId;
  }

  get eventName(): string {
    return 'TransactionPaid';
  }
}
