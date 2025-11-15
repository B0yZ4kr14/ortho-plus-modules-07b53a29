import { AggregateRoot } from '@/core/domain/AggregateRoot';

export interface ProntuarioProps {
  id: string;
  clinicId: string;
  patientId: string;
  numero: string;
  anamneseCompleta: boolean;
  observacoes?: string;
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Prontuario Aggregate Root
 * Manages patient medical records
 */
export class Prontuario extends AggregateRoot<ProntuarioProps> {
  private constructor(props: ProntuarioProps) {
    super(props);
  }

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

  get riskLevel(): 'BAIXO' | 'MEDIO' | 'ALTO' {
    return this.props.riskLevel;
  }

  static create(params: {
    clinicId: string;
    patientId: string;
    numero: string;
  }): Prontuario {
    const id = crypto.randomUUID();
    const now = new Date();

    return new Prontuario({
      id,
      clinicId: params.clinicId,
      patientId: params.patientId,
      numero: params.numero,
      anamneseCompleta: false,
      riskLevel: 'BAIXO',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  completeAnamnese(observacoes?: string): void {
    this.props.anamneseCompleta = true;
    this.props.observacoes = observacoes;
    this.props.updatedAt = new Date();
  }

  updateRiskLevel(level: 'BAIXO' | 'MEDIO' | 'ALTO'): void {
    this.props.riskLevel = level;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  static fromPersistence(props: ProntuarioProps): Prontuario {
    return new Prontuario(props);
  }

  toPersistence(): any {
    return {
      id: this.props.id,
      clinic_id: this.props.clinicId,
      patient_id: this.props.patientId,
      numero: this.props.numero,
      anamnese_completa: this.props.anamneseCompleta,
      observacoes: this.props.observacoes,
      risk_level: this.props.riskLevel,
      is_active: this.props.isActive,
      created_at: this.props.createdAt.toISOString(),
      updated_at: this.props.updatedAt.toISOString(),
    };
  }
}
