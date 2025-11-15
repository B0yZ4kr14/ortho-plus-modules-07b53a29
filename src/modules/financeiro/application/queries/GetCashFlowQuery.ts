import { Query, IQueryHandler } from '@/core/cqrs/Query';
import { ITransactionRepository, TransactionFilters } from '../../domain/repositories/ITransactionRepository';
import { Period } from '../../domain/valueObjects/Period';

export interface CashFlowResult {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  period: Period;
}

export class GetCashFlowQuery extends Query<CashFlowResult> {
  constructor(
    public readonly clinicId: string,
    public readonly period: Period
  ) {
    super();
  }
}

export class GetCashFlowQueryHandler 
  implements IQueryHandler<GetCashFlowQuery, CashFlowResult> {
  
  constructor(private repository: ITransactionRepository) {}

  async execute(query: GetCashFlowQuery): Promise<CashFlowResult> {
    const filters: TransactionFilters = {
      period: query.period,
    };

    const transactions = await this.repository.findByClinic(
      query.clinicId,
      filters
    );

    const totalReceitas = transactions
      .filter(t => t.type === 'RECEITA' && t.status === 'PAGO')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const totalDespesas = transactions
      .filter(t => t.type === 'DESPESA' && t.status === 'PAGO')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      period: query.period,
    };
  }
}
