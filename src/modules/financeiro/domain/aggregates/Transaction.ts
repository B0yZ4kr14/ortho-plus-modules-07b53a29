import { AggregateRoot } from '@/core/domain/AggregateRoot';
import { Money } from '../valueObjects/Money';
import { TransactionCreatedEvent } from '../events/TransactionCreatedEvent';
import { TransactionPaidEvent } from '../events/TransactionPaidEvent';

export type TransactionType = 'RECEITA' | 'DESPESA';
export type TransactionStatus = 'PENDENTE' | 'PAGA' | 'CANCELADA' | 'VENCIDA';

export interface TransactionProps {
  id: string;
  clinicId: string;
  type: TransactionType;
  amount: Money;
  description: string;
  categoryId?: string;
  dueDate: Date;
  paidDate?: Date;
  status: TransactionStatus;
  paymentMethod?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction Aggregate Root
 * Represents a financial transaction with business rules
 */
export class Transaction extends AggregateRoot<TransactionProps> {
  private constructor(props: TransactionProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get paidDate(): Date | undefined {
    return this.props.paidDate;
  }

  /**
   * Factory method to create a new transaction
   */
  static create(params: {
    clinicId: string;
    type: TransactionType;
    amount: number;
    description: string;
    categoryId?: string;
    dueDate: Date;
    createdBy: string;
  }): Transaction {
    const id = crypto.randomUUID();
    const now = new Date();
    const money = Money.fromNumber(params.amount);

    const transaction = new Transaction({
      id,
      clinicId: params.clinicId,
      type: params.type,
      amount: money,
      description: params.description,
      categoryId: params.categoryId,
      dueDate: params.dueDate,
      status: 'PENDENTE',
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    // Raise domain event
    transaction.addDomainEvent(
      new TransactionCreatedEvent({
        transactionId: id,
        clinicId: params.clinicId,
        amount: params.amount,
        type: params.type,
        categoryId: params.categoryId,
        createdBy: params.createdBy,
      })
    );

    return transaction;
  }

  /**
   * Mark transaction as paid
   */
  markAsPaid(paymentMethod: string, paidDate: Date = new Date()): void {
    if (this.props.status === 'PAGA') {
      throw new Error('Transação já está paga');
    }

    if (this.props.status === 'CANCELADA') {
      throw new Error('Não é possível pagar uma transação cancelada');
    }

    this.props.status = 'PAGA';
    this.props.paidDate = paidDate;
    this.props.paymentMethod = paymentMethod;
    this.props.updatedAt = new Date();

    // Raise domain event
    this.addDomainEvent(
      new TransactionPaidEvent({
        transactionId: this.id,
        clinicId: this.clinicId,
        amount: this.amount.toNumber(),
        paidDate,
        paymentMethod,
      })
    );
  }

  /**
   * Cancel transaction
   */
  cancel(): void {
    if (this.props.status === 'PAGA') {
      throw new Error('Não é possível cancelar uma transação paga');
    }

    if (this.props.status === 'CANCELADA') {
      throw new Error('Transação já está cancelada');
    }

    this.props.status = 'CANCELADA';
    this.props.updatedAt = new Date();
  }

  /**
   * Check if transaction is overdue
   */
  isOverdue(): boolean {
    if (this.props.status === 'PAGA' || this.props.status === 'CANCELADA') {
      return false;
    }

    return new Date() > this.props.dueDate;
  }

  /**
   * Update overdue status
   */
  updateOverdueStatus(): void {
    if (this.isOverdue() && this.props.status === 'PENDENTE') {
      this.props.status = 'VENCIDA';
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Reconstruct from persistence
   */
  static fromPersistence(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  /**
   * Convert to persistence format
   */
  toPersistence(): any {
    return {
      id: this.props.id,
      clinic_id: this.props.clinicId,
      type: this.props.type,
      amount: this.props.amount.toNumber(),
      description: this.props.description,
      category_id: this.props.categoryId,
      due_date: this.props.dueDate.toISOString(),
      paid_date: this.props.paidDate?.toISOString(),
      status: this.props.status,
      payment_method: this.props.paymentMethod,
      created_by: this.props.createdBy,
      created_at: this.props.createdAt.toISOString(),
      updated_at: this.props.updatedAt.toISOString(),
    };
  }
}
