/**
 * Entidade de Bloqueio
 * Representa um período bloqueado na agenda de um dentista
 */

export interface BloqueioProps {
  id: string;
  clinicId: string;
  dentistId: string;
  startTime: Date;
  endTime: Date;
  motivo: string;
  isRecorrente: boolean;
  recorrenciaConfig?: {
    tipo: 'DIARIO' | 'SEMANAL' | 'MENSAL';
    diasSemana?: number[]; // 0-6 (domingo-sábado)
    diaDoMes?: number; // 1-31
    dataFim?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class Bloqueio {
  private constructor(private props: BloqueioProps) {}

  /**
   * Factory method para criar novo bloqueio
   */
  static create(
    props: Omit<BloqueioProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Bloqueio {
    // Validações de domínio
    if (!props.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!props.dentistId?.trim()) {
      throw new Error('ID do dentista é obrigatório');
    }

    if (!props.startTime || !props.endTime) {
      throw new Error('Horários de início e fim são obrigatórios');
    }

    if (props.endTime <= props.startTime) {
      throw new Error('Horário de fim deve ser posterior ao horário de início');
    }

    if (!props.motivo?.trim()) {
      throw new Error('Motivo do bloqueio é obrigatório');
    }

    if (props.isRecorrente && !props.recorrenciaConfig) {
      throw new Error('Configuração de recorrência é obrigatória para bloqueios recorrentes');
    }

    const now = new Date();

    return new Bloqueio({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method para restaurar bloqueio do banco
   */
  static restore(props: BloqueioProps): Bloqueio {
    return new Bloqueio(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get dentistId(): string {
    return this.props.dentistId;
  }

  get startTime(): Date {
    return this.props.startTime;
  }

  get endTime(): Date {
    return this.props.endTime;
  }

  get motivo(): string {
    return this.props.motivo;
  }

  get isRecorrente(): boolean {
    return this.props.isRecorrente;
  }

  get recorrenciaConfig(): BloqueioProps['recorrenciaConfig'] {
    return this.props.recorrenciaConfig;
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
   * Atualiza horários do bloqueio
   */
  atualizarHorarios(startTime: Date, endTime: Date): void {
    if (endTime <= startTime) {
      throw new Error('Horário de fim deve ser posterior ao horário de início');
    }

    this.props.startTime = startTime;
    this.props.endTime = endTime;
    this.props.updatedAt = new Date();
  }

  /**
   * Atualiza motivo do bloqueio
   */
  atualizarMotivo(motivo: string): void {
    if (!motivo?.trim()) {
      throw new Error('Motivo não pode ser vazio');
    }

    this.props.motivo = motivo;
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se o bloqueio está ativo em uma data específica
   */
  isAtivoNaData(data: Date): boolean {
    // Se não é recorrente, verifica se a data está no intervalo
    if (!this.props.isRecorrente) {
      return data >= this.props.startTime && data <= this.props.endTime;
    }

    // Se é recorrente, verifica a configuração
    const config = this.props.recorrenciaConfig;
    if (!config) return false;

    // Verifica se passou da data fim da recorrência
    if (config.dataFim && data > config.dataFim) {
      return false;
    }

    // Verifica tipo de recorrência
    if (config.tipo === 'DIARIO') {
      return true;
    }

    if (config.tipo === 'SEMANAL' && config.diasSemana) {
      const diaSemana = data.getDay();
      return config.diasSemana.includes(diaSemana);
    }

    if (config.tipo === 'MENSAL' && config.diaDoMes) {
      return data.getDate() === config.diaDoMes;
    }

    return false;
  }

  /**
   * Verifica se está no passado
   */
  isPassado(): boolean {
    if (this.props.isRecorrente && this.props.recorrenciaConfig?.dataFim) {
      return this.props.recorrenciaConfig.dataFim < new Date();
    }
    return this.props.endTime < new Date();
  }

  /**
   * Converte para objeto plano
   */
  toObject(): BloqueioProps {
    return { ...this.props };
  }
}
