import { IAgendamentoRepository } from '@/domain/repositories/IAgendamentoRepository';

export interface CancelAgendamentoInput {
  agendamentoId: string;
}

export class CancelAgendamentoUseCase {
  constructor(
    private agendamentoRepository: IAgendamentoRepository
  ) {}

  async execute(input: CancelAgendamentoInput): Promise<void> {
    // Validações de input
    if (!input.agendamentoId?.trim()) {
      throw new Error('ID do agendamento é obrigatório');
    }

    // Buscar agendamento existente
    const agendamento = await this.agendamentoRepository.findById(input.agendamentoId);

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    // Cancelar usando método de domínio
    agendamento.cancelar();

    // Persistir mudanças
    await this.agendamentoRepository.update(agendamento);
  }
}
