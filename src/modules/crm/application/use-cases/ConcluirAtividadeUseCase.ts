import { Atividade } from '../../domain/entities/Atividade';
import { IAtividadeRepository } from '../../domain/repositories/IAtividadeRepository';

interface ConcluirAtividadeInput {
  atividadeId: string;
  resultado?: string;
}

export class ConcluirAtividadeUseCase {
  constructor(private atividadeRepository: IAtividadeRepository) {}

  async execute(input: ConcluirAtividadeInput): Promise<Atividade> {
    // Buscar atividade
    const atividade = await this.atividadeRepository.findById(input.atividadeId);
    
    if (!atividade) {
      throw new Error('Atividade não encontrada');
    }

    // Concluir atividade
    atividade.concluir(input.resultado);

    // Persistir
    return await this.atividadeRepository.update(atividade);
  }
}
