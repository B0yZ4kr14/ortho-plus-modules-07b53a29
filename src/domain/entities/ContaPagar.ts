/**
 * Domain Entity: ContaPagar
 * 
 * Representa uma conta a pagar da clínica (fornecedores, despesas, etc.)
 */

export type StatusContaPagar = 'PENDENTE' | 'PAGA' | 'ATRASADA' | 'CANCELADA';
export type CategoriaContaPagar = 
  | 'ALUGUEL' 
  | 'FOLHA_PAGAMENTO' 
  | 'FORNECEDOR' 
  | 'SERVICOS' 
  | 'IMPOSTOS' 
  | 'MARKETING' 
  | 'EQUIPAMENTOS' 
  | 'OUTROS';

export interface ContaPagarProps {
  id: string;
  clinicId: string;
  descricao: string;
  fornecedor: string;
  categoria: CategoriaContaPagar;
  valor: number;
  dataEmissao: Date;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: StatusContaPagar;
  formaPagamento?: string;
  valorPago?: number;
  recorrente: boolean;
  periodicidade?: string;
  parcelaNumero?: number;
  parcelaTotal?: number;
  observacoes?: string;
  anexoUrl?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContaPagar {
  private constructor(private props: ContaPagarProps) {
    this.validate();
  }

  // Factory Methods
  static create(
    props: Omit<ContaPagarProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): ContaPagar {
    const now = new Date();
    
    return new ContaPagar({
      ...props,
      id: crypto.randomUUID(),
      status: 'PENDENTE',
      recorrente: props.recorrente ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ContaPagarProps): ContaPagar {
    return new ContaPagar(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get descricao(): string { return this.props.descricao; }
  get fornecedor(): string { return this.props.fornecedor; }
  get categoria(): CategoriaContaPagar { return this.props.categoria; }
  get valor(): number { return this.props.valor; }
  get dataEmissao(): Date { return this.props.dataEmissao; }
  get dataVencimento(): Date { return this.props.dataVencimento; }
  get dataPagamento(): Date | undefined { return this.props.dataPagamento; }
  get status(): StatusContaPagar { return this.props.status; }
  get formaPagamento(): string | undefined { return this.props.formaPagamento; }
  get valorPago(): number | undefined { return this.props.valorPago; }
  get recorrente(): boolean { return this.props.recorrente; }
  get periodicidade(): string | undefined { return this.props.periodicidade; }
  get parcelaNumero(): number | undefined { return this.props.parcelaNumero; }
  get parcelaTotal(): number | undefined { return this.props.parcelaTotal; }
  get observacoes(): string | undefined { return this.props.observacoes; }
  get anexoUrl(): string | undefined { return this.props.anexoUrl; }
  get createdBy(): string | undefined { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain Methods
  pagar(valorPago: number, dataPagamento: Date, formaPagamento: string): void {
    if (this.props.status === 'PAGA') {
      throw new Error('Conta já está paga');
    }
    if (this.props.status === 'CANCELADA') {
      throw new Error('Conta cancelada não pode ser paga');
    }
    if (valorPago <= 0) {
      throw new Error('Valor pago deve ser maior que zero');
    }
    if (valorPago > this.props.valor) {
      throw new Error('Valor pago não pode ser maior que o valor da conta');
    }

    this.props.valorPago = valorPago;
    this.props.dataPagamento = dataPagamento;
    this.props.formaPagamento = formaPagamento;
    this.props.status = valorPago >= this.props.valor ? 'PAGA' : 'PENDENTE';
    this.props.updatedAt = new Date();
  }

  pagarParcial(valorPago: number, dataPagamento: Date, formaPagamento: string): void {
    if (this.props.status === 'PAGA') {
      throw new Error('Conta já está paga');
    }
    if (this.props.status === 'CANCELADA') {
      throw new Error('Conta cancelada não pode receber pagamentos');
    }
    if (valorPago <= 0) {
      throw new Error('Valor pago deve ser maior que zero');
    }

    const totalPago = (this.props.valorPago || 0) + valorPago;
    if (totalPago > this.props.valor) {
      throw new Error('Soma dos pagamentos não pode exceder o valor da conta');
    }

    this.props.valorPago = totalPago;
    this.props.dataPagamento = dataPagamento;
    this.props.formaPagamento = formaPagamento;
    this.props.status = totalPago >= this.props.valor ? 'PAGA' : 'PENDENTE';
    this.props.updatedAt = new Date();
  }

  cancelar(): void {
    if (this.props.status === 'PAGA') {
      throw new Error('Conta paga não pode ser cancelada');
    }
    
    this.props.status = 'CANCELADA';
    this.props.updatedAt = new Date();
  }

  isVencida(): boolean {
    if (this.props.status === 'PAGA' || this.props.status === 'CANCELADA') {
      return false;
    }
    return new Date() > this.props.dataVencimento;
  }

  isPendente(): boolean {
    return this.props.status === 'PENDENTE';
  }

  isPaga(): boolean {
    return this.props.status === 'PAGA';
  }

  isCancelada(): boolean {
    return this.props.status === 'CANCELADA';
  }

  calcularDiasVencimento(): number {
    const hoje = new Date();
    const diff = this.props.dataVencimento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  calcularSaldoDevedor(): number {
    if (this.props.status === 'PAGA') {
      return 0;
    }
    return this.props.valor - (this.props.valorPago || 0);
  }

  // Validations
  private validate(): void {
    if (!this.props.descricao?.trim()) {
      throw new Error('Descrição é obrigatória');
    }
    if (!this.props.fornecedor?.trim()) {
      throw new Error('Fornecedor é obrigatório');
    }
    if (this.props.valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    if (this.props.dataVencimento < this.props.dataEmissao) {
      throw new Error('Data de vencimento não pode ser anterior à data de emissão');
    }
    if (this.props.valorPago !== undefined && this.props.valorPago < 0) {
      throw new Error('Valor pago não pode ser negativo');
    }
  }
}
