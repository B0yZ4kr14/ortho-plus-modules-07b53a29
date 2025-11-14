import { Agendamento } from '@/domain/entities/Agendamento';
import { IAgendamentoRepository } from '@/domain/repositories/IAgendamentoRepository';

export interface GetAgendamentosByDateRangeInput {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  dentistId?: string;
}

export class GetAgendamentosByDateRangeUseCase {
  constructor(
    private agendamentoRepository: IAgendamentoRepository
  ) {}

  async execute(input: GetAgendamentosByDateRangeInput): Promise<Agendamento[]> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!input.startDate || !input.endDate) {
      throw new Error('Datas de início e fim são obrigatórias');
    }

    if (input.endDate < input.startDate) {
      throw new Error('Data de fim deve ser posterior à data de início');
    }

    // Buscar agendamentos
    let agendamentos: Agendamento[];

    if (input.dentistId) {
      // Buscar por dentista específico
      agendamentos = await this.agendamentoRepository.findByDentistAndDateRange(
        input.dentistId,
        input.startDate,
        input.endDate
      );
    } else {
      // Buscar todos da clínica
      agendamentos = await this.agendamentoRepository.findByClinicAndDateRange(
        input.clinicId,
        input.startDate,
        input.endDate
      );
    }

    return agendamentos;
  }
}
