export type StatusOrcamento = 'RASCUNHO' | 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'EXPIRADO';

export interface OrcamentoProps {
  id: string;
  numeroOrcamento: string;
  clinicId: string;
  patientId: string;
  createdBy: string;
  titulo: string;
  descricao?: string;
  tipoPlano: string;
  validadeDias: number;
  dataExpiracao: Date;
  status: StatusOrcamento;
  valorSubtotal: number;
  descontoPercentual?: number;
  descontoValor?: number;
  valorTotal: number;
  observacoes?: string;
  aprovadoPor?: string;
  aprovadoEm?: Date;
  rejeitadoPor?: string;
  rejeitadoEm?: Date;
  motivoRejeicao?: string;
  convertidoContrato: boolean;
  contratoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade Orcamento (Aggregate Root)
 * Representa um orçamento odontológico completo
 */
export class Orcamento {
  private constructor(private props: OrcamentoProps) {}

  /**
   * Factory Method: Criar novo orçamento
   */
  static create(data: Omit<OrcamentoProps, 'id' | 'numeroOrcamento' | 'status' | 'dataExpiracao' | 'createdAt' | 'updatedAt' | 'convertidoContrato'>): Orcamento {
    const now = new Date();
    const dataExpiracao = new Date(now);
    dataExpiracao.setDate(dataExpiracao.getDate() + data.validadeDias);

    const props: OrcamentoProps = {
      ...data,
      id: crypto.randomUUID(),
      numeroOrcamento: `ORC-${Date.now()}`,
      status: 'RASCUNHO',
      dataExpiracao,
      convertidoContrato: false,
      createdAt: now,
      updatedAt: now,
    };

    return new Orcamento(props);
  }

  /**
   * Factory Method: Restaurar orçamento existente
   */
  static restore(props: OrcamentoProps): Orcamento {
    return new Orcamento(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get numeroOrcamento(): string { return this.props.numeroOrcamento; }
  get clinicId(): string { return this.props.clinicId; }
  get patientId(): string { return this.props.patientId; }
  get createdBy(): string { return this.props.createdBy; }
  get titulo(): string { return this.props.titulo; }
  get descricao(): string | undefined { return this.props.descricao; }
  get tipoPlano(): string { return this.props.tipoPlano; }
  get validadeDias(): number { return this.props.validadeDias; }
  get dataExpiracao(): Date { return this.props.dataExpiracao; }
  get status(): StatusOrcamento { return this.props.status; }
  get valorSubtotal(): number { return this.props.valorSubtotal; }
  get descontoPercentual(): number | undefined { return this.props.descontoPercentual; }
  get descontoValor(): number | undefined { return this.props.descontoValor; }
  get valorTotal(): number { return this.props.valorTotal; }
  get observacoes(): string | undefined { return this.props.observacoes; }
  get aprovadoPor(): string | undefined { return this.props.aprovadoPor; }
  get aprovadoEm(): Date | undefined { return this.props.aprovadoEm; }
  get rejeitadoPor(): string | undefined { return this.props.rejeitadoPor; }
  get rejeitadoEm(): Date | undefined { return this.props.rejeitadoEm; }
  get motivoRejeicao(): string | undefined { return this.props.motivoRejeicao; }
  get convertidoContrato(): boolean { return this.props.convertidoContrato; }
  get contratoId(): string | undefined { return this.props.contratoId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Métodos de domínio
  podeSerEnviado(): boolean {
    return this.props.status === 'RASCUNHO' && this.props.valorTotal > 0;
  }

  enviarParaAprovacao(): void {
    if (!this.podeSerEnviado()) {
      throw new Error('Orçamento não pode ser enviado no estado atual');
    }
    this.props.status = 'PENDENTE';
    this.props.updatedAt = new Date();
  }

  aprovar(aprovadoPor: string): void {
    if (this.props.status !== 'PENDENTE') {
      throw new Error('Apenas orçamentos pendentes podem ser aprovados');
    }
    if (this.isExpirado()) {
      throw new Error('Orçamento expirado não pode ser aprovado');
    }
    this.props.status = 'APROVADO';
    this.props.aprovadoPor = aprovadoPor;
    this.props.aprovadoEm = new Date();
    this.props.updatedAt = new Date();
  }

  rejeitar(rejeitadoPor: string, motivo: string): void {
    if (this.props.status !== 'PENDENTE') {
      throw new Error('Apenas orçamentos pendentes podem ser rejeitados');
    }
    this.props.status = 'REJEITADO';
    this.props.rejeitadoPor = rejeitadoPor;
    this.props.rejeitadoEm = new Date();
    this.props.motivoRejeicao = motivo;
    this.props.updatedAt = new Date();
  }

  marcarExpirado(): void {
    if (this.props.status === 'PENDENTE' && this.isExpirado()) {
      this.props.status = 'EXPIRADO';
      this.props.updatedAt = new Date();
    }
  }

  atualizarValores(valorSubtotal: number, descontoPercentual?: number, descontoValor?: number): void {
    if (this.props.status !== 'RASCUNHO') {
      throw new Error('Apenas orçamentos em rascunho podem ter valores atualizados');
    }

    this.props.valorSubtotal = valorSubtotal;
    this.props.descontoPercentual = descontoPercentual;
    this.props.descontoValor = descontoValor;

    let valorTotal = valorSubtotal;
    if (descontoPercentual) {
      valorTotal -= (valorSubtotal * descontoPercentual) / 100;
    }
    if (descontoValor) {
      valorTotal -= descontoValor;
    }

    this.props.valorTotal = Math.max(0, valorTotal);
    this.props.updatedAt = new Date();
  }

  estenderValidade(diasAdicionais: number): void {
    if (this.props.status !== 'PENDENTE') {
      throw new Error('Apenas orçamentos pendentes podem ter validade estendida');
    }
    const novaData = new Date(this.props.dataExpiracao);
    novaData.setDate(novaData.getDate() + diasAdicionais);
    this.props.dataExpiracao = novaData;
    this.props.updatedAt = new Date();
  }

  isExpirado(): boolean {
    return new Date() > this.props.dataExpiracao;
  }

  isPresteAExpirar(): boolean {
    const diasRestantes = Math.ceil(
      (this.props.dataExpiracao.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return diasRestantes <= 7 && diasRestantes > 0;
  }

  isDraft(): boolean {
    return this.props.status === 'RASCUNHO';
  }

  isPending(): boolean {
    return this.props.status === 'PENDENTE';
  }

  isApproved(): boolean {
    return this.props.status === 'APROVADO';
  }

  isRejected(): boolean {
    return this.props.status === 'REJEITADO';
  }

  toObject(): OrcamentoProps {
    return { ...this.props };
  }
}
