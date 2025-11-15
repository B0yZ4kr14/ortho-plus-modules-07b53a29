export interface ItemOrcamentoProps {
  id: string;
  budgetId: string;
  ordem: number;
  descricao: string;
  procedimentoId?: string;
  denteRegiao?: string;
  quantidade: number;
  valorUnitario: number;
  descontoPercentual?: number;
  descontoValor?: number;
  valorTotal: number;
  observacoes?: string;
  createdAt: Date;
}

/**
 * Entidade ItemOrcamento
 * Representa um item/procedimento dentro de um orçamento
 */
export class ItemOrcamento {
  private constructor(private props: ItemOrcamentoProps) {}

  /**
   * Factory Method: Criar novo item
   */
  static create(data: Omit<ItemOrcamentoProps, 'id' | 'createdAt' | 'valorTotal'>): ItemOrcamento {
    const valorSubtotal = data.quantidade * data.valorUnitario;
    let valorTotal = valorSubtotal;

    if (data.descontoPercentual) {
      valorTotal -= (valorSubtotal * data.descontoPercentual) / 100;
    }
    if (data.descontoValor) {
      valorTotal -= data.descontoValor;
    }

    const props: ItemOrcamentoProps = {
      ...data,
      id: crypto.randomUUID(),
      valorTotal: Math.max(0, valorTotal),
      createdAt: new Date(),
    };

    return new ItemOrcamento(props);
  }

  /**
   * Factory Method: Restaurar item existente
   */
  static restore(props: ItemOrcamentoProps): ItemOrcamento {
    return new ItemOrcamento(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get budgetId(): string { return this.props.budgetId; }
  get ordem(): number { return this.props.ordem; }
  get descricao(): string { return this.props.descricao; }
  get procedimentoId(): string | undefined { return this.props.procedimentoId; }
  get denteRegiao(): string | undefined { return this.props.denteRegiao; }
  get quantidade(): number { return this.props.quantidade; }
  get valorUnitario(): number { return this.props.valorUnitario; }
  get descontoPercentual(): number | undefined { return this.props.descontoPercentual; }
  get descontoValor(): number | undefined { return this.props.descontoValor; }
  get valorTotal(): number { return this.props.valorTotal; }
  get observacoes(): string | undefined { return this.props.observacoes; }
  get createdAt(): Date { return this.props.createdAt; }

  // Métodos de domínio
  recalcularValorTotal(): void {
    const valorSubtotal = this.props.quantidade * this.props.valorUnitario;
    let valorTotal = valorSubtotal;

    if (this.props.descontoPercentual) {
      valorTotal -= (valorSubtotal * this.props.descontoPercentual) / 100;
    }
    if (this.props.descontoValor) {
      valorTotal -= this.props.descontoValor;
    }

    this.props.valorTotal = Math.max(0, valorTotal);
  }

  atualizarQuantidade(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }
    this.props.quantidade = quantidade;
    this.recalcularValorTotal();
  }

  atualizarValorUnitario(valorUnitario: number): void {
    if (valorUnitario < 0) {
      throw new Error('Valor unitário não pode ser negativo');
    }
    this.props.valorUnitario = valorUnitario;
    this.recalcularValorTotal();
  }

  aplicarDesconto(descontoPercentual?: number, descontoValor?: number): void {
    this.props.descontoPercentual = descontoPercentual;
    this.props.descontoValor = descontoValor;
    this.recalcularValorTotal();
  }

  toObject(): ItemOrcamentoProps {
    return { ...this.props };
  }
}
