/**
 * Prontuario Entity (Aggregate Root)
 * Representa o prontuário eletrônico completo do paciente
 */
export interface ProntuarioProps {
  id: string;
  clinicId: string;
  patientId: string;
  numero: string;
  dataAbertura: Date;
  status: 'ATIVO' | 'INATIVO' | 'ARQUIVADO';
  createdAt: Date;
  updatedAt: Date;
}

export class Prontuario {
  private props: ProntuarioProps;

  private constructor(props: ProntuarioProps) {
    this.props = props;
  }

  static create(props: Omit<ProntuarioProps, 'id' | 'createdAt' | 'updatedAt'>): Prontuario {
    // Validações de domínio
    if (!props.patientId) {
      throw new Error('ID do paciente é obrigatório');
    }

    if (!props.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!props.numero || props.numero.trim().length === 0) {
      throw new Error('Número do prontuário é obrigatório');
    }

    const now = new Date();

    return new Prontuario({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ProntuarioProps): Prontuario {
    return new Prontuario(props);
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

  get numero(): string {
    return this.props.numero;
  }

  get dataAbertura(): Date {
    return this.props.dataAbertura;
  }

  get status(): 'ATIVO' | 'INATIVO' | 'ARQUIVADO' {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  isAtivo(): boolean {
    return this.props.status === 'ATIVO';
  }

  arquivar(): void {
    if (this.props.status === 'ARQUIVADO') {
      throw new Error('Prontuário já está arquivado');
    }
    this.props.status = 'ARQUIVADO';
    this.props.updatedAt = new Date();
  }

  reativar(): void {
    if (this.props.status === 'ATIVO') {
      throw new Error('Prontuário já está ativo');
    }
    this.props.status = 'ATIVO';
    this.props.updatedAt = new Date();
  }

  inativar(): void {
    if (this.props.status === 'INATIVO') {
      throw new Error('Prontuário já está inativo');
    }
    this.props.status = 'INATIVO';
    this.props.updatedAt = new Date();
  }

  // Conversão para primitivos
  toObject(): ProntuarioProps {
    return { ...this.props };
  }
}
