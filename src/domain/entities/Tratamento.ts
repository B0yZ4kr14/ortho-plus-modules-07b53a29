/**
 * Tratamento Entity
 * Representa um tratamento/procedimento no prontuário do paciente
 */
export interface TratamentoProps {
  id: string;
  prontuarioId: string;
  clinicId: string;
  titulo: string;
  descricao: string;
  denteCodigo?: string;
  procedimentoId?: string;
  status: 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  dataInicio: Date;
  dataTermino?: Date;
  valorEstimado?: number;
  valorCobrado?: number;
  observacoes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Tratamento {
  private props: TratamentoProps;

  private constructor(props: TratamentoProps) {
    this.props = props;
  }

  static create(props: Omit<TratamentoProps, 'id' | 'createdAt' | 'updatedAt'>): Tratamento {
    // Validações de domínio
    if (!props.prontuarioId) {
      throw new Error('ID do prontuário é obrigatório');
    }

    if (!props.titulo || props.titulo.trim().length < 3) {
      throw new Error('Título do tratamento deve ter pelo menos 3 caracteres');
    }

    if (!props.descricao || props.descricao.trim().length < 5) {
      throw new Error('Descrição do tratamento deve ter pelo menos 5 caracteres');
    }

    if (props.valorEstimado !== undefined && props.valorEstimado < 0) {
      throw new Error('Valor estimado não pode ser negativo');
    }

    const now = new Date();

    return new Tratamento({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: TratamentoProps): Tratamento {
    return new Tratamento(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get prontuarioId(): string {
    return this.props.prontuarioId;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get titulo(): string {
    return this.props.titulo;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get denteCodigo(): string | undefined {
    return this.props.denteCodigo;
  }

  get procedimentoId(): string | undefined {
    return this.props.procedimentoId;
  }

  get status(): 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' {
    return this.props.status;
  }

  get dataInicio(): Date {
    return this.props.dataInicio;
  }

  get dataTermino(): Date | undefined {
    return this.props.dataTermino;
  }

  get valorEstimado(): number | undefined {
    return this.props.valorEstimado;
  }

  get valorCobrado(): number | undefined {
    return this.props.valorCobrado;
  }

  get observacoes(): string | undefined {
    return this.props.observacoes;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  iniciar(): void {
    if (this.props.status === 'EM_ANDAMENTO') {
      throw new Error('Tratamento já está em andamento');
    }
    if (this.props.status === 'CONCLUIDO') {
      throw new Error('Tratamento já foi concluído');
    }
    if (this.props.status === 'CANCELADO') {
      throw new Error('Tratamento foi cancelado');
    }
    this.props.status = 'EM_ANDAMENTO';
    this.props.updatedAt = new Date();
  }

  concluir(valorCobrado: number): void {
    if (this.props.status === 'CONCLUIDO') {
      throw new Error('Tratamento já foi concluído');
    }
    if (this.props.status === 'CANCELADO') {
      throw new Error('Tratamento foi cancelado');
    }
    if (valorCobrado < 0) {
      throw new Error('Valor cobrado não pode ser negativo');
    }
    this.props.status = 'CONCLUIDO';
    this.props.dataTermino = new Date();
    this.props.valorCobrado = valorCobrado;
    this.props.updatedAt = new Date();
  }

  cancelar(motivo: string): void {
    if (this.props.status === 'CONCLUIDO') {
      throw new Error('Não é possível cancelar um tratamento concluído');
    }
    if (this.props.status === 'CANCELADO') {
      throw new Error('Tratamento já está cancelado');
    }
    this.props.status = 'CANCELADO';
    this.props.observacoes = `${this.props.observacoes || ''}\nMotivo do cancelamento: ${motivo}`.trim();
    this.props.updatedAt = new Date();
  }

  atualizarValorEstimado(novoValor: number): void {
    if (novoValor < 0) {
      throw new Error('Valor estimado não pode ser negativo');
    }
    this.props.valorEstimado = novoValor;
    this.props.updatedAt = new Date();
  }

  adicionarObservacao(observacao: string): void {
    if (!observacao || observacao.trim().length === 0) {
      throw new Error('Observação não pode ser vazia');
    }
    const timestamp = new Date().toLocaleString('pt-BR');
    this.props.observacoes = `${this.props.observacoes || ''}\n[${timestamp}] ${observacao}`.trim();
    this.props.updatedAt = new Date();
  }

  // Conversão para primitivos
  toObject(): TratamentoProps {
    return { ...this.props };
  }
}
