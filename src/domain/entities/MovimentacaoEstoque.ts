import { v4 as uuidv4 } from 'uuid';

export interface MovimentacaoEstoqueProps {
  id: string;
  produtoId: string;
  clinicId: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  valorUnitario: number;
  valorTotal: number;
  motivo?: string;
  observacoes?: string;
  usuarioId: string;
  createdAt: Date;
}

/**
 * Entidade de Domínio: MovimentacaoEstoque
 * 
 * Representa uma movimentação de estoque (entrada, saída ou ajuste), incluindo:
 * - Tipo de movimentação
 * - Quantidades (anterior, movimentada, atual)
 * - Valores financeiros
 * - Rastreabilidade (usuário, timestamp)
 * - Auditoria completa
 */
export class MovimentacaoEstoque {
  private constructor(private props: MovimentacaoEstoqueProps) {}

  /**
   * Factory Method: Criar nova MovimentacaoEstoque
   */
  static create(data: {
    produtoId: string;
    clinicId: string;
    tipo: MovimentacaoEstoqueProps['tipo'];
    quantidade: number;
    quantidadeAnterior: number;
    valorUnitario: number;
    motivo?: string;
    observacoes?: string;
    usuarioId: string;
  }): MovimentacaoEstoque {
    // Validações
    if (!data.produtoId?.trim()) {
      throw new Error('ID do produto é obrigatório');
    }

    if (!data.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!data.usuarioId?.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (data.quantidade === 0) {
      throw new Error('Quantidade não pode ser zero');
    }

    if (data.quantidadeAnterior < 0) {
      throw new Error('Quantidade anterior não pode ser negativa');
    }

    if (data.valorUnitario < 0) {
      throw new Error('Valor unitário não pode ser negativo');
    }

    // Calcular quantidade atual baseada no tipo
    let quantidadeAtual: number;
    const quantidadeMovimentada = Math.abs(data.quantidade);

    switch (data.tipo) {
      case 'ENTRADA':
        quantidadeAtual = data.quantidadeAnterior + quantidadeMovimentada;
        break;
      case 'SAIDA':
        if (quantidadeMovimentada > data.quantidadeAnterior) {
          throw new Error(`Estoque insuficiente para saída. Disponível: ${data.quantidadeAnterior}, Solicitado: ${quantidadeMovimentada}`);
        }
        quantidadeAtual = data.quantidadeAnterior - quantidadeMovimentada;
        break;
      case 'AJUSTE':
        quantidadeAtual = quantidadeMovimentada; // No ajuste, a quantidade é absoluta
        break;
      default:
        throw new Error(`Tipo de movimentação inválido: ${data.tipo}`);
    }

    const valorTotal = quantidadeMovimentada * data.valorUnitario;

    return new MovimentacaoEstoque({
      id: uuidv4(),
      produtoId: data.produtoId,
      clinicId: data.clinicId,
      tipo: data.tipo,
      quantidade: quantidadeMovimentada,
      quantidadeAnterior: data.quantidadeAnterior,
      quantidadeAtual,
      valorUnitario: data.valorUnitario,
      valorTotal,
      motivo: data.motivo?.trim(),
      observacoes: data.observacoes?.trim(),
      usuarioId: data.usuarioId,
      createdAt: new Date(),
    });
  }

  /**
   * Factory Method: Restaurar MovimentacaoEstoque existente
   */
  static restore(props: MovimentacaoEstoqueProps): MovimentacaoEstoque {
    return new MovimentacaoEstoque(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get produtoId(): string {
    return this.props.produtoId;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get tipo(): MovimentacaoEstoqueProps['tipo'] {
    return this.props.tipo;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get quantidadeAnterior(): number {
    return this.props.quantidadeAnterior;
  }

  get quantidadeAtual(): number {
    return this.props.quantidadeAtual;
  }

  get valorUnitario(): number {
    return this.props.valorUnitario;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
  }

  get motivo(): string | undefined {
    return this.props.motivo;
  }

  get observacoes(): string | undefined {
    return this.props.observacoes;
  }

  get usuarioId(): string {
    return this.props.usuarioId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Método de Domínio: Calcular diferença de quantidade
   */
  calcularDiferenca(): number {
    return this.props.quantidadeAtual - this.props.quantidadeAnterior;
  }

  /**
   * Método de Domínio: Verificar se é entrada
   */
  isEntrada(): boolean {
    return this.props.tipo === 'ENTRADA';
  }

  /**
   * Método de Domínio: Verificar se é saída
   */
  isSaida(): boolean {
    return this.props.tipo === 'SAIDA';
  }

  /**
   * Método de Domínio: Verificar se é ajuste
   */
  isAjuste(): boolean {
    return this.props.tipo === 'AJUSTE';
  }

  /**
   * Converte para objeto plain (para persistência)
   */
  toObject(): MovimentacaoEstoqueProps {
    return { ...this.props };
  }
}
