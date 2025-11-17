/**
 * CadastrarPacienteUseCase - Cadastra novo paciente
 * 
 * Use Case que orquestra criação de paciente com validações,
 * persistência e publicação de eventos.
 */

import { Patient } from '../../domain/entities/Patient';
import { PatientStatus } from '../../domain/value-objects/PatientStatus';
import { DadosComerciaisVO } from '../../domain/value-objects/DadosComerciaisVO';
import { IPatientRepository } from '../../domain/repositories/IPatientRepository';
import { eventBus } from '@/shared/events/EventBus';
import { logger } from '@/infrastructure/logger';

export interface CadastrarPacienteDTO {
  clinicId: string;
  fullName: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
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
  
  // Status inicial (padrão: PROSPECT)
  statusCode?: string;
  
  // Dados comerciais
  campanhaOrigemId?: string;
  origemId?: string;
  promotorId?: string;
  eventoId?: string;
  telemarketingAgent?: string;
  escolaridade?: string;
  estadoCivil?: string;
  profissao?: string;
  empresa?: string;
  rendaMensal?: number;
  
  notes?: string;
  createdBy?: string;
}

export class CadastrarPacienteUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: CadastrarPacienteDTO): Promise<{ patientId: string }> {
    logger.info('CadastrarPacienteUseCase: Starting', {
      clinicId: dto.clinicId,
      fullName: dto.fullName,
    });

    // Validar duplicação por CPF
    if (dto.cpf) {
      const existingByCPF = await this.patientRepository.findByCPF(
        dto.cpf,
        dto.clinicId
      );
      if (existingByCPF) {
        throw new Error('Já existe paciente cadastrado com este CPF');
      }
    }

    // Validar duplicação por email
    if (dto.email) {
      const existingByEmail = await this.patientRepository.findByEmail(
        dto.email,
        dto.clinicId
      );
      if (existingByEmail) {
        throw new Error('Já existe paciente cadastrado com este email');
      }
    }

    // Criar status inicial
    const status = dto.statusCode
      ? PatientStatus.fromCode(dto.statusCode)
      : PatientStatus.prospect();

    // Criar dados comerciais se fornecidos
    const dadosComerciais = this.hasDadosComerciais(dto)
      ? new DadosComerciaisVO({
          campanhaOrigemId: dto.campanhaOrigemId,
          origemId: dto.origemId,
          promotorId: dto.promotorId,
          eventoId: dto.eventoId,
          telemarketingAgent: dto.telemarketingAgent,
          escolaridade: dto.escolaridade as any,
          estadoCivil: dto.estadoCivil as any,
          profissao: dto.profissao,
          empresa: dto.empresa,
          rendaMensal: dto.rendaMensal,
        })
      : undefined;

    // Criar aggregate Patient
    const patient = Patient.create({
      clinicId: dto.clinicId,
      fullName: dto.fullName,
      cpf: dto.cpf,
      rg: dto.rg,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      gender: dto.gender,
      email: dto.email,
      phone: dto.phone,
      mobile: dto.mobile,
      addressStreet: dto.addressStreet,
      addressNumber: dto.addressNumber,
      addressComplement: dto.addressComplement,
      addressNeighborhood: dto.addressNeighborhood,
      addressCity: dto.addressCity,
      addressState: dto.addressState,
      addressZipcode: dto.addressZipcode,
      status,
      dadosComerciais,
      notes: dto.notes,
      isActive: true,
      createdBy: dto.createdBy,
    });

    // Persistir
    await this.patientRepository.save(patient);

    // Registrar histórico de status inicial
    await this.patientRepository.saveStatusHistory(
      patient.id,
      null,
      status.code,
      'Cadastro inicial',
      dto.createdBy || 'system'
    );

    // Publicar eventos de domínio
    const events = patient.getDomainEvents();
    
    // Evento adicional: PacienteCadastrado
    await eventBus.publish({
      eventId: crypto.randomUUID(),
      eventType: 'Pacientes.PacienteCadastrado',
      aggregateId: patient.id,
      aggregateType: 'Patient',
      payload: {
        patientId: patient.id,
        patientName: patient.fullName,
        statusCode: status.code,
        clinicId: dto.clinicId,
      },
      metadata: {
        userId: dto.createdBy,
        clinicId: dto.clinicId,
        timestamp: new Date().toISOString(),
      },
    });

    for (const event of events) {
      await eventBus.publish(event);
    }

    patient.clearDomainEvents();

    logger.info('CadastrarPacienteUseCase: Success', {
      patientId: patient.id,
      patientName: patient.fullName,
    });

    return { patientId: patient.id };
  }

  private hasDadosComerciais(dto: CadastrarPacienteDTO): boolean {
    return !!(
      dto.campanhaOrigemId ||
      dto.origemId ||
      dto.promotorId ||
      dto.eventoId ||
      dto.telemarketingAgent ||
      dto.escolaridade ||
      dto.estadoCivil ||
      dto.profissao ||
      dto.empresa ||
      dto.rendaMensal
    );
  }
}
