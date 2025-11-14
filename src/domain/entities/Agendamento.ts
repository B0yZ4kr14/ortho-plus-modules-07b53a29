/**
 * Entidade de Agendamento (Aggregate Root)
 * Representa um agendamento de consulta na clínica
 */

export interface AgendamentoProps {
  id: string;
  clinicId: string;
  patientId: string;
  dentistId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'AGENDADO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'FALTOU';
  treatmentId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class Agendamento {
  private constructor(private props: AgendamentoProps) {}

  /**
   * Factory method para criar novo agendamento
   */
  static create(
    props: Omit<AgendamentoProps, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Agendamento {
    // Validações de domínio
    if (!props.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!props.patientId?.trim()) {
      throw new Error('ID do paciente é obrigatório');
    }

    if (!props.dentistId?.trim()) {
      throw new Error('ID do dentista é obrigatório');
    }

    if (!props.title?.trim()) {
      throw new Error('Título do agendamento é obrigatório');
    }

    if (!props.startTime || !props.endTime) {
      throw new Error('Horários de início e fim são obrigatórios');
    }

    if (props.endTime <= props.startTime) {
      throw new Error('Horário de fim deve ser posterior ao horário de início');
    }

    const now = new Date();

    return new Agendamento({
      ...props,
      id: crypto.randomUUID(),
      status: 'AGENDADO',
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method para restaurar agendamento do banco
   */
  static restore(props: AgendamentoProps): Agendamento {
    return new Agendamento(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get dentistId(): string {
    return this.props.dentistId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get startTime(): Date {
    return this.props.startTime;
  }

  get endTime(): Date {
    return this.props.endTime;
  }

  get status(): AgendamentoProps['status'] {
    return this.props.status;
  }

  get treatmentId(): string | undefined {
    return this.props.treatmentId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  // Domain Methods

  /**
   * Verifica se o agendamento pode ser confirmado
   */
  podeSerConfirmado(): boolean {
    return this.props.status === 'AGENDADO';
  }

  /**
   * Confirma o agendamento
   */
  confirmar(): void {
    if (!this.podeSerConfirmado()) {
      throw new Error('Apenas agendamentos com status AGENDADO podem ser confirmados');
    }

    this.props.status = 'CONFIRMADO';
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se o agendamento pode ser iniciado
   */
  podeSerIniciado(): boolean {
    return this.props.status === 'AGENDADO' || this.props.status === 'CONFIRMADO';
  }

  /**
   * Inicia o atendimento
   */
  iniciarAtendimento(): void {
    if (!this.podeSerIniciado()) {
      throw new Error('Apenas agendamentos AGENDADOS ou CONFIRMADOS podem ser iniciados');
    }

    this.props.status = 'EM_ATENDIMENTO';
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se o agendamento pode ser concluído
   */
  podeSerConcluido(): boolean {
    return this.props.status === 'EM_ATENDIMENTO';
  }

  /**
   * Conclui o atendimento
   */
  concluir(): void {
    if (!this.podeSerConcluido()) {
      throw new Error('Apenas agendamentos EM_ATENDIMENTO podem ser concluídos');
    }

    this.props.status = 'CONCLUIDO';
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se o agendamento pode ser cancelado
   */
  podeSerCancelado(): boolean {
    return (
      this.props.status === 'AGENDADO' ||
      this.props.status === 'CONFIRMADO'
    );
  }

  /**
   * Cancela o agendamento
   */
  cancelar(): void {
    if (!this.podeSerCancelado()) {
      throw new Error('Apenas agendamentos AGENDADOS ou CONFIRMADOS podem ser cancelados');
    }

    this.props.status = 'CANCELADO';
    this.props.updatedAt = new Date();
  }

  /**
   * Marca como falta
   */
  marcarFalta(): void {
    if (this.props.status !== 'AGENDADO' && this.props.status !== 'CONFIRMADO') {
      throw new Error('Apenas agendamentos AGENDADOS ou CONFIRMADOS podem ser marcados como falta');
    }

    this.props.status = 'FALTOU';
    this.props.updatedAt = new Date();
  }

  /**
   * Atualiza horários
   */
  atualizarHorarios(startTime: Date, endTime: Date): void {
    if (endTime <= startTime) {
      throw new Error('Horário de fim deve ser posterior ao horário de início');
    }

    if (this.props.status === 'CONCLUIDO' || this.props.status === 'CANCELADO') {
      throw new Error('Não é possível alterar horários de agendamentos concluídos ou cancelados');
    }

    this.props.startTime = startTime;
    this.props.endTime = endTime;
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se está no passado
   */
  isPassado(): boolean {
    return this.props.endTime < new Date();
  }

  /**
   * Verifica se está ativo (não cancelado/concluído/falta)
   */
  isAtivo(): boolean {
    return (
      this.props.status !== 'CANCELADO' &&
      this.props.status !== 'CONCLUIDO' &&
      this.props.status !== 'FALTOU'
    );
  }

  /**
   * Converte para objeto plano
   */
  toObject(): AgendamentoProps {
    return { ...this.props };
  }
}
