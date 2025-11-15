/**
 * Base interface for Commands (CQRS pattern)
 * Commands represent intention to change state
 */
export interface ICommand {
  readonly commandId: string;
  readonly timestamp: Date;
}

/**
 * Command Handler interface
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}

/**
 * Base Command class
 */
export abstract class Command implements ICommand {
  public readonly commandId: string;
  public readonly timestamp: Date;

  constructor() {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}
