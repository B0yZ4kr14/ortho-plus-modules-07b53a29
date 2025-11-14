import { IEvolucaoRepository } from '@/domain/repositories/IEvolucaoRepository';
import { Evolucao } from '@/domain/entities/Evolucao';
import { ValidationError } from '@/infrastructure/errors/ValidationError';
import { UnauthorizedError } from '@/infrastructure/errors/UnauthorizedError';

export interface CreateEvolucaoDTO {
  tratamentoId: string;
  prontuarioId: string;
  clinicId: string;
  descricao: string;
  procedimentosRealizados: string[];
  observacoes?: string;
  assinadoPor: string;
  createdBy: string;
}

export class CreateEvolucaoUseCase {
  constructor(private evolucaoRepository: IEvolucaoRepository) {}

  async execute(dto: CreateEvolucaoDTO): Promise<Evolucao> {
    // Validações
    if (!dto.tratamentoId) {
      throw new ValidationError('ID do tratamento é obrigatório');
    }

    if (!dto.descricao || dto.descricao.trim().length < 10) {
      throw new ValidationError('Descrição deve ter pelo menos 10 caracteres');
    }

    if (!dto.procedimentosRealizados || dto.procedimentosRealizados.length === 0) {
      throw new ValidationError('Pelo menos um procedimento realizado deve ser informado');
    }

    if (!dto.createdBy) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    // Criar entidade
    const evolucao = Evolucao.create({
      tratamentoId: dto.tratamentoId,
      prontuarioId: dto.prontuarioId,
      clinicId: dto.clinicId,
      data: new Date(),
      descricao: dto.descricao.trim(),
      procedimentosRealizados: dto.procedimentosRealizados,
      observacoes: dto.observacoes,
      assinadoPor: dto.assinadoPor,
      assinadoEm: new Date(), // Assinar imediatamente
      createdBy: dto.createdBy,
    });

    // Persistir
    await this.evolucaoRepository.save(evolucao);

    return evolucao;
  }
}
