/**
 * AlterarStatusPacienteUseCase - Altera status do paciente
 * 
 * Use Case que orquestra mudança de status com validações,
 * histórico e eventos.
 */

import { IPatientRepository } from '../../domain/repositories/IPatientRepository';
import { PatientStatus } from '../../domain/value-objects/PatientStatus';
import { eventBus } from '@/shared/events/EventBus';
import { logger } from '@/infrastructure/logger';

export interface AlterarStatusPacienteDTO {
  patientId: string;
  clinicId: string;
  novoStatusCode: string;
  reason: string;
  changedBy: string;
  metadata?: Record<string, any>;
}

export class AlterarStatusPacienteUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: AlterarStatusPacienteDTO): Promise<void> {
    logger.info('AlterarStatusPacienteUseCase: Starting', {
      patientId: dto.patientId,
      novoStatus: dto.novoStatusCode,
    });

    // Buscar paciente
    const patient = await this.patientRepository.findById(
      dto.patientId,
      dto.clinicId
    );

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    if (!patient.isActive) {
      throw new Error('Não é possível alterar status de paciente inativo');
    }

    // Validar novo status
    const novoStatus = PatientStatus.fromCode(dto.novoStatusCode);
    const statusAnterior = patient.status;

    // Business rule: Alterar status (validação de transição dentro do aggregate)
    patient.alterarStatus(novoStatus, dto.reason, dto.changedBy);

    // Persistir mudança
    await this.patientRepository.update(patient);

    // Registrar no histórico
    await this.patientRepository.saveStatusHistory(
      dto.patientId,
      statusAnterior.code,
      novoStatus.code,
      dto.reason,
      dto.changedBy,
      dto.metadata
    );

    // Publicar eventos de domínio
    const events = patient.getDomainEvents();
    for (const event of events) {
      await eventBus.publish(event);
    }
    patient.clearDomainEvents();

    logger.info('AlterarStatusPacienteUseCase: Success', {
      patientId: dto.patientId,
      fromStatus: statusAnterior.code,
      toStatus: novoStatus.code,
    });
  }
}
