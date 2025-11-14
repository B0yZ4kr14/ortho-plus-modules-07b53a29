import { IAgendamentoRepository } from '@/domain/repositories/IAgendamentoRepository';

export interface UpdateAgendamentoInput {
  agendamentoId: string;
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
}

export class UpdateAgendamentoUseCase {
  constructor(
    private agendamentoRepository: IAgendamentoRepository
  ) {}

  async execute(input: UpdateAgendamentoInput): Promise<void> {
    // Validações de input
    if (!input.agendamentoId?.trim()) {
      throw new Error('ID do agendamento é obrigatório');
    }

    // Buscar agendamento existente
    const agendamento = await this.agendamentoRepository.findById(input.agendamentoId);

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    // Atualizar horários se fornecidos
    if (input.startTime && input.endTime) {
      // Verificar conflito de horário (excluindo o próprio agendamento)
      const hasConflict = await this.agendamentoRepository.hasConflict(
        agendamento.dentistId,
        input.startTime,
        input.endTime,
        agendamento.id
      );

      if (hasConflict) {
        throw new Error('Já existe um agendamento neste horário para o dentista selecionado');
      }

      agendamento.atualizarHorarios(input.startTime, input.endTime);
    }

    // Atualizar título e descrição (via toObject e restore - pattern imutável)
    if (input.title !== undefined || input.description !== undefined) {
      const props = agendamento.toObject();
      
      if (input.title !== undefined) {
        if (!input.title.trim()) {
          throw new Error('Título não pode ser vazio');
        }
        props.title = input.title;
      }
      
      if (input.description !== undefined) {
        props.description = input.description;
      }
      
      props.updatedAt = new Date();
      
      const updatedAgendamento = (agendamento as any).constructor.restore(props);
      await this.agendamentoRepository.update(updatedAgendamento);
      return;
    }

    // Persistir mudanças
    await this.agendamentoRepository.update(agendamento);
  }
}
