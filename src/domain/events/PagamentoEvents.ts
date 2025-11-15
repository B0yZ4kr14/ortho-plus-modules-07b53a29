/**
 * FASE 1: DOMAIN EVENTS - Pagamento
 */

import { BaseDomainEvent } from './DomainEvent';

export class PagamentoRealizadoEvent extends BaseDomainEvent {
  constructor(
    pagamentoId: string,
    payload: {
      clinicId: string;
      valor: number;
      metodo: string;
      timestamp: Date;
    }
  ) {
    super(pagamentoId, 'PAGAMENTO_REALIZADO', payload);
  }
}

export class PagamentoCryptoConfirmadoEvent extends BaseDomainEvent {
  constructor(
    transacaoId: string,
    payload: {
      walletId: string;
      amount: number;
      coin: string;
      txHash: string;
      confirmations: number;
    }
  ) {
    super(transacaoId, 'PAGAMENTO_CRYPTO_CONFIRMADO', payload);
  }
}

export class SplitPagamentoProcessadoEvent extends BaseDomainEvent {
  constructor(
    transacaoId: string,
    payload: {
      clinicId: string;
      valorTotal: number;
      splits: Array<{ entityId: string; valor: number; percentual: number }>;
    }
  ) {
    super(transacaoId, 'SPLIT_PAGAMENTO_PROCESSADO', payload);
  }
}
