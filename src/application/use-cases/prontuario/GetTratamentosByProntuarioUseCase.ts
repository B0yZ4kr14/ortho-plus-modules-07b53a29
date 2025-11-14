import { ITratamentoRepository } from '@/domain/repositories/ITratamentoRepository';
import { Tratamento } from '@/domain/entities/Tratamento';
import { ValidationError } from '@/infrastructure/errors/ValidationError';

export class GetTratamentosByProntuarioUseCase {
  constructor(private tratamentoRepository: ITratamentoRepository) {}

  async execute(prontuarioId: string): Promise<Tratamento[]> {
    if (!prontuarioId) {
      throw new ValidationError('ID do prontuário é obrigatório');
    }

    return await this.tratamentoRepository.findByProntuarioId(prontuarioId);
  }
}
