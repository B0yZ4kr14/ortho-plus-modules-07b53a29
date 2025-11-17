/**
 * Transaction Data Adapter
 * Converte entre formato API e Frontend para transações financeiras
 */

interface TransactionAPI {
  id: string;
  tipo: 'RECEITA' | 'DESPESA';
  valor: number;
  descricao: string;
  dataVencimento: string;
  status: string;
  metodoPagamento?: string;
  criadoEm: string;
}

interface TransactionFrontend {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  amount: number;
  description: string;
  due_date: string;
  status: string;
  payment_method?: string;
  created_at: string;
}

export class TransactionAdapter {
  static toFrontend(apiTransaction: TransactionAPI): TransactionFrontend {
    return {
      id: apiTransaction.id,
      type: apiTransaction.tipo,
      amount: apiTransaction.valor,
      description: apiTransaction.descricao,
      due_date: apiTransaction.dataVencimento,
      status: apiTransaction.status,
      payment_method: apiTransaction.metodoPagamento,
      created_at: apiTransaction.criadoEm,
    };
  }

  static toAPI(frontendTransaction: Partial<TransactionFrontend>): Partial<TransactionAPI> {
    return {
      tipo: frontendTransaction.type,
      valor: frontendTransaction.amount,
      descricao: frontendTransaction.description,
      dataVencimento: frontendTransaction.due_date,
      status: frontendTransaction.status,
      metodoPagamento: frontendTransaction.payment_method,
    };
  }

  static toFrontendList(apiTransactions: TransactionAPI[]): TransactionFrontend[] {
    return apiTransactions.map(transaction => this.toFrontend(transaction));
  }
}
