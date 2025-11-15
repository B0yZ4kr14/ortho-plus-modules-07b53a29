/**
 * FASE 2 - TASK 2.4: Create TeleOdonto Session Use Case
 */

import { TeleOdontoSession } from '@/domain/entities/TeleOdontoSession';

export interface CreateTeleOdontoSessionDTO {
  clinicId: string;
  patientId: string;
  dentistId: string;
  appointmentId?: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  platform: 'jitsi' | 'zoom' | 'meet' | 'teams';
  notasPreConsulta?: string;
  createdBy: string;
}

export interface ITeleOdontoRepository {
  save(session: TeleOdontoSession): Promise<void>;
  findById(id: string): Promise<TeleOdontoSession | null>;
  findByClinic(clinicId: string, filters?: any): Promise<TeleOdontoSession[]>;
}

export class CreateTeleOdontoSessionUseCase {
  constructor(private repository: ITeleOdontoRepository) {}

  async execute(dto: CreateTeleOdontoSessionDTO): Promise<TeleOdontoSession> {
    // Validar datas
    if (dto.scheduledStart >= dto.scheduledEnd) {
      throw new Error('Data de fim deve ser posterior à data de início');
    }

    if (dto.scheduledStart < new Date()) {
      throw new Error('Data de início deve ser futura');
    }

    // Criar sessão
    const session = TeleOdontoSession.create({
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      dentistId: dto.dentistId,
      appointmentId: dto.appointmentId,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
      platform: dto.platform,
      notasPreConsulta: dto.notasPreConsulta,
      createdBy: dto.createdBy,
    });

    // Persistir
    await this.repository.save(session);

    return session;
  }
}
