import { ITratamentoRepository } from '@/domain/repositories/ITratamentoRepository';
import { Tratamento } from '@/domain/entities/Tratamento';
import { ValidationError } from '@/infrastructure/errors/ValidationError';
import { NotFoundError } from '@/infrastructure/errors/NotFoundError';

export interface UpdateTratamentoStatusDTO {
  tratamentoId: string;
  action: 'iniciar' | 'concluir' | 'cancelar';
  valorCobrado?: number;
  motivoCancelamento?: string;
}

export class UpdateTratamentoStatusUseCase {
  constructor(private tratamentoRepository: ITratamentoRepository) {}

  async execute(dto: UpdateTratamentoStatusDTO): Promise<Tratamento> {
    // Buscar tratamento
    const tratamento = await this.tratamentoRepository.findById(dto.tratamentoId);
    
    if (!tratamento) {
      throw new NotFoundError('Tratamento', dto.tratamentoId);
    }

    // Aplicar ação
    switch (dto.action) {
      case 'iniciar':
        tratamento.iniciar();
        break;
      
      case 'concluir':
        if (dto.valorCobrado === undefined) {
          throw new ValidationError('Valor cobrado é obrigatório para concluir tratamento');
        }
        tratamento.concluir(dto.valorCobrado);
        break;
      
      case 'cancelar':
        if (!dto.motivoCancelamento) {
          throw new ValidationError('Motivo do cancelamento é obrigatório');
        }
        tratamento.cancelar(dto.motivoCancelamento);
        break;
      
      default:
        throw new ValidationError('Ação inválida');
    }

    // Persistir mudanças
    await this.tratamentoRepository.update(tratamento);

    return tratamento;
  }
}
