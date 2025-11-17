/**
 * Patient - Aggregate Root do módulo PACIENTES
 * 
 * Representa a entidade principal do domínio de pacientes,
 * encapsulando dados pessoais, comerciais (CRM) e status.
 */

import { PatientStatus } from '../value-objects/PatientStatus';
import { DadosComerciaisVO } from '../value-objects/DadosComerciaisVO';
import { DomainEvent } from '@/shared/events/EventBus';

export interface PatientProps {
  id: string;
  clinicId: string;
  
  // Dados pessoais
  fullName: string;
  cpf?: string;
  rg?: string;
  birthDate?: Date;
  gender?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  
  // Endereço
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  
  // Status
  status: PatientStatus;
  
  // Dados comerciais
  dadosComerciais?: DadosComerciaisVO;
  
  // Observações
  notes?: string;
  
  // Metadados
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class Patient {
  private props: PatientProps;
  private domainEvents: DomainEvent[] = [];

  constructor(props: PatientProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.fullName || this.props.fullName.trim().length < 3) {
      throw new Error('Nome completo deve ter pelo menos 3 caracteres');
    }

    if (!this.props.clinicId) {
      throw new Error('Clínica é obrigatória');
    }

    // Validação de CPF (se fornecido)
    if (this.props.cpf && !this.isValidCPF(this.props.cpf)) {
      throw new Error('CPF inválido');
    }

    // Validação de email (se fornecido)
    if (this.props.email && !this.isValidEmail(this.props.email)) {
      throw new Error('Email inválido');
    }
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

  get cpf(): string | undefined {
    return this.props.cpf;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get status(): PatientStatus {
    return this.props.status;
  }

  get dadosComerciais(): DadosComerciaisVO | undefined {
    return this.props.dadosComerciais;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  // Business logic: Alterar status
  alterarStatus(
    novoStatus: PatientStatus,
    reason: string,
    changedBy: string
  ): void {
    const statusAnterior = this.props.status;

    // Validar transição de status
    if (!this.isValidStatusTransition(statusAnterior, novoStatus)) {
      throw new Error(
        `Transição inválida: ${statusAnterior.code} -> ${novoStatus.code}`
      );
    }

    this.props.status = novoStatus;
    this.props.updatedAt = new Date();
    this.props.updatedBy = changedBy;

    // Emitir evento de domínio
    this.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'Pacientes.StatusAlterado',
      aggregateId: this.props.id,
      aggregateType: 'Patient',
      payload: {
        patientId: this.props.id,
        patientName: this.props.fullName,
        fromStatus: statusAnterior.code,
        toStatus: novoStatus.code,
        reason,
      },
      metadata: {
        userId: changedBy,
        clinicId: this.props.clinicId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Business logic: Atualizar dados comerciais
  atualizarDadosComerciais(dados: DadosComerciaisVO, updatedBy: string): void {
    this.props.dadosComerciais = dados;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;

    this.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'Pacientes.DadosComerciaisAtualizados',
      aggregateId: this.props.id,
      aggregateType: 'Patient',
      payload: {
        patientId: this.props.id,
        campanhaId: dados.campanhaOrigemId,
        origemId: dados.origemId,
        promotorId: dados.promotorId,
      },
      metadata: {
        userId: updatedBy,
        clinicId: this.props.clinicId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Business logic: Inativar paciente
  inativar(reason: string, inactivatedBy: string): void {
    if (!this.props.isActive) {
      throw new Error('Paciente já está inativo');
    }

    this.props.isActive = false;
    this.props.updatedAt = new Date();
    this.props.updatedBy = inactivatedBy;

    this.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'Pacientes.Inativado',
      aggregateId: this.props.id,
      aggregateType: 'Patient',
      payload: {
        patientId: this.props.id,
        patientName: this.props.fullName,
        reason,
      },
      metadata: {
        userId: inactivatedBy,
        clinicId: this.props.clinicId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Domain events
  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  // Validações auxiliares
  private isValidStatusTransition(from: PatientStatus, to: PatientStatus): boolean {
    // Regras de negócio para transições válidas
    const invalidTransitions = [
      ['CONCLUIDO', 'PROSPECT'],
      ['CONCLUIDO', 'TRATAMENTO'],
      ['CANCELADO', 'TRATAMENTO'],
    ];

    return !invalidTransitions.some(
      ([f, t]) => from.code === f && to.code === t
    );
  }

  private isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false; // Todos dígitos iguais

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;

    return (
      parseInt(cleanCPF[9]) === digit1 && parseInt(cleanCPF[10]) === digit2
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Serialização
  toObject(): PatientProps {
    return { ...this.props };
  }

  static create(props: Omit<PatientProps, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    return new Patient({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: PatientProps): Patient {
    return new Patient(props);
  }
}
