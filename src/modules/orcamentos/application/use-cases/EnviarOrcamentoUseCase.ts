import { Orcamento } from '../../domain/entities/Orcamento';
import { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export interface EnviarOrcamentoInput {
  orcamentoId: string;
}

export interface EnviarOrcamentoOutput {
  orcamento: Orcamento;
}

export class EnviarOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(input: EnviarOrcamentoInput): Promise<EnviarOrcamentoOutput> {
    const orcamento = await this.orcamentoRepository.findById(input.orcamentoId);
    
    if (!orcamento) {
      throw new Error('Orçamento não encontrado');
    }

    orcamento.enviarParaAprovacao();
    await this.orcamentoRepository.update(orcamento);

    return { orcamento };
  }
}
