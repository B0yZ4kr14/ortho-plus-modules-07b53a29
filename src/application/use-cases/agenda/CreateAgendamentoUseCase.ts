import { Agendamento } from '@/domain/entities/Agendamento';
import { IAgendamentoRepository } from '@/domain/repositories/IAgendamentoRepository';

export interface CreateAgendamentoInput {
  clinicId: string;
  patientId: string;
  dentistId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  treatmentId?: string;
  createdBy: string;
}

export class CreateAgendamentoUseCase {
  constructor(
    private agendamentoRepository: IAgendamentoRepository
  ) {}

  async execute(input: CreateAgendamentoInput): Promise<void> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!input.patientId?.trim()) {
      throw new Error('ID do paciente é obrigatório');
    }

    if (!input.dentistId?.trim()) {
      throw new Error('ID do dentista é obrigatório');
    }

    if (!input.createdBy?.trim()) {
      throw new Error('ID do criador é obrigatório');
    }

    // Verificar conflito de horário
    const hasConflict = await this.agendamentoRepository.hasConflict(
      input.dentistId,
      input.startTime,
      input.endTime
    );

    if (hasConflict) {
      throw new Error('Já existe um agendamento neste horário para o dentista selecionado');
    }

    // Criar entidade de domínio
    const agendamento = Agendamento.create({
      clinicId: input.clinicId,
      patientId: input.patientId,
      dentistId: input.dentistId,
      title: input.title,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      treatmentId: input.treatmentId,
      createdBy: input.createdBy,
    });

    // Persistir
    await this.agendamentoRepository.save(agendamento);
  }
}
