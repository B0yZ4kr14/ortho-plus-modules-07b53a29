/**
 * Transaction Data Adapter
 * Converte entre formato API e Frontend para transações financeiras
 */

interface TransactionAPI {
  id: string;
  tipo: 'RECEITA' | 'DESPESA';
  categoria: string;
  valor: number;
  descricao: string;
  dataVencimento: string;
  dataPagamento?: string;
  status: string;
  metodoPagamento?: string;
  criadoEm: string;
  atualizadoEm: string;
}

interface TransactionFrontend {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  amount: number;
  description: string;
  due_date: string;
  payment_date?: string;
  status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export class TransactionAdapter {
  static toFrontend(apiTransaction: TransactionAPI): TransactionFrontend {
    return {
      id: apiTransaction.id,
      type: apiTransaction.tipo,
      category: apiTransaction.categoria,
      amount: apiTransaction.valor,
      description: apiTransaction.descricao,
      due_date: apiTransaction.dataVencimento,
      payment_date: apiTransaction.dataPagamento,
      status: apiTransaction.status,
      payment_method: apiTransaction.metodoPagamento,
      created_at: apiTransaction.criadoEm,
      updated_at: apiTransaction.atualizadoEm,
    };
  }

  static toAPI(frontendTransaction: Partial<TransactionFrontend>): Partial<TransactionAPI> {
    return {
      tipo: frontendTransaction.type,
      categoria: frontendTransaction.category,
      valor: frontendTransaction.amount,
      descricao: frontendTransaction.description,
      dataVencimento: frontendTransaction.due_date,
      dataPagamento: frontendTransaction.payment_date,
      status: frontendTransaction.status,
      metodoPagamento: frontendTransaction.payment_method,
    };
  }

  static toFrontendList(apiTransactions: TransactionAPI[]): TransactionFrontend[] {
    return apiTransactions.map(transaction => this.toFrontend(transaction));
  }
}
