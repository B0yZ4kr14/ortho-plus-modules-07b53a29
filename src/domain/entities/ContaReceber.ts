/**
 * Domain Entity: ContaReceber
 * 
 * Representa uma conta a receber da clínica (pagamentos de pacientes, etc.)
 */

export type StatusContaReceber = 'PENDENTE' | 'RECEBIDA' | 'ATRASADA' | 'CANCELADA';

export interface ContaReceberProps {
  id: string;
  clinicId: string;
  patientId?: string;
  descricao: string;
  valor: number;
  dataEmissao: Date;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: StatusContaReceber;
  formaPagamento?: string;
  valorPago?: number;
  parcelaNumero?: number;
  parcelaTotal?: number;
  observacoes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContaReceber {
  private constructor(private props: ContaReceberProps) {
    this.validate();
  }

  // Factory Methods
  static create(
    props: Omit<ContaReceberProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): ContaReceber {
    const now = new Date();
    
    return new ContaReceber({
      ...props,
      id: crypto.randomUUID(),
      status: 'PENDENTE',
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ContaReceberProps): ContaReceber {
    return new ContaReceber(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get patientId(): string | undefined { return this.props.patientId; }
  get descricao(): string { return this.props.descricao; }
  get valor(): number { return this.props.valor; }
  get dataEmissao(): Date { return this.props.dataEmissao; }
  get dataVencimento(): Date { return this.props.dataVencimento; }
  get dataPagamento(): Date | undefined { return this.props.dataPagamento; }
  get status(): StatusContaReceber { return this.props.status; }
  get formaPagamento(): string | undefined { return this.props.formaPagamento; }
  get valorPago(): number | undefined { return this.props.valorPago; }
  get parcelaNumero(): number | undefined { return this.props.parcelaNumero; }
  get parcelaTotal(): number | undefined { return this.props.parcelaTotal; }
  get observacoes(): string | undefined { return this.props.observacoes; }
  get createdBy(): string | undefined { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain Methods
  receber(valorPago: number, dataPagamento: Date, formaPagamento: string): void {
    if (this.props.status === 'RECEBIDA') {
      throw new Error('Conta já está recebida');
    }
    if (this.props.status === 'CANCELADA') {
      throw new Error('Conta cancelada não pode ser recebida');
    }
    if (valorPago <= 0) {
      throw new Error('Valor recebido deve ser maior que zero');
    }
    if (valorPago > this.props.valor) {
      throw new Error('Valor recebido não pode ser maior que o valor da conta');
    }

    this.props.valorPago = valorPago;
    this.props.dataPagamento = dataPagamento;
    this.props.formaPagamento = formaPagamento;
    this.props.status = valorPago >= this.props.valor ? 'RECEBIDA' : 'PENDENTE';
    this.props.updatedAt = new Date();
  }

  receberParcial(valorPago: number, dataPagamento: Date, formaPagamento: string): void {
    if (this.props.status === 'RECEBIDA') {
      throw new Error('Conta já está recebida');
    }
    if (this.props.status === 'CANCELADA') {
      throw new Error('Conta cancelada não pode receber pagamentos');
    }
    if (valorPago <= 0) {
      throw new Error('Valor recebido deve ser maior que zero');
    }

    const totalRecebido = (this.props.valorPago || 0) + valorPago;
    if (totalRecebido > this.props.valor) {
      throw new Error('Soma dos recebimentos não pode exceder o valor da conta');
    }

    this.props.valorPago = totalRecebido;
    this.props.dataPagamento = dataPagamento;
    this.props.formaPagamento = formaPagamento;
    this.props.status = totalRecebido >= this.props.valor ? 'RECEBIDA' : 'PENDENTE';
    this.props.updatedAt = new Date();
  }

  cancelar(): void {
    if (this.props.status === 'RECEBIDA') {
      throw new Error('Conta recebida não pode ser cancelada');
    }
    
    this.props.status = 'CANCELADA';
    this.props.updatedAt = new Date();
  }

  isVencida(): boolean {
    if (this.props.status === 'RECEBIDA' || this.props.status === 'CANCELADA') {
      return false;
    }
    return new Date() > this.props.dataVencimento;
  }

  isPendente(): boolean {
    return this.props.status === 'PENDENTE';
  }

  isRecebida(): boolean {
    return this.props.status === 'RECEBIDA';
  }

  isCancelada(): boolean {
    return this.props.status === 'CANCELADA';
  }

  calcularDiasVencimento(): number {
    const hoje = new Date();
    const diff = this.props.dataVencimento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  calcularSaldoReceber(): number {
    if (this.props.status === 'RECEBIDA') {
      return 0;
    }
    return this.props.valor - (this.props.valorPago || 0);
  }

  // Validations
  private validate(): void {
    if (!this.props.descricao?.trim()) {
      throw new Error('Descrição é obrigatória');
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
