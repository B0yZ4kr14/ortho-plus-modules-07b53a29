import { Command, ICommandHandler } from '@/core/cqrs/Command';
import { Transaction } from '../../domain/entities/Transaction';
import { Money } from '../../domain/valueObjects/Money';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { eventBus } from '@/core/domain/events/EventBus';
import { TransactionCreatedEvent } from '../../domain/events/TransactionCreatedEvent';

export class CreateTransactionCommand extends Command {
  constructor(
    public readonly clinicId: string,
    public readonly type: 'RECEITA' | 'DESPESA',
    public readonly amount: number,
    public readonly description: string,
    public readonly categoryId: string | undefined,
    public readonly dueDate: Date,
    public readonly createdBy: string,
    public readonly paymentMethod?: string,
    public readonly notes?: string
  ) {
    super();
  }
}

export class CreateTransactionCommandHandler 
  implements ICommandHandler<CreateTransactionCommand, Transaction> {
  
  constructor(private repository: ITransactionRepository) {}

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    // Create transaction entity
    const transaction = new Transaction({
      id: crypto.randomUUID(),
      clinicId: command.clinicId,
      type: command.type,
      amount: Money.fromNumber(command.amount),
      description: command.description,
      categoryId: command.categoryId,
      dueDate: command.dueDate,
      status: 'PENDENTE',
      createdBy: command.createdBy,
      paymentMethod: command.paymentMethod,
      notes: command.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save to repository
    await this.repository.save(transaction);

    // Publish domain event
    const event = new TransactionCreatedEvent({
      transactionId: transaction.id,
      clinicId: command.clinicId,
      amount: command.amount,
      type: command.type,
      categoryId: command.categoryId,
      createdBy: command.createdBy,
    });

    await eventBus.publish(event);

    return transaction;
  }
}
