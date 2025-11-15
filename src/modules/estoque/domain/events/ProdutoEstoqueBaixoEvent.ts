import { DomainEvent } from '@/core/domain/events/DomainEvent';

export interface ProdutoEstoqueBaixoEventData {
  produtoId: string;
  produtoNome: string;
  clinicId: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
}

export class ProdutoEstoqueBaixoEvent extends DomainEvent {
  constructor(public readonly data: ProdutoEstoqueBaixoEventData) {
    super();
  }

  get aggregateId(): string {
    return this.data.produtoId;
  }

  get eventName(): string {
    return 'ProdutoEstoqueBaixo';
  }
}
