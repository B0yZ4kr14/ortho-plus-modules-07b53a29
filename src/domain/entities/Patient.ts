import { Email } from '../value-objects/Email';
import { CPF } from '../value-objects/CPF';
import { Phone } from '../value-objects/Phone';

export type RiskLevel = 'baixo' | 'moderado' | 'alto' | 'critico';

export interface PatientProps {
  id: string;
  clinicId: string;
  fullName: string;
  email?: Email;
  cpf?: CPF;
  phone?: Phone;
  birthDate?: Date;
  riskLevel: RiskLevel;
  riskScoreMedical: number;
  riskScoreSurgical: number;
  riskScoreAnesthetic: number;
  riskScoreOverall: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Patient Entity (Aggregate Root)
 * Representa um paciente no domínio
 */
export class Patient {
  private props: PatientProps;

  private constructor(props: PatientProps) {
    this.props = props;
  }

  static create(props: Omit<PatientProps, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    // Validações de domínio
    if (!props.fullName || props.fullName.trim().length < 3) {
      throw new Error('Nome completo deve ter pelo menos 3 caracteres');
    }

    if (!props.clinicId) {
      throw new Error('Clínica é obrigatória');
    }

    // Valida risk scores (0-100)
    const scores = [
      props.riskScoreMedical,
      props.riskScoreSurgical,
      props.riskScoreAnesthetic,
      props.riskScoreOverall,
    ];

    for (const score of scores) {
      if (score < 0 || score > 100) {
        throw new Error('Risk scores devem estar entre 0 e 100');
      }
    }

    const now = new Date();

    return new Patient({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: PatientProps): Patient {
    return new Patient(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get email(): Email | undefined {
    return this.props.email;
  }

  get cpf(): CPF | undefined {
    return this.props.cpf;
  }

  get phone(): Phone | undefined {
    return this.props.phone;
  }

  get birthDate(): Date | undefined {
    return this.props.birthDate;
  }

  get riskLevel(): RiskLevel {
    return this.props.riskLevel;
  }

  get riskScoreMedical(): number {
    return this.props.riskScoreMedical;
  }

  get riskScoreSurgical(): number {
    return this.props.riskScoreSurgical;
  }

  get riskScoreAnesthetic(): number {
    return this.props.riskScoreAnesthetic;
  }

  get riskScoreOverall(): number {
    return this.props.riskScoreOverall;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get age(): number | undefined {
    if (!this.props.birthDate) return undefined;
    const today = new Date();
    const age = today.getFullYear() - this.props.birthDate.getFullYear();
    const monthDiff = today.getMonth() - this.props.birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.props.birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }

  // Domain methods
  updateFullName(newName: string): void {
    if (!newName || newName.trim().length < 3) {
      throw new Error('Nome completo deve ter pelo menos 3 caracteres');
    }
    this.props.fullName = newName.trim();
    this.props.updatedAt = new Date();
  }

  updateEmail(newEmail: Email): void {
    this.props.email = newEmail;
    this.props.updatedAt = new Date();
  }

  updatePhone(newPhone: Phone): void {
    this.props.phone = newPhone;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  updateRiskScores(
    medical: number,
    surgical: number,
    anesthetic: number,
    overall: number
  ): void {
    // Valida scores
    const scores = [medical, surgical, anesthetic, overall];
    for (const score of scores) {
      if (score < 0 || score > 100) {
        throw new Error('Risk scores devem estar entre 0 e 100');
      }
    }

    this.props.riskScoreMedical = medical;
    this.props.riskScoreSurgical = surgical;
    this.props.riskScoreAnesthetic = anesthetic;
    this.props.riskScoreOverall = overall;

    // Atualiza risk level baseado no overall score
    if (overall >= 75) {
      this.props.riskLevel = 'critico';
    } else if (overall >= 50) {
      this.props.riskLevel = 'alto';
    } else if (overall >= 25) {
      this.props.riskLevel = 'moderado';
    } else {
      this.props.riskLevel = 'baixo';
    }

    this.props.updatedAt = new Date();
  }

  // Conversão para primitivos (para persistência)
  toObject(): PatientProps {
    return { ...this.props };
  }
}
