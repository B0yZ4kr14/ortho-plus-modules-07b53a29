import { ITratamentoRepository } from '@/domain/repositories/ITratamentoRepository';
import { Tratamento } from '@/domain/entities/Tratamento';
import { ValidationError } from '@/infrastructure/errors/ValidationError';
import { UnauthorizedError } from '@/infrastructure/errors/UnauthorizedError';

export interface CreateTratamentoDTO {
  prontuarioId: string;
  clinicId: string;
  titulo: string;
  descricao: string;
  denteCodigo?: string;
  procedimentoId?: string;
  valorEstimado?: number;
  dataInicio: Date;
  createdBy: string;
}

export class CreateTratamentoUseCase {
  constructor(private tratamentoRepository: ITratamentoRepository) {}

  async execute(dto: CreateTratamentoDTO): Promise<Tratamento> {
    // Validações
    if (!dto.prontuarioId) {
      throw new ValidationError('ID do prontuário é obrigatório');
    }

    if (!dto.titulo || dto.titulo.trim().length < 3) {
      throw new ValidationError('Título deve ter pelo menos 3 caracteres');
    }

    if (!dto.createdBy) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    // Criar entidade
    const tratamento = Tratamento.create({
      prontuarioId: dto.prontuarioId,
      clinicId: dto.clinicId,
      titulo: dto.titulo.trim(),
      descricao: dto.descricao.trim(),
      denteCodigo: dto.denteCodigo,
      procedimentoId: dto.procedimentoId,
      status: 'PLANEJADO',
      dataInicio: dto.dataInicio,
      valorEstimado: dto.valorEstimado,
      createdBy: dto.createdBy,
    });

    // Persistir
    await this.tratamentoRepository.save(tratamento);

    return tratamento;
  }
}
