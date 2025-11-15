/**
 * Base interface for Queries (CQRS pattern)
 * Queries represent intention to read data
 */
export interface IQuery<TResult> {
  readonly queryId: string;
  readonly timestamp: Date;
}

/**
 * Query Handler interface
 */
export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

/**
 * Base Query class
 */
export abstract class Query<TResult> implements IQuery<TResult> {
  public readonly queryId: string;
  public readonly timestamp: Date;

  constructor() {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}
